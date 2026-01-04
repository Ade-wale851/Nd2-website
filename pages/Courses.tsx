import React, { useState } from 'react';
import { Book, Lightbulb, Loader2, ChevronRight, X } from 'lucide-react';
import { INITIAL_COURSES } from '../constants';
import { Course } from '../types';
import { getCourseStrategy } from '../services/geminiService';

const Courses: React.FC = () => {
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [aiTip, setAiTip] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGetTips = async (course: Course) => {
    setActiveCourse(course);
    setLoading(true);
    setAiTip('');
    
    const tip = await getCourseStrategy(course.title, course.units, course.description);
    setAiTip(tip);
    setLoading(false);
  };

  const closeModal = () => {
    setActiveCourse(null);
    setAiTip('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Departmental Courses</h1>
        <p className="text-slate-500 dark:text-slate-400">ND2 Computer Science Curriculum & Study Guides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_COURSES.map((course) => (
          <div key={course.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded">
                  {course.code}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">{course.units} Units</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{course.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => handleGetTips(course)}
                className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Lightbulb size={16} />
                Get Grade 'A' Strategy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Advice Modal */}
      {activeCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{activeCourse.code} Strategy</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini AI</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Loader2 className="animate-spin mb-3" size={32} />
                  <p>Analyzing course syllabus...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-blue dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{aiTip}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-xl flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;