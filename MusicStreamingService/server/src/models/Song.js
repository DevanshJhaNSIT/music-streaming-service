import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    coverUrl: {
      type: String,
      required: true
    },
    genre: {
      type: String,
      required: true
    },
    plays: {
      type: Number,
      default: 0
    },
    mood: {
      type: String,
      default: "Focus"
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

songSchema.index({ title: "text", genre: "text", mood: "text" });

const Song = mongoose.model("Song", songSchema);

export default Song;
