import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, MapPin, Edit2, Lock } from 'lucide-react';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../constants';
import { TimetableEntry, Student } from '../types';
import { dbTimetable } from '../services/db';

const Timetable: React.FC = () => {
  const userString = localStorage.getItem('cs_portal_user');
  const user: Student = userString ? JSON.parse(userString) : { role: 'student' };
  const isGovernor = user.role === 'governor';

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimetableEntry>>({
    day: 'Monday',
    time: TIME_SLOTS[0],
    courseCode: '',
    type: 'Lecture',
    venue: ''
  });

  useEffect(() => {
    const fetch = async () => {
      const data = await dbTimetable.getAll();
      setEntries(data);
    };
    fetch();
  }, []);

  const handleDelete = async (day: string, time: string) => {
    const updated = entries.filter(e => !(e.day === day && e.time === time));
    setEntries(updated);
    await dbTimetable.saveAll(updated);
  };

  const openAddModal = (day: string, time: string) => {
    setCurrentEntry({ day, time, courseCode: '', type: 'Lecture', venue: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!currentEntry.courseCode || !currentEntry.venue) return;

    // Remove existing entry for this slot if any
    const filtered = entries.filter(
      e => !(e.day === currentEntry.day && e.time === currentEntry.time)
    );

    const newEntries = [...filtered, currentEntry as TimetableEntry];
    setEntries(newEntries);
    await dbTimetable.saveAll(newEntries);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Weekly Timetable</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your lectures and practicals.</p>
        </div>
        
        {isGovernor ? (
            <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            >
            {isEditing ? 'Done Editing' : 'Edit Timetable'}
            <Edit2 size={16} />
            </button>
        ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm font-medium">
                <Lock size={14} /> Read Only
            </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 w-32 font-semibold text-slate-700 dark:text-slate-300">Time / Day</th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day} className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {TIME_SLOTS.map(time => (
              <tr key={time}>
                <td className="p-4 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 font-medium text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {time}
                </td>
                {DAYS_OF_WEEK.map(day => {
                  const entry = entries.find(e => e.day === day && e.time === time);
                  return (
                    <td key={`${day}-${time}`} className="p-2 border-r border-slate-100 dark:border-slate-800 h-32 align-top relative group">
                      {entry ? (
                        <div className={`
                          h-full p-2 rounded-lg border flex flex-col justify-between text-xs
                          ${entry.type === 'Lecture' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'}
                        `}>
                          <div>
                            <span className={`
                              px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 inline-block
                              ${entry.type === 'Lecture' ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300' : 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300'}
                            `}>
                              {entry.type}
                            </span>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{entry.courseCode}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <MapPin size={10} />
                            <span className="truncate">{entry.venue}</span>
                          </div>

                          {isEditing && (
                            <button 
                              onClick={() => handleDelete(day, time)}
                              className="absolute top-1 right-1 bg-red-100 text-red-500 p-1 rounded hover:bg-red-200"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ) : (
                        isEditing && (
                          <button 
                            onClick={() => openAddModal(day, time)}
                            className="w-full h-full rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                          >
                            <Plus size={20} />
                          </button>
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-sm w-full p-6">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Add Class</h3>
            <div className="space-y-3">
               <div>
                 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Time Slot</p>
                 <p className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-2 rounded">{currentEntry.day} @ {currentEntry.time}</p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                 <input 
                   type="text" 
                   value={currentEntry.courseCode} 
                   onChange={(e) => setCurrentEntry({...currentEntry, courseCode: e.target.value})}
                   className="w-full border dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded p-2 text-sm uppercase"
                   placeholder="e.g. COM 211"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                 <input 
                   type="text" 
                   value={currentEntry.venue} 
                   onChange={(e) => setCurrentEntry({...currentEntry, venue: e.target.value})}
                   className="w-full border dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded p-2 text-sm"
                   placeholder="e.g. Lab 1"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                 <select 
                   value={currentEntry.type}
                   onChange={(e) => setCurrentEntry({...currentEntry, type: e.target.value as 'Lecture' | 'Practical'})}
                   className="w-full border dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded p-2 text-sm"
                 >
                   <option value="Lecture">Lecture</option>
                   <option value="Practical">Practical</option>
                 </select>
               </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;