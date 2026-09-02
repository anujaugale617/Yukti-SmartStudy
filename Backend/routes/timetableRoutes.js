
const express = require('express');
const router = express.Router();
const {
  getTimetable,
  getTodayClasses,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodayClasses);
router.route('/')
  .get(getTimetable)
  .post(createClass);

router.route('/:id')
  .put(updateClass)
  .delete(deleteClass);

module.exports = router;
