import React, { useState, useEffect } from 'react';
import { BookOpen, Check, Copy, MessageCircle, AlertCircle, Clock, CheckCircle, ShieldCheck, XCircle } from 'lucide-react';
import { Handout, Student } from '../types';
import { dbHandouts } from '../services/db';

const Handouts: React.FC = () => {
  const userString = localStorage.getItem('cs_portal_user');
  const user: Student = userString ? JSON.parse(userString) : { role: 'student' };
  const isGovernor = user.role === 'governor';

  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [selectedHandout, setSelectedHandout] = useState<Handout | null>(null);
  const [transactionRef, setTransactionRef] = useState('');

  // Mock pending payments for Governor view
  const [pendingPayments, setPendingPayments] = useState([
      { id: 'pay1', studentName: 'Taiwo Ade', course: 'COM 214', amount: 1200, ref: 'REF-829102' },
      { id: 'pay2', studentName: 'Bisi Ola', course: 'COM 211', amount: 1500, ref: 'REF-112233' },
  ]);

  // Mock Class Governor Data
  const classRep = {
    name: "Ibrahim Musa (Gov)",
    bankName: "OPay / Kuda",
    accountNumber: "9012345678",
    phone: "2349012345678" // Format for WhatsApp link
  };

  useEffect(() => {
    const fetch = async () => {
      const data = await dbHandouts.getAll();
      setHandouts(data);
    };
    fetch();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!transactionRef.trim()) {
      alert("Please enter the transaction reference number.");
      return;
    }

    const updated = await dbHandouts.updateStatus(id, 'pending');
    setHandouts(updated);
    setSelectedHandout(null);
    setTransactionRef('');
  };

  const approvePayment = (id: string) => {
      setPendingPayments(prev => prev.filter(p => p.id !== id));
      // In a real multi-user DB, we would find the specific student's handout record and update it here.
  };

  // Generate WhatsApp Link
  const getWhatsAppLink = (handout: Handout) => {
    const message = `Hi Gov, I have paid ₦${handout.price.toLocaleString()} for ${handout.courseCode} (${handout.title}). My Matric Number is H/CS/23/001. Please verify.`;
    return `https://wa.me/${classRep.phone}?text=${encodeURIComponent(message)}`;
  };

  if (isGovernor) {
      return (
        <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" />
                        Governor Payment Portal
                    </h1>
                    <p className="text-slate-400">Verify and approve student handout payments.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-slate-800 dark:text-white">Pending Approvals ({pendingPayments.length})</h2>
                </div>
                {pendingPayments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <CheckCircle size={48} className="mx-auto mb-3 text-emerald-200 dark:text-emerald-900" />
                        <p>All payments verified!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pendingPayments.map(payment => (
                            <div key={payment.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 dark:text-white">{payment.studentName}</h3>
                                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded font-bold">{payment.course}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Ref: <span className="font-mono text-slate-700 dark:text-slate-300">{payment.ref}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-slate-800 dark:text-white">₦{payment.amount.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => approvePayment(payment.id)}
                                        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center gap-1"
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                    <button 
                                        onClick={() => approvePayment(payment.id)} // Mock reject behavior
                                        className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-800 flex items-center gap-1"
                                    >
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Handouts & Materials</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage course material payments via Class Governor.</p>
        </div>
      </div>

      {/* Class Gov Payment Details Card */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <BookOpen size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/30 px-2 py-1 rounded text-xs font-semibold border border-blue-400/30">PAYMENT INSTRUCTIONS</span>
          </div>
          <h2 className="text-xl font-bold mb-4">Pay to Class Governor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <p className="text-blue-200 text-xs mb-1 uppercase tracking-wide">Account Name</p>
               <p className="font-semibold text-lg">{classRep.name}</p>
            </div>
            <div>
               <p className="text-blue-200 text-xs mb-1 uppercase tracking-wide">Bank & Account</p>
               <div className="flex items-center gap-3">
                 <p className="font-mono text-xl font-bold tracking-wider">{classRep.accountNumber}</p>
                 <button onClick={() => handleCopy(classRep.accountNumber)} className="p-1 hover:bg-white/20 rounded">
                   <Copy size={16} />
                 </button>
               </div>
               <p className="text-sm text-blue-200">{classRep.bankName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {handouts.map(handout => (
          <div key={handout.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col relative transition-colors">
             {/* Status Badge */}
             <div className="absolute top-3 right-3 z-10">
               {handout.status === 'paid' && (
                 <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-sm">
                   <CheckCircle size={12} /> PAID
                 </span>
               )}
               {handout.status === 'pending' && (
                 <span className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800 shadow-sm">
                   <Clock size={12} /> PENDING
                 </span>
               )}
               {handout.status === 'unpaid' && (
                 <span className="flex items-center gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                   <AlertCircle size={12} /> UNPAID
                 </span>
               )}
             </div>

             <div className="h-32 bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
               <BookOpen size={48} className={`
                 ${handout.status === 'paid' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}
               `} />
             </div>
             
             <div className="p-5 flex-1">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {handout.courseCode}
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-2 leading-tight">{handout.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 flex items-center gap-1">
                   Cost: <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1 rounded">₦{handout.price.toLocaleString()}</span>
                </p>
             </div>

             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                {handout.status === 'paid' ? (
                  <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    <Check size={16} /> Collect / Download
                  </button>
                ) : handout.status === 'pending' ? (
                   <button 
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 py-2 rounded-lg cursor-not-allowed opacity-75"
                   >
                    <Clock size={16} /> Awaiting Verification
                   </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedHandout(handout);
                      setTransactionRef('');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm"
                  >
                    Pay Class Rep
                  </button>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* Payment Confirmation Modal */}
      {selectedHandout && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Confirm Payment</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Follow these steps to complete your payment for <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedHandout.courseCode}</span>.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Transfer Money</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Send ₦{selectedHandout.price.toLocaleString()} to {classRep.accountNumber} ({classRep.bankName}).</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Notify Governor</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Send proof of payment via WhatsApp.</p>
                  <a 
                    href={getWhatsAppLink(selectedHandout)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle size={14} /> Open WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">3</div>
                <div className="w-full">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Confirm Payment</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Enter transaction ID below.</p>
                  <input 
                    type="text" 
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Transaction Ref / ID (e.g. 000123...)"
                    className="w-full text-sm p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setSelectedHandout(null)}
                className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleMarkAsPaid(selectedHandout.id)}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
              >
                I Have Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Handouts;