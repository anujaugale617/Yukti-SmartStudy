
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  logoutUser, 
  updateProfile, 
  changePassword,
  updatePreferences 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
