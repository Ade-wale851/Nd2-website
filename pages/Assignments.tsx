import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, File, Bell, Plus, X } from 'lucide-react';
import { INITIAL_COURSES } from '../constants';
import { Student, Assignment } from '../types';
import { dbAssignments } from '../services/db';

const Assignments: React.FC = () => {
  const userString = localStorage.getItem('cs_portal_user');
  const user: Student = userString ? JSON.parse(userString) : { role: 'student' };
  const isGovernor = user.role === 'governor';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
      courseCode: INITIAL_COURSES[0].code,
      title: '',
      dueDate: '',
      status: 'pending'
  });

  useEffect(() => {
    const fetch = async () => {
      const data = await dbAssignments.getAll();
      setAssignments(data);
    };
    fetch();
  }, []);

  const handleAddAssignment = async () => {
      if(!newAssignment.title || !newAssignment.dueDate) return;
      
      const assignment: Assignment = {
          id: Date.now().toString(),
          courseCode: newAssignment.courseCode || 'COM 211',
          title: newAssignment.title,
          dueDate: newAssignment.dueDate,
          status: 'pending'
      };

      const updatedList = await dbAssignments.add(assignment);
      setAssignments(updatedList);
      setShowAddModal(false);
      setNewAssignment({ courseCode: INITIAL_COURSES[0].code, title: '', dueDate: '', status: 'pending' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Assignments & Tasks</h1>
            <p className="text-slate-500 dark:text-slate-400">View upcoming assignments and due dates.</p>
        </div>
        {isGovernor && (
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
                <Plus size={18} /> Post Assignment
            </button>
        )}
      </div>

      <div className="grid gap-4">
        {assignments.map(assignment => (
          <div key={assignment.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between relative overflow-hidden transition-colors">
             
             {/* Status Border Indicator */}
             <div className={`absolute left-0 top-0 bottom-0 w-1 ${assignment.status === 'submitted' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

            <div className="flex-1 pl-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                  {assignment.courseCode}
                </span>
                
                {assignment.status === 'pending' ? (
                  <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
                    <Clock size={12} /> Due: {assignment.dueDate}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle size={12} /> Completed
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{assignment.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {assignment.status === 'pending' 
                  ? "This assignment is currently active. Please ensure you complete it before the deadline."
                  : "This assignment is recorded as submitted."}
              </p>
            </div>

            <div className="w-full md:w-auto flex items-center justify-end">
               {assignment.status === 'pending' ? (
                   <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700 w-full md:w-auto">
                       <Bell size={20} className="text-amber-500 shrink-0" />
                       <div className="text-right">
                           <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase">Deadline</p>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{assignment.dueDate}</p>
                       </div>
                   </div>
               ) : (
                   <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                       <CheckCircle size={18} />
                       <span className="text-sm font-medium">Done</span>
                   </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
          <File size={48} className="mx-auto mb-3 opacity-30" />
          <p>No assignments found for this semester.</p>
        </div>
      )}

      {/* Add Assignment Modal for Governor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Post New Assignment</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course</label>
                        <select 
                            value={newAssignment.courseCode}
                            onChange={(e) => setNewAssignment({...newAssignment, courseCode: e.target.value})}
                            className="w-full border dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        >
                            {INITIAL_COURSES.map(course => (
                                <option key={course.id} value={course.code}>{course.code}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignment Title / Description</label>
                        <input 
                            type="text"
                            value={newAssignment.title}
                            onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                            placeholder="e.g. Lab Report 3"
                            className="w-full border dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                        <input 
                            type="date"
                            value={newAssignment.dueDate}
                            onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                            className="w-full border dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button 
                        onClick={handleAddAssignment}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Publish Assignment
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;