/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurriculumType = 'CBE' | 'Cambridge';

export interface Student {
  id: string;
  schoolId?: string; // Associated school under Skoola
  name: string;
  admissionNo: string;
  gender: 'Male' | 'Female';
  gradeLevel: string; // e.g. "Grade 4" for CBE, "Year 8" for Cambridge
  curriculum: CurriculumType;
  boardingStatus: 'Day' | 'Boarder';
  dormitoryId?: string;
  busRouteId?: string;
  parentEmail: string;
  parentPhone: string;
  approvalStatus?: 'Approved' | 'Pending_Enrollment' | 'Pending_Edit';
  pendingEdits?: {
    name?: string;
    gender?: 'Male' | 'Female';
    gradeLevel?: string;
    boardingStatus?: 'Day' | 'Boarder';
    dormitoryId?: string;
    busRouteId?: string;
    parentEmail?: string;
    parentPhone?: string;
  };
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  date: string;
  curriculum: CurriculumType;
  maxMarks?: number; // for Cambridge (e.g., 100)
}

export type CBERubric = 'EE' | 'ME' | 'AE' | 'BE'; 
// EE: Exceeding Expectations
// ME: Meeting Expectations
// AE: Approaching Expectations
// BE: Below Expectations

export interface StudentGrade {
  studentId: string;
  assessmentId: string;
  score?: number; // for Cambridge, e.g. 85 / 100
  grade?: string; // for Cambridge, A*, A, B, C, D, E, U
  rubricRating?: CBERubric; // for CBE
  remarks: string;
  lastUpdated: string;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Excused';
}

export interface LMSMaterial {
  id: string;
  title: string;
  subject: string;
  curriculum: CurriculumType;
  type: 'Note' | 'Assignment' | 'Quiz';
  content: string;
  assignedDate: string;
  dueDate?: string;
  imageUrl?: string;
}

export interface LMSSubmission {
  id: string;
  materialId: string;
  studentId: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Needs_Revision';
  content: string;
  parentApproved: boolean;
  parentFeedback?: string;
}

export interface Dormitory {
  id: string;
  name: string;
  capacity: number;
  gender: 'Male' | 'Female';
  wardenName: string;
  welfareLogs: {
    studentId: string;
    date: string;
    logType: 'Health' | 'Behavior' | 'General';
    notes: string;
  }[];
}

export interface BusRoute {
  id: string;
  name: string;
  driverName: string;
  driverPhone: string;
  stops: string[];
  status: 'Idle' | 'Active' | 'Delayed';
  currentStopIndex: number;
}

export interface OfflineAction {
  id: string;
  actionType: 'create_student' | 'grade_student' | 'mark_attendance' | 'submit_lms' | 'add_material' | 'parent_approve' | 'create_school' | 'create_staff' | 'create_class' | 'record_payment' | 'link_staff';
  payload: any;
  timestamp: string;
}

export interface AddOnModules {
  lms: boolean;
  exams: boolean;
  transport: boolean;
  boarding: boolean;
  analytics: boolean;
}

export interface School {
  id: string;
  name: string;
  code: string;
  curriculum: string; // e.g. "CBE (Kenya)" or "Cambridge (International)"
  phone: string;
  email: string;
  address: string;
}

export interface Staff {
  id: string;
  schoolId: string;
  name: string;
  role: 'Teacher' | 'Head Teacher' | 'Registrar' | 'Bus Driver' | 'Warden';
  email: string;
  phone: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;
  teacherId?: string; // Assigned supervisor/staff member ID
}

export interface FeePaymentHistory {
  date: string;
  amount: number;
  reference: string;
}

export interface FeeRecord {
  id: string;
  schoolId: string;
  studentId: string;
  term: string;
  totalDue: number;
  paidAmount: number;
  status: 'Pending' | 'Partial' | 'Paid';
  history: FeePaymentHistory[];
}
