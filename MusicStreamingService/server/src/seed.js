import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import Album from "./models/Album.js";
import Artist from "./models/Artist.js";
import Playlist from "./models/Playlist.js";
import Song from "./models/Song.js";
import User from "./models/User.js";

dotenv.config();

const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const catalog = [
  {
    artist: {
      name: "Nova Vale",
      bio: "Warm synth-pop with glassy hooks and late-night bass lines.",
      imageUrl: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=700&q=80",
      monthlyListeners: 1850000,
      genres: ["Synth Pop", "Indie"]
    },
    album: {
      title: "City Lights",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80",
      releaseYear: 2025,
      genre: "Synth Pop"
    },
    songs: [
      { title: "Neon Pulse", duration: 214, genre: "Synth Pop", mood: "Drive", isFeatured: true },
      { title: "Midnight Signal", duration: 198, genre: "Synth Pop", mood: "Night", isFeatured: true },
      { title: "Glass Avenue", duration: 231, genre: "Indie", mood: "Focus" }
    ]
  },
  {
    artist: {
      name: "Milo Harbor",
      bio: "Soulful guitar-led songs built for mornings and quiet train rides.",
      imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80",
      monthlyListeners: 980000,
      genres: ["Acoustic", "Soul"]
    },
    album: {
      title: "Blue Windows",
      coverUrl: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&w=700&q=80",
      releaseYear: 2024,
      genre: "Acoustic"
    },
    songs: [
      { title: "Harbor Road", duration: 205, genre: "Acoustic", mood: "Chill", isFeatured: true },
      { title: "Slow Coffee", duration: 187, genre: "Soul", mood: "Morning" },
      { title: "Paper Boats", duration: 223, genre: "Acoustic", mood: "Chill" }
    ]
  },
  {
    artist: {
      name: "Pulse Theory",
      bio: "Club-ready electronic music with crisp drums and luminous textures.",
      imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80",
      monthlyListeners: 2440000,
      genres: ["Electronic", "Dance"]
    },
    album: {
      title: "Kinetic",
      coverUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=700&q=80",
      releaseYear: 2026,
      genre: "Electronic"
    },
    songs: [
      { title: "Zero Gravity", duration: 246, genre: "Electronic", mood: "Workout", isFeatured: true },
      { title: "Afterimage", duration: 219, genre: "Dance", mood: "Party" },
      { title: "Voltage Bloom", duration: 234, genre: "Electronic", mood: "Drive" }
    ]
  }
];

export async function seedDemoData() {
  await Promise.all([Artist.deleteMany({}), Album.deleteMany({}), Song.deleteMany({}), Playlist.deleteMany({}), User.deleteMany({})]);

  const demoUser = await User.create({
    name: "Demo Listener",
    email: "demo@streamify.dev",
    password: "password123"
  });

  const createdSongs = [];

  for (const item of catalog) {
    const artist = await Artist.create(item.artist);
    const album = await Album.create({ ...item.album, artist: artist._id });

    for (const song of item.songs) {
      createdSongs.push(
        await Song.create({
          ...song,
          artist: artist._id,
          album: album._id,
          coverUrl: album.coverUrl,
          audioUrl,
          plays: Math.floor(Math.random() * 900000) + 20000
        })
      );
    }
  }

  demoUser.likedSongs = createdSongs.slice(0, 4).map((song) => song._id);
  demoUser.recentlyPlayed = createdSongs.slice(2, 6).map((song) => ({ song: song._id, playedAt: new Date() }));
  await demoUser.save();

  await Playlist.create({
    name: "Fresh Flow",
    description: "New favorites for coding, commuting, and late-night listening.",
    owner: demoUser._id,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=80",
    songs: createdSongs.slice(0, 6).map((song) => song._id),
    isPublic: true
  });

  console.log("Database seeded");
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }

  await connectDB();
  await seedDemoData();
  await disconnectDB();
}

if (process.argv[1]?.endsWith("seed.js")) {
  seed().catch(async (error) => {
    console.error(error);
    await disconnectDB();
    process.exit(1);
  });
}
