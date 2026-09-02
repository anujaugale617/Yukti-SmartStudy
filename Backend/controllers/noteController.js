
const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');
const cloudinary = require('../config/cloudinary');

const getNotes = async (req, res, next) => {
  try {
    const { subjectId, search, tag } = req.query;
    const query = { userId: req.user._id };

    if (subjectId && subjectId !== 'All') query.subjectId = subjectId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (tag) query.tags = tag;

    const notes = await Note.find(query)
      .populate('subjectId', 'name code color')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: notes.length, notes });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('subjectId', 'name code color');
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

const uploadNote = async (req, res, next) => {
  try {
    const { subjectId, title, description, tags } = req.body;
    if (!subjectId || !title) {
      return res.status(400).json({ success: false, message: 'Subject and title are required' });
    }

    let fileUrl = '';
    let fileName = 'Study-Material.pdf';
    let fileType = 'pdf';
    let fileSize = 1024 * 100;

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      const ext = path.extname(fileName).toLowerCase().replace('.', '');
      fileType = ext || 'pdf';

      // Check if Cloudinary is configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_key') {
        try {
          const cloudRes = await cloudinary.uploader.upload(req.file.path, {
            folder: 'yukti_notes',
            resource_type: 'auto'
          });
          fileUrl = cloudRes.secure_url;
        } catch (cloudErr) {
          console.warn('Cloudinary upload warning (using local fallback):', cloudErr.message);
          fileUrl = '/uploads/' + req.file.filename;
        }
      } else {
        fileUrl = '/uploads/' + req.file.filename;
      }
    } else {
      fileUrl = '/uploads/sample-lecture-notes.pdf';
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
    }

    const note = await Note.create({
      userId: req.user._id,
      subjectId,
      title,
      description: description || '',
      fileUrl,
      fileName,
      fileType,
      fileSize,
      tags: parsedTags
    });

    const populated = await Note.findById(note._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, note: populated });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Try deleting local file if applicable
    if (note.fileUrl && note.fileUrl.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(localPath)) {
        try { fs.unlinkSync(localPath); } catch (e) {}
      }
    }

    await Note.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  uploadNote,
  deleteNote
};
