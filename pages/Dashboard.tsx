import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { INITIAL_ASSIGNMENTS, INITIAL_HANDOUTS } from '../constants';

const Dashboard: React.FC = () => {
  const attendanceData = [
    { name: 'Mon', present: 80 },
    { name: 'Tue', present: 65 },
    { name: 'Wed', present: 90 },
    { name: 'Thu', present: 45 },
    { name: 'Fri', present: 70 },
  ];

  const pendingAssignments = INITIAL_ASSIGNMENTS.filter(a => a.status === 'pending').length;
  // Update: Check for status !== 'paid' (counts unpaid and pending)
  const unpaidHandouts = INITIAL_HANDOUTS.filter(h => h.status !== 'paid').length;

  const assignmentData = [
    { name: 'Submitted', value: INITIAL_ASSIGNMENTS.length - pendingAssignments },
    { name: 'Pending', value: pendingAssignments },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back! Here is your academic overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Pending Assignments</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pendingAssignments}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Unpaid Handouts</h3>
          <p className="text-3xl font-bold text-red-500 dark:text-red-400">{unpaidHandouts}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Avg. Attendance</h3>
          <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">75%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-80 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#64748b" className="dark:stroke-slate-400" tick={{fill: 'currentColor'}} />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" tick={{fill: 'currentColor'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-80 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Assignment Status</h3>
          <div className="flex h-full pb-8">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assignmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-2 pr-8">
               {assignmentData.map((entry, index) => (
                 <div key={index} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                   <span className="text-sm text-slate-600 dark:text-slate-300">{entry.name}: {entry.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;