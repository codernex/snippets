
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';

// Set up MongoDB connection using Mongoose
mongoose.connect('mongodb://localhost/image_upload_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the upload folder based on the file type
    const folder = req.params.folder;
    const uploadPath = `uploads/${folder}`;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

const app = express();

// Handle image upload
app.post('/upload/:folder', upload.single('image'), (req, res) => {
  // Save relevant information to the database
  const { folder } = req.params;
  const { filename, originalname, size } = req.file;

  // Assuming you have a "Image" model/schema defined using Mongoose
  const Image = mongoose.model('Image', new mongoose.Schema({
    folder: String,
    filename: String,
    originalname: String,
    size: Number,
  }));

  const image = new Image({
    folder,
    filename,
    originalname,
    size,
  });

  image.save((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save image information' });
    }
    return res.status(200).json({ message: 'Image uploaded successfully' });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

