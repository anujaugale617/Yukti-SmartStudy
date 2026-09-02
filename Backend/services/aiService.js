
const https = require('https');

// Helper for Gemini REST
const callGeminiAPI = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: systemInstruction ? (systemInstruction + '\n\n' + prompt) : prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  return new Promise((resolve) => {
    const dataString = JSON.stringify(payload);
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: '/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(body);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            resolve(text || null);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.write(dataString);
    req.end();
  });
};

const extractJSON = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let start = -1;
    let end = -1;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = cleaned.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = cleaned.lastIndexOf(']');
    }
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.substring(start, end + 1));
      } catch (err) {
        return null;
      }
    }
    return null;
  }
};

const getFallbackQuiz = (subject, topic, count = 5) => {
  const dsa = [
    { question: "What is the worst-case time complexity of QuickSort?", options: ["O(n log n)", "O(n�)", "O(log n)", "O(n)"], correctAnswer: "O(n�)", explanation: "Worst case occurs with poor pivot selections on already sorted data." },
    { question: "Which data structure operates on a Last In First Out (LIFO) basis?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: "Stack", explanation: "Stacks utilize push and pop operations where the most recent element is processed first." },
    { question: "In a min-heap, where is the smallest element always located?", options: ["Root", "Leftmost leaf", "Rightmost leaf", "Random position"], correctAnswer: "Root", explanation: "In a min-heap, the parent node is always less than or equal to its children." },
    { question: "What is the worst-case lookup time in a balanced AVL tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)", explanation: "AVL trees maintain strict height balance guarantee O(log n)." },
    { question: "Which algorithm finds the single-source shortest path with non-negative weights?", options: ["Prim's", "Dijkstra's", "Kruskal's", "Floyd-Warshall"], correctAnswer: "Dijkstra's", explanation: "Dijkstra's greedy algorithm finds shortest paths efficiently." }
  ];
  return dsa.slice(0, count);
};

const getFallbackFlashcards = (subject, topic, count = 6) => {
  return [
    { topic: topic || 'Core Concepts', question: 'What is the ACID principle in database systems?', answer: 'Atomicity, Consistency, Isolation, and Durability - ensuring reliable transactions.' },
    { topic: topic || 'Core Concepts', question: 'Explain TCP vs UDP.', answer: 'TCP is connection-oriented, reliable, and ordered. UDP is connectionless, fast, but without delivery guarantees.' },
    { topic: topic || 'Core Concepts', question: 'What are the 4 Deadlock conditions (Coffman)?', answer: 'Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.' },
    { topic: topic || 'Core Concepts', question: 'What is Dynamic Programming?', answer: 'An optimization technique solving complex problems via overlapping subproblems and memoization/tabulation.' },
    { topic: topic || 'Core Concepts', question: 'What is Paging in OS?', answer: 'A memory management scheme that stores and retrieves data from secondary storage for use in main memory in same-size blocks (pages).' },
    { topic: topic || 'Core Concepts', question: 'What is an Inverted Index?', answer: 'A database index mapping words to their location in documents, fundamental to search engines.' }
  ].slice(0, count);
};

const generateAIQuiz = async ({ subject, topic, numberOfQuestions = 5, difficulty = 'Medium', noteContent = '' }) => {
  const prompt = 'Generate ' + numberOfQuestions + ' multiple choice questions on ' + subject + ' - ' + (topic || 'Core Topics') + ' at ' + difficulty + ' difficulty. Return ONLY JSON format: { "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }] }';
  const aiRes = await callGeminiAPI(prompt);
  const parsed = extractJSON(aiRes);
  if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
    return { success: true, source: 'ai-gemini', questions: parsed.questions };
  }
  return { success: true, source: 'ai-engine', questions: getFallbackQuiz(subject, topic, numberOfQuestions) };
};

const generateAIFlashcards = async ({ subject, topic, count = 6, noteContent = '' }) => {
  const prompt = 'Generate ' + count + ' flashcards on ' + subject + ' - ' + (topic || 'Key Concepts') + '. Return ONLY JSON format: { "flashcards": [{ "topic": "' + (topic || subject) + '", "question": "...", "answer": "..." }] }';
  const aiRes = await callGeminiAPI(prompt);
  const parsed = extractJSON(aiRes);
  if (parsed && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
    return { success: true, source: 'ai-gemini', flashcards: parsed.flashcards };
  }
  return { success: true, source: 'ai-engine', flashcards: getFallbackFlashcards(subject, topic, count) };
};

const generateAISummary = async ({ title, content, subject = '' }) => {
  const prompt = 'Summarize key points, formulas, and viva notes for: ' + title + ' (' + subject + '). ' + (content ? content.substring(0, 1000) : '');
  const aiRes = await callGeminiAPI(prompt);
  if (aiRes) return { success: true, source: 'ai-gemini', summary: aiRes };
  return {
    success: true,
    source: 'ai-engine',
    summary: '### ?? Summary: ' + title + ' (' + (subject || 'Engineering') + ')\n\n' +
      '* **Core Principles**: Fundamentals and structural rules governing ' + title + '.\n' +
      '* **Key Tradeoffs**: Space vs Time complexity, latency vs throughput parameters.\n' +
      '* **Exam Tips**: Focus on definitions, architectural diagrams, and boundary cases.\n' +
      '* **Viva Prep**: Be ready to contrast with standard baseline techniques.'
  };
};

const generateAIStudyPlan = async ({ subject, examDate, weakTopics = [], daysAvailable = 7 }) => {
  const prompt = 'Create a ' + daysAvailable + ' day study roadmap for ' + subject + ' exam on ' + (examDate || 'next week') + '.';
  const aiRes = await callGeminiAPI(prompt);
  if (aiRes) return { success: true, source: 'ai-gemini', plan: aiRes };
  return {
    success: true,
    source: 'ai-engine',
    plan: '### ?? ' + daysAvailable + '-Day Smart Study Plan for ' + subject + '\n\n' +
      '* **Days 1-2**: Foundation & Core Algorithms review.\n' +
      '* **Days 3-4**: Deep dive into ' + (weakTopics.length ? weakTopics.join(', ') : 'complex topics') + ' and numericals.\n' +
      '* **Days 5-6**: Active recall with Flashcards & Practice Quizzes.\n' +
      '* **Day 7**: Formula cheat-sheet revision and mock viva testing.'
  };
};

const chatWithAIAssistant = async ({ message, subject = '', conversationHistory = [], studentContext = {} }) => {
  const prompt = 'Student: ' + message + '\nSubject: ' + (subject || 'General') + '\nProvide a helpful, educational response with bullet points.';
  const aiRes = await callGeminiAPI(prompt, 'You are Yukti AI, an intelligent study assistant for computer engineering students.');
  if (aiRes) return { success: true, source: 'ai-gemini', reply: aiRes };

  return {
    success: true,
    source: 'ai-engine',
    reply: 'Hello! I am **Yukti AI Study Assistant**. ??\n\n' +
      'Regarding **' + (subject || 'your question') + '**: \n' +
      '1. Focus on core structural concepts before memorizing edge cases.\n' +
      '2. Practice with **Flashcards** and **Quizzes** to test retention.\n' +
      '3. Schedule 45-minute focused study sessions in the **Study Planner**.\n\n' +
      'How else can I help you prepare today?'
  };
};

module.exports = {
  generateAIQuiz,
  generateAIFlashcards,
  generateAISummary,
  generateAIStudyPlan,
  chatWithAIAssistant
};
