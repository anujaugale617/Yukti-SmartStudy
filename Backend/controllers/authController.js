
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'yukti_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college, course, year, semester } = req.body;
    if (!name || !email || !password || !college || !course) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      college,
      course,
      year: year || 'Third Year',
      semester: semester || 'Semester 5'
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        course: user.course,
        year: user.year,
        semester: user.semester,
        profileImage: user.profileImage,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        course: user.course,
        year: user.year,
        semester: user.semester,
        profileImage: user.profileImage,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, college, course, year, semester, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.college = college || user.college;
      user.course = course || user.course;
      user.year = year || user.year;
      user.semester = semester || user.semester;
      if (profileImage !== undefined) user.profileImage = profileImage;

      const updatedUser = await user.save();
      res.json({ success: true, user: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.preferences = { ...user.preferences, ...req.body };
      await user.save();
      res.json({ success: true, preferences: user.preferences });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
  changePassword,
  updatePreferences
};
