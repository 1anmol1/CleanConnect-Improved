import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the destination for our uploads
const uploadDir = 'public/uploads';

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure how files are stored on disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files will be saved in the 'public/uploads' directory
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwriting: fieldname-timestamp.extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Function to check if the uploaded file is a valid image type
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // Reject the file if it's not an image
    cb(new Error('Images only! (jpeg, jpg, png, gif)'), false);
  }
};

// Initialize the upload middleware with our storage and file filter configurations
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
