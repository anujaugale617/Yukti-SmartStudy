
const { populateUserData } = require('../utils/seedData');

const seedUserDemoData = async (req, res, next) => {
  try {
    const result = await populateUserData(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { seedUserDemoData };
