import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Bell, Trash2, Calendar, User, AlertTriangle, X } from 'lucide-react';
import { Announcement, Student } from '../types';
import { dbAnnouncements } from '../services/db';

const Announcements: React.FC = () => {
  const userString = localStorage.getItem('cs_portal_user');
  const user: Student = userString ? JSON.parse(userString) : { role: 'student' };
  const isGovernor = user.role === 'governor';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState<{ title: string; content: string; priority: 'normal' | 'urgent' }>({
    title: '',
    content: '',
    priority: 'normal'
  });

  useEffect(() => {
    const fetch = async () => {
      const data = await dbAnnouncements.getAll();
      setAnnouncements(data);
    };
    fetch();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    const post: Announcement = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      priority: newPost.priority,
      date: new Date().toISOString().split('T')[0],
      author: user.name
    };

    const updatedList = await dbAnnouncements.add(post);
    setAnnouncements(updatedList);
    setShowModal(false);
    setNewPost({ title: '', content: '', priority: 'normal' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      const updatedList = await dbAnnouncements.delete(id);
      setAnnouncements(updatedList);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Information Board</h1>
          <p className="text-slate-500 dark:text-slate-400">Latest news and updates from the class executive.</p>
        </div>
        {isGovernor && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> Broadcast Info
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {announcements.length === 0 ? (
           <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
              <Megaphone size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-700" />
              <p className="text-slate-400 dark:text-slate-500">No announcements yet.</p>
           </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${item.priority === 'urgent' ? 'border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-slate-200 dark:border-slate-800'}`}>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                        {item.priority === 'urgent' ? (
                          <span className="flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                             <AlertTriangle size={12} /> URGENT
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                             <Bell size={12} /> INFO
                          </span>
                        )}
                        <span className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1">
                           <Calendar size={12} /> {item.date}
                        </span>
                     </div>
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{item.title}</h2>
                  </div>
                  {isGovernor && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
               </div>
               
               <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300 mb-4">
                 <p>{item.content}</p>
               </div>

               <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                     <User size={14} />
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Posted by <span className="text-slate-700 dark:text-slate-200">{item.author}</span></p>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Broadcast</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Change of Lecture Venue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 h-32 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Type your announcement here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      checked={newPost.priority === 'normal'}
                      onChange={() => setNewPost({...newPost, priority: 'normal'})}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Normal Info</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      checked={newPost.priority === 'urgent'}
                      onChange={() => setNewPost({...newPost, priority: 'urgent'})}
                      className="text-red-600"
                    />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">Urgent / Important</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;