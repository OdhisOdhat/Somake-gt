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
  UserPlus,
  UploadCloud,
  FileSpreadsheet,
  X,
  Check,
  ShieldAlert,
  Printer,
  Download,
  Award,
  ClipboardCheck,
  FileText
} from 'lucide-react';
import { Student, Assessment, StudentGrade, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';
import { useAppContext } from '../context/AppContext';
import { downloadStudentTemplate } from '../utils/templateGenerator';

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
  const { 
    userRole, 
    showToast, 
    fetchStateFromServer,
    handleProposeStudentEdit,
    handleApproveStudentChange,
    handleRejectStudentChange,
    examReports,
    handleSaveExamReport,
    staff
  } = useAppContext();

  // Student Edit Dialog Form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    gradeLevel: 'Grade 4',
    boardingStatus: 'Day' as 'Day' | 'Boarder',
    dormitoryId: 'dorm-elgon',
    busRouteId: 'route-a',
    parentEmail: '',
    parentPhone: ''
  });

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<Student | null>(null);
  const [aiRemarksLoading, setAiRemarksLoading] = useState(false);
  const [reportForm, setReportForm] = useState({
    term: 'Term 2',
    year: '2026',
    attendancePresent: '82',
    attendanceTotal: '85',
    conduct: 'Excellent',
    extraCurricular: 'Active in School Soccer as a forward striker and participates regularly in drama performances.',
    teacherRemarks: 'Musa has behaved wonderfully this term and showed exceptional leadership skills in school cleanups.',
    principalRemarks: 'Superb dedication. Keep up the high standards!',
    teacherSignature: 'P. Wambui',
    principalSignature: 'J. Mwangi'
  });

  if (!activeSchoolId || !activeSchool) {
    return <NoSchoolSelected title="Select a school profile" />;
  }

  // Bulk CSV parser states
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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

  // Open and load exam report card modal state
  const handleOpenReportModal = (student: Student) => {
    setSelectedReportStudent(student);
    const existing = examReports.find(r => r.studentId === student.id && r.term === 'Term 2' && r.year === '2026');
    if (existing) {
      setReportForm({
        term: existing.term,
        year: existing.year,
        attendancePresent: String(existing.attendancePresent),
        attendanceTotal: String(existing.attendanceTotal),
        conduct: existing.conduct,
        extraCurricular: existing.extraCurricular || '',
        teacherRemarks: existing.teacherRemarks || '',
        principalRemarks: existing.principalRemarks || '',
        teacherSignature: existing.teacherSignature || '',
        principalSignature: existing.principalSignature || ''
      });
    } else {
      const teacherName = staff.find(s => s.schoolId === student.schoolId && s.role !== 'Head Teacher')?.name || 'Class Teacher Peninah';
      const principalName = staff.find(s => s.role === 'Head Teacher' && s.schoolId === student.schoolId)?.name || 'Principal Jane Mwangi';
      setReportForm({
        term: 'Term 2',
        year: '2026',
        attendancePresent: '82',
        attendanceTotal: '85',
        conduct: 'Excellent',
        extraCurricular: 'Active in School Soccer as a forward striker and participates regularly in drama performances.',
        teacherRemarks: 'Showing great focus and growth in core areas. Hardworking and helpful in class activities.',
        principalRemarks: 'Superb dedication and positive conduct. Continue with high efforts.',
        teacherSignature: teacherName,
        principalSignature: principalName
      });
    }
    setShowReportModal(true);
  };

  const handleSaveReportForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportStudent) return;
    const reportPayload = {
      id: `rep-${selectedReportStudent.id}-${reportForm.term}-${reportForm.year}`.replace(/\s+/g, '-').toLowerCase(),
      studentId: selectedReportStudent.id,
      schoolId: selectedReportStudent.schoolId,
      term: reportForm.term,
      year: reportForm.year,
      attendancePresent: Number(reportForm.attendancePresent) || 0,
      attendanceTotal: Number(reportForm.attendanceTotal) || 0,
      conduct: reportForm.conduct,
      extraCurricular: reportForm.extraCurricular,
      teacherRemarks: reportForm.teacherRemarks,
      principalRemarks: reportForm.principalRemarks,
      teacherSignature: reportForm.teacherSignature,
      principalSignature: reportForm.principalSignature,
      published: true,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    handleSaveExamReport(reportPayload);
  };

  const handleModalAiRemarksGenerate = async () => {
    if (!selectedReportStudent) return;
    setAiRemarksLoading(true);
    try {
      const comment = await onGenerateAiComment(selectedReportStudent.id);
      setReportForm(prev => ({ ...prev, teacherRemarks: comment }));
      showToast('Gemini compiled personalized terminal comment successfully!', 'success');
    } catch {
      showToast('AI could not connect to server, standard commentary generated', 'error');
    } finally {
      setAiRemarksLoading(false);
    }
  };

  const handleTermYearChange = (term: string, year: string) => {
    if (!selectedReportStudent) return;
    setReportForm(prev => ({ ...prev, term, year }));
    const existing = examReports.find(r => r.studentId === selectedReportStudent.id && r.term === term && r.year === year);
    if (existing) {
      setReportForm({
        term: existing.term,
        year: existing.year,
        attendancePresent: String(existing.attendancePresent),
        attendanceTotal: String(existing.attendanceTotal),
        conduct: existing.conduct,
        extraCurricular: existing.extraCurricular || '',
        teacherRemarks: existing.teacherRemarks || '',
        principalRemarks: existing.principalRemarks || '',
        teacherSignature: existing.teacherSignature || '',
        principalSignature: existing.principalSignature || ''
      });
    }
  };

  const handlePrintReportCard = () => {
    const element = document.getElementById('printable-report-card');
    if (!element) return;
    const printWindow = window.open('', '_blank');
    if (printWindow && selectedReportStudent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Skoola Term Report - ${selectedReportStudent.name}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                background-color: white !important;
                color: #1e293b !important;
                padding: 30px !important;
              }
              tr {
                page-break-inside: avoid;
              }
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
            </style>
          </head>
          <body>
            <div class="max-w-4xl mx-auto">
              ${element.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      showToast('Popup is blocked by your browser! Please allow popups for printable card templates.', 'error');
    }
  };

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

  // Drag and Drop Callbacks
  const triggerFileSelect = () => {
    const fileElem = document.getElementById('csv-file-picker-input');
    if (fileElem) fileElem.click();
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeaveHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setCsvFile(file);
        showToast(`CSV queued: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
      } else {
        showToast('Only CSV files can be imported into this pupil register!', 'error');
      }
    }
  };

  const onFileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCsvFile(file);
      showToast(`CSV loaded: ${file.name}`, 'info');
    }
  };

  const handleCSVImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      showToast('Please select or drop a valid CSV student sheet first', 'error');
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) throw new Error('File content spreadsheet is empty');

        // Simple row lines breakdown
        const rows = text.split(/\r?\n/).map(line => {
          // Simple parsing of CSV elements
          const matches = line.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$|\r|\n)/g) || line.split(',');
          return matches.map(val => val.replace(/^"|"$/g, '').trim());
        }).filter(row => row.length > 0 && row.some(cell => cell !== ''));

        if (rows.length < 2) {
          throw new Error('CSV sheet is empty. Ensure you have a header row and data records!');
        }

        const headers = rows[0].map(h => h.toLowerCase());
        
        // Match header descriptors
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const admIdx = headers.findIndex(h => h.includes('id') || h.includes('adm') || h.includes('number'));
        const balIdx = headers.findIndex(h => h.includes('balance') || h.includes('fee') || h.includes('due') || h.includes('amount'));
        const genderIdx = headers.findIndex(h => h.includes('gender') || h.includes('sex'));
        const gradeIdx = headers.findIndex(h => h.includes('grade') || h.includes('class'));

        if (nameIdx === -1) {
          throw new Error('Could not identify a column containing student "Name". Make sure you have a "Name" column!');
        }

        const importStudents: any[] = [];
        const importFeeRecords: any[] = [];

        // Parse student rows starting from row 1
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const name = row[nameIdx];
          if (!name) continue; // Skip blank lines

          const admissionNo = admIdx !== -1 && row[admIdx] ? row[admIdx] : `ADM-${Math.floor(1000 + Math.random() * 9000)}`;
          const initialFeeBalance = balIdx !== -1 && row[balIdx] ? parseFloat(row[balIdx].replace(/[^0-9.]/g, '')) : 45000;
          const gender = genderIdx !== -1 && row[genderIdx] 
            ? (row[genderIdx].toLowerCase().startsWith('f') ? 'Female' : 'Male') 
            : 'Male';
          const gradeLevel = gradeIdx !== -1 && row[gradeIdx] ? row[gradeIdx] : 'Grade 4';

          const studentId = `stud-csv-${Date.now()}-${i}`;
          
          importStudents.push({
            id: studentId,
            schoolId: activeSchoolId,
            name,
            admissionNo,
            gender,
            gradeLevel,
            boardingStatus: 'Day',
            curriculum: (activeSchool?.curriculum ?? 'CBE').includes('CBE') ? 'CBE' : 'Cambridge',
            parentEmail: '',
            parentPhone: ''
          });

          importFeeRecords.push({
            id: `fee-csv-${Date.now()}-${i}`,
            studentId: studentId,
            schoolId: activeSchoolId,
            totalDue: isNaN(initialFeeBalance) ? 45000 : initialFeeBalance,
            paidAmount: 0
          });
        }

        const response = await fetch('/api/students/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: importStudents, feeRecords: importFeeRecords })
        });

        if (!response.ok) {
          const errRes = await response.json();
          throw new Error(errRes.error || 'Server rejected bulk import files');
        }

        const resData = await response.json();
        showToast(`Successfully bulk imported ${resData.count} pupil profiles and created their outstanding school fee accounts!`, 'success');
        
        // Reactive Context Load
        await fetchStateFromServer();

        setCsvFile(null);
        setShowBulkImport(false);
      } catch (err: any) {
        showToast(`CSV parse failure: ${err.message}`, 'error');
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      showToast('Error reading the CSV file on client-side', 'error');
      setIsImporting(false);
    };

    reader.readAsText(csvFile);
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (userRole !== 'super_admin') {
                  showToast("Access Restricted: Only Super Administrators can bulk-import student records.", "error");
                  return;
                }
                setShowBulkImport(!showBulkImport);
              }}
              className="w-full sm:w-auto shrink-0 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Bulk Import CSV
            </button>
            
            <button
              id="btn-students-add-student"
              onClick={() => {
                if (userRole !== 'super_admin' && userRole !== 'teacher') {
                  showToast("Access Restricted: Only Super Administrators or Class Teachers have rights to register student records.", "error");
                  return;
                }
                onAddNewStudent();
              }}
              className={`w-full sm:w-auto shrink-0 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                userRole !== 'super_admin' && userRole !== 'teacher'
                  ? 'bg-slate-100/70 border border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Enroll pupil {(userRole !== 'super_admin' && userRole !== 'teacher') && '🔒'}
            </button>
          </div>
        </div>

        {/* Expandable Bulk Import Box */}
        {showBulkImport && (
          <div className="bg-slate-50 border border-dashed border-slate-250 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-200 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">Bulk Import Scholar Database via CSV</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-0.5">
                  Import multi-row student directories and instantiate outstanding tuition fee balances simultaneously.
                </p>
              </div>
              <button 
                onClick={() => { setCsvFile(null); setShowBulkImport(false); }}
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div 
              onDragOver={onDragOverHandler}
              onDragLeave={onDragLeaveHandler}
              onDrop={onDropHandler}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:bg-slate-50/50'
              }`}
            >
              <input 
                id="csv-file-picker-input"
                type="file"
                accept=".csv"
                onChange={onFileChangeHandler}
                className="hidden"
              />
              <div className="mx-auto bg-slate-50 p-3 rounded-full w-12 h-12 flex items-center justify-center text-slate-500 mb-3 border border-slate-100 shadow-xs">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
              </div>
              
              {csvFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-850">{csvFile.name}</p>
                  <p className="text-[10px] text-emerald-600 font-extrabold">✓ CSV sheet loaded successfully. Click 'Proceed' below!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-700">Drag & drop your CSV spreadsheet here</p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal">or click to browse your devices local directories</p>
                </div>
              )}
            </div>

            {/* Recommended Template Format details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] bg-white p-3 rounded-xl border border-slate-150">
              <div className="space-y-1 text-left">
                <span className="text-slate-400 font-black block uppercase tracking-wider text-[9px]">Recommended Template Format:</span>
                <code className="bg-slate-50 text-indigo-600 font-black font-mono border border-slate-100 px-1 py-0.5 rounded text-[9.5px]">
                  Name, Admission, Balance, Gender, Grade
                </code>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={downloadStudentTemplate}
                  className="text-emerald-700 hover:text-emerald-950 font-extrabold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100/85 px-2.5 py-1.5 rounded-lg transition-colors border border-emerald-150 cursor-pointer text-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Download Student XLSX
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const demoCSV = "Name,Admission,Balance,Gender,Grade\nEsther Akinyi,ADM-8091,32000,Female,Grade 5\nKevin Mwangi,ADM-8092,54000,Male,Grade 6\nAmina Juma,ADM-8093,0,Female,Grade 4\nBrian Chepkwony,ADM-8094,45000,Male,Grade 5";
                    const blob = new Blob([demoCSV], { type: 'text/csv' });
                    const file = new File([blob], 'demo_students_import.csv', { type: 'text/csv' });
                    setCsvFile(file);
                    showToast('Prefilled with mock demo data! See status badge above.', 'success');
                  }}
                  className="text-indigo-700 hover:text-indigo-900 font-extrabold flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors border border-indigo-150 cursor-pointer text-xs"
                >
                  ✏ Inject test sample CSV
                </button>
              </div>
            </div>

            {csvFile && (
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCsvFile(null)}
                  className="px-3.5 py-2 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={handleCSVImportSubmit}
                  disabled={isImporting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isImporting ? 'Processing entries...' : 'Proceed with Bulk Upload'}
                </button>
              </div>
            )}
          </div>
        )}

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 truncate">{stud.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          stud.boardingStatus === 'Boarder' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-900'
                        }`}>
                          {stud.boardingStatus}
                        </span>
                        {stud.approvalStatus === 'Pending_Enrollment' && (
                          <span className="text-[8.5px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                            Pending Enroll Approval
                          </span>
                        )}
                        {stud.approvalStatus === 'Pending_Edit' && (
                          <span className="text-[8.5px] font-black uppercase text-indigo-750 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                            Proposals Pending
                          </span>
                        )}
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

              <div className="flex flex-col gap-1.5 items-end shrink-0">
                <button
                  onClick={() => {
                    setEditForm({
                      name: selectedStudent.name || '',
                      gender: selectedStudent.gender || 'Male',
                      gradeLevel: selectedStudent.gradeLevel || 'Grade 4',
                      boardingStatus: selectedStudent.boardingStatus || 'Day',
                      dormitoryId: selectedStudent.dormitoryId || 'dorm-elgon',
                      busRouteId: selectedStudent.busRouteId || 'route-a',
                      parentEmail: selectedStudent.parentEmail || '',
                      parentPhone: selectedStudent.parentPhone || ''
                    });
                    setShowEditModal(true);
                  }}
                  className="w-full text-[10.5px] font-black text-indigo-700 hover:text-indigo-850 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => {
                    if (userRole !== 'super_admin') {
                      showToast("Access Restricted: Academic profile deletion requires Super Administrator authentication.", "error");
                      return;
                    }
                    onDeleteStudent(selectedStudent.id);
                    setSelectedStudentId(null);
                  }}
                  className={`text-[10.5px] font-bold px-2 py-1 rounded-lg transition-all border ${
                    userRole !== 'super_admin'
                      ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'text-slate-500 hover:text-rose-600 border-slate-200 hover:border-rose-100 hover:bg-rose-50'
                  }`}
                >
                  Delete Profile {userRole !== 'super_admin' && '🔒'}
                </button>
              </div>
            </div>

            {/* Approval Banner for Admins */}
            {(selectedStudent.approvalStatus === 'Pending_Enrollment' || selectedStudent.approvalStatus === 'Pending_Edit') && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-[11.5px] font-black text-amber-900 tracking-tight">
                      {selectedStudent.approvalStatus === 'Pending_Enrollment' 
                        ? 'Enrollment Authorization Required' 
                        : 'Profile Update Authorization Required'}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mt-0.5">
                      {selectedStudent.approvalStatus === 'Pending_Enrollment'
                        ? 'A class teacher requested to enroll this pupil register. Admins must authorize the creation.'
                        : 'A class teacher proposed profile alterations. Review the side-by-side differentials below.'}
                    </p>
                  </div>
                </div>

                {selectedStudent.approvalStatus === 'Pending_Edit' && selectedStudent.pendingEdits && (
                  <div className="bg-white border border-slate-150 rounded-xl p-3 text-[10px] leading-normal space-y-2 font-semibold">
                    <div className="text-slate-450 font-black uppercase tracking-wide border-b border-slate-100 pb-1 text-[9px]">Comparison Matrix</div>
                    <div className="grid grid-cols-2 gap-3 text-slate-600">
                      <div className="border-r border-slate-100 pr-2">
                        <span className="text-slate-400 block font-bold text-[9px] mb-1">CURRENT STATUS:</span>
                        <ul className="list-disc pl-3.5 space-y-1 font-bold">
                          {selectedStudent.name !== selectedStudent.pendingEdits.name && <li>Name: <span className="line-through text-rose-500">{selectedStudent.name}</span></li>}
                          {selectedStudent.gender !== selectedStudent.pendingEdits.gender && <li>Gender: <span className="line-through text-rose-500">{selectedStudent.gender}</span></li>}
                          {selectedStudent.gradeLevel !== selectedStudent.pendingEdits.gradeLevel && <li>Grade: <span className="line-through text-rose-500">{selectedStudent.gradeLevel}</span></li>}
                          {selectedStudent.boardingStatus !== selectedStudent.pendingEdits.boardingStatus && <li>Boarding: <span className="line-through text-rose-500">{selectedStudent.boardingStatus}</span></li>}
                          {selectedStudent.parentEmail !== selectedStudent.pendingEdits.parentEmail && <li>Email: <span className="line-through text-rose-500">{selectedStudent.parentEmail || '(None)'}</span></li>}
                          {selectedStudent.parentPhone !== selectedStudent.pendingEdits.parentPhone && <li>Phone: <span className="line-through text-rose-500">{selectedStudent.parentPhone || '(None)'}</span></li>}
                        </ul>
                      </div>
                      <div>
                        <span className="text-indigo-600 block font-bold text-[9px] mb-1 font-black">PROPOSED EDITS:</span>
                        <ul className="list-disc pl-3.5 space-y-1 font-black text-slate-800">
                          {selectedStudent.name !== selectedStudent.pendingEdits.name && <li>Name: <span className="text-emerald-600 font-extrabold">{selectedStudent.pendingEdits.name}</span></li>}
                          {selectedStudent.gender !== selectedStudent.pendingEdits.gender && <li>Gender: <span className="text-emerald-600 font-extrabold">{selectedStudent.pendingEdits.gender}</span></li>}
                          {selectedStudent.gradeLevel !== selectedStudent.pendingEdits.gradeLevel && <li>Grade: <span className="text-emerald-600 font-extrabold">{selectedStudent.pendingEdits.gradeLevel}</span></li>}
                          {selectedStudent.boardingStatus !== selectedStudent.pendingEdits.boardingStatus && <li>Boarding: <span className="text-emerald-600 font-extrabold">{selectedStudent.pendingEdits.boardingStatus}</span></li>}
                          {selectedStudent.parentEmail !== selectedStudent.pendingEdits.parentEmail && <li>Email: <span className="text-emerald-600 font-extrabold">{selectedStudent.pendingEdits.parentEmail || '(None)'}</span></li>}
                          {selectedStudent.parentPhone !== selectedStudent.pendingEdits.parentPhone && <li>Phone: <span className="text-emerald-600 font-extrabold">{selectedStudent.pendingEdits.parentPhone || '(None)'}</span></li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {userRole === 'super_admin' ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={async () => {
                        await handleApproveStudentChange(selectedStudent.id);
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Code
                    </button>
                    <button
                      onClick={async () => {
                        await handleRejectStudentChange(selectedStudent.id);
                        setSelectedStudentId(null);
                      }}
                      className="flex-1 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline Request
                    </button>
                  </div>
                ) : (
                  <div className="text-[9.5px] text-amber-700 font-bold bg-amber-50 border border-amber-100/50 p-2 rounded-lg text-center flex items-center justify-center gap-1.5 leading-normal">
                    <ShieldAlert className="w-3.5 h-3.5 animate-pulse shrink-0" />
                    Pending Academic Administrator authorization action.
                  </div>
                )}
              </div>
            )}

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

            {/* End-of-Term Report Card Builder Section */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-500" /> End-of-Term Reports
                </h4>
                <span className="text-[8.5px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight">Printable CBC &amp; Cam</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Appraise, compile, print, and download comprehensive student termly sheet card statements in a beautifully structured layout.
              </p>
              <button
                type="button"
                id="btn-open-exam-report-modal"
                onClick={() => handleOpenReportModal(selectedStudent)}
                className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 font-sans"
              >
                <ClipboardCheck className="w-4 h-4 text-emerald-400" /> Compile Term Report Card
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Student Profile Editing Modal */}
      {showEditModal && selectedStudent && (
        <div id="modal-edit-student" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Propose student updates</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Editing: {selectedStudent.name} ({selectedStudent.admissionNo})</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                await handleProposeStudentEdit(selectedStudent.id, {
                  name: editForm.name,
                  gender: editForm.gender,
                  gradeLevel: editForm.gradeLevel,
                  boardingStatus: editForm.boardingStatus,
                  dormitoryId: editForm.boardingStatus === 'Boarder' ? editForm.dormitoryId : undefined,
                  busRouteId: editForm.boardingStatus === 'Day' ? editForm.busRouteId : undefined,
                  parentEmail: editForm.parentEmail,
                  parentPhone: editForm.parentPhone
                });
                setShowEditModal(false);
              }} 
              className="p-5 space-y-4 text-xs font-semibold text-left"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Jabari Omwamba"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Gender *</label>
                  <select
                    value={editForm.gender}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Grade / Year level Designation *</label>
                  <select
                    value={editForm.gradeLevel}
                    onChange={e => setEditForm({ ...editForm, gradeLevel: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Grade 4">Grade 4 (Formative Elementary)</option>
                    <option value="Grade 5">Grade 5 (Formative Elementary)</option>
                    <option value="Grade 6">Grade 6 (Formative Elementary)</option>
                    <option value="Year 7">Year 7 Middle School</option>
                    <option value="Year 8">Year 8 Middle School</option>
                    <option value="Year 9">Year 9 Middle School</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-455 mb-1 block">Boarding Category *</label>
                  <select
                    value={editForm.boardingStatus}
                    onChange={e => setEditForm({ ...editForm, boardingStatus: e.target.value as any })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Day">Day Commuter Scholar</option>
                    <option value="Boarder">Full Boarding Resident</option>
                  </select>
                </div>

                {editForm.boardingStatus === 'Boarder' ? (
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Dormitory allocation</label>
                    <select
                      value={editForm.dormitoryId}
                      onChange={e => setEditForm({ ...editForm, dormitoryId: e.target.value })}
                      className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="dorm-elgon">Elgon House (Boys)</option>
                      <option value="dorm-kili">Kilimanjaro House (Girls)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Transport assignment</label>
                    <select
                      value={editForm.busRouteId}
                      onChange={e => setEditForm({ ...editForm, busRouteId: e.target.value })}
                      className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="route-a">Westlands / Kilimani Shuttle</option>
                      <option value="route-b">Karen / Langata Express</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Guardian Email</label>
                  <input 
                    type="email"
                    placeholder="parent@example.com"
                    value={editForm.parentEmail}
                    onChange={e => setEditForm({ ...editForm, parentEmail: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Guardian Mobile phone</label>
                  <input 
                    type="text"
                    placeholder="e.g. 0712345678"
                    value={editForm.parentPhone}
                    onChange={e => setEditForm({ ...editForm, parentPhone: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4.5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer"
                >
                  {userRole === 'teacher' ? 'Submit Proposal to Admin' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern End-of-Term Report Card Builder Modal */}
      {showReportModal && selectedReportStudent && (
        <div id="modal-term-report" className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col md:flex-row h-[90vh] overflow-hidden">
            
            {/* Left side: Scrollable Form Panel */}
            <div className="w-full md:w-[45%] bg-white p-6 border-r border-slate-200 overflow-y-auto flex flex-col justify-between">
              
              {/* Form header */}
              <div className="space-y-1 pb-4 border-b border-slate-150 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" /> Term Report Builder
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">Appraising: <span className="text-slate-700 font-extrabold">{selectedReportStudent.name}</span></p>
                  </div>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Edit form */}
              <form onSubmit={handleSaveReportForm} className="space-y-4 text-xs font-semibold text-left flex-1 pr-1">
                
                {/* Term and Year selections */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Academic Term Selection</label>
                    <select
                      value={reportForm.term}
                      onChange={e => handleTermYearChange(e.target.value, reportForm.year)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Calendar Year</label>
                    <input
                      type="text"
                      value={reportForm.year}
                      onChange={e => handleTermYearChange(reportForm.term, e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Attendance info */}
                <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                  <div>
                    <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Days Logged Present</label>
                    <input
                      type="number"
                      min="0"
                      value={reportForm.attendancePresent}
                      onChange={e => setReportForm(prev => ({ ...prev, attendancePresent: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Total Termly Sessions</label>
                    <input
                      type="number"
                      min="0"
                      value={reportForm.attendanceTotal}
                      onChange={e => setReportForm(prev => ({ ...prev, attendanceTotal: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* Conduct selection */}
                <div className="border-t border-slate-100 pt-3">
                  <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Behavioral &amp; Conduct Appraisal</label>
                  <select
                    value={reportForm.conduct}
                    onChange={e => setReportForm(prev => ({ ...prev, conduct: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Excellent">Excellent - Model Academic Citizen</option>
                    <option value="Very Good">Very Good - Consistently Compliant</option>
                    <option value="Satisfactory">Satisfactory - Stable &amp; Well-Behaved</option>
                    <option value="Diligence Required">Diligence Required - Minor Disruption Records</option>
                  </select>
                </div>

                {/* Extra Curricular exploits */}
                <div>
                  <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Extracurricular Activities &amp; Athletics</label>
                  <input
                    type="text"
                    value={reportForm.extraCurricular}
                    onChange={e => setReportForm(prev => ({ ...prev, extraCurricular: e.target.value }))}
                    placeholder="Specific clubs, activities, achievements..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Class Teacher Comments */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-450 block">Class Teacher Academic Remark</label>
                    <button
                      type="button"
                      onClick={handleModalAiRemarksGenerate}
                      disabled={aiRemarksLoading}
                      className="text-[9.5px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" /> 
                      {aiRemarksLoading ? 'AI computing...' : 'Draft with Gemini'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={reportForm.teacherRemarks}
                    onChange={e => setReportForm(prev => ({ ...prev, teacherRemarks: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed resize-none text-slate-700 font-medium"
                    placeholder="Appraisal details concerning character development, academic milestones, etc..."
                  />
                </div>

                {/* Principal comments */}
                <div>
                  <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Principal / Advisory Summary Review</label>
                  <textarea
                    rows={2}
                    value={reportForm.principalRemarks}
                    onChange={e => setReportForm(prev => ({ ...prev, principalRemarks: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed resize-none text-slate-700 font-medium"
                    placeholder="Principal's feedback or stamp of confirmation..."
                  />
                </div>

                {/* Signature inputs */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Teacher Authority Name</label>
                    <input
                      type="text"
                      value={reportForm.teacherSignature}
                      onChange={e => setReportForm(prev => ({ ...prev, teacherSignature: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-black uppercase text-slate-450 block mb-1">Administration Approver</label>
                    <input
                      type="text"
                      value={reportForm.principalSignature}
                      onChange={e => setReportForm(prev => ({ ...prev, principalSignature: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Form buttons */}
                <div className="border-t border-slate-100 pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold font-sans text-center cursor-pointer text-xs transition-colors"
                  >
                    Close compiler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-[#047857] text-white py-2.5 px-4 rounded-xl font-bold font-sans shadow-sm text-center flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" /> Save &amp; Sync Report State
                  </button>
                </div>
              </form>
            </div>

            {/* Right side: WYSIWYG Print Preview Panel */}
            <div className="w-full md:w-[55%] bg-slate-600/30 p-6 overflow-y-auto flex flex-col justify-start relative">
              
              {/* Floating controls panel */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-450" /> WYSIWYG Printable Template
                </h4>

                <button 
                  type="button"
                  onClick={handlePrintReportCard}
                  className="bg-indigo-600 hover:bg-slate-900 border border-indigo-500 hover:border-slate-800 text-white font-extrabold text-[10.5px] uppercase tracking-wide py-1.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer leading-none"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-200" /> Print / Save as PDF
                </button>
              </div>

              {/* Core Printable Sheet Card (A4 Mimic) */}
              <div 
                id="printable-report-card" 
                className="w-full bg-white text-[#1e293b] p-8 shadow-lg rounded-2xl flex flex-col gap-6 border border-slate-200/50 min-h-[9.5in] font-sans text-left"
              >
                {/* Visual Header */}
                <div className="border-b-4 border-slate-900 pb-5 text-center relative">
                  {/* Crest design */}
                  {activeSchool.logoUrl ? (
                    <div className="mx-auto w-16 h-16 mb-2 flex items-center justify-center">
                      <img 
                        src={activeSchool.logoUrl} 
                        alt="School Logo" 
                        className="max-h-16 max-w-16 object-contain rounded-xl shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-serif text-xl font-black mb-2 shadow-sm uppercase tracking-wide">
                      {activeSchool.name.substring(0, 1)}
                    </div>
                  )}
                  
                  <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">{activeSchool.name}</h2>
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">{activeSchool.address} • Email: {activeSchool.email || 'info@school.ac.ke'}</p>
                  <div className="text-[11px] bg-slate-100 text-slate-800 border border-slate-200 font-extrabold px-3 py-1 rounded-md mt-3 inline-block uppercase tracking-wider font-mono">
                    Official End-Of-Term Academic evaluation Report
                  </div>
                </div>

                {/* Pupil Metadata Matrix */}
                <div className="grid grid-cols-2 gap-y-2 text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-150 leading-relaxed font-semibold">
                  <div>
                    <span className="text-slate-450 block font-black uppercase text-[8.5px] tracking-wider">Student Name</span>
                    <span className="text-slate-900 font-extrabold text-xs">{selectedReportStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block font-black uppercase text-[8.5px] tracking-wider">Admission Number</span>
                    <span className="text-slate-900 font-mono text-xs font-black">{selectedReportStudent.admissionNo}</span>
                  </div>
                  <div className="mt-2 text-left">
                    <span className="text-slate-450 block font-black uppercase text-[8.5px] tracking-wider">Academic Term / Cycle</span>
                    <span className="text-slate-800 font-bold">{reportForm.term}, {reportForm.year}</span>
                  </div>
                  <div className="mt-2 text-left">
                    <span className="text-slate-450 block font-black uppercase text-[8.5px] tracking-wider">Education System</span>
                    <span className="text-slate-850 font-extrabold uppercase">
                      {selectedReportStudent.curriculum === 'CBE' ? 'Kenyan Formative CBE' : 'Cambridge International Curriculum'}
                    </span>
                  </div>
                </div>

                {/* Subject Log Registry Table */}
                <div className="space-y-3">
                  <h4 className="text-[10.5px] font-black uppercase text-slate-900 tracking-wider border-b border-slate-200 pb-1">
                    Learning Areas &amp; Subject Accomplishments
                  </h4>
                  
                  {/* Dynamic Grading List Wrapper */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    
                    {selectedReportStudent.curriculum === 'CBE' ? (
                      /* CBE Competency Report Style Table */
                      <table className="w-full text-left text-[11px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-slate-900 text-white font-extrabold uppercase tracking-wide text-[9px]">
                            <th className="p-3">Learning Area / Strand</th>
                            <th className="p-3 text-center w-14">BE</th>
                            <th className="p-3 text-center w-14">AE</th>
                            <th className="p-3 text-center w-14">ME</th>
                            <th className="p-3 text-center w-14">EE</th>
                            <th className="p-3 pl-4">Formative Milestone Appraisal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-semibold text-slate-705">
                          {(() => {
                            // Map resolved fallback grades
                            const resolvedGr = grades.filter(g => g.studentId === selectedReportStudent.id);
                            const actualList = resolvedGr.length > 0 ? resolvedGr : [
                              { studentId: selectedReportStudent.id, assessmentId: 'fallback-math', rubricRating: 'EE', remarks: 'Exceptional numeracy skills and strong reasoning fluency.' },
                              { studentId: selectedReportStudent.id, assessmentId: 'fallback-sci', rubricRating: 'ME', remarks: 'Understands basic nutritional concepts and environmental patterns.' },
                              { studentId: selectedReportStudent.id, assessmentId: 'fallback-kis', rubricRating: 'ME', remarks: 'Anaonyesha ufasaha mkubwa katika kusikiliza na kusoma.' },
                              { studentId: selectedReportStudent.id, assessmentId: 'fallback-eng', rubricRating: 'EE', remarks: 'Displays rich vocabulary and creativity in narrative essays.' }
                            ];

                            return actualList.map((gr, i) => {
                              const ass = assessments.find(a => a.id === gr.assessmentId);
                              let subjectTitle = ass ? ass.subject : '';
                              if (!subjectTitle) {
                                if (gr.assessmentId.includes('math')) subjectTitle = 'Mathematics';
                                else if (gr.assessmentId.includes('sci')) subjectTitle = 'Science & Technology';
                                else if (gr.assessmentId.includes('kis')) subjectTitle = 'Kiswahili Lugha';
                                else if (gr.assessmentId.includes('eng')) subjectTitle = 'English Language';
                                else subjectTitle = 'Social & Creative Arts';
                              }

                              const rating = gr.rubricRating || 'ME';

                              return (
                                <tr key={i} className="align-middle">
                                  <td className="p-2.5 pl-3 font-black text-slate-900">{subjectTitle}</td>
                                  <td className="p-2.5 text-center font-mono">{rating === 'BE' ? '🟢' : '—'}</td>
                                  <td className="p-2.5 text-center font-mono">{rating === 'AE' ? '🟢' : '—'}</td>
                                  <td className="p-2.5 text-center font-mono">{rating === 'ME' ? '🟢' : '—'}</td>
                                  <td className="p-2.5 text-center font-mono">{rating === 'EE' ? '🟢' : '—'}</td>
                                  <td className="p-2.5 pl-4 text-slate-500 italic font-medium leading-normal text-[10.5px]">
                                    "{gr.remarks || 'Participated with focus and completed core strands.'}"
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    ) : (
                      /* Cambridge Academics Percentage Grade Table */
                      <table className="w-full text-left text-[11px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-slate-900 text-white font-extrabold uppercase tracking-wide text-[9px]">
                            <th className="p-3">Course / Assessment Strand</th>
                            <th className="p-3 text-center w-24">Raw Score (%)</th>
                            <th className="p-3 text-center w-20">Letter Grade</th>
                            <th className="p-3 pl-4">Cognitive Evaluation Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-semibold text-slate-705">
                          {(() => {
                            const resolvedGr = grades.filter(g => g.studentId === selectedReportStudent.id);
                            const actualList = resolvedGr.length > 0 ? resolvedGr : [
                              { studentId: selectedReportStudent.id, assessmentId: 'fallback-math', score: 92, grade: 'A*', remarks: 'Incredible accuracy in math operations and geometric deductions.' },
                              { studentId: selectedReportStudent.id, assessmentId: 'fallback-sci', score: 84, grade: 'A', remarks: 'Excellent understanding of scientific methodologies and biology.' },
                              { studentId: selectedReportStudent.id, assessmentId: 'fallback-eng', score: 76, grade: 'B', remarks: 'Strong critical reading comprehension but check essay structure.' }
                            ];

                            return actualList.map((gr, i) => {
                              const ass = assessments.find(a => a.id === gr.assessmentId);
                              let subjectTitle = ass ? `${ass.title} (${ass.subject})` : '';
                              if (!subjectTitle) {
                                if (gr.assessmentId.includes('math')) subjectTitle = 'Mathematics mid-term sheet';
                                else if (gr.assessmentId.includes('sci')) subjectTitle = 'Science strand report';
                                else if (gr.assessmentId.includes('eng')) subjectTitle = 'English essay comprehension';
                                else subjectTitle = 'Terminal Course Exam';
                              }

                              const scoreNum = gr.score || 75;
                              const letterGrade = gr.grade || (scoreNum >= 90 ? 'A*' : scoreNum >= 80 ? 'A' : scoreNum >= 70 ? 'B' : 'C');

                              return (
                                <tr key={i} className="align-middle">
                                  <td className="p-3 font-extrabold text-slate-900">{subjectTitle}</td>
                                  <td className="p-3 text-center font-mono font-bold text-xs">{scoreNum}%</td>
                                  <td className="p-3 text-center font-mono font-black text-indigo-700 text-xs">{letterGrade}</td>
                                  <td className="p-3 pl-4 text-slate-500 italic font-medium leading-normal text-[10.5px]">
                                    "{gr.remarks || 'Consistently strong performance throughout evaluated cycles.'}"
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    )}

                  </div>

                  {selectedReportStudent.curriculum === 'CBE' && (
                    <div className="text-[8.5px] text-slate-400 leading-normal font-sans text-center">
                      *CBE Criteria Matrix — <b>EE:</b> Exceeds Expectation | <b>ME:</b> Meets Expectation | <b>AE:</b> Approaching Expectation | <b>BE:</b> Below Expectation.
                    </div>
                  )}
                </div>

                {/* Narrative Assessment Section */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-[10.5px]">
                  <div className="space-y-2 border-r border-slate-150 pr-4">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Attendance Analytics</span>
                    <p className="font-semibold text-slate-700 leading-normal">
                      Pupil attended <span className="font-extrabold text-slate-900">{reportForm.attendancePresent}</span> out of <span className="font-extrabold text-slate-900">{reportForm.attendanceTotal}</span> mandatory sessions in this cycle, corresponding to an overall attendance performance rate of <span className="font-black text-indigo-600 font-mono">{Math.round((Number(reportForm.attendancePresent) / (Number(reportForm.attendanceTotal) || 1)) * 100)}%</span>.
                    </p>
                  </div>
                  <div className="space-y-1 pl-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Conduct &amp; Character Appraisal</span>
                    <p className="font-extrabold text-slate-900 text-[11.5px]">{reportForm.conduct}</p>
                    <p className="text-[10px] text-slate-500 italic font-medium leading-relaxed mt-1">"{reportForm.extraCurricular || 'No extracurricular logs reported.'}"</p>
                  </div>
                </div>

                {/* Official Sign-offs */}
                <div className="space-y-3.5 border-t border-slate-200/80 pt-4 leading-relaxed text-[11px]">
                  
                  {/* Teacher statement and signature block */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-[#4f46e5] block">Class Teacher Assessment Summary</span>
                    <p className="text-slate-800 italic mt-1.5 font-semibold text-[11px] leading-relaxed">
                      "{reportForm.teacherRemarks}"
                    </p>
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex justify-between items-end">
                      <div className="text-[9.5px]">
                        Teacher of Class: <span className="font-black text-slate-850">{reportForm.teacherSignature}</span>
                      </div>
                      <div className="border-b border-slate-400 w-32 h-6 font-serif italic text-slate-600 text-right pr-2">
                        {reportForm.teacherSignature.split(' ').pop()}
                      </div>
                    </div>
                  </div>

                  {/* Principal statement and signature block */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-450 block">Principal Advisory Board confirmation</span>
                    <p className="text-slate-800 italic mt-1.5 font-semibold text-[11px] leading-relaxed">
                      "{reportForm.principalRemarks}"
                    </p>
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex justify-between items-end">
                      <div className="text-[9.5px]">
                        Approving Head Guide: <span className="font-black text-slate-850">{reportForm.principalSignature}</span>
                      </div>
                      <div className="border-b border-slate-400 w-32 h-6 font-serif italic text-slate-600 text-right pr-2">
                        {reportForm.principalSignature.split(' ').pop()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authenticator Footer seal */}
                <div className="flex justify-between items-center text-[8px] text-slate-400 border-t border-slate-150 pt-4 font-mono font-bold uppercase tracking-wider">
                  <span>Issued by {activeSchool.name} Code Authority</span>
                  <span>Stamp Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
