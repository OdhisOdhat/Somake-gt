import React from 'react';
import { 
  User, 
  Plus, 
  Mail, 
  Phone, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  MessageSquare, 
  Sparkles, 
  Send, 
  Copy, 
  X, 
  Check, 
  FileText,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Staff, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';
import { useAppContext } from '../context/AppContext';
import { downloadStaffTemplate } from '../utils/templateGenerator';

interface StaffTabProps {
  activeSchoolId: string;
  schools: School[];
  staff: Staff[];
  onAddStaff: () => void;
  onDeleteStaff: (id: string) => void;
  userRole?: string;
}

interface MessageDraft {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  purpose: string;
  content: string;
  date: string;
}

export default function StaffTab({
  activeSchoolId,
  schools,
  staff,
  onAddStaff,
  onDeleteStaff,
  userRole
}: StaffTabProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId);
  const { showToast, handleLinkStaffToSchool } = useAppContext();

  if (!activeSchoolId || !activeSchool) {
    return <NoSchoolSelected title="Select a school profile" />;
  }

  // Filter staff belonging to current active school
  const activeStaffList = staff.filter(s => s.schoolId === activeSchoolId);

  // Drafting States
  const [selectedTeacher, setSelectedTeacher] = React.useState<Staff | null>(null);
  const [draftPurpose, setDraftPurpose] = React.useState('Performance Appraisal & Check-in');
  const [extraContext, setExtraContext] = React.useState('');
  const [draftBody, setDraftBody] = React.useState('');
  const [isDraftingAi, setIsDraftingAi] = React.useState(false);
  const [draftsRegistry, setDraftsRegistry] = React.useState<MessageDraft[]>(() => {
    try {
      const items = localStorage.getItem(`skoola_drafts_${activeSchoolId}`);
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem(`skoola_drafts_${activeSchoolId}`, JSON.stringify(draftsRegistry));
  }, [draftsRegistry, activeSchoolId]);

  const handleInitiateDraft = (teacher: Staff) => {
    setSelectedTeacher(teacher);
    setDraftPurpose('Performance Appraisal & Check-in');
    setExtraContext('');
    setDraftBody('');
  };

  const handleGenerateAiMemo = async () => {
    if (!selectedTeacher) return;
    setIsDraftingAi(true);
    setDraftBody('');
    try {
      const response = await fetch('/api/gemini/draft-teacher-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName: selectedTeacher.name,
          role: selectedTeacher.role,
          purpose: draftPurpose,
          extraContext: extraContext
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from backend API');
      const data = await response.json();
      setDraftBody(data.text);
      showToast(`AI successfully drafted memo for ${selectedTeacher.name}!`, "success");
    } catch (err: any) {
      console.error(err);
      // Client-side instant offline generation standard
      const subject = `Memo: ${draftPurpose} - ${selectedTeacher.name}`;
      const defaultText = `Subject: ${subject}\n\nDear ${selectedTeacher.name},\n\nI hope this message finds you well. As part of our ongoing commitment to academic excellence at ${activeSchool.name}, I wanted to reach out regarding: ${draftPurpose}.\n\nSpecifically: "${extraContext || 'classroom student welfare and feedback standards'}". Thank you for your continued stellar instruction and stewardship of our learning environments.\n\nWarm regards,\nOffice of the Principal / Director`;
      setDraftBody(defaultText);
      showToast("Draft created (offline fallback mode active)", "info");
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleSaveDraft = () => {
    if (!selectedTeacher || !draftBody) return;
    const newDraft: MessageDraft = {
      id: `draft-${Date.now()}`,
      schoolId: activeSchoolId,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      purpose: draftPurpose,
      content: draftBody,
      date: new Date().toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setDraftsRegistry(prev => [newDraft, ...prev]);
    setSelectedTeacher(null);
    showToast(`Saved draft to Principal communications outbox!`, "success");
  };

  return (
    <div id="skoola-staff-tab-root" className="space-y-6">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 px-2 rounded-lg bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase border border-indigo-100">Principal Console</span>
            <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight">Staff & Faculty Registry</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Add, coordinate records, and draft formal directives directly to school instructors</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={downloadStaffTemplate}
            className="border border-emerald-200 bg-emerald-55/40 hover:bg-emerald-100/70 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Download XLSX Template
          </button>

          <button
            id="btn-staff-add-staff"
            onClick={onAddStaff}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer animate-in fade-in duration-300"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            Add staff member
          </button>
        </div>
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

                    <div className="mt-3.5 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Linked School:</span>
                      <select
                        value={st.schoolId}
                        onChange={(e) => handleLinkStaffToSchool(st.id, e.target.value)}
                        className="text-[10px] font-black py-1 px-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer w-full max-w-[150px]"
                      >
                        {schools.map(sch => (
                          <option key={sch.id} value={sch.id}>{sch.name}</option>
                        ))}
                      </select>
                    </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-50 pt-3.5 mt-4 gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Duty
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleInitiateDraft(st)}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150/50 rounded-lg text-xs font-black flex items-center gap-1 transition-all"
                    title="Draft formal memo"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    Draft Memo
                  </button>

                  <button
                    id={`btn-delete-staff-${st.id}`}
                    onClick={() => onDeleteStaff(st.id)}
                    title="Remove staff record"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors border border-slate-100 hover:border-rose-100 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* SECTION: SAVED DRAFTS & COMMUNICATION OUTBOX */}
      {draftsRegistry.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#111] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" /> Principal's Communication Memos Registry ({draftsRegistry.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Logs and active copies of all memo drafts compiled by the Principal.</p>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {draftsRegistry.map((draft) => (
              <div key={draft.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Official Directive to {draft.teacherName}</h4>
                    <span className="text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                      {draft.purpose}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{draft.date}</span>
                    <button
                      onClick={() => {
                        setDraftsRegistry(prev => prev.filter(d => d.id !== draft.id));
                        showToast("Draft discarded successfully.", "info");
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Discard memo log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 font-mono leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 cursor-text select-all whitespace-pre-wrap">
                  {draft.content}
                </p>

                <div className="flex flex-wrap items-center gap-3 justify-end text-xs pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(draft.content);
                      showToast("Memo copied to clipboard!", "success");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Copy to Clipboard
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Dispatched simulated message directly to ${draft.teacherName}!`);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simulate Send ✉️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: DRAFT CREATOR EXPERIENCE */}
      {selectedTeacher && (
        <div id="modal-staff-draft-memo" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col transition-all animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="text-sm md:text-base font-extrabold text-[#111]">
                  Draft Principal Memo for {selectedTeacher.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTeacher(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold flex-1 overflow-y-auto max-h-[72vh]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Staff Role & Placement</label>
                  <div className="p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-700 font-bold truncate">
                    {selectedTeacher.role} ({selectedTeacher.email})
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1.5 block">Memo Strategic Focus *</label>
                  <select
                    value={draftPurpose}
                    onChange={(e) => setDraftPurpose(e.target.value)}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold cursor-pointer"
                  >
                    <option value="Performance Assessment Review">Performance Assessment Review</option>
                    <option value="Lesson Plans & Schemes of Work Request">Lesson Plans & Schemes of Work Request</option>
                    <option value="Parent Feedback & Student Welfare Follow-up">Parent Feedback & Student Welfare Follow-up</option>
                    <option value="Instructional Standard Excellence Congratulations">Instructional Standard Excellence Congratulations</option>
                    <option value="General Admin Policy Circular">General Admin Policy Circular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">
                  Additional Directives / Context Parameters (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Include praise for math projects, set deadline for Term 2 grades by next Friday"
                  value={extraContext}
                  onChange={e => setExtraContext(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isDraftingAi}
                  onClick={handleGenerateAiMemo}
                  className="w-full py-3 bg-[#0f172a] hover:bg-slate-805 disabled:bg-slate-350 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group border border-slate-800"
                >
                  {isDraftingAi ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                      <span>Consulting Somake AI Principal Assistant...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Draft Custom End-to-End Directive Memo with Somake AI</span>
                    </>
                  )}
                </button>
              </div>

              {draftBody && (
                <div className="space-y-1.5 animate-in fade-in duration-300 pt-1">
                  <label className="text-[10px] uppercase font-black text-slate-450 flex items-center justify-between">
                    <span>Generated Memo Body Draft</span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded uppercase">Editable</span>
                  </label>
                  <textarea 
                    value={draftBody}
                    onChange={e => setDraftBody(e.target.value)}
                    rows={10}
                    className="w-full p-3 bg-indigo-50/20 border border-indigo-150/70 rounded-xl focus:border-indigo-500 focus:outline-none text-xs font-mono font-medium leading-relaxed resize-none cursor-text select-text"
                  />
                </div>
              )}

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!draftBody}
                onClick={handleSaveDraft}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Draft to communications log
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
