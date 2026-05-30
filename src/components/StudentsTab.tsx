import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  Dumbbell,
  Clock, 
  Trash2, 
  BookOpen, 
  Bus, 
  Home, 
  UserPlus 
} from 'lucide-react';
import { Student, Assessment, StudentGrade, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';

interface StudentsTabProps {
  activeSchoolId: string;
  schools: School[];
  students: Student[];
  assessments: Assessment[];
  grades: StudentGrade[];
  onAddNewStudent: () => void;
  onGradeStudent: (payload: any) => void;
  onDeleteStudent: (id: string) => void;
  onGenerateAiComment: (studentId: string) => Promise<string>;
}

export default function StudentsTab({
  activeSchoolId,
  schools,
  students,
  assessments,
  grades,
  onAddNewStudent,
  onGradeStudent,
  onDeleteStudent,
  onGenerateAiComment
}: StudentsTabProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId);

  // Search/Filters states
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Grade Edit Form values
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [editScore, setEditScore] = useState('');
  const [editRubric, setEditRubric] = useState<'EE' | 'ME' | 'AE' | 'BE'>('ME');
  const [editRemarks, setEditRemarks] = useState('');

  // AI comments state
  const [aiComments, setAiComments] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  // Filter students to active school
  const activeStudentsList = useMemo(() => {
    return students.filter(s => {
      const matchSchool = s.schoolId === activeSchoolId;
      const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase());
      return matchSchool && matchSearch;
    });
  }, [students, activeSchoolId, studentSearch]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Filter assessments fitting this school's pathway
  const relevantAssessments = assessments.filter(
    a => (activeSchool?.curriculum ?? 'CBE').includes('CBE') ? a.curriculum === 'CBE' : a.curriculum === 'Cambridge'
  );

  // Generate AI comment
  const handleAiCommentTrig = async (studId: string) => {
    setAiLoading(prev => ({ ...prev, [studId]: true }));
    try {
      const comment = await onGenerateAiComment(studId);
      setAiComments(prev => ({ ...prev, [studId]: comment }));
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(prev => ({ ...prev, [studId]: false }));
    }
  };

  return (
    <div id="skoola-students-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* List / Search Column */}
      <div className="lg:col-span-12 xl:col-span-7 space-y-4">
        
        {/* Search header bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search pupils by name or ADM..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>

          <button
            id="btn-students-add-student"
            onClick={onAddNewStudent}
            className="w-full sm:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Enroll pupil
          </button>
        </div>

        {/* List of Students */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {activeStudentsList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No matching pupil profiles registered under this school.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeStudentsList.map(stud => {
                const isSelected = stud.id === selectedStudentId;
                const studGrades = grades.filter(g => g.studentId === stud.id);
                
                return (
                  <div 
                    key={stud.id}
                    onClick={() => {
                      setSelectedStudentId(stud.id);
                      // Pre-fill grading variables
                      setSelectedAssessmentId(relevantAssessments[0]?.id || '');
                      setEditRemarks('');
                      setEditScore('80');
                      setEditRubric('ME');
                    }}
                    className={`p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50/70 border-l-4 border-indigo-600 pl-3' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 truncate">{stud.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          stud.boardingStatus === 'Boarder' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-900'
                        }`}>
                          {stud.boardingStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-450 mt-1 font-semibold">
                        <span className="font-mono text-slate-400">{stud.admissionNo}</span>
                        <span>•</span>
                        <span>{stud.gradeLevel}</span>
                        <span>•</span>
                        <span>{stud.gender}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-650 px-2 py-1 rounded">
                        {stud.curriculum} ({studGrades.length} grades)
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Slide-out / Reports card compiler */}
      <div className="lg:col-span-12 xl:col-span-5">
        {!selectedStudent ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 min-h-[300px] flex flex-col justify-center items-center bg-slate-50/30">
            <Users className="w-8 h-8 text-slate-300 mb-2.5" />
            Select a pupil from the directory to review report card grades, record learning ratings, or query artificial intelligence remarks.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
            
            {/* Header profile info */}
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-[15px] font-black text-slate-900">{selectedStudent.name}</h3>
                <p className="text-[10.5px] text-slate-400 mt-0.5 font-semibold">
                  Pupil Record No: <strong className="font-mono text-slate-500 font-bold">{selectedStudent.admissionNo}</strong> | {selectedStudent.gradeLevel}
                </p>
              </div>

              <button
                onClick={() => {
                  onDeleteStudent(selectedStudent.id);
                  setSelectedStudentId(null);
                }}
                className="text-[10.5px] font-bold text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-100 hover:bg-rose-50 px-2 my-0.5 py-1 rounded-lg transition-colors"
              >
                Delete Profile
              </button>
            </div>

            {/* Quick school info */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-650 leading-relaxed font-semibold bg-slate-50/50 p-3 rounded-xl border border-slate-150">
              {selectedStudent.dormitoryId && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">Hostel: {selectedStudent.dormitoryId === 'dorm-elgon' ? 'Elgon' : 'Kilimanjaro'}</span>
                </div>
              )}
              {selectedStudent.busRouteId && (
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="truncate">Bus stops indexed</span>
                </div>
              )}
              <div className="col-span-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-bold uppercase">
                Parent Contact: {selectedStudent.parentEmail || 'Not configured'}
              </div>
            </div>

            {/* Assessment History list */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Academic Marks History</h4>
              
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {grades.filter(g => g.studentId === selectedStudent.id).length === 0 ? (
                  <div className="text-center p-6 text-[11px] text-slate-400 italic bg-slate-50/30 rounded-lg">
                    No learning accomplishments logged yet.
                  </div>
                ) : (
                  grades.filter(g => g.studentId === selectedStudent.id).map((gr, idx) => {
                    const ass = assessments.find(a => a.id === gr.assessmentId);
                    return (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex justify-between items-center shadow-2xs">
                        <div>
                          <div className="font-bold text-slate-800 truncate max-w-[190px]">{ass ? ass.title : 'External assessment'}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{gr.lastUpdated}</div>
                        </div>

                        <div className="text-right shrink-0">
                          {gr.rubricRating ? (
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                              gr.rubricRating === 'EE' ? 'bg-emerald-100 text-emerald-850' :
                              gr.rubricRating === 'ME' ? 'bg-indigo-100 text-indigo-850' :
                              gr.rubricRating === 'AE' ? 'bg-amber-100 text-amber-850' :
                              'bg-rose-100 text-rose-850'
                            }`}>
                              CBE: {gr.rubricRating}
                            </span>
                          ) : (
                            <span className="text-[11px] font-black font-mono bg-sky-50 border border-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                              {gr.score}% (Grade {gr.grade})
                            </span>
                          )}
                          <div className="text-[10px] text-slate-450 italic mt-1 font-medium max-w-[120px] truncate">"{gr.remarks || 'No remarks'}"</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Grading input Form block */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedAssessmentId) return;
                onGradeStudent({
                  studentId: selectedStudent.id,
                  assessmentId: selectedAssessmentId,
                  score: Number(editScore),
                  rubricRating: editRubric,
                  remarks: editRemarks
                });
                setEditRemarks('');
              }}
              className="space-y-3.5 border-t border-slate-100 pt-5"
            >
              <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Record Assessments Data</h4>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase mb-1 block">Selected Strand Assessment:</label>
                  <select
                    value={selectedAssessmentId}
                    onChange={e => setSelectedAssessmentId(e.target.value)}
                    className="w-full p-2.5 border border-slate-250 bg-white rounded-xl focus:border-indigo-500 font-semibold"
                  >
                    <option value="">-- Choose Assessment --</option>
                    {relevantAssessments.map(a => (
                      <option key={a.id} value={a.id}>{a.title} ({a.subject})</option>
                    ))}
                  </select>
                </div>

                {(activeSchool?.curriculum ?? 'CBE').includes('CBE') ? (
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase mb-1 block">Kenyan CBE Formative Rating:</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['EE', 'ME', 'AE', 'BE'] as const).map(rat => (
                        <button
                          key={rat}
                          type="button"
                          onClick={() => setEditRubric(rat)}
                          className={`py-2 border rounded-xl text-center text-xs font-black transition-all ${
                            editRubric === rat
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200'
                          }`}
                        >
                          {rat}
                        </button>
                      ))}
                    </div>
                    <div className="text-[9.5px] text-slate-400 mt-1 font-medium text-center">
                      EE: Exceeds | ME: Meets | AE: Approaching | BE: Below Standard
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase mb-1 block">Cambridge Exam Score (0-100%):</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={editScore}
                      onChange={e => setEditScore(e.target.value)}
                      className="w-full p-2.5 border border-slate-250 rounded-xl bg-white focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase mb-1 block">Appraisal teacher Comments:</label>
                  <input
                    type="text"
                    placeholder="Specific teacher annotations..."
                    value={editRemarks}
                    onChange={e => setEditRemarks(e.target.value)}
                    className="w-full p-2.5 border border-slate-250 bg-white rounded-xl focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedAssessmentId}
                className="w-full bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition-all"
              >
                Save Academic Metric
              </button>
            </form>

            {/* Gemini AI Evaluator Panel */}
            <div className="border-t border-slate-100 pt-5 space-y-3.5">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Server-side AI comment Compiler
                </h4>
                <button
                  id="btn-students-gen-ai-comment"
                  onClick={() => handleAiCommentTrig(selectedStudent.id)}
                  disabled={aiLoading[selectedStudent.id]}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  {aiLoading[selectedStudent.id] ? 'AI compiling...' : 'Query Gemini'}
                </button>
              </div>

              {aiComments[selectedStudent.id] ? (
                <div id="ai-evaluation-balloon" className="p-3 bg-gradient-to-tr from-indigo-50/50 to-indigo-100/30 border border-indigo-150/40 rounded-xl text-[11px] leading-relaxed font-semibold italic text-[#1e1b4b]">
                  {aiComments[selectedStudent.id]}
                </div>
              ) : (
                <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center text-[10px] leading-relaxed text-slate-400 font-medium">
                  Query Google Gemini LLM API server-side to auto-generate fully personalized terminal comment appraisal letters.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
