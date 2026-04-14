import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

export function authPayload(user, token) {
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      likedSongs: user.likedSongs
    }
  };
}
