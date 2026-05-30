import React from 'react';
import { User, Plus, Mail, Phone, Trash2, ShieldCheck, UserCheck } from 'lucide-react';
import { Staff, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';

interface StaffTabProps {
  activeSchoolId: string;
  schools: School[];
  staff: Staff[];
  onAddStaff: () => void;
  onDeleteStaff: (id: string) => void;
}

export default function StaffTab({
  activeSchoolId,
  schools,
  staff,
  onAddStaff,
  onDeleteStaff
}: StaffTabProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId);

  // Filter staff belonging to current active school
  const activeStaffList = staff.filter(s => s.schoolId === activeSchoolId);

  return (
    <div id="skoola-staff-tab-root" className="space-y-6">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight">Staff</h2>
          <p className="text-xs text-slate-500 mt-0.5">Add and coordinate staff records</p>
        </div>

        <button
          id="btn-staff-add-staff"
          onClick={onAddStaff}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          Add staff member
        </button>
      </div>

      {/* Grid or Blank State */}
      {activeStaffList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/70 rounded-2xl text-center min-h-[300px] shadow-sm">
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4 flex items-center justify-center">
            <UserCheck className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-xs font-extrabold text-[#111] mb-1">No staff members enrolled</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Click 'Add staff member' to assign educational personnel to this workspace.</p>
        </div>
      ) : (
        <div id="grid-staff-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeStaffList.map(st => (
            <div 
              key={st.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 truncate">{st.name}</h3>
                    <span className="inline-block text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mt-1.5">
                      {st.role}
                    </span>
                  </div>
                  <div className="bg-slate-100 text-slate-500 p-2.5 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                {/* Contact information */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-50 pt-3 leading-relaxed font-semibold">
                  {st.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{st.email}</span>
                    </div>
                  )}
                  {st.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{st.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer action bar */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-4">
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Duty
                </span>

                <button
                  id={`btn-delete-staff-${st.id}`}
                  onClick={() => onDeleteStaff(st.id)}
                  title="Remove staff record"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors border border-slate-100 hover:border-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
