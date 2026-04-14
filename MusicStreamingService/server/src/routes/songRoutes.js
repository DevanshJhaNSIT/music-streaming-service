import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Song from "../models/Song.js";
import User from "../models/User.js";

const router = express.Router();

const songPopulate = [
  { path: "artist", select: "name imageUrl genres" },
  { path: "album", select: "title coverUrl releaseYear genre" }
];

router.get("/", async (req, res) => {
  const { search, genre, mood, featured } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { genre: { $regex: search, $options: "i" } },
      { mood: { $regex: search, $options: "i" } }
    ];
  }

  if (genre && genre !== "All") {
    filter.genre = genre;
  }

  if (mood && mood !== "All") {
    filter.mood = mood;
  }

  if (featured === "true") {
    filter.isFeatured = true;
  }

  const songs = await Song.find(filter).populate(songPopulate).sort({ isFeatured: -1, plays: -1 });
  return res.json(songs);
});

router.get("/trending", async (req, res) => {
  const songs = await Song.find().populate(songPopulate).sort({ plays: -1 }).limit(10);
  return res.json(songs);
});

router.patch("/:id/play", requireAuth, async (req, res) => {
  const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true }).populate(songPopulate);

  if (!song) {
    return res.status(404).json({ message: "Song not found" });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      recentlyPlayed: {
        $each: [{ song: song._id, playedAt: new Date() }],
        $position: 0,
        $slice: 20
      }
    }
  });

  return res.json(song);
});

router.patch("/:id/like", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const liked = user.likedSongs.some((songId) => songId.equals(req.params.id));

  if (liked) {
    user.likedSongs.pull(req.params.id);
  } else {
    user.likedSongs.addToSet(req.params.id);
  }

  await user.save();
  await user.populate({ path: "likedSongs", populate: songPopulate });

  return res.json({
    liked: !liked,
    likedSongs: user.likedSongs
  });
});

export default router;
