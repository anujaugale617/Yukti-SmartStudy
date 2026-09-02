
const express = require('express');
const router = express.Router();
const {
  getAttendance,
  updateAttendance,
  markAttendanceClass
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAttendance);
router.put('/:id', updateAttendance);
router.patch('/:id/mark', markAttendanceClass);

module.exports = router;
