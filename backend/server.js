const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect("Your mongodb cluster connection url", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Schema
const imageSchema = new mongoose.Schema({
  fileName: String,
  filePath: String,
});
const Image = mongoose.model("Image", imageSchema);

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
// Upload Image
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newImage = new Image({
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
    });
    await newImage.save();
    res.status(201).json({ message: "File uploaded successfully", image: newImage });
  } catch (err) {
    res.status(500).json({ message: "Error uploading file", error: err });
  }
});

// Fetch All Images
app.get("/images", async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ message: "Error fetching images", error: err });
  }
});

// Delete Image
app.delete("/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete file from server
    const fs = require("fs");
    fs.unlinkSync(path.join(__dirname, image.filePath));

    // Delete document from DB
    await Image.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting image", error: err });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
