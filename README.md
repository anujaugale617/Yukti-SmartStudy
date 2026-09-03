# Yukti - Smart Study Management System
> An intelligent academic productivity and AI-powered study platform designed for Computer Engineering and University Students.

---

##  Project Overview
**Yukti** is a comprehensive, production-grade full-stack web application engineered to solve student disorganization, fragmented academic tracking, and inefficient revision methods. Developed as a **Major Project in Computer Engineering**, it provides a single unified interface for managing enrolled subjects, weekly timetable schedules, assignments with overdue detection, exam countdowns, real-time attendance calculations against the 75% university benchmark, daily study sprints, active goals, Cloudinary-backed notes, interactive timed quizzes with scoring and explanations, 3D flip flashcards, an AI study tutor, and detailed analytics.

---

##  Key Features

### 1. Core Academic Hub
- **Subject Management**: Enrolled course codes, credit units, faculty details, color tagging, and consolidated course assets.
- **Weekly Timetable**: Interactive Monday-to-Saturday schedule grid, classroom tags, and automatic "Today's Schedule" extractor.
- **Assignment Tracker**: Status management (Not Started, In Progress, Completed), priority tagging, due-date countdown, and overdue detection alerts.
- **Exam Countdown**: Internal, Practical, Midterm, End-Semester, and Viva dates with syllabus milestone checklists.

### 2. Attendance & Productivity
- **Attendance Calculator**: Automatic real-time percentage computation (`(attended / total) * 100`).
- **75% Benchmark Alerts**: Warning indicators highlighting exact consecutive classes needed to recover eligibility or safe skips available.
- **Quick Logging**: One-click "+1 Present" / "+1 Absent" record adjustments.
- **Study Planner**: 45-minute focused deep work blocks, scheduled session tracking, and completion metrics.
- **Academic Goals**: Long-term progress sliders (0-100%) and target milestones.

### 3.  AI Study Assistant & Active Recall
- **AI Quiz Generator**: Generates customized multiple-choice tests with difficulty filters, timers, score calculation, confetti celebrations, and instant educational explanations.
- **3D Flip Flashcards**: Interactive active-recall flashcard decks with flip animations, shuffle mode, and "Mastered" vs "Needs Revision" categorization.
- **Contextual AI Chat Assistant**: Educational chatbot with awareness of user's active courses, impending exams, and attendance gaps.
- **AI Summaries**: Instant bulleted summaries and viva preparation guides for uploaded lecture notes.

### 4.  Analytics & Notifications
- **Recharts Analytics**: Weekly study hours trends, assignment breakdown, quiz score diagnostics, and attendance vs 75% benchmark bar graphs.
- **Composite Productivity Score**: Transparent calculation factoring attendance, assignment velocity, goals, and quiz scores.
- **Notification Engine**: Background alerts for deadlines within 48h, upcoming exams, and low attendance.

---

##  Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide React, Recharts, Canvas-Confetti, React Hot Toast |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, Multer, Helmet, Morgan, Express-Validator |
| **Database** | MongoDB & Mongoose ORM |
| **AI Integration** | Google Gemini API (with resilient domain-aware structured fallback engine) |
| **Media Storage** | Cloudinary & Local disk storage fallback |

---

##  System Architecture & Folder Structure

```
yukti-smartstudy/
+-- Frontend/                     # React + Vite Frontend
|   +-- src/
|   |  +-- components/         # Common, layout, dashboard, quiz, flashcard, and AI widgets
|   |   +-- context/            # AuthContext, ThemeContext, NotificationContext
|   |   +-- pages/              # 18 Modular pages
|   |   +-- services/           # Axios API service with auth interceptor
|   |   +-- utils/              # Helpers & validators
|   |   +-- App.jsx             # React router & protected routes
|   |   +-- main.jsx
|  +-- package.json
|   +-- vite.config.js
|
+-- Backend/                     # Express Backend
|   +-- config/                 # MongoDB & Cloudinary configs
|   +-- controllers/            # 15 REST API controllers
|   +-- middleware/             # Auth, Upload, Validation, Error Handling
|   +-- models/                 # 12 Mongoose Schemas
|   +-- routes/                 # Express API routes
|   +-- services/               # Gemini AI & Recommendation Engine
|   +-- utils/                  # Standalone seedData generator
|   +-- app.js
|   +-- server.js
|   +-- package.json
|
+-- .env.example
+-- .gitignore
+-- README.md
```

---

##  MongoDB Database Models

1. **User**: Name, email, hashed password, university, course, year, semester, preferences.
2. **Subject**: User association, course name, code, faculty, credits, description, color.
3. **Timetable**: Day (Mon-Sat), start/end time, room/lab number, subject reference.
4. **Note**: Subject reference, file title, fileUrl (Cloudinary/Local), fileType, tags.
5. **Assignment**: Subject reference, title, description, dueDate, priority, status.
6. **Exam**: Subject reference, title, type (Midterm/Final/Viva), date, time, venue, syllabus.
7. **Attendance**: Total classes held, attended classes, subject association.
8. **StudyGoal**: Title, description, targetDate, priority, progress (0-100), status.
9. **StudyTask**: Title, date, startTime, duration in minutes, priority, completion flag.
10. **Quiz**: Title, difficulty, questions array with options, correct answers, explanations, and scores.
11. **Flashcard**: Topic, question, answer, mastered flag, review timestamps.
12. **Notification**: Title, message, type, read flag, route link.

---

##  Installation & Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://localhost:27017`) or MongoDB Atlas URI

### 1. Clone & Setup Backend
```bash
cd yukti-smartstudy/Backend
npm install
```

Create `Backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/yukti_smartstudy
JWT_SECRET=yukti_jwt_secret_super_secure_key_2026
AI_API_KEY=your_gemini_api_key_optional
CLOUDINARY_CLOUD_NAME=your_cloudinary_name_optional
CLOUDINARY_API_KEY=your_cloudinary_key_optional
CLOUDINARY_API_SECRET=your_cloudinary_secret_optional
```

### 2. Seed Realistic Demo Data (5 Computer Engineering Courses)
```bash
npm run seed
```

### 3. Start Backend Server
```bash
npm start
# Server will run on http://localhost:5000
```

### 4. Setup & Start Frontend Client
```bash
cd ../Frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

---

##  Demo Credentials

For quick viva or presentation evaluation:
- **Email**: `demo.student@yukti.edu`
- **Password**: `password123`
*(Or click the "Quick Fill Demo Student Credentials" button on the login screen!)*

---

##  Security & Architecture Best Practices
- **Password Hashing**: Bcrypt with salt factor 10.
- **Stateless Authentication**: JWT tokens stored securely in client storage and sent via `Authorization: Bearer <token>`.
- **Tenant Isolation**: Strict user authorization middleware ensures users can only access their own documents.
- **Secure Headers**: Express Helmet protection.
- **Validation**: Strict input sanitization with express-validator.
- **Resilient AI Fallback**: Intelligent built-in educational generator ensures full offline availability when external AI API quotas are exceeded.



