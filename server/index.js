const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Use the PORT environment variable provided by the cloud host, or default to 8000
const PORT = process.env.PORT || 8000;
// Use /tmp for writing files in serverless/read-only environments if necessary, 
// though standard persistent storage is recommended for production.
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// Initial Data Seeding (Matches constants.ts)
const INITIAL_DATA = {
  announcements: [
    {
      id: '1',
      title: 'Emergency General Meeting',
      content: 'There will be a mandatory general meeting for all ND2 students at the department foyer by 12pm tomorrow regarding the upcoming exams. Attendance is compulsory.',
      date: '2023-11-15',
      author: 'Class Governor',
      priority: 'urgent'
    },
    {
      id: '2',
      title: 'SIWES Logbook Submission',
      content: 'Please submit your SIWES logbooks to the department secretary before Friday. Ensure it is signed by your industry supervisor.',
      date: '2023-11-10',
      author: 'Asst. Class Rep',
      priority: 'normal'
    }
  ],
  assignments: [
    { id: '1', courseCode: 'COM 211', title: 'Build a Java Calculator', dueDate: '2023-11-20', status: 'pending' },
    { id: '2', courseCode: 'GNS 201', title: 'Technical Report Draft', dueDate: '2023-11-25', status: 'submitted' }
  ],
  handouts: [
    { id: '1', courseCode: 'COM 211', title: 'Java OOP Fundamentals', price: 1500, status: 'paid' },
    { id: '2', courseCode: 'COM 214', title: 'File Structures Guide', price: 1200, status: 'unpaid' },
    { id: '3', courseCode: 'EED 216', title: 'Business Plan Template', price: 1000, status: 'unpaid' }
  ],
  timetable: [
    { day: 'Monday', time: '8:00 - 10:00', courseCode: 'COM 211', type: 'Lecture', venue: 'CS Hall 1' },
    { day: 'Monday', time: '14:00 - 16:00', courseCode: 'COM 211', type: 'Practical', venue: 'Lab A' },
    { day: 'Tuesday', time: '10:00 - 12:00', courseCode: 'COM 212', type: 'Lecture', venue: 'CS Hall 2' },
    { day: 'Wednesday', time: '8:00 - 10:00', courseCode: 'COM 215', type: 'Lecture', venue: 'Hardware Lab' }
  ],
  attendance: []
};

// Database Helper Functions
const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
      return INITIAL_DATA;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading DB:", error);
    return INITIAL_DATA;
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing DB:", error);
  }
};

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'CS Portal Backend is running' });
});

// Announcements
app.get('/announcements', (req, res) => {
  const db = readDb();
  res.json(db.announcements);
});

app.post('/announcements', (req, res) => {
  const db = readDb();
  const newPost = req.body;
  db.announcements.unshift(newPost); // Add to top
  writeDb(db);
  res.json(db.announcements);
});

app.delete('/announcements/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.announcements = db.announcements.filter(a => a.id !== id);
  writeDb(db);
  res.json(db.announcements);
});

// Assignments
app.get('/assignments', (req, res) => {
  const db = readDb();
  res.json(db.assignments);
});

app.post('/assignments', (req, res) => {
  const db = readDb();
  const newItem = req.body;
  db.assignments.push(newItem);
  writeDb(db);
  res.json(db.assignments);
});

// Handouts
app.get('/handouts', (req, res) => {
  const db = readDb();
  res.json(db.handouts);
});

app.put('/handouts/:id/status', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { status } = req.body;
  
  const index = db.handouts.findIndex(h => h.id === id);
  if (index !== -1) {
    db.handouts[index].status = status;
    writeDb(db);
  }
  res.json(db.handouts);
});

// Timetable
app.get('/timetable', (req, res) => {
  const db = readDb();
  res.json(db.timetable);
});

app.post('/timetable', (req, res) => {
  const db = readDb();
  const items = req.body; // Expecting the full array
  if (Array.isArray(items)) {
    db.timetable = items;
    writeDb(db);
  }
  res.json(db.timetable);
});

// Attendance
app.get('/attendance', (req, res) => {
  const db = readDb();
  res.json(db.attendance);
});

app.post('/attendance', (req, res) => {
  const db = readDb();
  const record = req.body;
  db.attendance.unshift(record);
  writeDb(db);
  // Return entire updated list
  res.json(db.attendance);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});