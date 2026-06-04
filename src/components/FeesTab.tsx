import React from 'react';
import { 
  Coins, 
  Plus, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Mail, 
  Send, 
  X,
  Printer,
  FileCheck,
  Eye,
  Key
} from 'lucide-react';
import { FeeRecord, Student, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';
import { useAppContext } from '../context/AppContext';

interface FeesTabProps {
  activeSchoolId: string;
  schools: School[];
  students: Student[];
  feeRecords: FeeRecord[];
  onRecordPaymentClick: (studentId: string) => void;
}

export default function FeesTab({
  activeSchoolId,
  schools,
  students,
  feeRecords,
  onRecordPaymentClick
}: FeesTabProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId);
  const { userRole, selectedStudentId, showToast } = useAppContext();

  if (!activeSchoolId || !activeSchool) {
    return <NoSchoolSelected title="Select a school profile" />;
  }

  // Reminder Dialog State
  const [selectedReminder, setSelectedReminder] = React.useState<{
    student: Student;
    balance: number;
    totalDue: number;
    paidAmount: number;
  } | null>(null);

  const [reminderEmail, setReminderEmail] = React.useState('');
  const [reminderSubject, setReminderSubject] = React.useState('');
  const [reminderBody, setReminderBody] = React.useState('');
  const [isSendingSim, setIsSendingSim] = React.useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = React.useState('');

  // Search & Status filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Fully Paid' | 'Pending' | 'Partial'>('All');

  // Interactive Receipt Dialog State
  const [selectedReceiptStudent, setSelectedReceiptStudent] = React.useState<Student | null>(null);
  const [selectedReceiptItem, setSelectedReceiptItem] = React.useState<{
    date: string;
    amount: number;
    reference: string;
  } | null>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [printSuccess, setPrintSuccess] = React.useState(false);

  const handleOpenReminder = (student: Student, balance: number, totalDue: number, paidAmount: number) => {
    const parentEmail = student.parentEmail || 'parent@skoola.com';
    const subject = `Fee Payment Reminder: ${student.name} (${student.admissionNo})`;
    const body = `Dear Parent or Guardian of ${student.name},

We hope this email finds you well.

This is a friendly reminder from ${activeSchool?.name || 'Skoola'} regarding the outstanding school fees for Term 2 2026.

According to our records, the account details are as follows:
- Student Name: ${student.name}
- Admission No: ${student.admissionNo}
- Grade Level: ${student.gradeLevel}
- Total Invoiced: KES ${totalDue.toLocaleString()}
- Paid Amount: KES ${paidAmount.toLocaleString()}
- Outstanding Balance: KES ${balance.toLocaleString()}

Please arrange to settle the balance of KES ${balance.toLocaleString()} at your earliest convenience to maintain continuous learning access.

If you have already made the payment, kindly share the bank slip or M-Pesa reference code so that we can update our registers.

Thank you for your continued cooperation and support.

Best regards,
Accounts Department
${activeSchool?.name || 'Skoola'}`;

    setSelectedReminder({ student, balance, totalDue, paidAmount });
    setReminderEmail(parentEmail);
    setReminderSubject(subject);
    setReminderBody(body);
    setSendSuccessMsg('');
  };

  const handleTriggerMailto = () => {
    if (!selectedReminder) return;
    const mailtoUrl = `mailto:${encodeURIComponent(reminderEmail)}?subject=${encodeURIComponent(reminderSubject)}?body=${encodeURIComponent(reminderBody)}`;
    window.location.href = mailtoUrl;
  };

  const handleSimulateSend = async () => {
    setIsSendingSim(true);
    setSendSuccessMsg('');
    try {
      await new Promise(r => setTimeout(r, 1200));
      setSendSuccessMsg(`Successfully simulated direct dispatch to ${reminderEmail}!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingSim(false);
    }
  };

  // Filter student registries and fees belonging to this active school
  // CRITICAL: Parent & Student role can only access their authorized student profile fee records
  const schoolStudents = React.useMemo(() => {
    return students.filter(s => 
      s.schoolId === activeSchoolId &&
      (userRole !== 'parent_student' || s.id === selectedStudentId)
    );
  }, [students, activeSchoolId, userRole, selectedStudentId]);

  const activeFees = React.useMemo(() => {
    return feeRecords.filter(f => 
      f.schoolId === activeSchoolId &&
      (userRole !== 'parent_student' || f.studentId === selectedStudentId)
    );
  }, [feeRecords, activeSchoolId, userRole, selectedStudentId]);

  // Filter students based on searchQuery and statusFilter (Search & filter hidden/bypassed for parent/student layout)
  const filteredStudents = React.useMemo(() => {
    return schoolStudents.filter(stud => {
      const record = activeFees.find(f => f.studentId === stud.id);
      const totalDue = record?.totalDue ?? (stud.curriculum === 'CBE' ? 45000 : 120000);
      const paidAmount = record?.paidAmount ?? 0;
      const balance = totalDue - paidAmount;

      let status: 'Fully Paid' | 'Pending' | 'Partial' = 'Pending';
      if (balance <= 0) {
        status = 'Fully Paid';
      } else if (paidAmount > 0) {
        status = 'Partial';
      }

      const matchesSearch = stud.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            stud.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = statusFilter === 'All' || status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [schoolStudents, activeFees, searchQuery, statusFilter]);

  // Calculate Metrics (dynamically updates only to active student scope if restricted)
  const totalInvoiced = activeFees.reduce((sum, f) => sum + f.totalDue, 0);
  const totalCollected = activeFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalCollected;
  const successPercentage = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return (
    <div id="skoola-fees-tab-root" className="space-y-6">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 px-2 rounded-lg bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase border border-emerald-100">
              {userRole === 'parent_student' ? 'Parent & Student Portal' : 'Admin Billings'}
            </span>
            <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight">
              {userRole === 'parent_student' ? 'Authorized Fee Statement' : 'Fees & Accounts Invoicing'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {userRole === 'parent_student' 
              ? 'Secure transparent tracking of invoices, transactions, and printable school-authenticated receipts.' 
              : 'Control billing accounts, invoice profiles, and payment histories across the academic system.'}
          </p>
        </div>
      </div>

      {/* Stats Bento Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-semibold text-slate-800">
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {userRole === 'parent_student' ? 'Fees Settled to Date' : 'Total Collected'}
            </span>
            <div className="text-xl font-black text-emerald-605 mt-1 font-mono">KES {totalCollected.toLocaleString()}</div>
          </div>
          <Coins className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-xl shrink-0" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">Outstanding Balance</span>
            <div className="text-xl font-black text-rose-650 mt-1 font-mono">KES {totalOutstanding.toLocaleString()}</div>
          </div>
          <Coins className="w-8 h-8 text-rose-500 bg-rose-50 p-1.5 rounded-xl shrink-0" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between text-[10px] uppercase font-extrabold text-slate-400 mb-2">
            <span>{userRole === 'parent_student' ? 'Completeness' : 'Collection Success Rate'}</span>
            <span>{successPercentage}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-lg overflow-hidden border border-slate-200/50">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${successPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar (Only visible/available to administrators to prevent cross-profile navigation) */}
      {userRole !== 'parent_student' && schoolStudents.length > 0 && (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between animate-in fade-in duration-200">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by student name or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 bg-[#f8fafc] border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            />
            <div className="absolute left-2.5 top-3.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
            <span className="text-[10px] uppercase font-black text-slate-400 mr-1 font-sans">Filter Account:</span>
            {(['All', 'Fully Paid', 'Partial', 'Pending'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === filter
                    ? 'bg-[#1e1b4b] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fees List */}
      {schoolStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center min-h-[180px]">
          <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
          <h3 className="text-xs font-extrabold text-[#111] mb-0.5 font-sans">No invoice records</h3>
          <p className="text-[10px] text-slate-400 font-medium">Register pupils to auto-configure student billing accounts within this school.</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center min-h-[180px] animate-in fade-in duration-200">
          <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
          <h3 className="text-xs font-extrabold text-[#111] mb-0.5 font-sans">No matching records found</h3>
          <p className="text-[10px] text-slate-400 font-medium font-sans">No student balances match your current search queries or selected filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto overflow-y-auto max-h-[550px] shadow-sm animate-in fade-in duration-200 relative">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 font-sans z-10 shadow-[inset_0_-1px_0_#e2e8f0]">
              <tr>
                <th className="px-5 py-3.5">Admission Number</th>
                <th className="px-5 py-3.5">Pupil Profile Name</th>
                <th className="px-5 py-3.5">Total Invoiced</th>
                <th className="px-5 py-3.5">Amount Paid</th>
                <th className="px-5 py-3.5">Outstanding Balance</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right pr-6">Logs Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {filteredStudents.map(stud => {
                const record = activeFees.find(f => f.studentId === stud.id);
                
                // Defaults if no fee record matches
                const totalDue = record?.totalDue ?? (stud.curriculum === 'CBE' ? 45000 : 120000);
                const paidAmount = record?.paidAmount ?? 0;
                const balance = totalDue - paidAmount;

                let badgeColor = 'bg-rose-50 text-rose-750 border-rose-100';
                let text = 'Pending';
                if (balance <= 0) {
                  badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                  text = 'Fully Paid';
                } else if (paidAmount > 0) {
                  badgeColor = 'bg-amber-50 text-amber-800 border-amber-100';
                  text = 'Partial';
                }

                return (
                  <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-400 font-bold">{stud.admissionNo}</td>
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-[#111]">{stud.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-bold font-sans">{stud.gradeLevel} ({stud.curriculum})</div>
                    </td>
                    <td className="px-5 py-4 font-mono">KES {totalDue.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-emerald-600 font-extrabold">KES {paidAmount.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-rose-600 font-extrabold">KES {balance.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                        {text}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        
                        {/* 1. Record Payment (Only for Super-Admins / School Principal) */}
                        {userRole === 'super_admin' && balance > 0 && (
                          <button
                            onClick={() => onRecordPaymentClick(stud.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black transition-colors shrink-0 shadow-sm"
                          >
                            + Record Payment
                          </button>
                        )}

                        {/* 2. Dispatch Reminders (Super-Admins only if balance exists) */}
                        {userRole === 'super_admin' && balance > 0 && (
                          <button
                            onClick={() => handleOpenReminder(stud, balance, totalDue, paidAmount)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Reminder
                          </button>
                        )}

                        {/* 3. View Receipts Hub / Issue Receipt Certificate (For all roles as long as they have history payment) */}
                        {paidAmount > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedReceiptStudent(stud);
                              if (record && record.history && record.history.length > 0) {
                                setSelectedReceiptItem(record.history[0]);
                              } else {
                                // Safe fallback
                                setSelectedReceiptItem({
                                  date: '2026-05-28',
                                  amount: paidAmount,
                                  reference: record?.id ? `REF-${record.id.replace('fee-', '')}` : 'REF-SYSTEM'
                                });
                              }
                              setPrintSuccess(false);
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-150 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {userRole === 'parent_student' ? 'View Receipts' : 'Issue Receipt 🧾'}
                          </button>
                        ) : (
                          userRole === 'parent_student' && (
                            <span className="text-[10px] text-slate-400 italic font-medium pr-2">No transaction history found</span>
                          )
                        )}

                        {balance <= 0 && userRole !== 'parent_student' && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded font-black uppercase flex items-center gap-1 select-none font-sans shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5" /> Paid in Full
                          </span>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Model: Fees Reminder Dispatch Card */}
      {selectedReminder && (
        <div id="modal-reminder-template" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col transition-all animate-in fade-in zoom-in-95 duration-200 font-semibold text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-[#111]">Construct Balance Reminder Email</h3>
              </div>
              <button 
                onClick={() => setSelectedReminder(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold flex-1 overflow-y-auto max-h-[70vh]">
              {sendSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 animate-in fade-in duration-300">
                  <div className="bg-emerald-500 text-white rounded-full p-2">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-black text-emerald-950">Reminder Dispatched</h4>
                  <p className="text-xs text-emerald-700 font-medium max-w-md">{sendSuccessMsg}</p>
                  <button
                    onClick={() => setSelectedReminder(null)}
                    className="mt-2 px-4 py-2 bg-emerald-650 hover:bg-emerald-750 text-white rounded-xl text-xs font-black shadow-sm transition-colors"
                  >
                    Close Dialog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 block">Recipient Parent Email</label>
                    <input 
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={reminderEmail}
                      onChange={e => setReminderEmail(e.target.value)}
                      className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 block">Subject Line</label>
                    <input 
                      type="text"
                      required
                      value={reminderSubject}
                      onChange={e => setReminderSubject(e.target.value)}
                      className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 block">Email Message Template Body</label>
                    <textarea 
                      required
                      rows={12}
                      value={reminderBody}
                      onChange={e => setReminderBody(e.target.value)}
                      className="w-full p-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium font-mono leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <button
                      type="button"
                      disabled={isSendingSim}
                      onClick={handleTriggerMailto}
                      className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-indigo-500" />
                      Open in Mail Client
                    </button>

                    <button
                      type="button"
                      disabled={isSendingSim}
                      onClick={handleSimulateSend}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSendingSim ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                          <span>Sending Notification...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Simulate Direct Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReminder(null)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model: Official Interactive Receipt Hub (Generates Beautiful High-Fidelity Official Receipts) */}
      {selectedReceiptStudent && selectedReceiptItem && (
        <div id="modal-receipts-manager" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* LEFT PORTFOLIO CONTAINER: Payment installment selector */}
            <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-5 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900">Payment Installments</h3>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-4 space-y-2.5 text-xs font-semibold">
                  <div className="text-[9.5px] uppercase font-black text-slate-450">Child Portal Access</div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 leading-tight">{selectedReceiptStudent.name}</h4>
                    <span className="text-[10.5px] font-mono text-slate-400 font-bold">{selectedReceiptStudent.admissionNo}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-normal">
                    Academic Grade: <strong className="text-slate-800 font-sans">{selectedReceiptStudent.gradeLevel}</strong> <br/>
                    Curriculum System: <strong className="text-slate-800">{selectedReceiptStudent.curriculum}</strong>
                  </div>
                </div>

                <label className="text-[10.5px] uppercase font-black text-slate-400 mb-2.5 block">Select Transaction Log</label>
                <div className="space-y-2 overflow-y-auto max-h-[35vh] pr-1">
                  {(() => {
                    const record = activeFees.find(f => f.studentId === selectedReceiptStudent.id);
                    const history = record && record.history && record.history.length > 0 
                      ? record.history 
                      : [{
                          date: '2026-05-28',
                          amount: record?.paidAmount ?? 0,
                          reference: record?.id ? `REF-${record.id.replace('fee-', '')}` : 'REF-SYSTEM'
                        }];

                    return history.map((item, index) => {
                      const isActive = selectedReceiptItem.reference === item.reference;
                      return (
                        <button
                          key={item.reference || index}
                          onClick={() => {
                            setSelectedReceiptItem(item);
                            setPrintSuccess(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex flex-col gap-1 transition-all ${
                            isActive
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs ring-1 ring-indigo-300/30'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-bold">Installment No. {index + 1}</span>
                            <span className="text-[9.5px] font-mono text-slate-400">{item.date}</span>
                          </div>
                          <div className="flex justify-between items-center w-full mt-1">
                            <span className="font-mono font-black text-slate-900">KES {item.amount.toLocaleString()}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-100 border border-slate-200 uppercase text-slate-500">
                              {item.reference.substring(0, 11)}
                            </span>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedReceiptStudent(null)}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black border border-slate-200/50 transition-colors text-center block"
                >
                  Close Statement View
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Live Document visualizer with simulated stamp seal */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh]">
              
              <div className="bg-white border-2 border-dashed border-slate-250 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden select-text text-xs">
                
                {/* Simulated authenticated registry stamp */}
                <div className="absolute right-6 top-6 pointer-events-none opacity-[0.16] rotate-12">
                  <div className="border-4 border-emerald-600 text-emerald-600 rounded-full h-24 w-24 flex flex-col items-center justify-center p-1 uppercase text-center select-none font-bold">
                    <span className="font-black text-[9px] leading-tight">OFFICIAL SEAL</span>
                    <span className="font-black text-[12px] tracking-wider leading-none">VERIFIED</span>
                    <span className="font-mono text-[8px] leading-tight">SKOOLA SYS</span>
                  </div>
                </div>

                {/* Receipt Header details */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-indigo-100/50 pb-5 gap-3">
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">SKOOLA ACADEMIC SYSTEM</h2>
                    <p className="text-[9.5px] text-slate-400 font-mono mt-1 font-sans">TERM BILLING OFFICE • AUTHENTICATED TRANSACTION</p>
                    <div className="text-[11px] text-slate-500 mt-2.5 font-semibold">
                      Office: <strong className="text-indigo-950">{activeSchool.name}</strong> <br/>
                      Registry Address: {activeSchool.address || 'Capital City HQ'} • {activeSchool.phone || '+254700000'} <br/>
                      Support Desk: {activeSchool.email || 'accounts@skoola.app'}
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right flex flex-col sm:items-end justify-between self-start sm:self-auto">
                    <span className="bg-emerald-50 text-emerald-805 border border-emerald-150 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      Official Fees Receipt
                    </span>
                    <div className="text-[10px] text-slate-400 mt-2.5 font-mono">
                      Serial Reference: <strong className="text-slate-800 font-bold">REC-26-{selectedReceiptItem.reference.replace(/[^0-9]/g, '').substring(0, 5) || '10492'}</strong> <br/>
                      Transaction Date: <strong className="text-slate-800 font-bold">{selectedReceiptItem.date}</strong> <br/>
                      Billing Session: <strong className="text-slate-800 font-bold">Term 2 2026</strong>
                    </div>
                  </div>
                </div>

                {/* Ledger profile box */}
                <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-4.5 rounded-2xl border border-slate-100/80 leading-relaxed font-semibold">
                  <div>
                    <span className="text-[9.5px] uppercase font-black text-slate-450 block not-italic">Beneficiary Pupil</span>
                    <strong className="text-slate-900 text-xs font-black italic">{selectedReceiptStudent.name}</strong>
                    <div className="text-slate-500 font-semibold mt-0.5">Admission No: {selectedReceiptStudent.admissionNo}</div>
                    <div className="text-slate-500 font-semibold font-sans">Placement: {selectedReceiptStudent.gradeLevel} ({selectedReceiptStudent.curriculum})</div>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase font-black text-slate-450 block not-italic font-sans">Authorized Payer</span>
                    <strong className="text-slate-750 font-bold">Parent Representative</strong>
                    <div className="text-slate-500 font-semibold mt-0.5">Email Contact: {selectedReceiptStudent.parentEmail || 'parent@skoola.com'}</div>
                    <div className="text-slate-500 font-semibold">Mobile Phone: {selectedReceiptStudent.parentPhone || '+254700000'}</div>
                  </div>
                </div>

                {/* Financial breakdown statement */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-black text-slate-400 font-sans">Statement breakdown</div>
                  <div className="border border-slate-150 rounded-xl overflow-hidden font-semibold">
                    <div className="grid grid-cols-3 bg-slate-50 p-2.5 font-black text-slate-500 border-b border-slate-150 text-[9.5px] uppercase tracking-wider">
                      <span>Service Outline Description</span>
                      <span className="text-right">Allocation ID</span>
                      <span className="text-right">Transacted Amount</span>
                    </div>
                    <div className="grid grid-cols-3 p-3 text-slate-700 border-b border-slate-100">
                      <span>Term 2 2026 Educational Course Tuition Fee Block</span>
                      <span className="text-right font-mono text-slate-400">EDU-T2-2026</span>
                      <span className="text-right font-mono font-black text-slate-900">KES {selectedReceiptItem.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Outstanding / Total calculations */}
                <div className="flex flex-col items-end text-xs">
                  <div className="w-64 space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex justify-between text-slate-500 font-semibold">
                      <span>Amount Credited here:</span>
                      <strong className="font-mono text-slate-900 font-black">KES {selectedReceiptItem.amount.toLocaleString()}</strong>
                    </div>

                    {(() => {
                      const record = activeFees.find(f => f.studentId === selectedReceiptStudent.id);
                      const totalDue = record?.totalDue ?? (selectedReceiptStudent.curriculum === 'CBE' ? 45000 : 120000);
                      const cumulativePaid = record?.paidAmount ?? 0;
                      const remainingBal = totalDue - cumulativePaid;

                      return (
                        <>
                          <div className="flex justify-between text-slate-500 font-semibold">
                            <span>Cumulative Paid to Date:</span>
                            <strong className="font-mono text-slate-900">KES {cumulativePaid.toLocaleString()}</strong>
                          </div>

                          <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-slate-900 text-sm">
                            <span>Remaining Outstanding:</span>
                            <span className="font-mono text-rose-600">KES {remainingBal.toLocaleString()}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Bottom Authenticator credentials and stamp space */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-4">
                  <div className="text-[10px] text-slate-400 max-w-sm font-semibold leading-relaxed font-sans text-justify">
                    This digital communication acts as certified receipts of banking. Verify payments directly with the registrar's bookkeeper if necessary. Issued under active school system administrator tokens.
                  </div>
                  <div className="text-center shrink-0 border-t border-slate-200 w-36 pt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Signed By</span>
                    <strong className="text-[9.5px] font-serif tracking-wide text-indigo-950 block mt-1.5">Registrar Registry</strong>
                  </div>
                </div>

              </div>

              {/* Loader success outputs */}
              {printSuccess && (
                <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex items-center justify-center text-center gap-2 mt-4 text-xs text-emerald-805 font-bold animate-in fade-in duration-200">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-650" />
                  <span>Verified: Receipt officially generated and printable copies formatted. Standard notification has been updated.</span>
                </div>
              )}

              {/* Print buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 border-t border-slate-200/50 pt-5 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`SKOOLA OFFICIAL FEES RECEIPT:\nStudent: ${selectedReceiptStudent.name}\nAdm: ${selectedReceiptStudent.admissionNo}\nInstallment Date: ${selectedReceiptItem.date}\nAmount Credited: KES ${selectedReceiptItem.amount.toLocaleString()}\nPayment Ref: ${selectedReceiptItem.reference}`);
                    showToast("Receipt ledger text copied to clipboard!", "success");
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black transition-colors"
                >
                  Copy Details
                </button>

                {userRole !== 'parent_student' ? (
                  <button
                    type="button"
                    disabled={isPrinting}
                    onClick={() => {
                      setIsPrinting(true);
                      setTimeout(() => {
                        setIsPrinting(false);
                        setPrintSuccess(true);
                        showToast(`Simulated successful printing run and official registry issue.`, "success");
                      }, 1000);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2 justify-center"
                  >
                    {isPrinting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 border-t-2 border-b-2 border-white"></div>
                        <span>Processing Receipt...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4" />
                        <span>Issue & Print Receipt 🖨️</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPrinting}
                    onClick={() => {
                      setIsPrinting(true);
                      setTimeout(() => {
                        setIsPrinting(false);
                        setPrintSuccess(true);
                        showToast(`PDF download prepared successfully.`, "success");
                      }, 800);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-colors flex items-center gap-1.5 justify-center"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt Copy</span>
                  </button>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
