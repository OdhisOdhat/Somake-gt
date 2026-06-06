import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  AlertCircle, 
  Check,
  User,
  Mail,
  School,
  Building,
  ShieldAlert,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Import our cohesive sub-divided modules
import SkoolaSidebar from './SkoolaSidebar';
import DashboardTab from './DashboardTab';
import SchoolsTab from './SchoolsTab';
import StudentsTab from './StudentsTab';
import StaffTab from './StaffTab';
import ClassesTab from './ClassesTab';
import AttendanceTab from './AttendanceTab';
import FeesTab from './FeesTab';

export default function MainLayout() {
  const {
    schools, staff, schoolClasses, students, feeRecords,
    assessments, grades, attendance, lmsMaterials, lmsSubmissions, dormitories, busRoutes,
    isSignedOut, setIsSignedOut,
    signInPassword, setSignInPassword,
    userEmail,
    userRole, setUserRole,
    selectedTeacherId, setSelectedTeacherId,
    selectedStudentId, setSelectedStudentId,
    currentUser,
    handleLogin,
    handleSignup,
    handleSignOut,
    handleLinkStaffToSchool,
    activeSchoolId, setActiveSchoolId,
    activeTab, setActiveTab,
    showSchoolModal, setShowSchoolModal,
    showStudentModal, setShowStudentModal,
    showStaffModal, setShowStaffModal,
    showClassModal, setShowClassModal,
    showPaymentModal, setShowPaymentModal,
    paymentStudentId, setPaymentStudentId,
    schoolForm, setSchoolForm,
    studentForm, setStudentForm,
    staffForm, setStaffForm,
    classForm, setClassForm,
    paymentForm, setPaymentForm,
    toast, showToast,
    handleCreateSchool,
    handleEnrollStudent,
    handleCreateStaff,
    handleCreateClass,
    handleGradeStudentValue,
    handleMarkAttendanceCell,
    handleAddLmsMaterial,
    handleReviewLmsSubmission,
    handleTriggerBusStop,
    handleAddDormWelfareLog,
    handleRecordPaymentSubmit,
    handleDeleteStudent,
    handleDeleteStaff,
    handleDeleteSchool,
    handleGenerateAiComment
  } = useAppContext();

  // Authentication UI local states
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const [isNewSchool, setIsNewSchool] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher' as 'super_admin' | 'teacher' | 'parent_student',
    schoolId: '',
    newSchoolName: '',
    newSchoolCode: '',
    newSchoolCurriculum: 'CBE (Kenya)'
  });

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    if (!loginEmail || !loginPassword) {
      showToast('Please enter both email and password', 'error');
      return;
    }
    
    setIsAuthenticating(true);
    try {
      const success = await handleLogin(loginEmail, loginPassword);
      if (success) {
        setLoginEmail('');
        setLoginPassword('');
      }
    } catch (err: any) {
      console.error('[LoginSubmit Error]', err);
      showToast(err.message || 'Login attempt failed.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const onSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    const { name, email, password, role, schoolId, newSchoolName, newSchoolCode, newSchoolCurriculum } = signupForm;
    if (!name || !email || !password || !role) {
      showToast('Please fill in all required signup fields', 'error');
      return;
    }
    if ((role === 'teacher' || role === 'parent_student') && !schoolId) {
      showToast('Please link this account to a specific school', 'error');
      return;
    }
    if (schoolId === 'new_school' && !newSchoolName) {
      showToast('Please fill in the name for your new school', 'error');
      return;
    }

    setIsAuthenticating(true);
    try {
      const success = await handleSignup({ 
        name, 
        email, 
        password, 
        role, 
        schoolId, 
        newSchoolName, 
        newSchoolCode, 
        newSchoolCurriculum 
      });
      if (success) {
        setSignupForm({
          name: '',
          email: '',
          password: '',
          role: 'teacher',
          schoolId: '',
          newSchoolName: '',
          newSchoolCode: '',
          newSchoolCurriculum: 'CBE (Kenya)'
        });
        setIsNewSchool(false);
      }
    } catch (err: any) {
      console.error('[SignupSubmit Error]', err);
      showToast(err.message || 'Signup attempt failed.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // If Session Admin Locks are active, show secure lock-gate
  if (isSignedOut) {
    return (
      <div id="skoola-lockscreen" className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative">
        {toast && (
          <div 
            id="toast-notification"
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-xl shadow-xl border transition-all duration-300 max-w-sm font-sans ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
              'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
            <div className="text-xs font-bold leading-none">{toast.message}</div>
          </div>
        )}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto bg-indigo-50 text-indigo-600 p-4 rounded-full w-14 h-14 flex items-center justify-center shadow-inner">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Skoola Boarding & Academics Portal</h2>
            <p className="text-[11px] text-slate-400 font-semibold leading-normal">
              Enter your credential logs or create a new school identity workspace to start boarding.
            </p>
          </div>

          {/* Authentication tabs toggles */}
          <div className="flex border-b border-slate-100 p-1 bg-slate-50/80 rounded-2xl">
            <button
              onClick={() => setAuthTab('signin')}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                authTab === 'signin'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Portal Sign In
            </button>
            <button
              onClick={() => {
                setAuthTab('signup');
                // Auto prefill current school if available on signup tab click
                if (schools.length > 0 && !signupForm.schoolId) {
                  setSignupForm(prev => ({ ...prev, schoolId: schools[0].id }));
                }
              }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                authTab === 'signup'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {authTab === 'signin' ? (
            <form onSubmit={onLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    placeholder="Enter email e.g. principal@school.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 bg-slate-50/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    placeholder="Enter administrative password..."
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 bg-slate-50/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Sign In to Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-3.5 space-y-1.5 text-left">
                <h4 className="text-[10px] font-black text-indigo-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Administrative Demo Profile
                </h4>
                <p className="text-[9.5px] leading-relaxed text-slate-500 font-semibold">
                  Use the following credentials to access the prefilled system administrator dashboard:
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold bg-white/80 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-600">suppliesosubuko@gmail.com</span>
                  <span className="text-emerald-700">admin123</span>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={onSignupSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Principal Charles Carter"
                    value={signupForm.name}
                    onChange={e => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    required
                    placeholder="e.g. charles@school.com"
                    value={signupForm.email}
                    onChange={e => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="Create a strong password..."
                    value={signupForm.password}
                    onChange={e => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Your Portal Role</label>
                <select
                  value={signupForm.role}
                  onChange={e => setSignupForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full text-xs p-3 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-semibold text-slate-800"
                >
                  <option value="super_admin">Super Administrator (Full System access)</option>
                  <option value="teacher">Teacher / Educator (Linked to specific school)</option>
                  <option value="parent_student">Parent or Student Viewer (Linked to specific school)</option>
                </select>
              </div>

              {/* Register a new school check */}
              <div className="flex items-center gap-2 py-1 px-1">
                <input
                  type="checkbox"
                  id="chk-signup-new-school"
                  checked={isNewSchool}
                  onChange={e => {
                    const checked = e.target.checked;
                    setIsNewSchool(checked);
                    if (checked) {
                      setSignupForm(prev => ({ ...prev, schoolId: 'new_school' }));
                    } else {
                      setSignupForm(prev => ({ ...prev, schoolId: schools[0]?.id || '' }));
                    }
                  }}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                />
                <label htmlFor="chk-signup-new-school" className="text-xs text-slate-700 font-bold cursor-pointer select-none">
                  My school is not listed (Register new school)
                </label>
              </div>

              {/* If NOT registering a new school AND role is teacher or parent_student */}
              {!isNewSchool && (signupForm.role === 'teacher' || signupForm.role === 'parent_student') && (
                <div className="space-y-1 p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                  <label className="text-[10px] font-extrabold uppercase text-indigo-700 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-indigo-500" /> Link to specific school profile
                  </label>
                  <select
                    required
                    value={signupForm.schoolId}
                    onChange={e => setSignupForm(prev => ({ ...prev, schoolId: e.target.value }))}
                    className="w-full text-xs p-2.5 mt-1.5 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-semibold text-slate-800"
                  >
                    <option value="" disabled>-- Select School to Link --</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                  <p className="text-[9.5px] text-slate-400 mt-1.5 leading-normal">
                    This dynamically authorizes your record inside the selected educational ecosystem directory.
                  </p>
                </div>
              )}

              {/* If registering a new school */}
              {isNewSchool && (
                <div className="space-y-3.5 p-3.5 bg-indigo-50/50 border border-indigo-150 rounded-2xl">
                  <label className="text-[10.5px] font-black uppercase text-indigo-800 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-indigo-600" /> Register New School Identity
                  </label>
                  
                  <div className="space-y-1 block text-left">
                    <label className="text-[9.5px] font-extrabold uppercase text-slate-450 block">School Name *</label>
                    <input 
                      type="text"
                      required={isNewSchool}
                      placeholder="e.g. Hillcrest International Grays"
                      value={signupForm.newSchoolName}
                      onChange={e => setSignupForm(prev => ({ ...prev, newSchoolName: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-left">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-450 block">School Code</label>
                      <input 
                        type="text"
                        placeholder="e.g. HCG-102 (Auto)"
                        value={signupForm.newSchoolCode}
                        onChange={e => setSignupForm(prev => ({ ...prev, newSchoolCode: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-450 block">Curriculum *</label>
                      <select
                        value={signupForm.newSchoolCurriculum}
                        onChange={e => setSignupForm(prev => ({ ...prev, newSchoolCurriculum: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none font-semibold text-slate-800"
                      >
                        <option value="CBE (Kenya)">CBE (Kenya)</option>
                        <option value="Cambridge (International)">Cambridge (International)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    Initializing Portal...
                  </>
                ) : (
                  <>
                    Register & Initialize Account
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="skoola-fullstack-app" className="flex h-screen w-screen overflow-hidden bg-slate-50/50 text-slate-800 antialiased font-sans">
      
      {/* Toast Notification Container */}
      {toast && (
        <div 
          id="toast-notification"
          className={`fixed top-5 right-5 z-40 flex items-center gap-3 p-4 rounded-xl shadow-xl border transition-all duration-300 max-w-sm font-sans ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
          <div className="text-xs font-bold leading-none">{toast.message}</div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <SkoolaSidebar 
        schools={schools}
        activeSchoolId={activeSchoolId}
        setActiveSchoolId={setActiveSchoolId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSchoolClick={() => setShowSchoolModal(true)}
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-y-scroll overflow-x-hidden pt-6">
        
        {/* Active Session & Role impersonation Switcher */}
        {currentUser?.role === 'super_admin' && (
          <div className="px-6 md:px-8 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 shadow-lg border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-450 animate-pulse"></span>
                  <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-400">Security Rights Sandbox Mode</span>
                </div>
                <h2 className="text-sm font-black text-white mt-1">Simulated User Persona</h2>
                <p className="text-[10px] text-slate-400 font-medium">Verify how roles restrict screens, forms, dashboard metrics & read/write capabilities.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setUserRole('super_admin');
                    showToast('Provisioned Principal / Super-Admin Role (Unrestricted read/write)');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    userRole === 'super_admin'
                      ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                      : 'bg-[#1e293b] text-slate-300 hover:bg-[#2e3e56]'
                  }`}
                >
                  👑 School Principal
                </button>
                <button
                  onClick={() => {
                    setUserRole('teacher');
                    showToast('Activating Classroom Staff credentials (Limited visibility)');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    userRole === 'teacher'
                      ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                      : 'bg-[#1e293b] text-slate-300 hover:bg-[#2e3e56]'
                  }`}
                >
                  🧑‍🏫 Classroom Teacher
                </button>
                <button
                  onClick={() => {
                    setUserRole('parent_student');
                    // Switch the sidebar tab to dashboard if activeTab is not compatible
                    if (['schools', 'students', 'staff', 'attendance'].includes(activeTab)) {
                      setActiveTab('dashboard');
                    }
                    showToast('Activating Parent & Student portal');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    userRole === 'parent_student'
                      ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                      : 'bg-[#1e293b] text-slate-300 hover:bg-[#2e3e56]'
                  }`}
                >
                  🏡 Parent / Student
                </button>
              </div>
            </div>

            {/* Conditional Role-selector Dropdowns */}
            {userRole === 'teacher' && (
              <div className="mt-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2 rounded-lg bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase border border-indigo-100">Active Staff</span>
                  <span className="text-slate-500 font-bold">Acting Teacher credentials for:</span>
                </div>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => {
                    setSelectedTeacherId(e.target.value);
                    const s = staff.find(st => st.id === e.target.value);
                    showToast(`Acting as Teacher ${s?.name || ''}`);
                    if (s && s.schoolId) {
                      setActiveSchoolId(s.schoolId);
                    }
                  }}
                  className="p-1.5 border border-slate-200 bg-[#f8fafc] rounded-lg font-black text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {staff.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                  ))}
                </select>
              </div>
            )}

            {userRole === 'parent_student' && (
              <div className="mt-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2 rounded-lg bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase border border-emerald-100">Portal Pupil</span>
                  <span className="text-slate-500 font-bold">Simulating Student & Parent view for:</span>
                </div>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const s = students.find(st => st.id === e.target.value);
                    showToast(`Simulating Parent of ${s?.name || ''}`);
                  }}
                  className="p-1.5 border border-slate-200 bg-[#f8fafc] rounded-lg font-black text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.gradeLevel})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        
        {/* Tab content area */}
        <div className="flex-1 px-6 md:px-8 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              schools={schools}
              activeSchoolId={activeSchoolId}
              students={students}
              staff={staff}
              schoolClasses={schoolClasses}
              feeRecords={feeRecords}
              grades={grades}
              attendance={attendance}
              assessments={assessments}
              onNewSchoolClick={() => setShowSchoolModal(true)}
              userRole={userRole}
              selectedTeacherId={selectedTeacherId}
              selectedStudentId={selectedStudentId}
            />
          )}

          {activeTab === 'schools' && (
            <SchoolsTab 
              schools={schools}
              activeSchoolId={activeSchoolId}
              setActiveSchoolId={setActiveSchoolId}
              setActiveTab={setActiveTab}
              onNewSchoolClick={() => setShowSchoolModal(true)}
              onDeleteSchool={handleDeleteSchool}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              students={students}
              assessments={assessments}
              grades={grades}
              onAddNewStudent={() => setShowStudentModal(true)}
              onGradeStudent={handleGradeStudentValue}
              onDeleteStudent={handleDeleteStudent}
              onGenerateAiComment={handleGenerateAiComment}
            />
          )}

          {activeTab === 'staff' && (
            <StaffTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              staff={staff}
              onAddStaff={() => setShowStaffModal(true)}
              onDeleteStaff={handleDeleteStaff}
              userRole={userRole}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              schoolClasses={schoolClasses}
              staff={staff}
              students={students}
              lmsMaterials={lmsMaterials}
              lmsSubmissions={lmsSubmissions}
              busRoutes={busRoutes}
              dormitories={dormitories}
              onAddClass={() => setShowClassModal(true)}
              onAddLmsMaterial={handleAddLmsMaterial}
              onReviewLmsSubmission={handleReviewLmsSubmission}
              onTriggerBusStop={handleTriggerBusStop}
              onAddDormWelfareLog={handleAddDormWelfareLog}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              students={students}
              attendance={attendance}
              onMarkAttendance={handleMarkAttendanceCell}
            />
          )}

          {activeTab === 'fees' && (
            <FeesTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              students={students}
              feeRecords={feeRecords}
              onRecordPaymentClick={(studId) => {
                setPaymentStudentId(studId);
                setShowPaymentModal(true);
              }}
            />
          )}
        </div>

      </main>

      {/* ============================================== */}
      {/* OVERLAY MODAL FORMS POPUPS */}
      {/* ============================================== */}

      {/* Modal 1: Create School */}
      {showSchoolModal && (
        <div id="modal-create-school" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl transition-all flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Create school</h3>
              <button onClick={() => setShowSchoolModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="p-5 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Hillcrest Primary School"
                    value={schoolForm.name}
                    onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Code *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. HIL-005"
                    value={schoolForm.code}
                    onChange={e => setSchoolForm({ ...schoolForm, code: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Curriculum *</label>
                  <select
                    value={schoolForm.curriculum}
                    onChange={e => setSchoolForm({ ...schoolForm, curriculum: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  >
                    <option value="CBE (Kenya)">CBE (Kenya)</option>
                    <option value="Cambridge (International)">Cambridge (International)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Phone</label>
                  <input 
                    type="text"
                    placeholder="e.g. 0711000999"
                    value={schoolForm.phone}
                    onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Email</label>
                  <input 
                    type="email"
                    placeholder="e.g. registrar@hillcrest.edu"
                    value={schoolForm.email}
                    onChange={e => setSchoolForm({ ...schoolForm, email: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Address</label>
                  <input 
                    type="text"
                    placeholder="e.g. Ngong Road, Nairobi"
                    value={schoolForm.address}
                    onChange={e => setSchoolForm({ ...schoolForm, address: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4.5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Enroll Student */}
      {showStudentModal && (
        <div id="modal-enroll-student" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Register scholar profile</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="p-5 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Jabari Omwamba"
                    value={studentForm.name}
                    onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Gender *</label>
                  <select
                    value={studentForm.gender}
                    onChange={e => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Grade / Year level Designation *</label>
                  <select
                    value={studentForm.gradeLevel}
                    onChange={e => setStudentForm({ ...studentForm, gradeLevel: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Grade 4">Grade 4 (Formative Elementary)</option>
                    <option value="Grade 5">Grade 5 (Formative Elementary)</option>
                    <option value="Grade 6">Grade 6 (Formative Elementary)</option>
                    <option value="Year 7">Year 7 Middle School</option>
                    <option value="Year 8">Year 8 Middle School</option>
                    <option value="Year 9">Year 9 Middle School</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-455 mb-1 block">Boarding Category *</label>
                  <select
                    value={studentForm.boardingStatus}
                    onChange={e => setStudentForm({ ...studentForm, boardingStatus: e.target.value as any })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Day">Day Commuter Scholar</option>
                    <option value="Boarder">Full Boarding Resident</option>
                  </select>
                </div>

                {studentForm.boardingStatus === 'Boarder' ? (
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Dormitory allocation</label>
                    <select
                      value={studentForm.dormitoryId}
                      onChange={e => setStudentForm({ ...studentForm, dormitoryId: e.target.value })}
                      className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="dorm-elgon">Elgon House (Boys)</option>
                      <option value="dorm-kili">Kilimanjaro House (Girls)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Transport assignment</label>
                    <select
                      value={studentForm.busRouteId}
                      onChange={e => setStudentForm({ ...studentForm, busRouteId: e.target.value })}
                      className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="route-a">Westlands / Kilimani Shuttle</option>
                      <option value="route-b">Karen / Langata Express</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Guardian Email</label>
                  <input 
                    type="email"
                    placeholder="parent@example.com"
                    value={studentForm.parentEmail}
                    onChange={e => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Guardian Mobile phone</label>
                  <input 
                    type="text"
                    placeholder="e.g. 0712345678"
                    value={studentForm.parentPhone}
                    onChange={e => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4.5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm"
                >
                  Enroll Scholar profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Staff */}
      {showStaffModal && (
        <div id="modal-add-staff" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Enlist staff member</h3>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Kiprop Kipruto"
                  value={staffForm.name}
                  onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Role Certification *</label>
                <select
                  value={staffForm.role}
                  onChange={e => setStaffForm({ ...staffForm, role: e.target.value as any })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Head Teacher">Head Principal</option>
                  <option value="Registrar">Registrar Administrator</option>
                  <option value="Bus Driver">Bus Driver Shuttle</option>
                  <option value="Warden">Warden Officer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Email address</label>
                <input 
                  type="email"
                  placeholder="staff@skoola.co.ke"
                  value={staffForm.email}
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Mobile Phone</label>
                <input 
                  type="text"
                  placeholder="e.g. 0711999888"
                  value={staffForm.phone}
                  onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Assigned School Workspace</label>
                <select
                  value={staffForm.schoolId || activeSchoolId}
                  onChange={e => setStaffForm({ ...staffForm, schoolId: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                >
                  {schools.map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.name}</option>
                  ))}
                </select>
                <p className="text-[9.5px] text-slate-450 mt-1.5 leading-normal">
                  ⚠️ <strong>Structural Rule:</strong> A staff member is bound exclusively to a single school directory workspace. One school can host many teachers, but one teacher cannot be concurrent in multiple school spaces.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black"
                >
                  Enroll staffing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add Class */}
      {showClassModal && (
        <div id="modal-add-class" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Establish Classroom</h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Class Name designation *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Grade 4 West / Year 8 Alpha"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Assigned Superintending Teacher</label>
                <select
                  value={classForm.teacherId}
                  onChange={e => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">-- No supervisor --</option>
                  {staff.filter(st => st.schoolId === activeSchoolId).map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black"
                >
                  Establish Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Record Fees Payment */}
      {showPaymentModal && paymentStudentId && (
        <div id="modal-record-payment" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Log payment receipt</h3>
              <button 
                onClick={() => {
                  setPaymentStudentId(null);
                  setShowPaymentModal(false);
                }} 
                className="text-slate-400 hover:text-slate-650"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Amount Paid (KES) *</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Transaction Reference / Receipt ID</label>
                <input 
                  type="text"
                  placeholder="e.g. MPESA-TX8890"
                  value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Date of Payment</label>
                <input 
                  type="date"
                  value={paymentForm.date}
                  onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStudentId(null);
                    setShowPaymentModal(false);
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black"
                >
                  Log Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
