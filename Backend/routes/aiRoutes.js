
const express = require('express');
const router = express.Router();
const {
  generateQuizHandler,
  generateFlashcardsHandler,
  generateSummaryHandler,
  generateStudyPlanHandler,
  chatHandler,
  getRecommendationsHandler
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate-quiz', generateQuizHandler);
router.post('/generate-flashcards', generateFlashcardsHandler);
router.post('/summary', generateSummaryHandler);
router.post('/study-plan', generateStudyPlanHandler);
router.post('/chat', chatHandler);
router.get('/recommendations', getRecommendationsHandler);

module.exports = router;
