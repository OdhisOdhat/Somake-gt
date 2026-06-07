import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Calendar, 
  Bell, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Check, 
  CheckCircle, 
  Inbox, 
  AlertCircle, 
  Filter,
  Megaphone,
  BookOpen,
  Info
} from 'lucide-react';
import { ExamSchedule, PortalNotification } from '../types';
import { CBE_SUBJECTS, CAMBRIDGE_SUBJECTS } from '../utils/theme';

export default function ExamsTab() {
  const {
    students,
    schools,
    activeSchoolId,
    userRole,
    userEmail,
    selectedStudentId,
    examSchedules,
    portalNotifications,
    handleCreateExamSchedule,
    handleMarkNotificationRead,
    showToast
  } = useAppContext();

  // Active sub-tab inside Exam Hub: 'schedules' or 'notifications'
  const [subTab, setSubTab] = useState<'schedules' | 'notifications'>('schedules');

  // Admin Exam Form states
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('all');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [venue, setVenue] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [gradeFilter, setGradeFilter] = useState('all');

  const currentSchool = schools.find(s => s.id === activeSchoolId);
  const isAuthorizedAdmin = userRole === 'super_admin' || userRole === 'teacher';

  // Get active school schedules
  const activeSchedules = (examSchedules || []).filter(s => s.schoolId === activeSchoolId);

  // Get active student matching for Parent/Student role matching notifications
  const matchedStudent = students.find(s => s.id === selectedStudentId);

  // Filter notifications for current user/role
  const filteredNotifications = (portalNotifications || []).filter(notif => {
    // Must be same school
    if (notif.schoolId !== activeSchoolId) return false;

    if (userRole === 'super_admin' || userRole === 'teacher') {
      // Teachers/Admins can see everything for audit logs
      return true;
    }

    // Parents/students can see notifications matching their ID, or matching 'all'
    if (notif.roleTag === 'all') return true;

    if (userRole === 'parent_student') {
      // Show if targeting parent/student and associated student is currently selected
      const isTargetedToSelectedStudent = notif.studentId === selectedStudentId;
      if (isTargetedToSelectedStudent) {
        // Find if user is matching parentEmail or student (both map to parent_student role tag)
        return true;
      }
    }

    return false;
  }).reverse(); // Latest notifications first

  // Count unread notifications for current view
  const unreadCount = filteredNotifications.filter(
    n => !n.readBy?.includes(userEmail)
  ).length;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast('Subject name is required', 'error');
      return;
    }
    if (!examDate) {
      showToast('Exam date is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await handleCreateExamSchedule({
        schoolId: activeSchoolId,
        gradeLevel,
        subject,
        examDate,
        examTime,
        durationMinutes,
        venue,
        instructions
      });
      // Reset form
      setSubject('');
      setExamDate('');
      setInstructions('');
      setVenue('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReadClick = async (notifId: string) => {
    await handleMarkNotificationRead(notifId);
    showToast('Alert marked as read', 'success');
  };

  // List of unique grades currently in school for filter dropdowns
  const availableGrades = Array.from(
    new Set(students.filter(s => s.schoolId === activeSchoolId).map(s => s.gradeLevel))
  ).filter(Boolean);

  return (
    <div id="exams-hub-container" className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-emerald-600" />
            Exams & Alerts Hub
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentSchool ? `${currentSchool.name} — Interactive schedules and automated notifications.` : 'Schedule exam assessments.'}
          </p>
        </div>
        
        {/* Navigation pills */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 self-start md:self-center">
          <button
            id="subtab-schedules-btn"
            onClick={() => setSubTab('schedules')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              subTab === 'schedules'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Exam Calendars
          </button>
          <button
            id="subtab-notifications-btn"
            onClick={() => setSubTab('notifications')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all relative flex items-center gap-2 ${
              subTab === 'notifications'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            Portal Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {subTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Scheduler Panel */}
          <div className={`col-span-1 border border-gray-200 rounded-xl bg-white p-6 shadow-sm self-start ${
            !isAuthorizedAdmin ? 'bg-gray-50 border-dashed opacity-85' : ''
          }`}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Set New Exam Date
            </h3>

            {!isAuthorizedAdmin ? (
              <div id="no-auth-scheduler-card" className="space-y-4">
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-sm text-orange-700 flex items-start gap-2.5">
                  <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Access Restricted</span>
                    Only school instructors, registrars or headmasters are authorized to configure official examinations.
                  </div>
                </div>
                <div className="text-xs text-gray-400 p-2 border-t border-gray-200">
                  Logged in as: <span className="font-medium text-gray-600">{userEmail}</span> ({userRole})
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Subject Selection</label>
                    <select
                      value={CBE_SUBJECTS.includes(subject) || CAMBRIDGE_SUBJECTS.includes(subject) ? subject : (subject ? 'custom_subject' : '')}
                      onChange={e => {
                        if (e.target.value !== 'custom_subject') {
                          setSubject(e.target.value);
                        }
                      }}
                      className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-gray-900 focus:ring-emerald-500 outline-none font-semibold cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Subject --</option>
                      {( (currentSchool?.curriculum ?? 'CBE').includes('CBE') ? CBE_SUBJECTS : CAMBRIDGE_SUBJECTS ).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="custom_subject">✎ Write Custom Subject...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Custom Subject / Paper Designation</label>
                    <input
                      id="exam-subject-input"
                      type="text"
                      required
                      placeholder="Type custom subject or paper (e.g. Paper 1 Theory)"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Target Grade</label>
                    <select
                      id="exam-grade-input"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-gray-900 focus:ring-emerald-500 outline-none"
                    >
                      <option value="all">All Grades</option>
                      {availableGrades.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Duration (Min)</label>
                    <input
                      id="exam-duration-input"
                      type="number"
                      required
                      min="15"
                      max="480"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Exam Date</label>
                    <input
                      id="exam-date-input"
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Start Time</label>
                    <input
                      id="exam-time-input"
                      type="text"
                      required
                      placeholder="e.g. 09:00 AM"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Exam Venue / Hall</label>
                  <input
                    id="exam-venue-input"
                    type="text"
                    required
                    placeholder="e.g. Main Laboratory Hall 1"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Special instructions</label>
                  <textarea
                    id="exam-instructions-input"
                    rows={3}
                    placeholder="Describe specific equipment, formulas or materials allowed..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-[11px] text-emerald-800 flex items-start gap-2">
                  <Megaphone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Auto-Trigger Alert</strong>: Submitting an exam date immediately posts custom alerts on the respective parent and student portal feeds.
                  </span>
                </div>

                <button
                  id="submit-schedule-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Dispersing Notifications...'
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Set Examination
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Exam Schedules List */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <span className="font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Active Calendars ({activeSchedules.length})
              </span>
              
              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <select
                  id="grade-filter"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-md p-1.5 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">Filter: All Grades</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeSchedules.length === 0 ? (
              <div id="no-exams-placeholder" className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-white">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-gray-700 mb-1">No exam scheduled yet</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Examinations for this school year haven't been scheduled. Create one on the left panel to instantly notify the student body!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSchedules
                  .filter(s => gradeFilter === 'all' || s.gradeLevel === 'all' || s.gradeLevel === gradeFilter)
                  .map((schedule) => {
                    const matchesUserGrade = 
                      userRole === 'parent_student' && 
                      matchedStudent && 
                      (schedule.gradeLevel === 'all' || schedule.gradeLevel === matchedStudent.gradeLevel);

                    return (
                      <div
                        key={schedule.id}
                        id={`schedule-card-${schedule.id}`}
                        className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                          matchesUserGrade 
                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="p-4">
                          {/* Subject Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-1.5">
                                {schedule.gradeLevel === 'all' ? 'All Classes' : schedule.gradeLevel}
                              </span>
                              <h4 className="font-bold text-gray-900 leading-snug">{schedule.subject}</h4>
                            </div>
                            
                            {matchesUserGrade && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                Your Exam
                              </span>
                            )}
                          </div>

                          {/* Stats info */}
                          <div className="mt-4 space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium text-gray-800">{schedule.examDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span>{schedule.examTime} ({schedule.durationMinutes} minutes)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium text-gray-800">{schedule.venue || 'TBD'}</span>
                            </div>
                          </div>

                          {/* Instructions */}
                          {schedule.instructions && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Instructions:</span>
                              <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2 leading-relaxed">
                                "{schedule.instructions}"
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex items-center justify-between text-[11px] text-gray-400">
                          <span>Set by School Admin</span>
                          <span>{new Date(schedule.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'notifications' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm text-emerald-900 text-xs">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {userRole === 'parent_student' 
                  ? `Showing notifications for ${matchedStudent ? matchedStudent.name : 'Your Account'} (${matchedStudent?.gradeLevel || 'Global'})`
                  : 'Teacher Audit Mode: Listing all triggered student/parent notifications for academic transparency.'
                }
              </span>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div id="no-notifs-placeholder" className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-white">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-bounce" />
              <h4 className="text-sm font-semibold text-gray-700 mb-1">No alerts found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No active exam schedules or portal updates have been directed to your dashboard yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const isRead = notif.readBy?.includes(userEmail);
                
                return (
                  <div
                    key={notif.id}
                    id={`notification-item-${notif.id}`}
                    className={`border rounded-xl p-4 shadow-sm bg-white transition-all flex items-start gap-3.5 ${
                      !isRead 
                        ? 'border-emerald-500/40 bg-emerald-50/5 ring-1 ring-emerald-400/10' 
                        : 'border-gray-200 opacity-90'
                    }`}
                  >
                    <div className="mt-1">
                      {!isRead ? (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      ) : (
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold text-gray-900 ${!isRead ? 'text-gray-900 font-extrabold' : 'text-gray-700'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  •  {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="pt-2 flex items-center justify-between gap-2 text-[10px] text-gray-400">
                        <div className="flex items-center gap-1.5 uppercase font-semibold tracking-wider">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                            Target: {notif.roleTag === 'all' ? 'All Portal Users' : notif.roleTag}
                          </span>
                          {notif.studentId && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex items-center gap-1">
                              <User className="h-2.5 w-2.5" />
                              ID: {notif.studentId}
                            </span>
                          )}
                        </div>

                        {/* Read triggers */}
                        {userRole === 'parent_student' && !isRead && (
                          <button
                            id={`mark-read-btn-${notif.id}`}
                            onClick={() => handleFormSubmit && handleReadClick(notif.id)}
                            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded transition-all shadow-sm flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Mark as Read
                          </button>
                        )}

                        {isAuthorizedAdmin && (
                          <div className="text-[10px] text-gray-400 italic">
                            Read by:{' '}
                            <span className="font-semibold text-gray-500">
                              {notif.readBy && notif.readBy.length > 0 
                                ? notif.readBy.join(', ') 
                                : 'No eyes yet'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
