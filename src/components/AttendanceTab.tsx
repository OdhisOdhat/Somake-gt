import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AttendanceRecord, Student, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';
import { useAppContext } from '../context/AppContext';

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
  const { handleSaveBulkAttendance, showToast } = useAppContext();

  const activeDate = '2026-05-28'; // Today's date default

  // Filter students to active school
  const schoolStudents = students.filter(s => s.schoolId === activeSchoolId);

  // Draft attendance state to buffer teacher edits of the day before saving
  const [draftStatus, setDraftStatus] = useState<Record<string, 'Present' | 'Absent' | 'Excused'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Synchronize draft states when the students or saved attendance shifts
  useEffect(() => {
    const initial: Record<string, 'Present' | 'Absent' | 'Excused'> = {};
    schoolStudents.forEach(stud => {
      const record = attendance.find(a => a.studentId === stud.id && a.date === activeDate);
      initial[stud.id] = record ? record.status : 'Present';
    });
    setDraftStatus(initial);
    setHasChanges(false);
  }, [students, attendance, activeSchoolId]);

  const handleMarkLocalStatus = (studentId: string, status: 'Present' | 'Absent' | 'Excused') => {
    setDraftStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
    setHasChanges(true);
  };

  const saveRecordedAttendance = async () => {
    setIsSaving(true);
    try {
      const recordsToSave = Object.entries(draftStatus).map(([studentId, status]) => ({
        studentId,
        status
      }));
      await handleSaveBulkAttendance(recordsToSave);
      setHasChanges(false);
    } catch (e) {
      showToast('Could not save attendance. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeSchoolId || !activeSchool) {
    return <NoSchoolSelected title="Select a school profile" />;
  }

  return (
    <div id="skoola-attendance-tab-root" className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Attendance Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Mark daily registers to monitor classroom statistics</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-2xs">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Active Date Register: {activeDate}</span>
          </div>

          <button
            onClick={saveRecordedAttendance}
            disabled={isSaving}
            className={`font-black text-xs px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              hasChanges 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${hasChanges ? 'text-white' : 'text-slate-400'}`} />
            {isSaving ? 'Saving...' : 'Save Daily Register'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-800">You have unsaved daily attendance logs. Click &quot;Save Daily Register&quot; to commit changes.</span>
          </div>
          <button
            onClick={saveRecordedAttendance}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg shadow-3xs cursor-pointer"
          >
            Commit Saves
          </button>
        </div>
      )}

      {schoolStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center min-h-[220px]">
          <UserCheck className="w-8 h-8 text-slate-300 mb-2" />
          <h3 className="text-xs font-extrabold text-[#111] mb-0.5">No registered pupils</h3>
          <p className="text-[10px] text-slate-400">Please enroll pupils first in the Students tab before marking registers.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-705 font-medium whitespace-nowrap">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Admission Number</th>
                <th className="px-5 py-3.5">Pupil Profile Name</th>
                <th className="px-5 py-3.5 text-center">Draft Status Badge</th>
                <th className="px-5 py-3.5 text-right pr-8">Record Attendance registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {schoolStudents.map(stud => {
                const currentStatus = draftStatus[stud.id] || 'Present';

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
                              onClick={() => {
                                handleMarkLocalStatus(stud.id, st);
                                onMarkAttendance(stud.id, st); // Sync immediately state-wise while giving robust Save control
                              }}
                              className={`px-3 py-1 bg-white hover:bg-slate-100 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
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
