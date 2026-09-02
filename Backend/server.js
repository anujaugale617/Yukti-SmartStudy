
const dotenv = require('dotenv');
const path = require('path');


dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start Express server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`?? Yukti Backend Server running on http://localhost:${PORT}`);
    console.log(`?? Health Check: http://localhost:${PORT}/api/health`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});
