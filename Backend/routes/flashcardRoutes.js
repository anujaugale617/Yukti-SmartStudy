
const express = require('express');
const router = express.Router();
const {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  toggleMastered,
  deleteFlashcard
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFlashcards)
  .post(createFlashcard);

router.patch('/:id/master', toggleMastered);

router.route('/:id')
  .put(updateFlashcard)
  .delete(deleteFlashcard);

module.exports = router;
