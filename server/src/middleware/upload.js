const multer = require('multer');
const path = require('path');

// Configure Multer memory storage (files stored as buffers in RAM)
const storage = multer.memoryStorage();

// File filter (Allow only PDF files)
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF resume uploads are allowed!'), false);
  }
};

// Initialize multer upload middleware
const uploadResume = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: fileFilter,
}).single('resume'); // Expect file field named 'resume'

module.exports = { uploadResume };
