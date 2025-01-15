const express = require("express");
const multer = require("multer");
const Image = require("../models/Image");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Route to upload an image
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const image = new Image({
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    });
    await image.save();
    res.status(200).json(image);
  } catch (err) {
    res.status(500).json({ error: "Error uploading image" });
  }
});

// Route to get all images
router.get("/images", async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ error: "Error fetching images" });
  }
});

// Route to delete an image
router.delete("/image/:id", async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting image" });
  }
});

module.exports = router;
