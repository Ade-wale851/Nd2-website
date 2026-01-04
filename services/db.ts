/// <reference types="vite/client" />
import { Announcement, Assignment, AttendanceRecord, Handout, TimetableEntry } from '../types';
import { INITIAL_ANNOUNCEMENTS, INITIAL_ASSIGNMENTS, INITIAL_HANDOUTS, INITIAL_TIMETABLE } from '../constants';

// In production, use the environment variable. In development, fallback to local.
// Remove trailing slash if present to avoid double slashes
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

// Fallback data providing a seamless "Demo Mode" when backend is unreachable
const getFallbackData = (endpoint: string) => {
  if (endpoint.includes('/announcements')) return INITIAL_ANNOUNCEMENTS;
  if (endpoint.includes('/assignments')) return INITIAL_ASSIGNMENTS;
  if (endpoint.includes('/handouts')) return INITIAL_HANDOUTS;
  if (endpoint.includes('/timetable')) return INITIAL_TIMETABLE;
  // Attendance and others default to empty
  return [];
};

const api = {
  get: async (endpoint: string) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (e) {
      console.warn(`Backend unreachable at ${endpoint}. Using local fallback data.`);
      return getFallbackData(endpoint);
    }
  },
  post: async (endpoint: string, data: any) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (e) {
      console.warn(`Backend unreachable. Simulating POST to ${endpoint}.`);
      // Simulate adding data locally for the session (volatile)
      const fallback = getFallbackData(endpoint);
      return [data, ...fallback];
    }
  },
  put: async (endpoint: string, data: any) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (e) {
      console.warn(`Backend unreachable. Simulating PUT to ${endpoint}.`);
      return getFallbackData(endpoint);
    }
  },
  delete: async (endpoint: string) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (e) {
      console.warn(`Backend unreachable. Simulating DELETE to ${endpoint}.`);
      return getFallbackData(endpoint);
    }
  }
};

export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    // Short timeout to avoid hanging the UI check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const res = await fetch(`${API_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'online';
  } catch (e) {
    return false;
  }
};

export const initDatabase = () => {
    // No-op
};

// Announcements
export const dbAnnouncements = {
  getAll: async (): Promise<Announcement[]> => api.get('/announcements'),
  add: async (item: Announcement): Promise<Announcement[]> => api.post('/announcements', item),
  delete: async (id: string): Promise<Announcement[]> => api.delete(`/announcements/${id}`)
};

// Assignments
export const dbAssignments = {
  getAll: async (): Promise<Assignment[]> => api.get('/assignments'),
  add: async (item: Assignment): Promise<Assignment[]> => api.post('/assignments', item)
};

// Timetable
export const dbTimetable = {
  getAll: async (): Promise<TimetableEntry[]> => api.get('/timetable'),
  saveAll: async (items: TimetableEntry[]): Promise<TimetableEntry[]> => api.post('/timetable', items)
};

// Handouts
export const dbHandouts = {
  getAll: async (): Promise<Handout[]> => api.get('/handouts'),
  updateStatus: async (id: string, status: 'unpaid' | 'pending' | 'paid'): Promise<Handout[]> => 
    api.put(`/handouts/${id}/status`, { status })
};

// Attendance
export const dbAttendance = {
  getAll: async (): Promise<AttendanceRecord[]> => api.get('/attendance'),
  add: async (record: AttendanceRecord): Promise<AttendanceRecord[]> => api.post('/attendance', record)
};