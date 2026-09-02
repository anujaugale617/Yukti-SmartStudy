
const Flashcard = require('../models/Flashcard');

const getFlashcards = async (req, res, next) => {
  try {
    const { subjectId, mastered, topic } = req.query;
    const query = { userId: req.user._id };

    if (subjectId && subjectId !== 'All') query.subjectId = subjectId;
    if (mastered !== undefined && mastered !== 'All') query.mastered = mastered === 'true';
    if (topic && topic !== 'All') query.topic = topic;

    const flashcards = await Flashcard.find(query)
      .populate('subjectId', 'name code color')
      .sort({ createdAt: -1 });

    const totalCount = flashcards.length;
    const masteredCount = flashcards.filter(f => f.mastered).length;

    res.json({
      success: true,
      stats: {
        total: totalCount,
        mastered: masteredCount,
        unmastered: totalCount - masteredCount
      },
      flashcards
    });
  } catch (error) {
    next(error);
  }
};

const createFlashcard = async (req, res, next) => {
  try {
    const { subjectId, topic, question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const flashcard = await Flashcard.create({
      userId: req.user._id,
      subjectId: subjectId || null,
      topic: topic || 'General',
      question,
      answer,
      mastered: false
    });

    const populated = await Flashcard.findById(flashcard._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, flashcard: populated });
  } catch (error) {
    next(error);
  }
};

const updateFlashcard = async (req, res, next) => {
  try {
    let flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found' });
    }

    flashcard = await Flashcard.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name code color');

    res.json({ success: true, flashcard });
  } catch (error) {
    next(error);
  }
};

const toggleMastered = async (req, res, next) => {
  try {
    let flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found' });
    }

    flashcard.mastered = !flashcard.mastered;
    flashcard.lastReviewed = new Date();
    await flashcard.save();

    const populated = await Flashcard.findById(flashcard._id).populate('subjectId', 'name code color');
    res.json({ success: true, flashcard: populated });
  } catch (error) {
    next(error);
  }
};

const deleteFlashcard = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found' });
    }

    await Flashcard.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Flashcard deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  toggleMastered,
  deleteFlashcard
};
