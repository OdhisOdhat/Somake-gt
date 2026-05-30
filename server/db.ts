import fs from 'fs';
import path from 'path';
import { 
  Student, 
  Assessment, 
  StudentGrade, 
  AttendanceRecord, 
  LMSMaterial, 
  LMSSubmission, 
  Dormitory, 
  BusRoute, 
  School, 
  Staff, 
  SchoolClass, 
  FeeRecord 
} from '../src/types';

const DB_FILE = path.join(process.cwd(), 'server_db.json');

export interface DatabaseState {
  schools: School[];
  staff: Staff[];
  schoolClasses: SchoolClass[];
  students: Student[];
  feeRecords: FeeRecord[];
  assessments: Assessment[];
  grades: StudentGrade[];
  attendance: AttendanceRecord[];
  lmsMaterials: LMSMaterial[];
  lmsSubmissions: LMSSubmission[];
  dormitories: Dormitory[];
  busRoutes: BusRoute[];
}

const initialData: DatabaseState = {
  schools: [
    { id: 'school-1', name: 'Nairobi Primary School', code: 'NRB-001', curriculum: 'CBE (Kenya)', phone: '0711222333', email: 'info@nps.ac.ke', address: 'Westlands, Nairobi' },
    { id: 'school-2', name: 'Kileleshwa Academy', code: 'KIL-002', curriculum: 'Cambridge (International)', phone: '0722333444', email: 'contact@kileleshwa.edu', address: 'Kileleshwa, Nairobi' }
  ],
  staff: [
    { id: 'staff-1', schoolId: 'school-1', name: 'Teacher Peninah Wambui', role: 'Teacher', email: 'peninah.w@skoola.co.ke', phone: '0711122233' },
    { id: 'staff-2', schoolId: 'school-1', name: 'Principal Jane Mwangi', role: 'Head Teacher', email: 'principal.jane@skoola.co.ke', phone: '0722233344' },
    { id: 'staff-3', schoolId: 'school-2', name: 'Dr. Arthur Pendelton', role: 'Head Teacher', email: 'a.pendelton@skoola.co.ke', phone: '0733344455' },
    { id: 'staff-4', schoolId: 'school-2', name: 'Teacher Charles Carter', role: 'Teacher', email: 'c.carter@skoola.co.ke', phone: '0744455566' }
  ],
  schoolClasses: [
    { id: 'class-1', schoolId: 'school-1', name: 'Grade 4 East', teacherId: 'staff-1' },
    { id: 'class-2', schoolId: 'school-1', name: 'Grade 5 West', teacherId: 'staff-2' },
    { id: 'class-3', schoolId: 'school-2', name: 'Year 8 Alpha', teacherId: 'staff-4' },
    { id: 'class-4', schoolId: 'school-2', name: 'Year 9 Beta', teacherId: 'staff-4' }
  ],
  students: [
    { id: '1', schoolId: 'school-1', name: 'Musa Kiptoo', admissionNo: 'SD-4012', gender: 'Male', gradeLevel: 'Grade 4', curriculum: 'CBE', boardingStatus: 'Boarder', dormitoryId: 'dorm-elgon', parentEmail: 'musa.parent@example.com', parentPhone: '0712345678' },
    { id: '2', schoolId: 'school-1', name: 'Amani Onyango', admissionNo: 'SD-5089', gender: 'Female', gradeLevel: 'Grade 5', curriculum: 'CBE', boardingStatus: 'Day', busRouteId: 'route-a', parentEmail: 'amani.parent@example.com', parentPhone: '0723456789' },
    { id: '3', schoolId: 'school-1', name: 'Zawadi Mwangi', admissionNo: 'SD-4033', gender: 'Female', gradeLevel: 'Grade 4', curriculum: 'CBE', boardingStatus: 'Boarder', dormitoryId: 'dorm-kili', parentEmail: 'zawadi.parent@example.com', parentPhone: '0734567890' },
    { id: '4', schoolId: 'school-2', name: 'Chloe Higgins', admissionNo: 'CB-8041', gender: 'Female', gradeLevel: 'Year 8', curriculum: 'Cambridge', boardingStatus: 'Boarder', dormitoryId: 'dorm-kili', parentEmail: 'chloe.parent@example.com', parentPhone: '0745678901' },
    { id: '5', schoolId: 'school-2', name: 'Tejas Patel', admissionNo: 'CB-9011', gender: 'Male', gradeLevel: 'Year 9', curriculum: 'Cambridge', boardingStatus: 'Day', busRouteId: 'route-b', parentEmail: 'tejas.parent@example.com', parentPhone: '0756789012' },
    { id: '6', schoolId: 'school-2', name: 'David Ndwiga', admissionNo: 'CB-8022', gender: 'Male', gradeLevel: 'Year 8', curriculum: 'Cambridge', boardingStatus: 'Boarder', dormitoryId: 'dorm-elgon', parentEmail: 'david.parent@example.com', parentPhone: '0767890123' }
  ],
  feeRecords: [
    { id: 'fee-1', schoolId: 'school-1', studentId: '1', term: 'Term 2 2026', totalDue: 45000, paidAmount: 30050, status: 'Partial', history: [{ date: '2026-05-10', amount: 30000, reference: 'MPESA-TX9982' }] },
    { id: 'fee-2', schoolId: 'school-1', studentId: '2', term: 'Term 2 2026', totalDue: 45000, paidAmount: 45000, status: 'Paid', history: [{ date: '2026-05-09', amount: 45000, reference: 'MPESA-TX4412' }] },
    { id: 'fee-3', schoolId: 'school-1', studentId: '3', term: 'Term 2 2026', totalDue: 45000, paidAmount: 0, status: 'Pending', history: [] },
    { id: 'fee-4', schoolId: 'school-2', studentId: '4', term: 'Term 2 2026', totalDue: 120000, paidAmount: 120000, status: 'Paid', history: [{ date: '2026-05-01', amount: 120000, reference: 'BANK-CHQ9021' }] },
    { id: 'fee-5', schoolId: 'school-2', studentId: '5', term: 'Term 2 2026', totalDue: 120000, paidAmount: 90000, status: 'Partial', history: [{ date: '2026-05-03', amount: 90000, reference: 'BANK-CHQ8812' }] }
  ],
  assessments: [
    { id: 'a1', title: 'Mathematics Mid-Term', subject: 'Mathematics', date: '2026-05-15', curriculum: 'Cambridge', maxMarks: 100 },
    { id: 'a2', title: 'English Creative Reading', subject: 'English', date: '2026-05-16', curriculum: 'Cambridge', maxMarks: 50 },
    { id: 'a3', title: 'Science Strand 1: Nutrition', subject: 'Science', date: '2026-05-18', curriculum: 'CBE' },
    { id: 'a4', title: 'Kiswahili: Kusikia na Kuzungumza', subject: 'Kiswahili', date: '2026-05-19', curriculum: 'CBE' }
  ],
  grades: [
    { studentId: '4', assessmentId: 'a1', score: 92, grade: 'A*', remarks: 'Exceptional problem solving skill, top of the class.', lastUpdated: '2026-05-15' },
    { studentId: '5', assessmentId: 'a1', score: 78, grade: 'B', remarks: 'Good accuracy. Needs more geometry focus.', lastUpdated: '2026-05-15' },
    { studentId: '6', assessmentId: 'a1', score: 62, grade: 'C', remarks: 'Passed comfortably but needs to improve speed.', lastUpdated: '2026-05-15' },
    { studentId: '4', assessmentId: 'a2', score: 45, grade: 'A*', remarks: 'Deep insight in analytical review.', lastUpdated: '2026-05-16' },
    { studentId: '5', assessmentId: 'a2', score: 35, grade: 'B', remarks: 'Great creativity but check spelling choices.', lastUpdated: '2026-05-16' },
    { studentId: '1', assessmentId: 'a3', rubricRating: 'EE', remarks: 'Identified all nutritional groups and set up balancing examples successfully.', lastUpdated: '2026-05-18' },
    { studentId: '2', assessmentId: 'a3', rubricRating: 'ME', remarks: 'Fully comprehends the importance of balanced meals.', lastUpdated: '2026-05-18' },
    { studentId: '3', assessmentId: 'a3', rubricRating: 'ME', remarks: 'Followed instruction sets perfectly.', lastUpdated: '2026-05-18' },
    { studentId: '1', assessmentId: 'a4', rubricRating: 'ME', remarks: 'Anaonyesha uwezo mkuu wa kutamka maneno na kuelewa hadithi fupi.', lastUpdated: '2026-05-19' },
    { studentId: '2', assessmentId: 'a4', rubricRating: 'EE', remarks: 'Ufasaha wa hali ya juu katika uwasilishaji wa mashairi.', lastUpdated: '2026-05-19' }
  ],
  attendance: [
    { studentId: '1', date: '2026-05-27', status: 'Present' },
    { studentId: '2', date: '2026-05-27', status: 'Present' },
    { studentId: '3', date: '2026-05-27', status: 'Absent' },
    { studentId: '4', date: '2026-05-27', status: 'Present' },
    { studentId: '5', date: '2026-05-27', status: 'Excused' },
    { studentId: '6', date: '2026-05-27', status: 'Present' }
  ],
  lmsMaterials: [
    { id: 'm1', title: 'Algebraic Equations Cheat-Sheet', subject: 'Mathematics', curriculum: 'Cambridge', type: 'Note', content: 'Formulas for quadratic solutions and factorisation rules.', assignedDate: '2026-05-20' },
    { id: 'm2', title: 'Home Assignment: Energy Sources', subject: 'Science', curriculum: 'CBE', type: 'Assignment', content: 'Explore local communities for primary energy resources and classify them (Renewable / Non-Renewable). Write a 1-page log.', assignedDate: '2026-05-22', dueDate: '2026-06-02' },
    { id: 'm3', title: 'Language Arts: Insha Kuhusu Likizo', subject: 'Kiswahili', curriculum: 'CBE', type: 'Assignment', content: 'Tafadhali andika insha kuhusu likizo yako na uandike kazi hii kwenye kitabu chako kisha upige picha au uambatishe hapa.', assignedDate: '2026-05-24', dueDate: '2026-05-31' }
  ],
  lmsSubmissions: [
    {
      id: 'sub-1',
      materialId: 'm2',
      studentId: '1',
      submittedAt: '2026-05-25T14:30:00Z',
      status: 'Approved',
      content: 'In my home village of Kamariny, we use solar panels for light, and charcoal or firewood for cooking. Solar is clean energy (renewable), and wood is biofuel but has smoke.',
      parentApproved: true,
      parentFeedback: 'Well researched, Musa has been interviewing his grandmother about old style fire usage!'
    },
    {
      id: 'sub-2',
      materialId: 'm3',
      studentId: '2',
      submittedAt: '2026-05-26T09:15:00Z',
      status: 'Pending',
      content: 'Likizo yangu ilikuwa ya kusisimua. Nilienda kutembelea mbuga ya wanyama ya Nairobi na kuwaona simba pia chui na kiboko...',
      parentApproved: false,
      parentFeedback: ''
    }
  ],
  dormitories: [
    {
      id: 'dorm-elgon',
      name: 'Elgon House',
      capacity: 20,
      gender: 'Male',
      wardenName: 'Mr. Peter Kiprop',
      welfareLogs: [
        { studentId: '1', date: '2026-05-25', logType: 'General', notes: 'Participated outstandingly in common room clean up.' },
        { studentId: '6', date: '2026-05-26', logType: 'Health', notes: 'Complained of minor headache. Given paracetamol, rested for 2 hours. Fully recovered.' }
      ]
    },
    {
      id: 'dorm-kili',
      name: 'Kilimanjaro House',
      capacity: 20,
      gender: 'Female',
      wardenName: 'Mrs. Grace Ombati',
      welfareLogs: [
        { studentId: '4', date: '2026-05-24', logType: 'Health', notes: 'Periodic asthma check. Inhaler is accessible, doing completely fine.' }
      ]
    }
  ],
  busRoutes: [
    { id: 'route-a', name: 'Westlands / Kilimani Shuttle', driverName: 'Uncle James Mworia', driverPhone: '0701112223', stops: ['School', 'Westlands Mall', 'Kilimani Ring Rd', 'Yaya Centre', 'Prestige Plaza'], status: 'Active', currentStopIndex: 2 },
    { id: 'route-b', name: 'Karen / Langata Express', driverName: 'Uncle Stephen Oloo', driverPhone: '0702223334', stops: ['School', 'Galleria Mall', 'Karen Triangle', 'Hillcrest Rd', 'Bomas'], status: 'Idle', currentStopIndex: 0 }
  ]
};

let dbState: DatabaseState = { ...initialData };

export function loadDatabase(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      dbState = { ...initialData, ...parsed };
      console.log('[Somake Persistent DB] Loaded data from server_db.json.');
    } else {
      console.log('[Somake Persistent DB] Init server_db.json file.');
      saveDatabase();
    }
  } catch (err) {
    console.warn('[Somake Persistent DB] Failed to load, loading fallback.', err);
    dbState = { ...initialData };
  }
  return dbState;
}

export function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (err) {
    console.error('[Somake Persistent DB] Sync write failed:', err);
  }
}

export function getDb() {
  return dbState;
}
