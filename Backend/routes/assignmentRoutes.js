
const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(createAssignment);

router.patch('/:id/status', updateAssignmentStatus);

router.route('/:id')
  .put(updateAssignment)
  .delete(deleteAssignment);

module.exports = router;
