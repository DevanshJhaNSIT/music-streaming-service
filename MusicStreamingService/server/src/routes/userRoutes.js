import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

const songPopulate = {
  path: "likedSongs",
  populate: [
    { path: "artist", select: "name imageUrl" },
    { path: "album", select: "title coverUrl" }
  ]
};

router.get("/library", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).populate(songPopulate).populate({
    path: "recentlyPlayed.song",
    populate: [
      { path: "artist", select: "name imageUrl" },
      { path: "album", select: "title coverUrl" }
    ]
  });

  return res.json({
    likedSongs: user.likedSongs,
    recentlyPlayed: user.recentlyPlayed.filter((item) => item.song)
  });
});

export default router;
