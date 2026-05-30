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
  AlertCircle
} from 'lucide-react';
import { School, Student, Staff, SchoolClass, FeeRecord, StudentGrade, AttendanceRecord } from '../types';

interface DashboardTabProps {
  schools: School[];
  activeSchoolId: string;
  students: Student[];
  staff: Staff[];
  schoolClasses: SchoolClass[];
  feeRecords: FeeRecord[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  onNewSchoolClick: () => void;
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
  onNewSchoolClick
}: DashboardTabProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId);

  // If no school, show Image 1 prompt
  if (!activeSchool) {
    return (
      <div id="no-school-dashboard-view" className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#1e1b4b] tracking-tight">Welcome</h2>
          <p className="text-xs text-slate-500 mt-1">Let's set up your first school</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="max-w-md">
            <h3 className="text-base font-extrabold text-[#111] mb-2">Create your first school</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              A school holds all students, staff, classes, attendance and fee records.
            </p>
            <button
              id="btn-create-school-dashboard"
              onClick={onNewSchoolClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              Create school
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics for selected school
  const schoolStudents = students.filter(s => s.schoolId === activeSchool.id);
  const schoolStaff = staff.filter(s => s.schoolId === activeSchool.id);
  const schoolClassesForId = schoolClasses.filter(c => c.schoolId === activeSchool.id);
  const schoolFees = feeRecords.filter(f => f.schoolId === activeSchool.id);

  const maleCount = schoolStudents.filter(s => s.gender === 'Male').length;
  const femaleCount = schoolStudents.filter(s => s.gender === 'Female').length;

  // Attendance ratio for today
  const schoolStudentIds = schoolStudents.map(s => s.id);
  const activeAttendance = attendance.filter(a => schoolStudentIds.includes(a.studentId));
  const presentCount = activeAttendance.filter(a => a.status === 'Present').length;
  const totalAttendanceLogged = activeAttendance.length;
  const attendancePercentage = totalAttendanceLogged > 0 
    ? Math.round((presentCount / totalAttendanceLogged) * 100) 
    : 100;

  // Fees collected progress
  const totalDueFees = schoolFees.reduce((sum, f) => sum + f.totalDue, 0);
  const totalPaidFees = schoolFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const feesPercentages = totalDueFees > 0 
    ? Math.round((totalPaidFees / totalDueFees) * 100) 
    : 0;

  // Competencies / Grade analytics
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
          <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight flex items-center gap-1.5 leading-none">
            {activeSchool.name} <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 animate-pulse">Active Workspace</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Running <strong>{activeSchool.curriculum}</strong> framework. Terminal code: {activeSchool.code}
          </p>
        </div>
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
            <span className="text-[10px] text-slate-500">allocated personnel</span>
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
            <span className="text-[10px] text-slate-500">classrooms</span>
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
                <span>This school runs <strong>Kenyan CBE Formative Rubrics</strong>. The active performance represents evaluated learning strands today.</span>
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
              <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100/40 flex items-start gap-2 text-xs text-sky-950 leading-normal">
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
                    <span className="text-[9px] uppercase font-bold text-slate-400">Attendance Register</span>
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
              <h3 className="text-sm font-extrabold text-slate-[#111]">School Details</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Contact and registry coordinates on file.</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex border-b border-slate-50 pb-2">
                <span className="w-20 font-bold text-slate-405">Phone:</span>
                <span className="font-medium">{activeSchool.phone || 'Not recorded'}</span>
              </div>
              <div className="flex border-b border-slate-50 pb-2">
                <span className="w-20 font-bold text-slate-405">Email:</span>
                <span className="font-medium truncate underline text-indigo-600">{activeSchool.email || 'Not recorded'}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold text-slate-405">Address:</span>
                <span className="font-medium text-slate-600 italic leading-snug">{activeSchool.address || 'Not recorded'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] leading-relaxed text-slate-450 italic font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Ensure all regional registry databases match statutory educational directives perfectly.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
