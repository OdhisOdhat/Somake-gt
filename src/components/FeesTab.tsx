import React from 'react';
import { Coins, Plus, Calendar, CreditCard, ShieldCheck, Mail, Send, X } from 'lucide-react';
import { FeeRecord, Student, School } from '../types';
import NoSchoolSelected from './NoSchoolSelected';

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
    const mailtoUrl = `mailto:${encodeURIComponent(reminderEmail)}?subject=${encodeURIComponent(reminderSubject)}&body=${encodeURIComponent(reminderBody)}`;
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
  const schoolStudents = students.filter(s => s.schoolId === activeSchoolId);
  const activeFees = feeRecords.filter(f => f.schoolId === activeSchoolId);

  // Calculate Metrics
  const totalInvoiced = activeFees.reduce((sum, f) => sum + f.totalDue, 0);
  const totalCollected = activeFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalCollected;
  const successPercentage = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return (
    <div id="skoola-fees-tab-root" className="space-y-6">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight">Fees & Accounts Invoicing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control billing accounts, invoice profiles, and payment histories</p>
        </div>
      </div>

      {/* Stats Bento Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Collected</span>
            <div className="text-xl font-black text-emerald-600 mt-1 font-mono">KES {totalCollected.toLocaleString()}</div>
          </div>
          <Coins className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-xl shrink-0" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding</span>
            <div className="text-xl font-black text-rose-600 mt-1 font-mono">KES {totalOutstanding.toLocaleString()}</div>
          </div>
          <Coins className="w-8 h-8 text-rose-500 bg-rose-50 p-1.5 rounded-xl shrink-0" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-2">
            <span>Collection Success Rate</span>
            <span>{successPercentage}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-lg overflow-hidden border border-slate-200/50">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${successPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Fees List */}
      {schoolStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center min-h-[180px]">
          <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
          <h3 className="text-xs font-extrabold text-[#111] mb-0.5 font-sans">No invoice records</h3>
          <p className="text-[10px] text-slate-400">Register pupils to auto-configure student billing accounts within this school.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
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
              {schoolStudents.map(stud => {
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
                      <div className="font-extrabold text-slate-905">{stud.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{stud.gradeLevel}</div>
                    </td>
                    <td className="px-5 py-4 font-mono">KES {totalDue.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-emerald-600">KES {paidAmount.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-rose-600">KES {balance.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                        {text}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right pr-6">
                      {balance > 0 ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRecordPaymentClick(stud.id)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-200/50 rounded-lg text-xs font-black transition-colors shrink-0"
                          >
                            Record Payment
                          </button>
                          <button
                            onClick={() => handleOpenReminder(stud, balance, totalDue, paidAmount)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Send Reminder
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1 select-none pr-3">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Fees Reminder Dispatch Card */}
      {selectedReminder && (
        <div id="modal-reminder-template" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col transition-all animate-in fade-in zoom-in-95 duration-200">
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
                  <h4 className="text-sm font-black text-emerald-900">Reminder Dispatched</h4>
                  <p className="text-xs text-emerald-700 font-medium max-w-md">{sendSuccessMsg}</p>
                  <button
                    onClick={() => setSelectedReminder(null)}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-colors"
                  >
                    Close Dialog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Recipient Parent Email</label>
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
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Subject Line</label>
                    <input 
                      type="text"
                      required
                      value={reminderSubject}
                      onChange={e => setReminderSubject(e.target.value)}
                      className="w-full p-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-indigo-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Email Message Template Body</label>
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
                      className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-indigo-500" />
                      Open in Mail Client
                    </button>

                    <button
                      type="button"
                      disabled={isSendingSim}
                      onClick={handleSimulateSend}
                      className="w-full py-3 bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-200 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
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

    </div>
  );
}
