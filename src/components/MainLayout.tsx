import React from 'react';
import { 
  X, 
  Lock, 
  AlertCircle, 
  Check 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Import our cohesive sub-divided modules
import SkoolaSidebar from './SkoolaSidebar';
import DashboardTab from './DashboardTab';
import SchoolsTab from './SchoolsTab';
import StudentsTab from './StudentsTab';
import StaffTab from './StaffTab';
import ClassesTab from './ClassesTab';
import AttendanceTab from './AttendanceTab';
import FeesTab from './FeesTab';

export default function MainLayout() {
  const {
    schools, staff, schoolClasses, students, feeRecords,
    assessments, grades, attendance, lmsMaterials, lmsSubmissions, dormitories, busRoutes,
    isSignedOut, setIsSignedOut,
    signInPassword, setSignInPassword,
    userEmail,
    activeSchoolId, setActiveSchoolId,
    activeTab, setActiveTab,
    showSchoolModal, setShowSchoolModal,
    showStudentModal, setShowStudentModal,
    showStaffModal, setShowStaffModal,
    showClassModal, setShowClassModal,
    showPaymentModal, setShowPaymentModal,
    paymentStudentId, setPaymentStudentId,
    schoolForm, setSchoolForm,
    studentForm, setStudentForm,
    staffForm, setStaffForm,
    classForm, setClassForm,
    paymentForm, setPaymentForm,
    toast, showToast,
    handleCreateSchool,
    handleEnrollStudent,
    handleCreateStaff,
    handleCreateClass,
    handleGradeStudentValue,
    handleMarkAttendanceCell,
    handleAddLmsMaterial,
    handleReviewLmsSubmission,
    handleTriggerBusStop,
    handleAddDormWelfareLog,
    handleRecordPaymentSubmit,
    handleDeleteStudent,
    handleDeleteStaff,
    handleDeleteSchool,
    handleGenerateAiComment
  } = useAppContext();

  // If Session Admin Locks are active, show secure lock-gate
  if (isSignedOut) {
    return (
      <div id="skoola-lockscreen" className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-850 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-5 text-center">
          <div className="mx-auto bg-indigo-50 text-indigo-600 p-4 rounded-full w-16 h-16 flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Skoola Terminal</h2>
            <p className="text-xs text-slate-500 mt-0.5">Session locked for: {userEmail}</p>
          </div>

          <div className="space-y-3.5">
            <input 
              type="password"
              placeholder="Enter password (any to unlock)..."
              value={signInPassword}
              onChange={e => setSignInPassword(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center font-bold"
            />
            <button
              onClick={() => {
                setIsSignedOut(false);
                setSignInPassword('');
                showToast('Welcome back, School Admin!');
              }}
              className="w-full bg-indigo-600 hover:bg-slate-905 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
            >
              Sign back in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="skoola-fullstack-app" className="flex h-screen w-screen overflow-hidden bg-slate-50/50 text-slate-800 antialiased font-sans">
      
      {/* Toast Notification Container */}
      {toast && (
        <div 
          id="toast-notification"
          className={`fixed top-5 right-5 z-40 flex items-center gap-3 p-4 rounded-xl shadow-xl border transition-all duration-300 max-w-sm font-sans ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
          <div className="text-xs font-bold leading-none">{toast.message}</div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <SkoolaSidebar 
        schools={schools}
        activeSchoolId={activeSchoolId}
        setActiveSchoolId={setActiveSchoolId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSchoolClick={() => setShowSchoolModal(true)}
        userEmail={userEmail}
        onSignOut={() => {
          setIsSignedOut(true);
          showToast('Session locks secured successfully!', 'info');
        }}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-y-scroll overflow-x-hidden pt-6">
        
        {/* Tab content area */}
        <div className="flex-1 px-6 md:px-8 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              schools={schools}
              activeSchoolId={activeSchoolId}
              students={students}
              staff={staff}
              schoolClasses={schoolClasses}
              feeRecords={feeRecords}
              grades={grades}
              attendance={attendance}
              onNewSchoolClick={() => setShowSchoolModal(true)}
            />
          )}

          {activeTab === 'schools' && (
            <SchoolsTab 
              schools={schools}
              activeSchoolId={activeSchoolId}
              setActiveSchoolId={setActiveSchoolId}
              setActiveTab={setActiveTab}
              onNewSchoolClick={() => setShowSchoolModal(true)}
              onDeleteSchool={handleDeleteSchool}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              students={students}
              assessments={assessments}
              grades={grades}
              onAddNewStudent={() => setShowStudentModal(true)}
              onGradeStudent={handleGradeStudentValue}
              onDeleteStudent={handleDeleteStudent}
              onGenerateAiComment={handleGenerateAiComment}
            />
          )}

          {activeTab === 'staff' && (
            <StaffTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              staff={staff}
              onAddStaff={() => setShowStaffModal(true)}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              schoolClasses={schoolClasses}
              staff={staff}
              students={students}
              lmsMaterials={lmsMaterials}
              lmsSubmissions={lmsSubmissions}
              busRoutes={busRoutes}
              dormitories={dormitories}
              onAddClass={() => setShowClassModal(true)}
              onAddLmsMaterial={handleAddLmsMaterial}
              onReviewLmsSubmission={handleReviewLmsSubmission}
              onTriggerBusStop={handleTriggerBusStop}
              onAddDormWelfareLog={handleAddDormWelfareLog}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              students={students}
              attendance={attendance}
              onMarkAttendance={handleMarkAttendanceCell}
            />
          )}

          {activeTab === 'fees' && (
            <FeesTab 
              activeSchoolId={activeSchoolId}
              schools={schools}
              students={students}
              feeRecords={feeRecords}
              onRecordPaymentClick={(studId) => {
                setPaymentStudentId(studId);
                setShowPaymentModal(true);
              }}
            />
          )}
        </div>

      </main>

      {/* ============================================== */}
      {/* OVERLAY MODAL FORMS POPUPS */}
      {/* ============================================== */}

      {/* Modal 1: Create School */}
      {showSchoolModal && (
        <div id="modal-create-school" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl transition-all flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Create school</h3>
              <button onClick={() => setShowSchoolModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="p-5 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Hillcrest Primary School"
                    value={schoolForm.name}
                    onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Code *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. HIL-005"
                    value={schoolForm.code}
                    onChange={e => setSchoolForm({ ...schoolForm, code: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Curriculum *</label>
                  <select
                    value={schoolForm.curriculum}
                    onChange={e => setSchoolForm({ ...schoolForm, curriculum: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  >
                    <option value="CBE (Kenya)">CBE (Kenya)</option>
                    <option value="Cambridge (International)">Cambridge (International)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Phone</label>
                  <input 
                    type="text"
                    placeholder="e.g. 0711000999"
                    value={schoolForm.phone}
                    onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Email</label>
                  <input 
                    type="email"
                    placeholder="e.g. registrar@hillcrest.edu"
                    value={schoolForm.email}
                    onChange={e => setSchoolForm({ ...schoolForm, email: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Address</label>
                  <input 
                    type="text"
                    placeholder="e.g. Ngong Road, Nairobi"
                    value={schoolForm.address}
                    onChange={e => setSchoolForm({ ...schoolForm, address: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4.5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Enroll Student */}
      {showStudentModal && (
        <div id="modal-enroll-student" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Register scholar profile</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="p-5 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Jabari Omwamba"
                    value={studentForm.name}
                    onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Gender *</label>
                  <select
                    value={studentForm.gender}
                    onChange={e => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Grade / Year level Designation *</label>
                  <select
                    value={studentForm.gradeLevel}
                    onChange={e => setStudentForm({ ...studentForm, gradeLevel: e.target.value })}
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
                    value={studentForm.boardingStatus}
                    onChange={e => setStudentForm({ ...studentForm, boardingStatus: e.target.value as any })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Day">Day Commuter Scholar</option>
                    <option value="Boarder">Full Boarding Resident</option>
                  </select>
                </div>

                {studentForm.boardingStatus === 'Boarder' ? (
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Dormitory allocation</label>
                    <select
                      value={studentForm.dormitoryId}
                      onChange={e => setStudentForm({ ...studentForm, dormitoryId: e.target.value })}
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
                      value={studentForm.busRouteId}
                      onChange={e => setStudentForm({ ...studentForm, busRouteId: e.target.value })}
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
                    value={studentForm.parentEmail}
                    onChange={e => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Guardian Mobile phone</label>
                  <input 
                    type="text"
                    placeholder="e.g. 0712345678"
                    value={studentForm.parentPhone}
                    onChange={e => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4.5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm"
                >
                  Enroll Scholar profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Staff */}
      {showStaffModal && (
        <div id="modal-add-staff" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Enlist staff member</h3>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Kiprop Kipruto"
                  value={staffForm.name}
                  onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Role Certification *</label>
                <select
                  value={staffForm.role}
                  onChange={e => setStaffForm({ ...staffForm, role: e.target.value as any })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Head Teacher">Head Principal</option>
                  <option value="Registrar">Registrar Administrator</option>
                  <option value="Bus Driver">Bus Driver Shuttle</option>
                  <option value="Warden">Warden Officer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Email address</label>
                <input 
                  type="email"
                  placeholder="staff@skoola.co.ke"
                  value={staffForm.email}
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Mobile Phone</label>
                <input 
                  type="text"
                  placeholder="e.g. 0711999888"
                  value={staffForm.phone}
                  onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black"
                >
                  Enroll staffing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add Class */}
      {showClassModal && (
        <div id="modal-add-class" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Establish Classroom</h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Class Name designation *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Grade 4 West / Year 8 Alpha"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Assigned Superintending Teacher</label>
                <select
                  value={classForm.teacherId}
                  onChange={e => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">-- No supervisor --</option>
                  {staff.filter(st => st.schoolId === activeSchoolId).map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black"
                >
                  Establish Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Record Fees Payment */}
      {showPaymentModal && paymentStudentId && (
        <div id="modal-record-payment" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111]">Log payment receipt</h3>
              <button 
                onClick={() => {
                  setPaymentStudentId(null);
                  setShowPaymentModal(false);
                }} 
                className="text-slate-400 hover:text-slate-650"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Amount Paid (KES) *</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Transaction Reference / Receipt ID</label>
                <input 
                  type="text"
                  placeholder="e.g. MPESA-TX8890"
                  value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Date of Payment</label>
                <input 
                  type="date"
                  value={paymentForm.date}
                  onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStudentId(null);
                    setShowPaymentModal(false);
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black"
                >
                  Log Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
