import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
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
    coverUrl: {
      type: String,
      required: true
    },
    releaseYear: {
      type: Number,
      required: true
    },
    genre: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Album = mongoose.model("Album", albumSchema);

export default Album;
