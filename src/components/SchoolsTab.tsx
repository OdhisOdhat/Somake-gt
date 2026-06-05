import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Trash2, ArrowRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { School } from '../types';
import { downloadSchoolTemplate } from '../utils/templateGenerator';

interface SchoolsTabProps {
  schools: School[];
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  setActiveTab: (tab: any) => void;
  onNewSchoolClick: () => void;
  onDeleteSchool: (id: string) => void;
}

export default function SchoolsTab({
  schools,
  activeSchoolId,
  setActiveSchoolId,
  setActiveTab,
  onNewSchoolClick,
  onDeleteSchool
}: SchoolsTabProps) {
  const navigate = useNavigate();
  return (
    <div id="skoola-schools-tab-root" className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight">Schools</h2>
          <p className="text-xs text-slate-500 mt-0.5">Add and manage schools in your network</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={downloadSchoolTemplate}
            className="border border-emerald-200 bg-emerald-55/40 hover:bg-emerald-100/70 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Download XLSX Template
          </button>

          <button
            id="btn-schools-add-school"
            onClick={onNewSchoolClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            New school
          </button>
        </div>
      </div>

      {/* Grid or Blank State */}
      {schools.length === 0 ? (
        <div 
          id="blank-state-no-schools" 
          className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/70 rounded-2xl text-center min-h-[350px] shadow-sm"
        >
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4 flex items-center justify-center">
            <Building className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-extrabold text-[#111] mb-1">No schools yet. Click "New school"</h3>
          <p className="text-xs text-slate-450 mt-0.5">to get started.</p>
        </div>
      ) : (
        <div id="grid-schools-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schools.map(sch => {
            const isActive = sch.id === activeSchoolId;
            return (
              <div 
                key={sch.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between relative ${
                  isActive ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-slate-250 hover:border-slate-350'
                }`}
              >
                {isActive && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-150">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Selected
                  </span>
                )}

                <div className="space-y-4">
                  {/* Title and curriculum */}
                  <div>
                    <h3 className="text-[15px] font-black text-slate-900 pr-16 truncate">{sch.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase font-bold tracking-wider">{sch.code}</p>
                  </div>

                  {/* Attributes list */}
                  <div className="space-y-2 text-xs text-slate-650 border-t border-b border-slate-100 py-3.5 leading-relaxed font-semibold">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Curriculum Pathway:</span>
                      <strong className="text-indigo-950 font-extrabold">{sch.curriculum}</strong>
                    </div>
                    {sch.phone && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Phone Contact:</span>
                        <span>{sch.phone}</span>
                      </div>
                    )}
                    {sch.email && (
                      <div className="truncate">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Email Inbox:</span>
                        <span className="text-indigo-600 underline font-medium">{sch.email}</span>
                      </div>
                    )}
                    {sch.address && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Address Location:</span>
                        <span className="text-slate-500 italic font-medium leading-none">{sch.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-between gap-3 pt-4 mt-1">
                  <button
                    onClick={() => {
                      setActiveSchoolId(sch.id);
                      navigate(`/${sch.id}/dashboard`);
                    }}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    <span>{isActive ? 'Manage School' : 'Select & Manage'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteSchool(sch.id)}
                    title="Delete school profile"
                    className="p-2 border border-slate-200 text-slate-450 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
