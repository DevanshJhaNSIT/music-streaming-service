import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import { authPayload, signToken } from "../utils/token.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user);
    return res.status(201).json(authPayload(user, token));
  } catch (error) {
    return res.status(500).json({ message: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json(authPayload(user, token));
  } catch (error) {
    return res.status(500).json({ message: "Could not sign in" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
