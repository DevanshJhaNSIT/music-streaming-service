import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Playlist from "../models/Playlist.js";

const router = express.Router();

const songPopulate = {
  path: "songs",
  populate: [
    { path: "artist", select: "name imageUrl" },
    { path: "album", select: "title coverUrl" }
  ]
};

router.use(requireAuth);

router.get("/", async (req, res) => {
  const playlists = await Playlist.find({
    $or: [{ owner: req.user._id }, { isPublic: true }]
  })
    .populate("owner", "name")
    .populate(songPopulate)
    .sort({ updatedAt: -1 });

  return res.json(playlists);
});

router.post("/", async (req, res) => {
  const { name, description, coverUrl, isPublic } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Playlist name is required" });
  }

  const playlist = await Playlist.create({
    name,
    description,
    coverUrl,
    isPublic,
    owner: req.user._id
  });

  return res.status(201).json(playlist);
});

router.patch("/:id/songs/:songId", async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id });

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  const exists = playlist.songs.some((songId) => songId.equals(req.params.songId));
  if (exists) {
    playlist.songs.pull(req.params.songId);
  } else {
    playlist.songs.addToSet(req.params.songId);
  }

  await playlist.save();
  await playlist.populate(songPopulate);

  return res.json(playlist);
});

router.delete("/:id", async (req, res) => {
  const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  return res.status(204).send();
});

export default router;
