import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BookOpen, 
  FileText, 
  CreditCard, 
  CalendarDays,
  Menu,
  X,
  GraduationCap,
  LogOut,
  ShieldAlert,
  Megaphone,
  Moon,
  Sun,
  WifiOff,
  Terminal
} from 'lucide-react';
import { Student } from '../types';
import { checkBackendStatus } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  user: Student;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isGovernor = user.role === 'governor';
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Check Backend Status on Mount
  useEffect(() => {
    const checkStatus = async () => {
      const online = await checkBackendStatus();
      setIsBackendOnline(online);
    };
    checkStatus();
    // Poll every 10 seconds to check if it comes back
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/announcements', label: 'Info Board', icon: Megaphone },
    { path: '/attendance', label: isGovernor ? 'Attendance Control' : 'Attendance', icon: CalendarCheck },
    { path: '/courses', label: 'Courses & Tips', icon: BookOpen },
    { path: '/timetable', label: 'Timetable', icon: CalendarDays },
    { path: '/assignments', label: isGovernor ? 'Manage Tasks' : 'Assignments', icon: FileText },
    { path: '/handouts', label: isGovernor ? 'Verify Payments' : 'Handouts & Pay', icon: CreditCard },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Backend Offline Warning */}
      {!isBackendOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs font-bold py-3 px-4 text-center flex items-center justify-center gap-3 shadow-md">
          <WifiOff size={16} />
          <span>Offline Mode. To save data, open terminal and run:</span>
          <code className="bg-black/20 px-2 py-1 rounded font-mono flex items-center gap-1">
             <Terminal size={12} /> cd server && npm start
          </code>
        </div>
      )}

      {/* Mobile Header */}
      <div className={`md:hidden text-white p-4 flex justify-between items-center sticky ${!isBackendOnline ? 'top-10' : 'top-0'} z-20 ${isGovernor ? 'bg-slate-900' : 'bg-blue-900 dark:bg-blue-950'}`}>
        <div className="flex items-center gap-2">
          {isGovernor ? <ShieldAlert size={24} className="text-emerald-400" /> : <GraduationCap size={24} />}
          <span className="font-bold text-lg">FedPoly CS ND2</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky ${!isBackendOnline ? 'top-10' : 'top-0'} h-screen w-64 text-white transition-transform duration-300 z-10
          ${isGovernor ? 'bg-slate-900 border-r border-slate-800' : 'bg-blue-900 dark:bg-slate-900 border-r dark:border-slate-800'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col
        `}
      >
        <div className={`p-6 border-b hidden md:flex items-center gap-3 ${isGovernor ? 'border-slate-800' : 'border-blue-800 dark:border-slate-800'}`}>
          {isGovernor ? <ShieldAlert size={32} className="text-emerald-400" /> : <GraduationCap size={32} />}
          <div>
            <h1 className="font-bold text-xl leading-none">FedPoly Ado</h1>
            <span className={`text-xs ${isGovernor ? 'text-emerald-400' : 'text-blue-200'}`}>
                {isGovernor ? 'GOVERNOR PANEL' : 'Comp. Sci. ND2'}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive(item.path) 
                  ? (isGovernor ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'bg-blue-700 dark:bg-slate-800 text-white shadow-md') 
                  : (isGovernor ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-blue-100 hover:bg-blue-800 dark:hover:bg-slate-800 hover:text-white')}
              `}
            >
              <item.icon size={20} className={isActive(item.path) && isGovernor ? 'text-emerald-400' : ''} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={`p-4 border-t ${isGovernor ? 'border-slate-800' : 'border-blue-800 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4 px-1">
             <span className="text-xs text-blue-200 dark:text-slate-400 uppercase font-bold">Theme</span>
             <button 
               onClick={() => setDarkMode(!darkMode)}
               className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
               aria-label="Toggle Dark Mode"
             >
               {darkMode ? <Sun size={16} className="text-amber-300" /> : <Moon size={16} className="text-blue-200" />}
             </button>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold uppercase text-sm ${isGovernor ? 'bg-emerald-500 text-slate-900' : 'bg-blue-500'}`}>
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className={`text-xs truncate uppercase ${isGovernor ? 'text-emerald-400 font-bold' : 'text-blue-300'}`}>
                  {isGovernor ? 'Class Governor' : user.matricNumber}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium transition-colors ${
                isGovernor 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' 
                : 'bg-blue-800/50 hover:bg-blue-800 text-blue-200 hover:text-white'
            }`}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] md:h-screen ${!isBackendOnline ? 'mt-10' : ''}`}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;