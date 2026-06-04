import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Building2, 
  ShieldAlert, 
  ArrowRight, 
  Plus, 
  Users, 
  UserCheck, 
  Sparkles, 
  GraduationCap 
} from 'lucide-react';

interface NoSchoolSelectedProps {
  title: string;
}

export default function NoSchoolSelected({ title }: NoSchoolSelectedProps) {
  const navigate = useNavigate();
  const { 
    schools, 
    students, 
    staff, 
    activeTab,
    setActiveSchoolId, 
    setActiveTab, 
    setShowSchoolModal 
  } = useAppContext();

  return (
    <div 
      id="no-active-school-fallback" 
      className="max-w-4xl mx-auto space-y-8 py-6"
    >
      
      {/* Alert Header Banner */}
      <div className="flex flex-col md:flex-row items-center gap-5 p-6 bg-indigo-950/40 border border-indigo-900/60 rounded-2xl shadow-inner text-center md:text-left">
        <div className="bg-indigo-950 border border-indigo-900 p-3 h-12 w-12 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 shadow-sm animate-pulse">
          <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-base font-extrabold text-white">{title} Required</h3>
          <p className="text-xs text-indigo-200 leading-normal max-w-2xl">
            You must choose an active school network to use this module. Look at the registered schools 
            below to load a live sandbox database, or construct a brand new workspace right now.
          </p>
        </div>
        <button
          onClick={() => setShowSchoolModal(true)}
          className="group inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          New Campus
        </button>
      </div>

      {/* Schools previews block list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">Available Campus Networks ({schools.length})</h4>
          <span className="text-[10px] text-slate-550 font-bold font-mono">Select to activate workspace browser</span>
        </div>

        {schools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schools.map(sch => {
              // Calculate counts connected to this school
              const studentMatches = students.filter(s => s.schoolId === sch.id).length;
              const staffMatches = staff.filter(s => s.schoolId === sch.id).length;

              return (
                <div 
                  key={sch.id}
                  onClick={() => {
                    setActiveSchoolId(sch.id);
                    navigate(`/${sch.id}/${activeTab || 'dashboard'}`);
                  }}
                  className="bg-white border border-slate-200 hover:border-indigo-500/80 rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/[0.02] active:scale-[0.99] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-black text-slate-950 group-hover:text-indigo-600 transition-colors text-sm">
                            {sch.name}
                          </h4>
                          <span className="text-[10.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">{sch.code}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-[9px] font-black rounded font-mono border bg-slate-50 text-slate-500 uppercase tracking-widest">
                        {sch.curriculum}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-slate-100 text-xs text-slate-650 font-semibold leading-normal">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold leading-none">STUDENTS</span>
                          <span className="text-slate-800 font-extrabold">{studentMatches} registered</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold leading-none">STAFF RECTORY</span>
                          <span className="text-slate-800 font-extrabold">{staffMatches} active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-50 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSchoolId(sch.id);
                        navigate(`/${sch.id}/${activeTab || 'dashboard'}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      Assign Framework Preview
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-205 rounded-2xl shadow-sm space-y-4 max-w-sm mx-auto">
            <div className="bg-indigo-50 border border-indigo-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto text-indigo-500">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 px-4">
              <p className="font-extrabold text-[#111] text-xs">No School Networks Configured</p>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                There are no school profiles on file. Build your first campus to launch registrations.
              </p>
            </div>
            <button
              onClick={() => setShowSchoolModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all"
            >
              Setup School Profile
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
