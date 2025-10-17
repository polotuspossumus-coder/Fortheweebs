const multer = require('multer');
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });
const validateUpload = require('../../middleware/validateUpload');
const rateLimiter = require('../../middleware/rateLimiter');

router.post('/upload', rateLimiter, validateUpload, upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});
