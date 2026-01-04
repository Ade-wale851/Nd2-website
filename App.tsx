import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Courses from './pages/Courses';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Handouts from './pages/Handouts';
import Announcements from './pages/Announcements';
import Login from './pages/Login';
import { Student } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const saved = localStorage.getItem('cs_portal_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse user session");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (student: Student) => {
    setUser(student);
  };

  const handleLogout = () => {
    localStorage.removeItem('cs_portal_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/handouts" element={<Handouts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;