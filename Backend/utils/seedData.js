
const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const Note = require('../models/Note');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const StudyGoal = require('../models/StudyGoal');
const StudyTask = require('../models/StudyTask');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const Notification = require('../models/Notification');

const populateUserData = async (userId) => {
  await Promise.all([
    Subject.deleteMany({ userId }),
    Timetable.deleteMany({ userId }),
    Note.deleteMany({ userId }),
    Assignment.deleteMany({ userId }),
    Exam.deleteMany({ userId }),
    Attendance.deleteMany({ userId }),
    StudyGoal.deleteMany({ userId }),
    StudyTask.deleteMany({ userId }),
    Quiz.deleteMany({ userId }),
    Flashcard.deleteMany({ userId }),
    Notification.deleteMany({ userId })
  ]);

  const subjectsData = [
    { name: 'Data Structures & Algorithms', code: 'CS301', teacher: 'Prof. Rajesh Sharma', credits: 4, description: 'Advanced trees, graph algorithms, dynamic programming, and algorithmic complexity.', color: '#3b82f6' },
    { name: 'Computer Networks', code: 'CS302', teacher: 'Dr. Priya Nair', credits: 4, description: 'OSI and TCP/IP stack, socket programming, routing protocols, and congestion control.', color: '#10b981' },
    { name: 'Database Management Systems', code: 'CS303', teacher: 'Prof. Amit Kulkarni', credits: 3, description: 'Relational algebra, SQL, normalization (3NF/BCNF), transactions, and indexing.', color: '#8b5cf6' },
    { name: 'Operating Systems', code: 'CS304', teacher: 'Dr. Sunita Deshmukh', credits: 4, description: 'Process synchronization, CPU scheduling, memory paging, deadlocks, and virtual memory.', color: '#f59e0b' },
    { name: 'Artificial Intelligence', code: 'CS305', teacher: 'Prof. Vikram Joshi', credits: 3, description: 'Informed search algorithms (A*), heuristic optimization, and deep learning basics.', color: '#ec4899' }
  ];

  const createdSubjects = [];
  for (const s of subjectsData) {
    const sub = await Subject.create({ userId, ...s });
    createdSubjects.push(sub);
  }

  const [dsa, cn, dbms, os, ai] = createdSubjects;

  const timetableEntries = [
    { userId, subjectId: dsa._id, day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'LH-101' },
    { userId, subjectId: cn._id, day: 'Monday', startTime: '10:15', endTime: '11:15', room: 'Lab-3' },
    { userId, subjectId: dbms._id, day: 'Monday', startTime: '11:30', endTime: '12:30', room: 'LH-102' },
    { userId, subjectId: os._id, day: 'Monday', startTime: '14:00', endTime: '15:00', room: 'LH-104' },
    { userId, subjectId: os._id, day: 'Tuesday', startTime: '09:00', endTime: '10:00', room: 'LH-104' },
    { userId, subjectId: ai._id, day: 'Tuesday', startTime: '10:15', endTime: '11:15', room: 'LH-201' },
    { userId, subjectId: dsa._id, day: 'Tuesday', startTime: '11:30', endTime: '13:30', room: 'Algo Lab' },
    { userId, subjectId: dbms._id, day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'LH-102' },
    { userId, subjectId: cn._id, day: 'Wednesday', startTime: '10:15', endTime: '11:15', room: 'Network Lab' },
    { userId, subjectId: ai._id, day: 'Wednesday', startTime: '11:30', endTime: '12:30', room: 'LH-201' },
    { userId, subjectId: dsa._id, day: 'Thursday', startTime: '09:00', endTime: '10:00', room: 'LH-101' },
    { userId, subjectId: os._id, day: 'Thursday', startTime: '10:15', endTime: '12:15', room: 'OS Lab' },
    { userId, subjectId: dbms._id, day: 'Thursday', startTime: '14:00', endTime: '15:00', room: 'LH-102' },
    { userId, subjectId: cn._id, day: 'Friday', startTime: '09:00', endTime: '10:00', room: 'LH-101' },
    { userId, subjectId: ai._id, day: 'Friday', startTime: '10:15', endTime: '11:15', room: 'AI Lab' },
    { userId, subjectId: dsa._id, day: 'Friday', startTime: '11:30', endTime: '12:30', room: 'LH-101' },
    { userId, subjectId: dbms._id, day: 'Saturday', startTime: '10:00', endTime: '12:00', room: 'Seminar Hall' }
  ];
  await Timetable.insertMany(timetableEntries);

  await Attendance.insertMany([
    { userId, subjectId: dsa._id, totalClasses: 32, attendedClasses: 28 },
    { userId, subjectId: cn._id, totalClasses: 28, attendedClasses: 24 },
    { userId, subjectId: dbms._id, totalClasses: 30, attendedClasses: 26 },
    { userId, subjectId: os._id, totalClasses: 26, attendedClasses: 18 },
    { userId, subjectId: ai._id, totalClasses: 24, attendedClasses: 22 }
  ]);

  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in6Days = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const past2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in20Days = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

  await Assignment.insertMany([
    { userId, subjectId: dsa._id, title: 'Implement Red-Black Tree and AVL Rotations', description: 'Complete C++ implementation of balanced binary search trees with deletion rebalancing.', dueDate: in3Days, priority: 'High', status: 'In Progress' },
    { userId, subjectId: cn._id, title: 'TCP Multi-Client Chat Server in Python', description: 'Develop a non-blocking TCP socket server handling concurrent clients with broadcast messaging.', dueDate: in6Days, priority: 'Medium', status: 'Not Started' },
    { userId, subjectId: os._id, title: 'Banker�s Algorithm Deadlock Avoidance Simulation', description: 'Simulate safety algorithm and resource request algorithm with 5 processes and 3 resource types.', dueDate: in10Days, priority: 'High', status: 'Not Started' },
    { userId, subjectId: dbms._id, title: 'ER Modeling & 3NF Normalization Case Study', description: 'Design an e-commerce database schema, eliminate transitive functional dependencies.', dueDate: past2Days, priority: 'Medium', status: 'Completed' },
    { userId, subjectId: ai._id, title: '8-Puzzle Solver with A* Heuristic Search', description: 'Implement Manhattan distance heuristic vs Misplaced Tiles heuristic in Python.', dueDate: past2Days, priority: 'High', status: 'Completed' }
  ]);

  const exam1 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const exam2 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
  const exam3 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const exam4 = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

  await Exam.insertMany([
    { userId, subjectId: dsa._id, title: 'DSA Midterm Examination', type: 'Midterm', date: exam1, time: '10:00 AM - 12:00 PM', venue: 'Hall B-204', syllabus: 'Units 1-3: Trees, Balanced BSTs, B-Trees, Dynamic Programming, Graphs (BFS/DFS/Dijkstra)' },
    { userId, subjectId: os._id, title: 'Operating Systems Internal Assessment', type: 'Internal', date: exam2, time: '02:00 PM - 03:30 PM', venue: 'Hall A-102', syllabus: 'Processes, Threads, CPU Scheduling (SJF/RR), Semaphores, Deadlock Avoidance' },
    { userId, subjectId: dbms._id, title: 'DBMS Practical & Viva', type: 'Practical', date: exam3, time: '09:30 AM - 12:30 PM', venue: 'Database Lab', syllabus: 'SQL DDL/DML, Complex Joins, Stored Procedures, Triggers, Normalization Proofs' },
    { userId, subjectId: cn._id, title: 'Computer Networks End Semester Theory', type: 'End Semester', date: exam4, time: '10:00 AM - 01:00 PM', venue: 'Auditorium', syllabus: 'Full Syllabus: Physical to Application Layer, Routing (OSPF/BGP), Congestion Control' }
  ]);

  await Note.insertMany([
    { userId, subjectId: dsa._id, title: 'Graph Algorithms & Shortest Path Cheat Sheet', description: 'Dijkstra, Bellman-Ford, Floyd-Warshall, and Prim-Kruskal complexity comparisons.', fileUrl: '/uploads/sample-lecture-notes.pdf', fileName: 'DSA-Graph-Cheatsheet.pdf', fileType: 'pdf', fileSize: 1024 * 450, tags: ['graphs', 'dijkstra', 'algorithms', 'exam-prep'] },
    { userId, subjectId: dbms._id, title: 'Complete Guide to SQL Joins & Normalization Forms', description: '1NF, 2NF, 3NF, BCNF step-by-step decomposition examples with foreign keys.', fileUrl: '/uploads/sample-lecture-notes.pdf', fileName: 'DBMS-Normalization.pdf', fileType: 'pdf', fileSize: 1024 * 620, tags: ['normalization', 'sql', 'bcnf', 'viva'] },
    { userId, subjectId: os._id, title: 'Process Scheduling & Synchronization Lecture Slides', description: 'Dining Philosophers, Producer-Consumer, Peterson solution, and Counting Semaphores.', fileUrl: '/uploads/sample-lecture-notes.pdf', fileName: 'OS-Synchronization.pdf', fileType: 'pdf', fileSize: 1024 * 890, tags: ['deadlocks', 'semaphores', 'scheduling'] },
    { userId, subjectId: cn._id, title: 'Subnetting & TCP Flow Control Summary', description: 'IPv4 CIDR notation tables, TCP Sliding Window diagrams, and Congestion Avoidance curves.', fileUrl: '/uploads/sample-lecture-notes.pdf', fileName: 'CN-Subnetting-TCP.pdf', fileType: 'pdf', fileSize: 1024 * 380, tags: ['tcp', 'subnetting', 'osi'] },
    { userId, subjectId: ai._id, title: 'Heuristic Search & Alpha-Beta Pruning Notes', description: 'Minimax game trees, admissible and consistent heuristic properties with state spaces.', fileUrl: '/uploads/sample-lecture-notes.pdf', fileName: 'AI-Heuristics.pdf', fileType: 'pdf', fileSize: 1024 * 510, tags: ['a-star', 'heuristics', 'game-trees'] }
  ]);

  await StudyGoal.insertMany([
    { userId, subjectId: dsa._id, title: 'Solve 50 LeetCode Medium Problems on Trees & Graphs', description: 'Prepare for university midterm and upcoming campus technical coding rounds.', targetDate: in10Days, priority: 'High', progress: 70, status: 'In Progress' },
    { userId, subjectId: os._id, title: 'Recover OS Attendance to 75% Benchmark', description: 'Attend next 6 consecutive lectures without missing a class.', targetDate: in14Days, priority: 'High', progress: 40, status: 'In Progress' },
    { userId, subjectId: dbms._id, title: 'Master Query Optimization & B+ Tree Indexing', description: 'Understand EXPLAIN ANALYZE query plans and clustered index storage layouts.', targetDate: in20Days, priority: 'Medium', progress: 100, status: 'Completed' },
    { userId, subjectId: cn._id, title: 'Simulate Packet Capture with Wireshark', description: 'Analyze 3-way handshake and DNS query packets in live lab session.', targetDate: in6Days, priority: 'Medium', progress: 30, status: 'In Progress' }
  ]);

  await StudyTask.insertMany([
    { userId, subjectId: dsa._id, title: 'Practice AVL Tree Rotations (Left, Right, LR, RL)', date: now, startTime: '18:00', duration: 45, priority: 'High', completed: true },
    { userId, subjectId: os._id, title: 'Review Banker�s Algorithm Safety Proof', date: now, startTime: '19:00', duration: 60, priority: 'High', completed: false },
    { userId, subjectId: cn._id, title: 'Read Chapter 4: Network Layer & Distance Vector Routing', date: now, startTime: '20:30', duration: 45, priority: 'Medium', completed: false },
    { userId, subjectId: dbms._id, title: 'Solve 5 SQL Query Practice questions on Group By', date: new Date(now.getTime() + 24 * 60 * 60 * 1000), startTime: '17:30', duration: 45, priority: 'Medium', completed: false },
    { userId, subjectId: ai._id, title: 'Write 8-puzzle A* python heuristic script', date: new Date(now.getTime() + 24 * 60 * 60 * 1000), startTime: '19:00', duration: 60, priority: 'High', completed: false }
  ]);

  await Quiz.create({
    userId,
    subjectId: dsa._id,
    title: 'DSA Trees & Graphs Diagnostic Quiz',
    topic: 'Binary Search Trees & DFS',
    difficulty: 'Medium',
    totalQuestions: 4,
    score: 100,
    completedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    questions: [
      { question: "What is the worst-case search time complexity in a balanced AVL tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)", userAnswer: "O(log n)", explanation: "Balanced binary search trees maintain height proportional to log(n)." },
      { question: "Which data structure is primarily used for Depth First Search (DFS)?", options: ["Queue", "Stack", "Priority Queue", "Circular Buffer"], correctAnswer: "Stack", userAnswer: "Stack", explanation: "DFS uses LIFO stack recursion semantics." },
      { question: "In a Min-Heap, where is the smallest element located?", options: ["Root", "Left leaf", "Right leaf", "Random"], correctAnswer: "Root", userAnswer: "Root", explanation: "Min-heap property places minimal element at the root node." },
      { question: "Which algorithm finds single-source shortest paths on non-negative weighted graphs?", options: ["Dijkstra's", "Prim's", "Kruskal's", "Floyd-Warshall"], correctAnswer: "Dijkstra's", userAnswer: "Dijkstra's", explanation: "Dijkstra's greedy algorithm solves SSSP in O((V+E) log V) time." }
    ]
  });

  await Flashcard.insertMany([
    { userId, subjectId: dsa._id, topic: 'Data Structures', question: 'What is the time complexity of QuickSort in worst vs average case?', answer: 'Average: O(n log n)\nWorst: O(n�) when pivot chosen is consistently the extreme element.', mastered: true, lastReviewed: now },
    { userId, subjectId: dbms._id, topic: 'Database Concepts', question: 'What are ACID properties?', answer: 'Atomicity (all or nothing), Consistency (preserves constraints), Isolation (concurrency control), Durability (persisted commits).', mastered: true, lastReviewed: now },
    { userId, subjectId: os._id, topic: 'Operating Systems', question: 'State the 4 Coffman conditions for Deadlock.', answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait', mastered: false, lastReviewed: null },
    { userId, subjectId: cn._id, topic: 'Computer Networks', question: 'What is the 3-Way Handshake in TCP?', answer: '1. SYN (Client -> Server)\n2. SYN-ACK (Server -> Client)\n3. ACK (Client -> Server)', mastered: true, lastReviewed: now },
    { userId, subjectId: os._id, topic: 'Operating Systems', question: 'What is Belady�s Anomaly in Paging?', answer: 'Allocating more page frames can result in more page faults when using the FIFO page replacement algorithm.', mastered: false, lastReviewed: null },
    { userId, subjectId: ai._id, topic: 'Artificial Intelligence', question: 'What makes a heuristic admissible in A* search?', answer: 'A heuristic h(n) is admissible if it NEVER overestimates the true cost to reach the goal from node n (h(n) <= h*(n)).', mastered: false, lastReviewed: null }
  ]);

  await Notification.insertMany([
    { userId, title: 'Upcoming Exam: DSA Midterm', message: 'DSA Midterm Exam is scheduled in 4 days (Hall B-204). Start revision now!', type: 'exam', read: false, link: '/exams' },
    { userId, title: 'Attendance Alert: Operating Systems', message: 'Your OS attendance is at 69.2% (below 75% criteria). Attend upcoming lectures.', type: 'attendance', read: false, link: '/attendance' },
    { userId, title: 'Assignment Due: Red-Black Tree Implementation', message: 'High priority assignment for Data Structures is due in 3 days.', type: 'assignment', read: false, link: '/assignments' },
    { userId, title: 'Welcome to Yukti SmartStudy! ??', message: 'Your semester dashboard has been configured. Explore the AI Assistant, quizzes, and notes.', type: 'system', read: true, link: '/dashboard' }
  ]);

  return { success: true, message: 'User dataset seeded with 5 full courses, timetable, exams, and assignments' };
};

module.exports = { populateUserData };
