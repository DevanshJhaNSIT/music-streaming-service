import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    coverUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
      }
    ],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
