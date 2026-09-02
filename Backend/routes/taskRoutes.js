
const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.patch('/:id/toggle', toggleTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
