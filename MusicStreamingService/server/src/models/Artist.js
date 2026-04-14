import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      default: ""
    },
    imageUrl: {
      type: String,
      required: true
    },
    monthlyListeners: {
      type: Number,
      default: 0
    },
    genres: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;
