import express from "express";
import Album from "../models/Album.js";
import Song from "../models/Song.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const albums = await Album.find().populate("artist", "name imageUrl").sort({ releaseYear: -1 });
  return res.json(albums);
});

router.get("/:id", async (req, res) => {
  const album = await Album.findById(req.params.id).populate("artist", "name imageUrl genres");

  if (!album) {
    return res.status(404).json({ message: "Album not found" });
  }

  const songs = await Song.find({ album: album._id }).populate("artist", "name imageUrl").populate("album", "title coverUrl");
  return res.json({ album, songs });
});

export default router;
