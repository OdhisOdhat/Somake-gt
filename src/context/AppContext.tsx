import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Student, 
  Assessment, 
  StudentGrade, 
  AttendanceRecord, 
  LMSMaterial, 
  LMSSubmission, 
  Dormitory, 
  BusRoute, 
  OfflineAction, 
  CurriculumType, 
  School, 
  Staff, 
  SchoolClass, 
  FeeRecord 
} from '../types';

interface AppContextType {
  // Core Data Registries
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  schoolClasses: SchoolClass[];
  setSchoolClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  feeRecords: FeeRecord[];
  setFeeRecords: React.Dispatch<React.SetStateAction<FeeRecord[]>>;

  // Secondary registries
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  grades: StudentGrade[];
  setGrades: React.Dispatch<React.SetStateAction<StudentGrade[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  lmsMaterials: LMSMaterial[];
  setLmsMaterials: React.Dispatch<React.SetStateAction<LMSMaterial[]>>;
  lmsSubmissions: LMSSubmission[];
  setLmsSubmissions: React.Dispatch<React.SetStateAction<LMSSubmission[]>>;
  dormitories: Dormitory[];
  setDormitories: React.Dispatch<React.SetStateAction<Dormitory[]>>;
  busRoutes: BusRoute[];
  setBusRoutes: React.Dispatch<React.SetStateAction<BusRoute[]>>;

  // Authentication & Security 
  isSignedOut: boolean;
  setIsSignedOut: (v: boolean) => void;
  signInPassword: string;
  setSignInPassword: (p: string) => void;
  userEmail: string;
  userRole: 'super_admin' | 'teacher' | 'parent_student';
  setUserRole: (role: 'super_admin' | 'teacher' | 'parent_student') => void;
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  currentUser: any;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleSignup: (userData: any) => Promise<boolean>;
  handleSignOut: () => void;
  handleLinkStaffToSchool: (staffId: string, schoolId: string) => Promise<void>;

  // Active Context Indicators
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  activeTab: 'dashboard' | 'schools' | 'students' | 'staff' | 'classes' | 'attendance' | 'fees';
  setActiveTab: (tab: any) => void;

  // Interaction Modals Visible status triggers
  showSchoolModal: boolean;
  setShowSchoolModal: (v: boolean) => void;
  showStudentModal: boolean;
  setShowStudentModal: (v: boolean) => void;
  showStaffModal: boolean;
  setShowStaffModal: (v: boolean) => void;
  showClassModal: boolean;
  setShowClassModal: (v: boolean) => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (v: boolean) => void;
  paymentStudentId: string | null;
  setPaymentStudentId: (id: string | null) => void;

  // Modular forms inputs 
  schoolForm: any;
  setSchoolForm: any;
  studentForm: any;
  setStudentForm: any;
  staffForm: any;
  setStaffForm: any;
  classForm: any;
  setClassForm: any;
  paymentForm: any;
  setPaymentForm: any;

  // Toast Alerts Trigger
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Core Mutation Operations
  fetchStateFromServer: () => Promise<void>;
  handleCreateSchool: (e: React.FormEvent) => void;
  handleEnrollStudent: (e: React.FormEvent) => void;
  handleCreateStaff: (e: React.FormEvent) => void;
  handleCreateClass: (e: React.FormEvent) => void;
  handleGradeStudentValue: (gradePayload: any) => void;
  handleMarkAttendanceCell: (studentId: string, status: 'Present' | 'Absent' | 'Excused') => void;
  handleAddLmsMaterial: (materialPayload: any) => void;
  handleReviewLmsSubmission: (submissionId: string, approved: boolean, feedback: string) => void;
  handleTriggerBusStop: (routeId: string) => void;
  handleAddDormWelfareLog: (dormId: string, studentId: string, notes: string) => void;
  handleRecordPaymentSubmit: (e: React.FormEvent) => void;
  
  handleDeleteStudent: (id: string) => Promise<void>;
  handleDeleteStaff: (id: string) => Promise<void>;
  handleDeleteSchool: (id: string) => Promise<void>;
  handleGenerateAiComment: (studentId: string) => Promise<string>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Core Data Registries
  const [schools, setSchools] = useState<School[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);

  // Original datasets
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [lmsMaterials, setLmsMaterials] = useState<LMSMaterial[]>([]);
  const [lmsSubmissions, setLmsSubmissions] = useState<LMSSubmission[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);

  // Sign-in Session Admin locks
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: 'super_admin' | 'teacher' | 'parent_student'; schoolId?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('skoola-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSignedOut, setIsSignedOut] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('skoola-user');
      return !saved;
    } catch {
      return true;
    }
  });

  const [signInPassword, setSignInPassword] = useState<string>('');
  
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('skoola-user');
      return saved ? JSON.parse(saved).email : 'suppliesosubuko@gmail.com';
    } catch {
      return 'suppliesosubuko@gmail.com';
    }
  });

  const [userRole, setUserRole] = useState<'super_admin' | 'teacher' | 'parent_student'>(() => {
    try {
      const saved = localStorage.getItem('skoola-user');
      return saved ? JSON.parse(saved).role : 'super_admin';
    } catch {
      return 'super_admin';
    }
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('staff-1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('1');

  // School selectors & navigation trackers
  const [activeSchoolId, setActiveSchoolId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'students' | 'staff' | 'classes' | 'attendance' | 'fees'>('dashboard');

  // Dialog triggers
  const [showSchoolModal, setShowSchoolModal] = useState<boolean>(false);
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentStudentId, setPaymentStudentId] = useState<string | null>(null);

  // Forms states
  const [schoolForm, setSchoolForm] = useState({ name: '', code: '', curriculum: 'CBE (Kenya)', phone: '', email: '', address: '' });
  const [studentForm, setStudentForm] = useState({ name: '', gender: 'Male' as 'Male' | 'Female', gradeLevel: 'Grade 4', boardingStatus: 'Day' as 'Day' | 'Boarder', dormitoryId: '', busRouteId: '', parentEmail: '', parentPhone: '' });
  const [staffForm, setStaffForm] = useState({ name: '', role: 'Teacher' as any, email: '', phone: '', schoolId: '' });
  const [classForm, setClassForm] = useState({ name: '', teacherId: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', reference: '', date: '2026-05-28' });

  // Notifications Alerts states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Dark mode trigger states
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('skoola-dark-mode');
    return saved === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('skoola-dark-mode', String(newVal));
      return newVal;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Recover storage on boot
  useEffect(() => {
    fetchStateFromServer();
  }, []);

  const fetchStateFromServer = async () => {
    try {
      const resp = await fetch('/api/state');
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      
      setStudents(data.students || []);
      setAssessments(data.assessments || []);
      setGrades(data.grades || []);
      setAttendance(data.attendance || []);
      setLmsMaterials(data.lmsMaterials || []);
      setLmsSubmissions(data.lmsSubmissions || []);
      setDormitories(data.dormitories || []);
      setBusRoutes(data.busRoutes || []);
      setSchools(data.schools || []);
      setStaff(data.staff || []);
      setSchoolClasses(data.schoolClasses || []);
      setFeeRecords(data.feeRecords || []);

      // Auto-configure linked teacher or student context indicators
      const savedUser = localStorage.getItem('skoola-user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'teacher') {
          const matchedStaff = (data.staff || []).find((s: Staff) => s.email && s.email.toLowerCase() === parsed.email.toLowerCase());
          if (matchedStaff) {
            setSelectedTeacherId(matchedStaff.id);
          }
        } else if (parsed.role === 'parent_student') {
          const matchedStudent = (data.students || []).find((s: Student) => s.parentEmail && s.parentEmail.toLowerCase() === parsed.email.toLowerCase());
          if (matchedStudent) {
            setSelectedStudentId(matchedStudent.id);
          }
        }
        if (parsed.schoolId) {
          setActiveSchoolId(parsed.schoolId);
        }
      } else if (data.schools && data.schools.length > 0 && !activeSchoolId) {
        setActiveSchoolId(data.schools[0].id);
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log(`[Skoola Auth] Attempting login for ${email}...`);
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) {
        let errMsg = 'Authentication failed';
        try {
          const text = await resp.text();
          try {
            const parsed = JSON.parse(text);
            errMsg = parsed.error || parsed.message || errMsg;
          } catch {
            errMsg = text.slice(0, 100) || `Server error ${resp.status}`;
          }
        } catch {
          errMsg = `Server error ${resp.status}`;
        }
        console.error(`[Skoola Auth] Login request failed with status: ${resp.status}. Details:`, errMsg);
        showToast(errMsg, 'error');
        return false;
      }
      
      const data = await resp.json();
      console.log('[Skoola Auth] Login success! User payload:', data.user);
      
      const freshData = await fetchStateFromServer();
      
      setCurrentUser(data.user);
      setUserEmail(data.user.email);
      setUserRole(data.user.role);
      setIsSignedOut(false);
      localStorage.setItem('skoola-user', JSON.stringify(data.user));
      
      if (data.user.schoolId) {
        setActiveSchoolId(data.user.schoolId);
      } else if (freshData && freshData.schools && freshData.schools.length > 0) {
        setActiveSchoolId(freshData.schools[0].id);
      } else if (schools.length > 0) {
        setActiveSchoolId(schools[0].id);
      }
      setActiveTab('dashboard');
      
      // Auto-link staff / students dynamically based on updated list
      if (data.user.role === 'teacher') {
        const staffList = freshData?.staff || staff;
        const matchedStaff = staffList.find((s: Staff) => s.email && s.email.toLowerCase() === email.toLowerCase());
        if (matchedStaff) setSelectedTeacherId(matchedStaff.id);
      } else if (data.user.role === 'parent_student') {
        const studentList = freshData?.students || students;
        const matchedStudent = studentList.find((s: Student) => s.parentEmail && s.parentEmail.toLowerCase() === email.toLowerCase());
        if (matchedStudent) setSelectedStudentId(matchedStudent.id);
      }
      
      showToast(`Welcome back, ${data.user.name || 'User'}!`, 'success');
      return true;
    } catch (e: any) {
      console.error('[Skoola Auth] Unexpected error in handleLogin:', e);
      showToast(`Network or connection error during login: ${e?.message || e}`, 'error');
      return false;
    }
  };

  const handleSignup = async (userData: any): Promise<boolean> => {
    try {
      console.log('[Skoola Auth] Attempting signup for', userData.email);
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!resp.ok) {
        let errMsg = 'Registration failed';
        try {
          const text = await resp.text();
          try {
            const parsed = JSON.parse(text);
            errMsg = parsed.error || parsed.message || errMsg;
          } catch {
            errMsg = text.slice(0, 100) || `Server error ${resp.status}`;
          }
        } catch {
          errMsg = `Server error ${resp.status}`;
        }
        console.error(`[Skoola Auth] Signup request failed with status: ${resp.status}. Details:`, errMsg);
        showToast(errMsg, 'error');
        return false;
      }
      
      const data = await resp.json();
      console.log('[Skoola Auth] Signup success! User payload:', data.user);
      
      const freshData = await fetchStateFromServer();
      
      setCurrentUser(data.user);
      setUserEmail(data.user.email);
      setUserRole(data.user.role);
      setIsSignedOut(false);
      localStorage.setItem('skoola-user', JSON.stringify(data.user));
      
      if (data.user.schoolId) {
        setActiveSchoolId(data.user.schoolId);
      } else if (freshData && freshData.schools && freshData.schools.length > 0) {
        setActiveSchoolId(freshData.schools[0].id);
      } else if (schools.length > 0) {
        setActiveSchoolId(schools[0].id);
      }
      setActiveTab('dashboard');
      
      showToast(`Account successfully created, welcome ${data.user.name || 'User'}!`, 'success');
      return true;
    } catch (e: any) {
      console.error('[Skoola Auth] Unexpected error in handleSignup:', e);
      showToast(`Network or connection error during signup: ${e?.message || e}`, 'error');
      return false;
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setUserEmail('');
    setIsSignedOut(true);
    localStorage.removeItem('skoola-user');
    showToast('Successfully signed out of portal.', 'info');
  };

  const handleLinkStaffToSchool = async (staffId: string, schoolId: string) => {
    try {
      const resp = await fetch('/api/staff/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, schoolId })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Link request failed');
      }
      
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, schoolId } : s));
      showToast('Staff member successfully linked to school!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update school linkage', 'error');
    }
  };

  const dispatchActionToServer = async (actionType: string, payload: any) => {
    const action: OfflineAction = {
      id: `act-${Math.floor(100000 + Math.random() * 900000)}`,
      actionType: actionType as any,
      payload,
      timestamp: new Date().toISOString()
    };
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: [action] })
      });
    } catch (e) {
      console.error('Failed to sync changes with host backend database:', e);
    }
  };

  // ---------------- OPERATIONS MUTATION IMPLEMENTATIONS ----------------

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.code) return;

    const schId = `school-${schools.length + 101}`;
    const payload = { ...schoolForm, id: schId };

    setSchools(prev => [...prev, payload]);
    dispatchActionToServer('create_school', payload);
    showToast(`School "${schoolForm.name}" registered successfully!`, 'success');

    setSchoolForm({ name: '', code: '', curriculum: 'CBE (Kenya)', phone: '', email: '', address: '' });
    setShowSchoolModal(false);
    setActiveSchoolId(schId);
    setActiveTab('dashboard');
  };

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name) return;
    if (!activeSchoolId) {
      showToast('Please create or select a school first to enroll students!', 'error');
      return;
    }

    const selectedSchool = schools.find(s => s.id === activeSchoolId);
    const curr: CurriculumType = selectedSchool?.curriculum.includes('CBE') ? 'CBE' : 'Cambridge';
    const studId = String(students.length + 101);
    
    const payload = {
      id: studId,
      schoolId: activeSchoolId,
      name: studentForm.name,
      admissionNo: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      gender: studentForm.gender,
      gradeLevel: studentForm.gradeLevel,
      curriculum: curr,
      boardingStatus: studentForm.boardingStatus,
      dormitoryId: studentForm.boardingStatus === 'Boarder' ? (studentForm.dormitoryId || 'dorm-elgon') : undefined,
      busRouteId: studentForm.boardingStatus === 'Day' ? (studentForm.busRouteId || 'route-a') : undefined,
      parentEmail: studentForm.parentEmail || 'parent@skoola.com',
      parentPhone: studentForm.parentPhone || '0700000000'
    };

    setStudents(prev => [...prev, payload]);
    dispatchActionToServer('create_student', payload);
    showToast(`Pupil ${studentForm.name} profile completed!`, 'success');

    setStudentForm({
      name: '',
      gender: 'Male',
      gradeLevel: 'Grade 4',
      boardingStatus: 'Day',
      dormitoryId: '',
      busRouteId: '',
      parentEmail: '',
      parentPhone: ''
    });
    setShowStudentModal(false);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name) return;
    const targetSchoolId = staffForm.schoolId || activeSchoolId;
    if (!targetSchoolId) {
      showToast('Please create or select a school first to enlist staff!', 'error');
      return;
    }

    const staffId = `staff-${staff.length + 101}`;
    const payload = {
      id: staffId,
      schoolId: targetSchoolId,
      name: staffForm.name,
      role: staffForm.role,
      email: staffForm.email || 'staff@skoola.edu',
      phone: staffForm.phone || '0700000000'
    };

    setStaff(prev => [...prev, payload]);
    dispatchActionToServer('create_staff', payload);
    showToast(`Staff member ${staffForm.name} enrolled successfully!`, 'success');

    setStaffForm({ name: '', role: 'Teacher', email: '', phone: '', schoolId: '' });
    setShowStaffModal(false);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name) return;
    if (!activeSchoolId) {
      showToast('Please create or select a school first to establish classes!', 'error');
      return;
    }

    const classId = `class-${schoolClasses.length + 101}`;
    const payload = {
      id: classId,
      schoolId: activeSchoolId,
      name: classForm.name,
      teacherId: classForm.teacherId || undefined
    };

    setSchoolClasses(prev => [...prev, payload]);
    dispatchActionToServer('create_class', payload);
    showToast(`Classroom "${classForm.name}" set up.`, 'success');

    setClassForm({ name: '', teacherId: '' });
    setShowClassModal(false);
  };

  const handleGradeStudentValue = (gradePayload: any) => {
    const isCbe = schools.find(s => s.id === activeSchoolId)?.curriculum.includes('CBE');
    const computedLetter = gradePayload.score >= 85 ? 'A*' : gradePayload.score >= 70 ? 'B' : gradePayload.score >= 55 ? 'C' : 'D';

    const fullGrade: StudentGrade = {
      studentId: gradePayload.studentId,
      assessmentId: gradePayload.assessmentId,
      remarks: gradePayload.remarks || 'Excellent progress',
      lastUpdated: new Date().toISOString().split('T')[0],
      ...(isCbe ? { rubricRating: gradePayload.rubricRating } : { score: gradePayload.score, grade: computedLetter })
    };

    setGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === fullGrade.studentId && g.assessmentId === fullGrade.assessmentId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = fullGrade;
        return next;
      }
      return [...prev, fullGrade];
    });

    dispatchActionToServer('grade_student', fullGrade);
    showToast('Student grade registered.', 'success');
  };

  const handleMarkAttendanceCell = (studentId: string, status: 'Present' | 'Absent' | 'Excused') => {
    const activeDate = '2026-05-28';
    
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === studentId && a.date === activeDate);
      if (idx !== -1) {
        const next = [...prev];
        next[idx].status = status;
        return next;
      }
      return [...prev, { studentId, date: activeDate, status }];
    });

    dispatchActionToServer('mark_attendance', { studentId, date: activeDate, status });
    showToast('Attendance records saved.', 'success');
  };

  const handleAddLmsMaterial = (materialPayload: any) => {
    const matId = `m-${Math.floor(100 + Math.random() * 900)}`;
    const fullMat: LMSMaterial = {
      id: matId,
      title: materialPayload.title,
      subject: materialPayload.subject,
      curriculum: materialPayload.curriculum,
      type: materialPayload.type,
      content: materialPayload.content,
      assignedDate: new Date().toISOString().split('T')[0],
      imageUrl: materialPayload.imageUrl || ''
    };

    setLmsMaterials(prev => [...prev, fullMat]);
    dispatchActionToServer('add_material', fullMat);
    showToast(`Lesson material/task "${materialPayload.title}" posted.`, 'success');

    // Auto simulate mock classroom student responses for richness
    const targetStudents = students.filter(s => s.schoolId === activeSchoolId);
    if (targetStudents.length > 0 && materialPayload.type === 'Assignment') {
      setTimeout(() => {
        const simSub: LMSSubmission = {
          id: `sub-${Math.floor(1000 + Math.random() * 9000)}`,
          materialId: matId,
          studentId: targetStudents[0].id,
          submittedAt: new Date().toISOString(),
          status: 'Pending',
          content: 'I have completed my homework on green electricity resources.',
          parentApproved: true,
          parentFeedback: 'Confirmed & approved'
        };
        setLmsSubmissions(prev => [...prev, simSub]);
        dispatchActionToServer('submit_lms', simSub);
      }, 500);
    }
  };

  const handleReviewLmsSubmission = (submissionId: string, approved: boolean, feedback: string) => {
    setLmsSubmissions(prev => {
      const idx = prev.findIndex(s => s.id === submissionId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx].status = approved ? 'Approved' : 'Needs_Revision';
        next[idx].parentFeedback = feedback;
        return next;
      }
      return prev;
    });

    dispatchActionToServer('parent_approve', { submissionId, parentApproved: approved, parentFeedback: feedback });
    showToast(approved ? 'Homework successfully parent-approved!' : 'Homework returned for revision.');
  };

  const handleTriggerBusStop = (routeId: string) => {
    setBusRoutes(prev => prev.map(route => {
      if (route.id === routeId) {
        const nextStop = (route.currentStopIndex + 1) % route.stops.length;
        return { ...route, currentStopIndex: nextStop, status: 'Active' };
      }
      return route;
    }));
    showToast('Bus routing dispatch and telemetry tracked successfully.');
  };

  const handleAddDormWelfareLog = (dormId: string, studentId: string, notes: string) => {
    setDormitories(prev => prev.map(dorm => {
      if (dorm.id === dormId) {
        const newLog = {
          studentId,
          date: new Date().toISOString().split('T')[0],
          logType: 'Health' as any,
          notes
        };
        return { ...dorm, welfareLogs: [newLog, ...dorm.welfareLogs] };
      }
      return dorm;
    }));
    showToast('Welfare and health logs added to Dorm register.');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentStudentId || !paymentForm.amount) return;

    const amountNum = Number(paymentForm.amount);
    const selectedSchool = schools.find(s => s.id === activeSchoolId);
    const invoiceTotal = selectedSchool?.curriculum.includes('CBE') ? 45000 : 120000;

    const payload = {
      id: `fee-${feeRecords.length + 101}`,
      schoolId: activeSchoolId,
      studentId: paymentStudentId,
      term: 'Term 2 2026',
      totalDue: invoiceTotal,
      amount: amountNum,
      reference: paymentForm.reference || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      date: paymentForm.date
    };

    setFeeRecords(prev => {
      const idx = prev.findIndex(f => f.studentId === paymentStudentId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx].paidAmount += amountNum;
        next[idx].status = next[idx].paidAmount >= next[idx].totalDue ? 'Paid' : 'Partial';
        next[idx].history.push({
          date: paymentForm.date,
          amount: amountNum,
          reference: payload.reference
        });
        return next;
      }
      return [...prev, {
        id: payload.id,
        schoolId: activeSchoolId,
        studentId: paymentStudentId,
        term: payload.term,
        totalDue: payload.totalDue,
        paidAmount: payload.amount,
        status: payload.amount >= payload.totalDue ? 'Paid' : 'Partial' as any,
        history: [{ date: payload.date, amount: payload.amount, reference: payload.reference }]
      }];
    });

    dispatchActionToServer('record_payment', payload);
    showToast(`KES ${amountNum.toLocaleString()} payment receipt registered successfully!`, 'success');

    setPaymentForm({ amount: '', reference: '', date: '2026-05-28' });
    setPaymentStudentId(null);
    setShowPaymentModal(false);
  };

  // Archive & Delete operations with DB syncing
  const handleDeleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast('Pupil status archived successfully.', 'info');
    try {
      await fetch(`/api/student/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    showToast('Staff profile archived successfully.', 'info');
    try {
      await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    setSchools(prev => prev.filter(s => s.id !== id));
    if (activeSchoolId === id) {
      setActiveSchoolId('');
    }
    showToast('School network deleted successfully.', 'info');
    try {
      await fetch(`/api/school/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAiComment = async (studentId: string): Promise<string> => {
    const selectedStudent = students.find(s => s.id === studentId);
    if (!selectedStudent) return '';

    const studGrades = grades.filter(g => g.studentId === studentId);
    const avgScore = studGrades.length > 0
      ? Math.round(studGrades.reduce((sum, g) => sum + (g.score || 0), 0) / studGrades.length)
      : 80;

    try {
      const response = await fetch('/api/gemini/report-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName: selectedStudent.name,
          curriculum: selectedStudent.curriculum,
          gradesList: studGrades,
          subjectsAvg: avgScore
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.text;
    } catch {
      const level = selectedStudent.curriculum === 'CBE' ? 'rubric competency milestones' : 'testing designations';
      return `[Somake AI Principal Advisor Appraisal] Under our school's standard review metrics, student ${selectedStudent.name} demonstrates robust comprehension in active ${level}. They coordinate assignments efficiently, present stable participation, and are highly encouraged to persist in active classroom feedback.`;
    }
  };

  return (
    <AppContext.Provider value={{
      schools, setSchools,
      staff, setStaff,
      schoolClasses, setSchoolClasses,
      students, setStudents,
      feeRecords, setFeeRecords,
      assessments, setAssessments,
      grades, setGrades,
      attendance, setAttendance,
      lmsMaterials, setLmsMaterials,
      lmsSubmissions, setLmsSubmissions,
      dormitories, setDormitories,
      busRoutes, setBusRoutes,
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
      fetchStateFromServer,
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
      handleGenerateAiComment,
      darkMode,
      toggleDarkMode
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
