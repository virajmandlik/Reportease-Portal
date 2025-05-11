// controllers/profileController.js

const multer = require("multer");
const path = require("path");
const db1 = require("../db/dbConnection"); // Your db connection
const { console } = require("inspector");
const db =db1.promise()
// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder where files will be uploaded
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename); // Unique filename based on timestamp
  },
});

const upload = multer({ storage });

// Upload Profile Photo Logic
const uploadProfilePhoto = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file  || !req.body.userid) {
      return res.status(400).json({ message: "No file uploaded User ID is required" });
    }

    // Get the file URL
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    // Get the userId from the request (this should be passed by the frontend)
    const userId = req.body.userid;
    // const userId = parseInt(req.body.userId, 10);
    console.log(userId);
    console.log(req.body);
    console.log(fileUrl);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Save the file URL in the photourl table
    // const query = 'INSERT INTO photourl (user_id, url) VALUES (?, ?) ON DUPLICATE KEY UPDATE url = ?';
    // await db.query(query, [userId, fileUrl, fileUrl]);
    const query = `
    INSERT INTO photourl (user_id, url)
    SELECT ?, ?
    WHERE EXISTS (SELECT 1 FROM user WHERE user_id = ?)
    ON DUPLICATE KEY UPDATE url = ?;`;
    await db.query(query, [userId, fileUrl, userId, fileUrl]);

    // Respond with success
    res
      .status(200)
      .json({ message: "Profile photo uploaded successfully", url: fileUrl });
  } catch (err) {
    console.error("Error uploading profile photo:", err);
    res.status(500).json({ message: "Failed to upload profile photo" });
  }
};

module.exports = {
  uploadProfilePhoto,
  upload, // export multer instance to use in routes
};
