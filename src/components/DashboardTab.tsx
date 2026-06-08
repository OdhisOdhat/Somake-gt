import React, { useMemo } from 'react';
import { 
  Building, 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar, 
  Coins, 
  Sparkles, 
  Check, 
  TrendingUp, 
  ArrowRight,
  ClipboardCheck,
  AlertCircle,
  Award,
  Bus,
  Home,
  Shield,
  Clock,
  Paintbrush
} from 'lucide-react';
import { School, Student, Staff, SchoolClass, FeeRecord, StudentGrade, AttendanceRecord, Assessment } from '../types';
import CbeAnalyticsChart from './CbeAnalyticsChart';
import { getThemePalette } from '../utils/theme';
import { useAppContext } from '../context/AppContext';

interface DashboardTabProps {
  schools: School[];
  activeSchoolId: string;
  students: Student[];
  staff: Staff[];
  schoolClasses: SchoolClass[];
  feeRecords: FeeRecord[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  assessments: Assessment[];
  onNewSchoolClick: () => void;
  userRole?: 'super_admin' | 'teacher' | 'parent_student';
  selectedTeacherId?: string;
  selectedStudentId?: string;
}

export default function DashboardTab({
  schools,
  activeSchoolId,
  students,
  staff,
  schoolClasses,
  feeRecords,
  grades,
  attendance,
  assessments,
  onNewSchoolClick,
  userRole = 'super_admin',
  selectedTeacherId = 'staff-1',
  selectedStudentId = '1'
}: DashboardTabProps) {
  const { setCustomizingSchoolId, setActiveTab } = useAppContext();
  const activeSchool = schools.find(s => s.id === activeSchoolId);
  const schPalette = getThemePalette(activeSchool?.themeColor);

  // 1. NO SCHOOL ESTABLISHED FALLBACK (Saves from blank states)
  if (!activeSchool) {
    return (
      <div id="no-school-dashboard-view" className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to Skoola</h2>
          <p className="text-xs text-slate-500 mt-1">Multi-school administration, CBA registries and student learning portfolios.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="max-w-md space-y-4">
            <h3 className="text-base font-extrabold text-[#111]">Create your first school</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              A school profile hosts students, staff members, classes, attendance records, and educational frameworks (CBE or Cambridge).
            </p>
            <button
              id="btn-create-school-dashboard"
              onClick={onNewSchoolClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CORE CALCULATIONS FOR ACTIVE SCHOOL
  const schoolStudents = students.filter(s => s.schoolId === activeSchool.id);
  const schoolStaff = staff.filter(s => s.schoolId === activeSchool.id);
  const schoolClassesForId = schoolClasses.filter(c => c.schoolId === activeSchool.id);
  const schoolFees = feeRecords.filter(f => f.schoolId === activeSchool.id);

  // Total school metrics
  const maleCount = schoolStudents.filter(s => s.gender === 'Male').length;
  const femaleCount = schoolStudents.filter(s => s.gender === 'Female').length;

  const schoolStudentIds = schoolStudents.map(s => s.id);
  const activeAttendance = attendance.filter(a => schoolStudentIds.includes(a.studentId));
  const presentCount = activeAttendance.filter(a => a.status === 'Present').length;
  const totalAttendanceLogged = activeAttendance.length;
  const attendancePercentage = totalAttendanceLogged > 0 
    ? Math.round((presentCount / totalAttendanceLogged) * 100) 
    : 100;

  const totalDueFees = schoolFees.reduce((sum, f) => sum + f.totalDue, 0);
  const totalPaidFees = schoolFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const feesPercentages = totalDueFees > 0 
    ? Math.round((totalPaidFees / totalDueFees) * 100) 
    : 0;

  // ------------------------------------------------------------------------
  // A. PARENT / STUDENT PORTAL DASHBOARD (Highly restricted, customized outcomes)
  // ------------------------------------------------------------------------
  if (userRole === 'parent_student') {
    const selectedStudent = schoolStudents.find(s => s.id === selectedStudentId);

    if (!selectedStudent) {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 text-center text-xs font-bold font-sans">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          No registered student found for ID "{selectedStudentId}" under {activeSchool.name}.
          <p className="mt-1 font-medium text-[11px] text-slate-500">Please switch to Super Admin mode and enroll pupils first.</p>
        </div>
      );
    }

    // Filter student records
    const studentGrades = grades.filter(g => g.studentId === selectedStudent.id);
    const studentAttendance = attendance.filter(a => a.studentId === selectedStudent.id);
    const studentFees = schoolFees.find(f => f.studentId === selectedStudent.id);

    // Calculate Attendance Statistics
    const stPresent = studentAttendance.filter(a => a.status === 'Present').length;
    const stAbsent = studentAttendance.filter(a => a.status === 'Absent').length;
    const stExcused = studentAttendance.filter(a => a.status === 'Excused').length;
    const stTotal = studentAttendance.length;

    // Student fees outstanding balance
    const feesDue = studentFees ? studentFees.totalDue : 0;
    const feesPaid = studentFees ? studentFees.paidAmount : 0;
    const feesBalance = feesDue - feesPaid;

    return (
      <div id="parent-student-portal-hub" className="space-y-6">
        
        {/* Portal Greeting Banner */}
        <div className="p-6 rounded-2xl bg-indigo-900 text-white shadow-md relative overflow-hidden border border-indigo-850">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px] tracking-wider text-indigo-200">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Secure Parent-Student Dashboard
              </div>
              <h1 className="text-xl font-black text-white mt-1">Hello, Parent of {selectedStudent.name}</h1>
              <p className="text-[11px] text-indigo-200/90 leading-relaxed font-semibold mt-1">
                Welcome to your child’s learning portfolio at <strong>{activeSchool.name}</strong>. Here you can monitor CBA achievements, attendance logs, and fee balances.
              </p>
            </div>
            
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 shrink-0 select-none text-right md:text-center">
              <span className="text-[10px] text-indigo-200 block font-bold uppercase">Admission No</span>
              <span className="text-sm font-extrabold text-white leading-none font-mono">{selectedStudent.admissionNo}</span>
            </div>
          </div>
          {/* Subtle background graphics */}
          <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-5 select-none font-black text-9xl">
            S
          </div>
        </div>

        {/* 3-Column Bento Grid: Student details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento Card 1: School Profile */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-500" /> Academic Placement
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex border-b border-slate-50 pb-2 justify-between">
                <span className="font-bold text-slate-400">Curriculum:</span>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">{selectedStudent.curriculum}</span>
              </div>
              <div className="flex border-b border-slate-50 pb-2 justify-between">
                <span className="font-bold text-slate-400">Grade Level:</span>
                <span className="font-extrabold text-slate-800">{selectedStudent.gradeLevel}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <div className="text-[10px] text-slate-450 font-bold">Gender & Stay:</div>
                <div className="text-[11px] font-black text-slate-800">{selectedStudent.gender} | {selectedStudent.boardingStatus}</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Transit & Boarding logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-emerald-500" /> Transit & Boarding Logs
            </h3>
            {selectedStudent.boardingStatus === 'Boarder' ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex border-b border-slate-50 pb-2 items-center gap-1.5">
                  <span className="font-bold text-slate-400">Boarding Location:</span>
                  <span className="font-semibold text-slate-750 bg-slate-50 px-2 py-0.5 rounded border border-slate-150 max-w-[120px] truncate">{selectedStudent.dormitoryId || 'Welfare Dorm'}</span>
                </div>
                <div className="p-2.5 rounded-xl text-[10px] bg-emerald-50/50 text-emerald-800 border border-emerald-100 leading-normal font-semibold">
                  🌿 <strong>Dorm Warden log:</strong> Child demonstrates orderly grooming, attends morning prep punctually, and maintains cordial relations in the dorm.
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="flex border-b border-slate-50 pb-2 justify-between items-center">
                  <span className="font-bold text-slate-405">Bus Route:</span>
                  <span className="font-extrabold text-[#111]">{selectedStudent.busRouteId || 'Green Route Hub'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 border border-slate-150 rounded-lg">
                  <span className="font-bold text-slate-400">Bus Operator Status:</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Active driver</span>
                </div>
              </div>
            )}
          </div>

          {/* Bento Card 3: Parental Coordinates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-500" /> Guardian Contacts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1 text-slate-700">
                <span className="font-bold text-slate-400">Parent Phone:</span>
                <span className="font-semibold">{selectedStudent.parentPhone || '+2547000000'}</span>
              </div>
              <div className="flex justify-between pb-1 text-slate-705">
                <span className="font-bold text-slate-400">Registered Email:</span>
                <span className="font-semibold truncate max-w-[150px]">{selectedStudent.parentEmail || 'parent@school.com'}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">To request updates to contact metrics, please contact Skoola Registrars office directly.</p>
            </div>
          </div>

        </div>

        {/* Attendance Timeline Ledger & Fee records */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left panel: Daily Attendance timeline */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#111] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" /> Daily Attendance Ledger
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time attendance checkpoints recorded by classroom supervisions.</p>
            </div>

            {/* Attendance numbers */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 font-bold">
                <span className="block text-lg font-black">{stPresent}</span> Present
              </div>
              <div className="bg-rose-50 text-rose-800 p-2.5 rounded-xl border border-rose-105 font-bold">
                <span className="block text-lg font-black">{stAbsent}</span> Absent
              </div>
              <div className="bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-100 font-bold">
                <span className="block text-lg font-black">{stExcused}</span> Excused
              </div>
            </div>

            {/* Visual Timeline Bubbles */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Recent school days logs:</span>
              {studentAttendance.length === 0 ? (
                <div className="text-slate-400 italic text-[11px] bg-slate-50/50 p-4 rounded-xl border border-slate-150 text-center">
                  No attendance entries signed yet. Keep active learning sessions going!
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {studentAttendance.map((att, index) => (
                    <div 
                      key={index}
                      className={`px-3 py-1.5 rounded-xl border text-[10.5px] font-black flex items-center gap-1.5 shadow-3xs ${
                        att.status === 'Present' ? 'bg-emerald-50 border-emerald-100 text-emerald-850' :
                        att.status === 'Absent' ? 'bg-rose-50 border-rose-100 text-rose-850' :
                        'bg-amber-50 border-amber-100 text-amber-850'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${att.status === 'Present' ? 'bg-emerald-500' : att.status === 'Absent' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                      {att.date}: {att.status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Fees Outstanding Ledger */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#111] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" /> Outstanding Bills & Fees
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Summary of payments made and outstanding balance.</p>
              </div>

              {/* Ledger visual block */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-black text-slate-500">Total Billed:</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">KES {feesDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-slate-150 pb-2">
                  <span className="text-[11px] font-black text-slate-500">Paid to Date:</span>
                  <span className="text-sm font-extrabold text-emerald-700 font-mono">KES {feesPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[11px] font-black text-slate-600">Outstanding Balance:</span>
                  <span className={`text-base font-black font-mono ${feesBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    KES {feesBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Completed Ledger Payments</span>
                  <span>{feesDue > 0 ? Math.round((feesPaid / feesDue) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all" 
                    style={{ width: `${feesDue > 0 ? (feesPaid / feesDue) * 100 : 2}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 text-[11px] leading-normal font-medium border border-indigo-100 text-indigo-900 mt-4">
              📌 To make payments via Mpessa or wire transfer, navigate over to the <strong>Fees</strong> tab in the sidebar navigation and capture your transaction logs!
            </div>
          </div>

        </div>

        {/* Academic Assessment Report Card / Competency Marks */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#111] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" /> Learner assessment achievements journal
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Formative Rubric grading mapped and locked on registry for active curriculum strands.</p>
          </div>

          {studentGrades.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 italic text-xs">
              No academic milestones published yet for {selectedStudent.name}. Consult school heads for schedule details.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentGrades.map((g, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Task Strand: {g.assessmentId}</h4>
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 rounded mt-1 inline-block">
                        Competency Milestone
                      </span>
                    </div>
                    {g.rubricRating ? (
                      <span className={`text-[11px] font-black text-white px-2.5 py-1 rounded-lg uppercase shadow-3xs ${
                        g.rubricRating === 'EE' ? 'bg-emerald-600' :
                        g.rubricRating === 'ME' ? 'bg-indigo-600' :
                        g.rubricRating === 'AE' ? 'bg-amber-400' :
                        'bg-rose-500'
                      }`}>
                        {g.rubricRating}
                      </span>
                    ) : g.score !== undefined ? (
                      <span className="bg-sky-600 text-white font-mono font-black text-sm px-2.5 py-1 rounded-lg shadow-3xs">
                        {g.score}% ({g.grade})
                      </span>
                    ) : null}
                  </div>
                  {g.remarks && (
                    <p className="text-[11px] text-slate-600 border border-slate-150 leading-relaxed font-semibold bg-white p-2.5 rounded-lg select-text italic">
                      "Instructor Remarks: {g.remarks}"
                    </p>
                  )}
                  <div className="text-[9px] text-slate-400 text-right font-mono mt-1">Evaluated on: {g.lastUpdated}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------------
  // B. CLASSROOM TEACHER DASHBOARD (Filtered records by assigned teacher)
  // ------------------------------------------------------------------------
  if (userRole === 'teacher') {
    const currentTeacher = staff.find(st => st.id === selectedTeacherId);

    if (!currentTeacher) {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 text-center text-xs font-bold font-sans">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          No staff record matching ID "{selectedTeacherId}" found under {activeSchool.name}.
          <p className="mt-1 font-medium text-[11px] text-slate-500">Please reset or select an active staff registry from the super admin dropdown.</p>
        </div>
      );
    }

    // Identify taught classes based on teacher supervisor ID matching our school classes config
    const teacherClasses = schoolClassesForId.filter(c => c.teacherId === currentTeacher.id);
    const teacherClassNames = teacherClasses.map(c => c.name);

    // Filter students belonging to this teacher's grades
    const teacherStudents = schoolStudents.filter(s => {
      return teacherClassNames.some(className => 
        className.toLowerCase().includes(s.gradeLevel.toLowerCase()) || s.gradeLevel.toLowerCase().includes(className.toLowerCase())
      );
    });

    const teacherStudentIds = teacherStudents.map(s => s.id);
    const mCount = teacherStudents.filter(s => s.gender === 'Male').length;
    const fCount = teacherStudents.filter(s => s.gender === 'Female').length;

    // Filter grade evaluations logged for students under this teacher's wings
    const myGradesCount = grades.filter(g => teacherStudentIds.includes(g.studentId)).length;

    return (
      <div id="teacher-classroom-portal-hub" className="space-y-6">
        
        {/* Portal Greeting Banner */}
        <div className="p-6 rounded-2xl bg-[#0f172a] text-white shadow-md relative overflow-hidden border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px] tracking-wider text-slate-300">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Active Teacher Dashboard
              </div>
              <h1 className="text-xl font-black text-white mt-1">Hello, {currentTeacher.name}</h1>
              <p className="text-[11px] text-slate-350 leading-relaxed font-semibold mt-1">
                You are assigned as a <strong>{currentTeacher.role}</strong> and class supervisor under {activeSchool.name}. Evaluate class materials, post learning tasks, grade assignments and logs.
              </p>
            </div>
            
            <div className="bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 shrink-0 select-none text-right md:text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Staff Identifier</span>
              <span className="text-sm font-extrabold text-indigo-400 leading-none font-mono">{currentTeacher.id}</span>
            </div>
          </div>
          {/* Subtle background graphics */}
          <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-5 select-none font-black text-9xl">
            T
          </div>
        </div>

        {/* Bento Stats Row (Only for units handled by this teacher) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">My Students</span>
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{teacherStudents.length}</span>
              <span className="text-[10px] font-medium text-slate-500">({mCount}M : {fCount}F)</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">My Supervised Classes</span>
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{teacherClasses.length}</span>
              <span className="text-[10px] text-slate-500">classrooms listed</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Marks Logged</span>
              <Award className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{myGradesCount}</span>
              <span className="text-[10px] text-slate-500">milestone marks published</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">My School's Attendance</span>
              <Calendar className="w-5 h-5 text-[#ec4899]" />
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{attendancePercentage}%</span>
              <span className="text-[10px] text-slate-500">general progress</span>
            </div>
          </div>

        </div>

        {activeSchool.curriculum.includes('CBE') && (
          <CbeAnalyticsChart
            students={students}
            assessments={assessments}
            grades={grades}
            activeSchoolId={activeSchool.id}
          />
        )}

        {/* Classroom listings taught by this teacher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#111] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Classes Under Your Supervision
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Click on "Classes" or "Students" in the sidebar navigation to administer or grade exams.</p>
            </div>

            {teacherClasses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 italic text-xs">
                Currently, you are not assigned as the coordinator of any active classroom. Go to "Schools" to configure class allocations structure.
              </div>
            ) : (
              <div className="space-y-3">
                {teacherClasses.map(cls => {
                  const studentNum = teacherStudents.filter(s => 
                    cls.name.toLowerCase().includes(s.gradeLevel.toLowerCase()) || s.gradeLevel.toLowerCase().includes(cls.name.toLowerCase())
                  ).length;
                  return (
                    <div key={cls.id} className="p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-black text-slate-800">{cls.name}</h4>
                        <span className="text-[10px] font-black uppercase text-slate-400 block mt-0.5">Assigned Class Supervisor ID: {cls.teacherId}</span>
                      </div>
                      <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg">
                        {studentNum} active pupils
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#111] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Teacher Administration Rights Rules
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Review current regulatory guidelines and role access limits.</p>
            </div>
            
            <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-lg text-[11px] font-semibold">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>You can mark daily homework attendance registers and record classroom materials, including snapshot files.</span>
              </div>
              <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-lg text-[11px] font-semibold">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>You can log learners exam marks, grading, and draft generative Somake AI principal comments.</span>
              </div>
              <div className="flex gap-2 items-start bg-rose-50/50 p-2.5 rounded-lg text-[11px] font-semibold text-rose-950 border border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Access Restricted:</strong> Financial journals, staff registries, and school setup configurations are disabled for teacher authentication state.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------------
  // C. ORIGINAL SUPER ADMIN DASHBOARD
  // ------------------------------------------------------------------------
  const rubricFrequency = useMemo(() => {
    let ee = 0, me = 0, ae = 0, be = 0;
    grades.forEach(g => {
      if (schoolStudentIds.includes(g.studentId)) {
        if (g.rubricRating === 'EE') ee++;
        if (g.rubricRating === 'ME') me++;
        if (g.rubricRating === 'AE') ae++;
        if (g.rubricRating === 'BE') be++;
      }
    });
    return { ee, me, ae, be };
  }, [grades, schoolStudentIds]);

  const cambridgeScores = useMemo(() => {
    const scores = grades
      .filter(g => schoolStudentIds.includes(g.studentId) && g.score !== undefined)
      .map(g => g.score as number);
    const average = scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) 
      : 0;
    return { average, count: scores.length };
  }, [grades, schoolStudentIds]);

  return (
    <div id="skoola-connected-dashboard" className="space-y-6">
      
      {/* Welcome Board */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
            {activeSchool.name} 
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse transition-all ${
              schPalette.badge
            }`}>
              Active Workspace
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeSchool.slogan && (
              <span className="italic font-semibold text-slate-600 block mb-1">
                "{activeSchool.slogan}"
              </span>
            )}
            Running <strong>{activeSchool.curriculum}</strong> framework. Terminal code: {activeSchool.code}
          </p>
        </div>

        {userRole === 'super_admin' && (
          <button
            onClick={() => {
              setCustomizingSchoolId(activeSchool.id);
              setActiveTab('schools');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer grow-0 shrink-0 self-start sm:self-auto"
          >
            <Paintbrush className="w-4.5 h-4.5" />
            <span>Customise & Brand Layout</span>
          </button>
        )}
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Students</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{schoolStudents.length}</span>
            <span className="text-[10px] font-medium text-slate-500">({maleCount}M : {femaleCount}F)</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff Members</span>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{schoolStaff.length}</span>
            <span className="text-[10px] text-slate-500 font-bold">allocated personnel</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Classes Set Up</span>
            <BookOpen className="w-5 h-5 text-sky-500" />
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{schoolClassesForId.length}</span>
            <span className="text-[10px] text-slate-500 font-bold">classrooms</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fees Progress</span>
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-slate-900">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[15px] font-black">
                {feesPercentages}%
              </span>
              <span className="text-[10px] text-slate-550 font-semibold font-mono">
                KES {totalPaidFees.toLocaleString()} / {totalDueFees.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all" 
                style={{ width: `${feesPercentages}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {activeSchool.curriculum.includes('CBE') && (
        <CbeAnalyticsChart
          students={students}
          assessments={assessments}
          grades={grades}
          activeSchoolId={activeSchool.id}
        />
      )}

      {/* Analytics and School Profile panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left widget: curriculum statistics */}
        <div className="md:col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Academic Performance Analytics
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Real-time breakdown of current school evaluations parsed by learning pathways.</p>
          </div>

          {activeSchool.curriculum.includes('CBE') ? (
            <div className="space-y-4.5">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-start gap-2 text-xs text-indigo-900 leading-normal">
                <ClipboardCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                <span>This school runs <strong>Kenyan CBE Formative Rubrics</strong>. The active performance represents evaluated learning milestones today.</span>
              </div>

              {/* CBE rating frequency bars */}
              <div className="space-y-3.5">
                {[
                  { key: 'EE', label: 'EE (Exceeding Expectations)', color: 'bg-emerald-500', count: rubricFrequency.ee },
                  { key: 'ME', label: 'ME (Meeting Expectations)', color: 'bg-indigo-500', count: rubricFrequency.me },
                  { key: 'AE', label: 'AE (Approaching Expectations)', color: 'bg-amber-400', count: rubricFrequency.ae },
                  { key: 'BE', label: 'BE (Below Expectations)', color: 'bg-rose-500', count: rubricFrequency.be }
                ].map((item) => {
                  const maxCount = Math.max(rubricFrequency.ee, rubricFrequency.me, rubricFrequency.ae, rubricFrequency.be, 1);
                  const widthPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-705">
                        <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${item.color}`} /> {item.label}</span>
                        <span className="font-mono font-black">{item.count} marks locked</span>
                      </div>
                      <div className="w-full bg-slate-50 h-2.5 rounded-lg overflow-hidden border border-slate-100">
                        <div 
                          className={`${item.color} h-full transition-all`} 
                          style={{ width: `${item.count > 0 ? widthPercent : 2}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4.5">
              <div className="p-3 bg-[#e0f2fe] rounded-xl border border-sky-100 flex items-start gap-2 text-xs text-slate-800 leading-normal">
                <ClipboardCheck className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
                <span>This school runs <strong>Cambridge International</strong>. Academic grades map testing assessments numeric metrics.</span>
              </div>

              <div id="cambridge-analytics-panel" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-center items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Cambridge Score</span>
                  <span className="text-4xl font-black text-sky-600 mt-2 font-mono">
                    {cambridgeScores.average}%
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-1 bg-sky-100 px-2.5 py-0.5 rounded-full uppercase">
                    Grade {cambridgeScores.average >= 85 ? 'A*' : cambridgeScores.average >= 70 ? 'B' : cambridgeScores.average >= 50 ? 'C' : 'D'}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-250 bg-white grid grid-cols-2 gap-3 divide-x divide-slate-100">
                  <div className="text-center flex flex-col justify-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Grades Synced</span>
                    <span className="text-2xl font-black text-slate-800 mt-1">{cambridgeScores.count}</span>
                  </div>
                  <div className="text-center flex flex-col justify-center pl-3">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Attendance Rate</span>
                    <span className="text-2xl font-black text-emerald-600 mt-1">{attendancePercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Widget: active metadata */}
        <div className="md:col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-[#111]">School Directory</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Primary contact and address details.</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex border-b border-slate-50 pb-2">
                <span className="w-18 font-bold text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-800">{activeSchool.phone || 'Not recorded'}</span>
              </div>
              <div className="flex border-b border-slate-50 pb-2">
                <span className="w-18 font-bold text-slate-400">Email:</span>
                <span className="font-semibold truncate underline text-indigo-600">{activeSchool.email || 'Not recorded'}</span>
              </div>
              <div className="flex">
                <span className="w-18 font-bold text-slate-400">Address:</span>
                <span className="font-semibold text-slate-600 italic leading-snug">{activeSchool.address || 'Not recorded'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11.5px] leading-relaxed text-slate-400 italic font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Ensure all regional registry databases match statutory educational directives perfectly.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
