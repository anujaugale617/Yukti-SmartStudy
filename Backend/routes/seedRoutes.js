
const express = require('express');
const router = express.Router();
const { seedUserDemoData } = require('../controllers/seedController');
const { protect } = require('../middleware/auth');

router.post('/demo-data', protect, seedUserDemoData);

module.exports = router;
