const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const UserFile = require('../Models/userFile');
require('dotenv').config();

// Configure S3 client with region and credentials
const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
  },
});

// Use multer with in-memory storage for file buffering
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload to S3 middleware
exports.uploadToS3 = [
  upload.single('file'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const fileBuffer = file.buffer;

      const uploadParams = {
        Bucket: 'mygroupchatproject',
        Key: fileName,
        Body: fileBuffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const fileUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${fileName}`;

      await UserFile.create({
        userId,
        filename: file.originalname,
        fileUrl,
      });

      res.json({
        message: 'File uploaded successfully!',
        fileUrl,
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
];

