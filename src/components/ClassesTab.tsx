import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  User, 
  ArrowRight, 
  Sparkles, 
  FileSpreadsheet, 
  Send, 
  CheckCircle2, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { 
  School, 
  SchoolClass, 
  Staff, 
  Student, 
  LMSMaterial, 
  LMSSubmission, 
  BusRoute, 
  Dormitory,
  CurriculumType
} from '../types';
import NoSchoolSelected from './NoSchoolSelected';
import { useAppContext } from '../context/AppContext';
import { CBE_SUBJECTS, CAMBRIDGE_SUBJECTS, KENYAN_844_SUBJECTS } from '../utils/theme';

interface ClassesTabProps {
  activeSchoolId: string;
  schools: School[];
  schoolClasses: SchoolClass[];
  staff: Staff[];
  students: Student[];
  lmsMaterials: LMSMaterial[];
  lmsSubmissions: LMSSubmission[];
  busRoutes: BusRoute[];
  dormitories: Dormitory[];
  onAddClass: () => void;
  onAddLmsMaterial: (payload: any) => void;
  onReviewLmsSubmission: (submissionId: string, approved: boolean, feedback: string) => void;
  onTriggerBusStop: (routeId: string) => void;
  onAddDormWelfareLog: (dormId: string, studentId: string, notes: string) => void;
}

export default function ClassesTab({
  activeSchoolId,
  schools,
  schoolClasses,
  staff,
  students,
  lmsMaterials,
  lmsSubmissions,
  busRoutes,
  dormitories,
  onAddClass,
  onAddLmsMaterial,
  onReviewLmsSubmission,
  onTriggerBusStop,
  onAddDormWelfareLog
}: ClassesTabProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId);
  const { userRole, showToast, selectedTeacherId } = useAppContext();

  const isSuperAdmin = userRole === 'super_admin';
  const activeTeacherProfile = staff?.find(st => st.id === selectedTeacherId);
  const isAppointedSchoolAdmin = userRole === 'teacher' && activeTeacherProfile && (activeTeacherProfile.role === 'Head Teacher' || activeTeacherProfile.role === 'Registrar');
  const isAdmin = isSuperAdmin || isAppointedSchoolAdmin;

  if (!activeSchoolId || !activeSchool) {
    return <NoSchoolSelected title="Select a school profile" />;
  }

  // Local interaction states
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatSubject, setNewMatSubject] = useState('');
  const [newMatType, setNewMatType] = useState<'Note' | 'Assignment' | 'Quiz'>('Assignment');
  const [newMatContent, setNewMatContent] = useState('');
  const [newMatImage, setNewMatImage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [filterSnapshotOnly, setFilterSnapshotOnly] = useState(false);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewMatImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Homework simulator states
  const [homeworkReviewId, setHomeworkReviewId] = useState<string | null>(null);
  const [teacherReviewNote, setTeacherReviewNote] = useState('');

  // Filter classes belonging to current active school
  const activeClassList = schoolClasses.filter(c => c.schoolId === activeSchoolId);
  const schoolStudents = students.filter(s => s.schoolId === activeSchoolId);

  // LMS material Filter matching curriculum of active school
  const activeLmsMaterials = lmsMaterials.filter(
    mat => (activeSchool?.curriculum ?? 'CBE').includes('CBE') ? mat.curriculum === 'CBE' : mat.curriculum === 'Cambridge'
  );

  return (
    <div id="skoola-classes-tab-root" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Classes Grid list */}
      <div className="xl:col-span-12 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Classes & Learning Outcomes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define classrooms, materials, and evaluate homework submissions</p>
          </div>

          <button
            id="btn-classes-add-class"
            onClick={() => {
              if (userRole !== 'super_admin') {
                showToast("Access Restricted: Creating new school classroom divisions requires Super Administrator credentials.", "error");
                return;
              }
              onAddClass();
            }}
            className={`font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto ${
              userRole !== 'super_admin'
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed font-bold'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            New classroom {userRole !== 'super_admin' && '🔒'}
          </button>
        </div>

        {activeClassList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/70 rounded-2xl text-center min-h-[180px] shadow-sm">
            <BookOpen className="w-8 h-8 text-slate-300 mb-2" />
            <h3 className="text-xs font-extrabold text-[#111] mb-1">No classrooms established</h3>
            <p className="text-[10px] text-slate-400">Click 'Add classroom' to link divisions to this school profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeClassList.map(cls => {
              const supervisor = staff.find(st => st.id === cls.teacherId);
              // Count pupils belonging to this grade/year
              const studentMatches = schoolStudents.filter(s => {
                const isCbeClass = (activeSchool?.curriculum ?? 'CBE').includes('CBE');
                if (isCbeClass) {
                  return cls.name.toLowerCase().includes(s.gradeLevel.toLowerCase()) || s.gradeLevel.toLowerCase().includes(cls.name.toLowerCase());
                } else {
                  return cls.name.toLowerCase().includes(s.gradeLevel.toLowerCase()) || s.gradeLevel.toLowerCase().includes(cls.name.toLowerCase());
                }
              }).length;

              return (
                <div 
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id === selectedClassId ? null : cls.id)}
                  className={`p-4 bg-white border rounded-2xl cursor-pointer hover:border-slate-350 transition-all space-y-3 shadow-2xs relative ${
                    selectedClassId === cls.id ? 'border-indigo-500 ring-2 ring-indigo-50/50' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{cls.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Dual Framework Division</p>
                  </div>

                  <div className="flex justify-between items-center text-[10.5px] border-t border-slate-50 pt-2.5 font-bold text-slate-700">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {supervisor ? supervisor.name : 'No Teacher'}</span>
                    <span className="text-slate-400">{studentMatches || 2} pupils linked</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Curriculum LMS study materials and homework compiler */}
      <div className="xl:col-span-12 xl:grid xl:grid-cols-12 gap-6 pt-2">
        
        {/* LMS study list */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Study Materials & Homework assignments ({activeLmsMaterials.length})
              </h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Interactive tasks matching registered curriculum parameters.</p>
            </div>

            <button
              onClick={() => setShowMaterialForm(!showMaterialForm)}
              className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              {showMaterialForm ? 'Cancel Form' : 'Add Material'}
            </button>
          </div>

          {showMaterialForm && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMatTitle || !newMatSubject) return;
                onAddLmsMaterial({
                  title: newMatTitle,
                  subject: newMatSubject,
                  type: newMatType,
                  content: newMatContent,
                  imageUrl: newMatImage,
                  curriculum: (activeSchool?.curriculum ?? 'CBE').includes('CBE') ? 'CBE' : 'Cambridge'
                });
                setNewMatTitle('');
                setNewMatSubject('');
                setNewMatContent('');
                setNewMatImage('');
                setShowMaterialForm(false);
              }}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3.5 text-xs text-slate-750"
            >
              <h4 className="font-extrabold text-slate-805 uppercase tracking-wide text-[10px]">Create classroom Material</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Material/Task Title *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Insha Kuhusu Likizo, Physics Exam Set"
                    value={newMatTitle}
                    onChange={e => setNewMatTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Subject Selection *</label>
                  <select
                    value={CBE_SUBJECTS.includes(newMatSubject) || CAMBRIDGE_SUBJECTS.includes(newMatSubject) || KENYAN_844_SUBJECTS.includes(newMatSubject) ? newMatSubject : (newMatSubject ? 'custom_subject' : '')}
                    onChange={e => {
                      if (e.target.value !== 'custom_subject') {
                        setNewMatSubject(e.target.value);
                      }
                    }}
                    className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:border-indigo-500 font-semibold"
                    required
                  >
                    <option value="">-- Choose Subject --</option>
                    {( (activeSchool?.curriculum ?? 'CBE').includes('CBE') 
                        ? CBE_SUBJECTS 
                        : (activeSchool?.curriculum ?? '').includes('844') 
                          ? KENYAN_844_SUBJECTS 
                          : CAMBRIDGE_SUBJECTS 
                    ).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="custom_subject">✎ Write Custom Subject...</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Custom Subject Descriptor</label>
                  <input 
                    type="text"
                    required
                    placeholder="Type subject descriptor..."
                    value={newMatSubject}
                    onChange={e => setNewMatSubject(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Task Format</label>
                  <select
                    value={newMatType}
                    onChange={e => setNewMatType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:border-indigo-500 font-bold"
                  >
                    <option value="Assignment">Assignment Homework</option>
                    <option value="Note">Notes Reading</option>
                    <option value="Quiz">Quick Quiz</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Textual Syllabus explanation / specifications</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide notes text or detailed task prompt instructions..."
                    value={newMatContent}
                    onChange={e => setNewMatContent(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:border-indigo-500 font-medium"
                  />
                </div>

                {/* Photo uploader with fully functional drag-and-drop & manual file selection */}
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">
                    📷 Homework of the Day Blackboard / Text Snapshot (Optional)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2 font-medium">
                    Upload a high-fidelity image of handwritten homework on the board or a printed test worksheet for pupils to read.
                  </p>
                  
                  {newMatImage ? (
                    <div className="relative border border-dashed border-indigo-200 rounded-xl p-3 bg-indigo-50/10 flex flex-col items-center justify-center space-y-2">
                      <img 
                        src={newMatImage} 
                        alt="Snapshot Preview" 
                        referrerPolicy="no-referrer"
                        className="max-h-40 rounded-lg object-contain shadow-sm border border-slate-200"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewMatImage('')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-rose-100"
                        >
                          <X className="w-3.5 h-3.5" /> Remove Attachment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleImageFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => {
                        const fileInput = document.getElementById('homework-photo-input');
                        if (fileInput) fileInput.click();
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-indigo-500 bg-indigo-50/30' 
                          : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/20'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="homework-photo-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFile(e.target.files[0]);
                          }
                        }}
                      />
                      <Sparkles className="w-5 h-5 text-indigo-500 mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-slate-700">
                        Drag & Drop or <span className="text-indigo-600 hover:underline">Click to upload</span> a whiteboard snapshot
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports JPG, PNG, WEBP, GIF (reads directly as durable Base64)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Post study file
                </button>
              </div>
            </form>
          )}

          {/* Quick Filter tabs for Materials with snapshots */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 bg-slate-50/50 p-1.5 rounded-lg">
            <span className="text-[9.5px] uppercase font-mono font-black text-slate-400 mr-2">Filter</span>
            <button
              onClick={() => setFilterSnapshotOnly(false)}
              className={`text-[10px] font-black px-2.5 py-1 rounded-md transition-all ${
                !filterSnapshotOnly 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              All Hub ({activeLmsMaterials.length})
            </button>
            <button
              onClick={() => setFilterSnapshotOnly(true)}
              className={`text-[10px] font-black px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                filterSnapshotOnly 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              📷 Classroom Snapshots Only ({activeLmsMaterials.filter(m => m.imageUrl).length})
            </button>
          </div>

          {/* List of files */}
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {activeLmsMaterials.filter(m => !filterSnapshotOnly || m.imageUrl).length === 0 ? (
              <div className="text-center py-12 text-[11px] text-slate-400 italic bg-slate-50/30 rounded-xl">
                No matching classroom materials with this filter.
              </div>
            ) : (
              activeLmsMaterials
                .filter(m => !filterSnapshotOnly || m.imageUrl)
                .map(mat => (
                  <div key={mat.id} className="p-4 bg-slate-50/40 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          {mat.title}
                          {mat.imageUrl && (
                            <span className="bg-emerald-50 text-emerald-700 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider flex items-center gap-0.5">
                              📷 snapshot
                            </span>
                          )}
                        </h4>
                        <span className="text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 mt-1.5 inline-block">
                          Subject: {mat.subject} | {mat.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{mat.assignedDate}</span>
                    </div>
                    {mat.content && (
                      <p className="text-[11px] text-slate-600 italic leading-relaxed font-semibold bg-white p-2.5 border border-slate-150 rounded-lg">
                        "{mat.content}"
                      </p>
                    )}

                    {/* Render attachment block if exist */}
                    {mat.imageUrl && (
                      <div className="relative group overflow-hidden border border-slate-200 rounded-lg bg-slate-100 max-h-48 flex justify-center items-center shadow-3xs cursor-pointer">
                        <img 
                          src={mat.imageUrl} 
                          alt="Homework Snapshot" 
                          referrerPolicy="no-referrer"
                          className="w-full max-h-48 object-cover group-hover:scale-101 transition-all"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[10px] font-bold">
                          <Sparkles className="w-3.5 h-3.5 animate-bounce text-indigo-300" /> Click to read & enlarge homework photo
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* LMS Homework Submissions & Parent approvals review console */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#111] flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Pupils submissions & approvals
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Assigned files evaluation matching parents signatures logs.</p>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {lmsSubmissions.length === 0 ? (
              <div className="text-center p-8 text-[11px] text-slate-400 italic bg-slate-50/30 rounded-xl">
                No homework submissions logged yet.
              </div>
            ) : (
              lmsSubmissions.map(sub => {
                const std = students.find(s => s.id === sub.studentId);
                const mat = lmsMaterials.find(m => m.id === sub.materialId);
                
                return (
                  <div key={sub.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-50 pb-1.5">
                      <div>
                        <h4 className="text-[11px] font-bold text-[#111]">{std ? std.name : 'Unknown pupil'}</h4>
                        <p className="text-[9px] text-slate-400 font-bold">{mat ? mat.title : 'Study task'}</p>
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-600 font-semibold italic">"{sub.content}"</p>

                    {/* Parents approval signature */}
                    <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-[9.5px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${sub.parentApproved ? 'bg-emerald-400' : 'bg-rose-450 animate-pulse'}`} />
                        <span className="font-bold">Guardian Appraisal: {sub.parentApproved ? 'Signed & Witnessed' : 'Awaiting confirmation'}</span>
                      </div>
                      {sub.parentFeedback && (
                        <p className="italic text-slate-550 leading-none">Parent Feedback: "{sub.parentFeedback}"</p>
                      )}
                    </div>

                    {/* Teacher Review buttons */}
                    {sub.status === 'Pending' && (
                      <div className="flex gap-2 pt-1 border-t border-slate-50">
                        <button
                          onClick={() => onReviewLmsSubmission(sub.id, true, 'Excellent work!')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black py-1.5 rounded-lg text-center shadow-3xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReviewLmsSubmission(sub.id, false, 'Needs revision on solar energy details')}
                          className="flex-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-650 text-[10px] font-bold py-1.5 rounded-lg text-center"
                        >
                          Revise Task
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Lightbox / Immersive Fullscreen Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setViewingImage(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = viewingImage;
                link.download = 'homework-of-the-day-snapshot.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all border border-white/10 shadow-sm"
              title="Download Snapshot image"
            >
              Download Photo
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingImage(null);
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/10 transition-all font-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div 
            className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={viewingImage} 
              alt="Homework full resolution snapshot" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/15"
            />
          </div>
          
          <div className="text-center mt-4 max-w-md">
            <h4 className="text-white font-extrabold text-sm flex items-center justify-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> Classroom Whiteboard / Workbook Photograph</h4>
            <p className="text-indigo-200 text-xs mt-1 leading-normal font-semibold">Pupils: review and complete instructions into your homework journals. Press anywhere outside or click Esc/cross to dismiss.</p>
          </div>
        </div>
      )}

    </div>
  );
}
