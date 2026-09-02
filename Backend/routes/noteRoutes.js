
const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  uploadNote,
  deleteNote
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getNotes);
router.post('/upload', upload.single('file'), uploadNote);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);

module.exports = router;
