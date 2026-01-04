export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  description: string;
}

export interface Student {
  id: string;
  matricNumber: string;
  name: string;
  email: string;
  role: 'student' | 'governor';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  courseCode: string;
  status: 'present' | 'absent' | 'late';
  verified: boolean;
  studentName?: string;
  matricNumber?: string;
}

export interface Assignment {
  id: string;
  courseCode: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
}

export interface Handout {
  id: string;
  courseCode: string;
  title: string;
  price: number;
  status: 'unpaid' | 'pending' | 'paid';
}

export interface TimetableEntry {
  day: string;
  time: string;
  courseCode: string;
  type: 'Lecture' | 'Practical';
  venue: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'normal' | 'urgent';
}