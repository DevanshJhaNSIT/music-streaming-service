const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ VERY IMPORTANT (handles text fields like jobDesc)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    // ✅ Check file
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);

    // ✅ Get job description from frontend
    const jobDesc = req.body.jobDesc || "";

    console.log("File Path:", filePath);
    console.log("Job Desc:", jobDesc);

    // ✅ Send to ML service
    const response = await axios.post("http://localhost:8000/analyze", {
      filePath,
      jobDesc,
    });

    // ✅ Delete uploaded file after processing
    fs.unlinkSync(filePath);

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error processing resume" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));