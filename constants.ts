import { Course, TimetableEntry, Assignment, Handout, Announcement } from './types';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const TIME_SLOTS = ['8:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00'];

export const INITIAL_COURSES: Course[] = [
  { id: '1', code: 'COM 211', title: 'Computer Programming II (Java)', units: 3, description: 'Object-oriented programming concepts using Java.' },
  { id: '2', code: 'COM 212', title: 'Intro to Systems Programming', units: 2, description: 'Assemblers, Compilers, and Operating System basics.' },
  { id: '3', code: 'COM 213', title: 'Commercial Application Packages', units: 2, description: 'Advanced use of spreadsheet and database management software.' },
  { id: '4', code: 'COM 214', title: 'File Organization & Management', units: 2, description: 'Data structures, file access methods, and storage strategies.' },
  { id: '5', code: 'COM 215', title: 'Computer Hardware II', units: 2, description: 'Digital logic, circuit design, and maintenance.' },
  { id: '6', code: 'GNS 201', title: 'Communication in English II', units: 2, description: 'Advanced reporting writing and professional communication.' },
  { id: '7', code: 'EED 216', title: 'Entrepreneurship Development', units: 2, description: 'Business planning and management skills.' },
];

export const INITIAL_TIMETABLE: TimetableEntry[] = [
  { day: 'Monday', time: '8:00 - 10:00', courseCode: 'COM 211', type: 'Lecture', venue: 'CS Hall 1' },
  { day: 'Monday', time: '14:00 - 16:00', courseCode: 'COM 211', type: 'Practical', venue: 'Lab A' },
  { day: 'Tuesday', time: '10:00 - 12:00', courseCode: 'COM 212', type: 'Lecture', venue: 'CS Hall 2' },
  { day: 'Wednesday', time: '8:00 - 10:00', courseCode: 'COM 215', type: 'Lecture', venue: 'Hardware Lab' },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: '1', courseCode: 'COM 211', title: 'Build a Java Calculator', dueDate: '2023-11-20', status: 'pending' },
  { id: '2', courseCode: 'GNS 201', title: 'Technical Report Draft', dueDate: '2023-11-25', status: 'submitted' },
];

export const INITIAL_HANDOUTS: Handout[] = [
  { id: '1', courseCode: 'COM 211', title: 'Java OOP Fundamentals', price: 1500, status: 'paid' },
  { id: '2', courseCode: 'COM 214', title: 'File Structures Guide', price: 1200, status: 'unpaid' },
  { id: '3', courseCode: 'EED 216', title: 'Business Plan Template', price: 1000, status: 'unpaid' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
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
];