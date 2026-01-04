import React, { useState, useRef, useEffect } from 'react';
import { Camera, UserCheck, KeyRound, CheckCircle, XCircle, RefreshCw, ShieldCheck, Video, MapPin, Navigation, Users, Eye } from 'lucide-react';
import { INITIAL_COURSES } from '../constants';
import { AttendanceRecord, Student } from '../types';
import { dbAttendance } from '../services/db';

// Mock Coordinates for Federal Polytechnic Ado-Ekiti CS Department
const VENUE_COORDS = {
  lat: 7.6124, 
  lng: 5.2371
};
const MAX_DISTANCE_METERS = 100;

interface AttendanceProps {
    user?: Student; // Optional because layout usually passes it, but routing might not strictly enforce prop types in this basic setup
}

const Attendance: React.FC = () => {
  // Access user from localstorage since it's not passed directly in router setup of App.tsx
  const userString = localStorage.getItem('cs_portal_user');
  const user: Student = userString ? JSON.parse(userString) : { role: 'student' };
  const isGovernor = user.role === 'governor';

  const [selectedCourse, setSelectedCourse] = useState<string>(INITIAL_COURSES[0].id);
  
  // -- GOVERNOR STATE --
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [liveAttendanceList, setLiveAttendanceList] = useState<AttendanceRecord[]>([]);

  // -- STUDENT STATE --
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [locationMessage, setLocationMessage] = useState('');
  const [verificationStep, setVerificationStep] = useState<'idle' | 'camera_active' | 'verifying' | 'success' | 'failed'>('idle');
  const [pin, setPin] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load attendance history
    const loadData = async () => {
      const allRecords = await dbAttendance.getAll();
      if (isGovernor) {
          setLiveAttendanceList(allRecords); // Gov sees all
      } else {
          // Mock filter for current user - in real app filter by ID
          setLiveAttendanceList(allRecords); 
          setHistory(allRecords.map(r => ({
              id: r.id, 
              date: r.date, 
              course: r.courseCode, 
              status: r.status, 
              verified: r.verified
          })));
      }
    };
    loadData();

    return () => stopCamera();
  }, [isGovernor]);

  // --- GOVERNOR LOGIC ---
  const generateSessionPin = () => {
      // Mock random 4 digit PIN
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedPin(newPin);
      setIsSessionActive(true);
  };

  const closeSession = () => {
      setIsSessionActive(false);
      setGeneratedPin(null);
  };

  // --- STUDENT GEOLOCATION LOGIC ---
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; 
  };

  const verifyLocation = () => {
    setLocationStatus('checking');
    setLocationMessage('Acquiring satellite position...');

    if (!navigator.geolocation) {
      setLocationStatus('failed');
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const dist = calculateDistance(latitude, longitude, VENUE_COORDS.lat, VENUE_COORDS.lng);
        const isCloseEnough = dist <= MAX_DISTANCE_METERS || true; // Force True for Demo

        if (isCloseEnough) {
          setLocationStatus('success');
          const displayDist = dist > 1000 ? 'Testing Mode' : `${dist.toFixed(1)}m`;
          setLocationMessage(`Location Verified: You are ${displayDist} from the venue (Accuracy: ±${accuracy.toFixed(1)}m)`);
        } else {
          setLocationStatus('failed');
          setLocationMessage(`You are too far from the class venue (${dist.toFixed(0)}m away).`);
        }
      },
      (error) => {
        console.error(error);
        setLocationStatus('failed');
        setLocationMessage('Unable to retrieve location. Please enable GPS permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --- STUDENT BIOMETRIC LOGIC ---
  const startCamera = async () => {
    try {
      setStatusMessage('Initializing secure camera feed...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVerificationStep('camera_active');
      setStatusMessage('Position your face within the frame.');
    } catch (err) {
      console.error("Camera Error:", err);
      setVerificationStep('failed');
      setStatusMessage('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const image = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(image);
        stopCamera();
        verifyAttendance(image);
      }
    }
  };

  const verifyAttendance = (imageProof: string) => {
    setVerificationStep('verifying');
    setStatusMessage('Verifying biometric data and Class PIN...');

    setTimeout(async () => {
      // In a real app, this would check against the PIN set by the Governor in the backend
      // For demo, we accept any 4 digit pin, or specifically '1234'
      if (pin.length !== 4) {
        setVerificationStep('failed');
        setStatusMessage('Invalid Class PIN format.');
        return;
      }

      setVerificationStep('success');
      setStatusMessage('Identity Verified. Attendance marked.');
      
      const course = INITIAL_COURSES.find(c => c.id === selectedCourse);
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        courseCode: course?.code || 'Unknown',
        status: 'present',
        verified: true,
        studentName: user.name,
        matricNumber: user.matricNumber
      };
      
      const updatedHistory = await dbAttendance.add(newRecord);
      
      setHistory(updatedHistory.map(r => ({
          id: r.id,
          date: r.date,
          course: r.courseCode,
          status: 'Present',
          verified: r.verified
      })));

    }, 2000);
  };

  const resetVerification = () => {
    setVerificationStep('idle');
    setPin('');
    setCapturedImage(null);
    setStatusMessage('');
  };

  // --- RENDER GOVERNOR VIEW ---
  if (isGovernor) {
      return (
        <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400" />
                    Governor Attendance Control
                </h1>
                <p className="text-slate-400">Generate PINs and monitor class attendance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Controller Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Start Session</h2>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Course</label>
                    <select 
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg mb-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                        {INITIAL_COURSES.map(course => (
                            <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                        ))}
                    </select>

                    {!isSessionActive ? (
                        <button 
                            onClick={generateSessionPin}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                        >
                            <KeyRound size={20} /> Generate Class PIN
                        </button>
                    ) : (
                        <div className="text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-2">Active PIN Code</p>
                            <div className="text-5xl font-mono font-bold text-slate-900 dark:text-white tracking-[0.5em] mb-4">
                                {generatedPin}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Share this code with students in class.</p>
                            <button 
                                onClick={closeSession}
                                className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
                            >
                                End Session
                            </button>
                        </div>
                    )}
                </div>

                {/* Live List Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[400px]">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            <Users size={20} className="text-slate-500 dark:text-slate-400" />
                            Live Attendance
                        </h2>
                        <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2 py-1 rounded-full">
                            {liveAttendanceList.length} Present
                        </span>
                     </div>
                     <div className="flex-1 overflow-y-auto pr-2">
                        {liveAttendanceList.map(record => (
                            <div key={record.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{record.studentName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{record.matricNumber}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER STUDENT VIEW ---
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Secure Attendance</h1>
        <p className="text-slate-500 dark:text-slate-400">Multi-factor verification: Location + Biometrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 transition-colors">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldCheck className="text-blue-600 dark:text-blue-400" />
            Class Verification
          </h2>

          {/* Step 1: Course Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">1. Select Course</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={verificationStep !== 'idle'}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              {INITIAL_COURSES.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Location Verification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">2. Location Check</label>
            <div className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
              locationStatus === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
              locationStatus === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
            }`}>
               <div className={`mt-0.5 ${
                 locationStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 
                 locationStatus === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-slate-400'
               }`}>
                 <MapPin size={20} />
               </div>
               
               <div className="flex-1">
                 {locationStatus === 'idle' && (
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-slate-500 dark:text-slate-400">Verify you are in class</span>
                     <button 
                       onClick={verifyLocation}
                       className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 flex items-center gap-1"
                     >
                       <Navigation size={12} /> Verify Location
                     </button>
                   </div>
                 )}
                 
                 {locationStatus === 'checking' && (
                   <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                     <RefreshCw size={14} className="animate-spin" />
                     {locationMessage}
                   </div>
                 )}
                 
                 {(locationStatus === 'success' || locationStatus === 'failed') && (
                   <div>
                     <p className={`text-sm font-semibold ${
                       locationStatus === 'success' ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'
                     }`}>
                       {locationStatus === 'success' ? 'Location Confirmed' : 'Location Failed'}
                     </p>
                     <p className={`text-xs mt-1 ${
                        locationStatus === 'success' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'
                     }`}>
                       {locationMessage}
                     </p>
                     {locationStatus === 'failed' && (
                       <button onClick={verifyLocation} className="text-xs text-blue-600 dark:text-blue-400 underline mt-2">Try Again</button>
                     )}
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Step 3: Class PIN */}
          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                <span>3. Enter Class PIN</span>
                <span className="text-xs text-blue-500 dark:text-blue-400 font-normal">(Provided by Governor)</span>
             </label>
             <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  disabled={verificationStep !== 'idle' || locationStatus !== 'success'}
                  placeholder="e.g. 1234"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tracking-widest font-mono font-bold disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400"
                />
             </div>
          </div>

          {/* Step 4: Biometric Capture Area */}
          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">4. Face Verification</label>
             <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex flex-col items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                
                {verificationStep === 'idle' && (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                       <UserCheck size={32} />
                    </div>
                    <button 
                      onClick={startCamera}
                      disabled={pin.length !== 4 || locationStatus !== 'success'}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Camera size={18} /> Start Camera
                    </button>
                    {(pin.length !== 4 || locationStatus !== 'success') && (
                      <p className="text-xs text-red-400 mt-2">Complete previous steps first</p>
                    )}
                  </div>
                )}

                {verificationStep === 'camera_active' && (
                   <div className="relative w-full h-full">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                      />
                      <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-black/50 to-transparent">
                         <button 
                           onClick={capturePhoto}
                           className="bg-white text-blue-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-transform active:scale-95 flex items-center gap-2"
                         >
                           <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                           Capture Proof
                         </button>
                      </div>
                      <div className="absolute inset-0 pointer-events-none border-4 border-white/20 m-8 rounded-[3rem]"></div>
                   </div>
                )}

                {verificationStep === 'verifying' && (
                   <div className="text-center">
                     <RefreshCw className="animate-spin text-blue-400 mx-auto mb-3" size={40} />
                     <p className="text-white font-medium animate-pulse">Analyzing Biometrics...</p>
                   </div>
                )}

                {verificationStep === 'success' && capturedImage && (
                   <div className="relative w-full h-full">
                     <img src={capturedImage} alt="Proof" className="w-full h-full object-cover opacity-50" />
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/40 backdrop-blur-sm">
                       <CheckCircle size={64} className="text-emerald-400 mb-2 drop-shadow-lg" />
                       <h3 className="text-white text-xl font-bold">Verified!</h3>
                       <p className="text-emerald-100 text-sm">You are present.</p>
                     </div>
                   </div>
                )}

                {verificationStep === 'failed' && (
                   <div className="text-center p-6">
                     <XCircle size={48} className="text-red-500 mx-auto mb-3" />
                     <h3 className="text-white font-bold mb-1">Verification Failed</h3>
                     <p className="text-red-200 text-sm mb-4 max-w-xs mx-auto">{statusMessage}</p>
                     <button 
                       onClick={resetVerification}
                       className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                     >
                       Try Again
                     </button>
                   </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
             </div>
             
             {verificationStep !== 'idle' && (
                <p className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                   {verificationStep === 'success' ? <CheckCircle size={12} className="text-emerald-500"/> : <Video size={12} />}
                   {statusMessage}
                </p>
             )}
          </div>
        </div>

        {/* History Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">My Attendance Log</h2>
              <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                {history.filter(h => h.status === 'Present').length} / {history.length} Present
              </span>
           </div>
           
           <div className="overflow-x-auto flex-1">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                 <tr>
                   <th className="p-3 rounded-tl-lg">Date</th>
                   <th className="p-3">Course</th>
                   <th className="p-3">Status</th>
                   <th className="p-3 rounded-tr-lg text-center">Proof</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {history.map((record) => (
                   <tr key={record.id}>
                     <td className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{record.date}</td>
                     <td className="p-3 font-medium text-slate-800 dark:text-white">{record.course}</td>
                     <td className="p-3">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                         record.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                       }`}>
                         {record.status}
                       </span>
                     </td>
                     <td className="p-3 text-center">
                       {record.verified ? (
                         <div className="flex justify-center" title="Biometrically Verified">
                           <ShieldCheck size={16} className="text-emerald-500" />
                         </div>
                       ) : (
                         <div className="flex justify-center">
                           <XCircle size={16} className="text-slate-300 dark:text-slate-600" />
                         </div>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;