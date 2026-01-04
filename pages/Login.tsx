import React, { useState } from 'react';
import { GraduationCap, User, Mail, FileBadge, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { Student } from '../types';

interface LoginProps {
  onLogin: (student: Student) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isGovernor, setIsGovernor] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricNumber: '',
    govPin: ''
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Common validations
    if (!formData.name || !formData.email) {
        setError('Name and Email are required.');
        return;
    }

    let userRole: 'student' | 'governor' = 'student';

    if (isGovernor) {
        // Governor Validation
        if (formData.govPin !== 'GOV-ND2') { // Simple hardcoded PIN for demo
            setError('Invalid Governor Access PIN.');
            return;
        }
        userRole = 'governor';
    } else {
        // Student Validation
        if (!formData.matricNumber) {
            setError('Matric Number is required.');
            return;
        }
        // Validate Matric Number Format: FPA/CS/24/1-XXXX
        const matricRegex = /^FPA\/CS\/24\/1-\d{4}$/;
        const normalizedMatric = formData.matricNumber.trim().toUpperCase();

        if (!matricRegex.test(normalizedMatric)) {
            setError('Invalid Matric Number. Format must be FPA/CS/24/1-XXXX (e.g., FPA/CS/24/1-0042)');
            return;
        }
    }

    const user: Student = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        matricNumber: isGovernor ? 'GOV-ADMIN' : formData.matricNumber.trim().toUpperCase(),
        role: userRole
    };
    
    // Save to local storage for persistence
    localStorage.setItem('cs_portal_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
       <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
          <div className={`p-8 text-center relative overflow-hidden transition-colors duration-500 ${isGovernor ? 'bg-slate-900' : 'bg-blue-900'}`}>
             {/* Background decorative circles */}
             <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full opacity-50"></div>
             <div className="absolute top-10 -right-10 w-24 h-24 bg-white/10 rounded-full opacity-50"></div>

             <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-4 ring-4 ring-white/20 ${isGovernor ? 'bg-slate-800' : 'bg-blue-800'}`}>
                    {isGovernor ? <ShieldAlert size={32} /> : <GraduationCap size={32} />}
                </div>
                <h1 className="text-2xl font-bold text-white">{isGovernor ? 'Governor Control' : 'Student Portal'}</h1>
                <p className="text-blue-200 text-sm mt-1">Computer Science ND2</p>
             </div>
          </div>
          
          <div className="p-8">
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
                <button 
                    onClick={() => setIsGovernor(false)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isGovernor ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-900 dark:text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Student Login
                </button>
                <button 
                    onClick={() => setIsGovernor(true)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isGovernor ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Class Gov Login
                </button>
             </div>
             
             {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                   <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="e.g. Ibrahim Musa"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                   </div>
                </div>

                {isGovernor ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Governor Access PIN</label>
                        <div className="relative">
                            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                placeholder="Enter Admin PIN"
                                value={formData.govPin}
                                onChange={e => setFormData({...formData, govPin: e.target.value})}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 ml-1">Default Demo PIN: <strong>GOV-ND2</strong></p>
                    </div>
                ) : (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matric Number</label>
                    <div className="relative">
                        <FileBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            placeholder="FPA/CS/24/1-XXXX"
                            value={formData.matricNumber}
                            onChange={e => setFormData({...formData, matricNumber: e.target.value})}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 ml-1">Format: FPA/CS/24/1-0000</p>
                    </div>
                )}

                <button 
                  type="submit"
                  className={`w-full text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg ${isGovernor ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20' : 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'}`}
                >
                  {isGovernor ? 'Access Control Panel' : 'Access Portal'} <ArrowRight size={18} />
                </button>
             </form>
          </div>
       </div>
    </div>
  );
};

export default Login;