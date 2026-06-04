import React from 'react';
import { Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import { AttendanceRecord, Student, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';

interface AttendanceTabProps {
  activeSchoolId: string;
  schools: School[];
  students: Student[];
  attendance: AttendanceRecord[];
  onMarkAttendance: (studentId: string, status: 'Present' | 'Absent' | 'Excused') => void;
}

export default function AttendanceTab({
  activeSchoolId,
  schools,
  students,
  attendance,
  onMarkAttendance
}: AttendanceTabProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId);

  if (!activeSchoolId || !activeSchool) {
    return <NoSchoolSelected title="Select a school profile" />;
  }

  const activeDate = '2026-05-28'; // Today's date default

  // Filter students to active school
  const schoolStudents = students.filter(s => s.schoolId === activeSchoolId);

  return (
    <div id="skoola-attendance-tab-root" className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight">Attendance Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Mark daily registers to monitor classroom statistics</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-2xs">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Active Date Register: {activeDate}</span>
        </div>
      </div>

      {schoolStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center min-h-[220px]">
          <UserCheck className="w-8 h-8 text-slate-300 mb-2" />
          <h3 className="text-xs font-extrabold text-[#111] mb-0.5">No registered pupils</h3>
          <p className="text-[10px] text-slate-400">Please enroll pupils first in the Students tab before marking registers.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 font-medium whitespace-nowrap">
            <thead className="bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Admission Number</th>
                <th className="px-5 py-3.5">Pupil Profile Name</th>
                <th className="px-5 py-3.5 text-center">Current Status Badge</th>
                <th className="px-5 py-3.5 text-right pr-8">Record Attendance registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {schoolStudents.map(stud => {
                const record = attendance.find(a => a.studentId === stud.id && a.date === activeDate);
                const currentStatus = record?.status || 'Present';

                return (
                  <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-450 font-bold">{stud.admissionNo}</td>
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900">{stud.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{stud.gradeLevel}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        currentStatus === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        currentStatus === 'Absent' ? 'bg-rose-50 text-rose-750 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right pr-8">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shadow-3xs">
                        {(['Present', 'Absent', 'Excused'] as const).map(st => {
                          const isActive = currentStatus === st;
                          return (
                            <button
                              key={st}
                              onClick={() => onMarkAttendance(stud.id, st)}
                              className={`px-3 py-1 bg-white hover:bg-slate-100 rounded-lg text-[9.5px] font-black uppercase transition-all ${
                                isActive 
                                  ? st === 'Present' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-3xs' : 
                                    st === 'Absent' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-3xs' :
                                    'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-3xs'
                                  : 'text-slate-500'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
