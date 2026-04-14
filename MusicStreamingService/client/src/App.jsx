import { Heart, Home, Library, ListMusic, LogOut, Pause, Play, Plus, Search, SkipBack, SkipForward, Sparkles, Volume2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { api, setToken } from "./api.js";

const fallbackSongs = [
  {
    _id: "local-1",
    title: "Neon Pulse",
    duration: 214,
    genre: "Synth Pop",
    mood: "Drive",
    plays: 761420,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80",
    artist: { name: "Nova Vale" },
    album: { title: "City Lights" }
  },
  {
    _id: "local-2",
    title: "Harbor Road",
    duration: 205,
    genre: "Acoustic",
    mood: "Chill",
    plays: 515280,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&w=700&q=80",
    artist: { name: "Milo Harbor" },
    album: { title: "Blue Windows" }
  },
  {
    _id: "local-3",
    title: "Zero Gravity",
    duration: 246,
    genre: "Electronic",
    mood: "Workout",
    plays: 905019,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=700&q=80",
    artist: { name: "Pulse Theory" },
    album: { title: "Kinetic" }
  }
];

const genres = ["All", "Synth Pop", "Acoustic", "Electronic", "Soul", "Dance", "Indie"];

function formatTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function App() {
  const audioRef = useRef(null);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "demo@streamify.dev", password: "password123" });
  const [songs, setSongs] = useState(fallbackSongs);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [library, setLibrary] = useState({ likedSongs: [], recentlyPlayed: [] });
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const currentSong = songs[currentIndex] || songs[0];
  const likedIds = useMemo(() => new Set((library.likedSongs || []).map((song) => song._id || song)), [library.likedSongs]);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    loadSongs();
  }, [query, activeGenre]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) {
      return;
    }

    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      recordPlay(currentSong._id);
    }
  }, [currentSong]);

  async function bootstrap() {
    try {
      const [songData, albumData] = await Promise.all([api("/api/songs?featured=true"), api("/api/albums")]);
      setSongs(songData.length ? songData : fallbackSongs);
      setAlbums(albumData);

      const storedUser = localStorage.getItem("streamify_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        await refreshPrivateData();
      }
    } catch (error) {
      setMessage("Using local demo tracks until the API is connected.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSongs() {
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (activeGenre !== "All") params.set("genre", activeGenre);
      const data = await api(`/api/songs?${params.toString()}`);
      setSongs(data.length ? data : fallbackSongs);
      setCurrentIndex(0);
    } catch (error) {
      const filtered = fallbackSongs.filter((song) => {
        const matchesGenre = activeGenre === "All" || song.genre === activeGenre;
        const text = `${song.title} ${song.artist.name} ${song.genre} ${song.mood}`.toLowerCase();
        return matchesGenre && text.includes(query.toLowerCase());
      });
      setSongs(filtered.length ? filtered : fallbackSongs);
    }
  }

  async function refreshPrivateData() {
    try {
      const [libraryData, playlistData] = await Promise.all([api("/api/users/library"), api("/api/playlists")]);
      setLibrary(libraryData);
      setPlaylists(playlistData);
    } catch (error) {
      setLibrary({ likedSongs: [], recentlyPlayed: [] });
      setPlaylists([]);
    }
  }

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    try {
      const path = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authMode === "login" ? { email: authForm.email, password: authForm.password } : authForm;
      const data = await api(path, { method: "POST", body: JSON.stringify(payload) });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("streamify_user", JSON.stringify(data.user));
      await refreshPrivateData();
      setMessage(`Welcome ${data.user.name}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("streamify_user");
    setUser(null);
    setLibrary({ likedSongs: [], recentlyPlayed: [] });
    setPlaylists([]);
  }

  function togglePlay(song = currentSong) {
    if (!song) return;

    const index = songs.findIndex((item) => item._id === song._id);
    if (index >= 0 && index !== currentIndex) {
      setCurrentIndex(index);
      setIsPlaying(true);
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        recordPlay(song._id);
      }).catch(() => setMessage("Could not start playback."));
    }
  }

  function nextSong() {
    setCurrentIndex((index) => (index + 1) % songs.length);
    setIsPlaying(true);
  }

  function previousSong() {
    setCurrentIndex((index) => (index - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  }

  async function recordPlay(songId) {
    if (!user || songId.startsWith("local-")) return;

    try {
      await api(`/api/songs/${songId}/play`, { method: "PATCH" });
      await refreshPrivateData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function toggleLike(song) {
    if (!user) {
      setMessage("Sign in to save songs.");
      return;
    }

    if (song._id.startsWith("local-")) {
      setMessage("Connect MongoDB to save demo songs.");
      return;
    }

    try {
      const data = await api(`/api/songs/${song._id}/like`, { method: "PATCH" });
      setLibrary((previous) => ({ ...previous, likedSongs: data.likedSongs }));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createPlaylist() {
    if (!user) {
      setMessage("Sign in to create playlists.");
      return;
    }

    try {
      await api("/api/playlists", {
        method: "POST",
        body: JSON.stringify({
          name: `My Mix ${playlists.length + 1}`,
          description: "A fresh queue built from Streamify.",
          isPublic: false
        })
      });
      await refreshPrivateData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>Streamify</span>
        </div>
        <nav>
          <a href="#home"><Home size={19} /> Home</a>
          <a href="#library"><Library size={19} /> Library</a>
          <a href="#discover"><Sparkles size={19} /> Discover</a>
        </nav>
        <button className="create-button" onClick={createPlaylist}><Plus size={18} /> New playlist</button>
        <div className="playlist-list">
          <p>Your playlists</p>
          {playlists.length ? playlists.map((playlist) => <span key={playlist._id}>{playlist.name}</span>) : <span>Fresh Flow</span>}
        </div>
      </aside>

      <main>
        <section className="topbar">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs, moods, genres" />
          </label>
          {user ? (
            <div className="profile">
              <img src={user.avatarUrl} alt={user.name} />
              <span>{user.name}</span>
              <button onClick={logout} aria-label="Log out"><LogOut size={17} /></button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "register" && <input placeholder="Name" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} />}
              <input placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
              <input placeholder="Password" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
              <button>{authMode === "login" ? "Sign in" : "Join"}</button>
              <button type="button" className="ghost" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Create account" : "Use login"}</button>
            </form>
          )}
        </section>

        {message && <div className="notice">{message}</div>}

        <section id="home" className="hero">
          <div>
            <p className="eyebrow">Featured radio</p>
            <h1>Find the next track that moves with you.</h1>
            <p>Fresh albums, saved favorites, playlists, and search in one MERN-powered listening space.</p>
            <button onClick={() => togglePlay()}>{isPlaying ? <Pause size={18} /> : <Play size={18} />} Play featured</button>
          </div>
          <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80" alt="Live concert crowd" />
        </section>

        <section id="discover" className="filter-row">
          {genres.map((genre) => (
            <button className={activeGenre === genre ? "active" : ""} key={genre} onClick={() => setActiveGenre(genre)}>{genre}</button>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel wide">
            <div className="section-heading">
              <h2>{loading ? "Loading tracks" : "Popular tracks"}</h2>
              <span>{songs.length} songs</span>
            </div>
            <div className="track-list">
              {songs.map((song, index) => (
                <button className={`track-row ${currentSong?._id === song._id ? "selected" : ""}`} key={song._id} onClick={() => togglePlay(song)}>
                  <span className="track-index">{currentSong?._id === song._id && isPlaying ? <Pause size={17} /> : index + 1}</span>
                  <img src={song.coverUrl} alt={song.album?.title || song.title} />
                  <span className="track-main"><strong>{song.title}</strong><small>{song.artist?.name} · {song.album?.title}</small></span>
                  <span className="chip">{song.mood}</span>
                  <span>{formatTime(song.duration)}</span>
                  <span>{song.plays?.toLocaleString()} plays</span>
                  <span className="heart" onClick={(event) => { event.stopPropagation(); toggleLike(song); }}>
                    <Heart size={18} fill={likedIds.has(song._id) ? "currentColor" : "none"} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel" id="library">
            <div className="section-heading">
              <h2>Your library</h2>
              <Heart size={18} />
            </div>
            <div className="stat">
              <strong>{library.likedSongs?.length || 0}</strong>
              <span>Liked songs</span>
            </div>
            <div className="mini-list">
              {(library.recentlyPlayed || []).slice(0, 4).map((item) => (
                <span key={`${item.song?._id}-${item.playedAt}`}>{item.song?.title}</span>
              ))}
              {!library.recentlyPlayed?.length && <span>Play a track to start history</span>}
            </div>
          </div>
        </section>

        <section className="album-grid">
          <div className="section-heading">
            <h2>Albums</h2>
            <ListMusic size={18} />
          </div>
          <div className="cards">
            {(albums.length ? albums : fallbackSongs.map((song) => ({ _id: song._id, title: song.album.title, coverUrl: song.coverUrl, artist: song.artist, genre: song.genre }))).map((album) => (
              <article className="album-card" key={album._id}>
                <img src={album.coverUrl} alt={album.title} />
                <strong>{album.title}</strong>
                <span>{album.artist?.name} · {album.genre}</span>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="player">
        <div className="now-playing">
          <img src={currentSong?.coverUrl} alt={currentSong?.title} />
          <span><strong>{currentSong?.title}</strong><small>{currentSong?.artist?.name}</small></span>
        </div>
        <div className="player-center">
          <div className="controls">
            <button onClick={previousSong}><SkipBack size={20} /></button>
            <button className="play-button" onClick={() => togglePlay()}>{isPlaying ? <Pause size={21} /> : <Play size={21} />}</button>
            <button onClick={nextSong}><SkipForward size={20} /></button>
          </div>
          <div className="progress-row">
            <span>{formatTime(progress)}</span>
            <input type="range" min="0" max={currentSong?.duration || 1} value={progress} onChange={(event) => {
              const next = Number(event.target.value);
              setProgress(next);
              if (audioRef.current) audioRef.current.currentTime = next;
            }} />
            <span>{formatTime(currentSong?.duration)}</span>
          </div>
        </div>
        <div className="volume"><Volume2 size={19} /><span>80%</span></div>
      </footer>

      <audio ref={audioRef} onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)} onEnded={nextSong} />
    </div>
  );
}

export default App;
