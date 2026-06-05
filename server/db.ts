import { Pool } from 'pg';
import dotenv from 'dotenv';
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

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_VEn2JXihyBZ0@ep-restless-leaf-aqyf9hou-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 4,                  // Limit connections in serverless environment
  idleTimeoutMillis: 1000, // Close idle connections quickly
  connectionTimeoutMillis: 5000 // Fast fail if database is unresponsive
});

// Handle unhandled socket or database errors to prevent Node process crashes
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err);
});

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

async function initTables() {
  const client = await pool.connect();
  try {
    const tableCheck = await client.query("SELECT to_regclass('public.app_users')");
    if (tableCheck.rows[0] && tableCheck.rows[0].to_regclass) {
      // Tables already exist; bypass CREATE TABLE queries for instant serverless cold-starts
      return;
    }

    // 1. Create table schema if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        curriculum TEXT NOT NULL,
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        address TEXT DEFAULT ''
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT DEFAULT '',
        phone TEXT DEFAULT ''
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS school_classes (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        teacher_id TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        admission_no TEXT NOT NULL,
        gender TEXT NOT NULL,
        grade_level TEXT NOT NULL,
        curriculum TEXT NOT NULL,
        boarding_status TEXT NOT NULL,
        dormitory_id TEXT DEFAULT '',
        bus_route_id TEXT DEFAULT '',
        parent_email TEXT DEFAULT '',
        parent_phone TEXT DEFAULT ''
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS fee_records (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        term TEXT NOT NULL,
        total_due INTEGER NOT NULL,
        paid_amount INTEGER NOT NULL,
        status TEXT NOT NULL,
        history JSONB NOT NULL DEFAULT '[]'::jsonb
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        date TEXT NOT NULL,
        curriculum TEXT NOT NULL,
        max_marks INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS grades (
        student_id TEXT NOT NULL,
        assessment_id TEXT NOT NULL,
        score INTEGER,
        grade TEXT,
        rubric_rating TEXT,
        remarks TEXT DEFAULT '',
        last_updated TEXT NOT NULL,
        PRIMARY KEY (student_id, assessment_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        student_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        PRIMARY KEY (student_id, date)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lms_materials (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        curriculum TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        assigned_date TEXT NOT NULL,
        due_date TEXT,
        image_url TEXT DEFAULT ''
      );
    `);

    // Ensure image_url column exists in case the table was created earlier
    await client.query(`
      ALTER TABLE lms_materials ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lms_submissions (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        submitted_at TEXT NOT NULL,
        status TEXT NOT NULL,
        content TEXT NOT NULL,
        parent_approved BOOLEAN DEFAULT FALSE,
        parent_feedback TEXT DEFAULT ''
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS dormitories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        gender TEXT NOT NULL,
        warden_name TEXT NOT NULL,
        welfare_logs JSONB NOT NULL DEFAULT '[]'::jsonb
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bus_routes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        driver_phone TEXT DEFAULT '',
        stops JSONB NOT NULL DEFAULT '[]'::jsonb,
        status TEXT NOT NULL,
        current_stop_index INTEGER DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        school_id TEXT DEFAULT ''
      );
    `);

    const userCountRes = await client.query('SELECT COUNT(*) FROM app_users');
    const userCount = parseInt(userCountRes.rows[0].count, 10);
    if (userCount === 0) {
      console.log('[Somake Neon DB] Seeding default administrator account...');
      await client.query(
        'INSERT INTO app_users (email, name, password, role, school_id) VALUES ($1, $2, $3, $4, $5)',
        ['suppliesosubuko@gmail.com', 'Skoola Admin', 'admin123', 'super_admin', 'school-1']
      );
    }

    // Let's check if the database is completely empty (no schools defined), if so, seed it!
    const testRes = await client.query('SELECT COUNT(*) FROM schools');
    const count = parseInt(testRes.rows[0].count, 10);
    if (count === 0) {
      console.log('[Somake Neon DB] Seeding initial data into PostgreSQL...');
      // Seed schools
      for (const item of initialData.schools) {
        await client.query(
          'INSERT INTO schools (id, name, code, curriculum, phone, email, address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [item.id, item.name, item.code, item.curriculum, item.phone, item.email, item.address]
        );
      }
      // Seed staff
      for (const item of initialData.staff) {
        await client.query(
          'INSERT INTO staff (id, school_id, name, role, email, phone) VALUES ($1, $2, $3, $4, $5, $6)',
          [item.id, item.schoolId, item.name, item.role, item.email, item.phone]
        );
      }
      // Seed schoolClasses
      for (const item of initialData.schoolClasses) {
        await client.query(
          'INSERT INTO school_classes (id, school_id, name, teacher_id) VALUES ($1, $2, $3, $4)',
          [item.id, item.schoolId, item.name, item.teacherId]
        );
      }
      // Seed students
      for (const item of initialData.students) {
        await client.query(
          'INSERT INTO students (id, school_id, name, admission_no, gender, grade_level, curriculum, boarding_status, dormitory_id, bus_route_id, parent_email, parent_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [item.id, item.schoolId, item.name, item.admissionNo, item.gender, item.gradeLevel, item.curriculum, item.boardingStatus, item.dormitoryId, item.busRouteId, item.parentEmail, item.parentPhone]
        );
      }
      // Seed feeRecords
      for (const item of initialData.feeRecords) {
        await client.query(
          'INSERT INTO fee_records (id, school_id, student_id, term, total_due, paid_amount, status, history) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [item.id, item.schoolId, item.studentId, item.term, item.totalDue, item.paidAmount, item.status, JSON.stringify(item.history)]
        );
      }
      // Seed assessments
      for (const item of initialData.assessments) {
        await client.query(
          'INSERT INTO assessments (id, title, subject, date, curriculum, max_marks) VALUES ($1, $2, $3, $4, $5, $6)',
          [item.id, item.title, item.subject, item.date, item.curriculum, item.maxMarks]
        );
      }
      // Seed grades
      for (const item of initialData.grades) {
        await client.query(
          'INSERT INTO grades (student_id, assessment_id, score, grade, rubric_rating, remarks, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [item.studentId, item.assessmentId, item.score, item.grade, item.rubricRating, item.remarks, item.lastUpdated]
        );
      }
      // Seed attendance
      for (const item of initialData.attendance) {
        await client.query(
          'INSERT INTO attendance (student_id, date, status) VALUES ($1, $2, $3)',
          [item.studentId, item.date, item.status]
        );
      }
      // Seed lmsMaterials
      for (const item of initialData.lmsMaterials) {
        await client.query(
          'INSERT INTO lms_materials (id, title, subject, curriculum, type, content, assigned_date, due_date, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [item.id, item.title, item.subject, item.curriculum, item.type, item.content, item.assignedDate, item.dueDate, '']
        );
      }
      // Seed lmsSubmissions
      for (const item of initialData.lmsSubmissions) {
        await client.query(
          'INSERT INTO lms_submissions (id, material_id, student_id, submitted_at, status, content, parent_approved, parent_feedback) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [item.id, item.materialId, item.studentId, item.submittedAt, item.status, item.content, item.parentApproved, item.parentFeedback]
        );
      }
      // Seed dormitories
      for (const item of initialData.dormitories) {
        await client.query(
          'INSERT INTO dormitories (id, name, capacity, gender, warden_name, welfare_logs) VALUES ($1, $2, $3, $4, $5, $6)',
          [item.id, item.name, item.capacity, item.gender, item.wardenName, JSON.stringify(item.welfareLogs)]
        );
      }
      // Seed busRoutes
      for (const item of initialData.busRoutes) {
        await client.query(
          'INSERT INTO bus_routes (id, name, driver_name, driver_phone, stops, status, current_stop_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [item.id, item.name, item.driverName, item.driverPhone, JSON.stringify(item.stops), item.status, item.currentStopIndex]
        );
      }
      console.log('[Somake Neon DB] Seeding completed.');
    }
  } catch (err) {
    console.error('[Somake Neon DB] Initialization/Seeding error in initTables():', err);
  } finally {
    client.release();
  }
}

export async function loadDatabase(): Promise<DatabaseState> {
  await initTables();

  const client = await pool.connect();
  try {
    const schools = await client.query('SELECT * FROM schools');
    const staff = await client.query('SELECT * FROM staff');
    const schoolClasses = await client.query('SELECT * FROM school_classes');
    const students = await client.query('SELECT * FROM students');
    const feeRecords = await client.query('SELECT * FROM fee_records');
    const assessments = await client.query('SELECT * FROM assessments');
    const grades = await client.query('SELECT * FROM grades');
    const attendance = await client.query('SELECT * FROM attendance');
    const lmsMaterials = await client.query('SELECT * FROM lms_materials');
    const lmsSubmissions = await client.query('SELECT * FROM lms_submissions');
    const dormitories = await client.query('SELECT * FROM dormitories');
    const busRoutes = await client.query('SELECT * FROM bus_routes');

    dbState = {
      schools: schools.rows.map(r => ({
        id: r.id,
        name: r.name,
        code: r.code,
        curriculum: r.curriculum,
        phone: r.phone || '',
        email: r.email || '',
        address: r.address || ''
      })),
      staff: staff.rows.map(r => ({
        id: r.id,
        schoolId: r.school_id,
        name: r.name,
        role: r.role,
        email: r.email || '',
        phone: r.phone || ''
      })),
      schoolClasses: schoolClasses.rows.map(r => ({
        id: r.id,
        schoolId: r.school_id,
        name: r.name,
        teacherId: r.teacher_id
      })),
      students: students.rows.map(r => ({
        id: r.id,
        schoolId: r.school_id,
        name: r.name,
        admissionNo: r.admission_no,
        gender: r.gender,
        gradeLevel: r.grade_level,
        curriculum: r.curriculum,
        boardingStatus: r.boarding_status,
        dormitoryId: r.dormitory_id || '',
        busRouteId: r.bus_route_id || '',
        parentEmail: r.parent_email || '',
        parentPhone: r.parent_phone || ''
      })),
      feeRecords: feeRecords.rows.map(r => ({
        id: r.id,
        schoolId: r.school_id,
        studentId: r.student_id,
        term: r.term,
        totalDue: r.total_due,
        paidAmount: r.paid_amount,
        status: r.status,
        history: Array.isArray(r.history) ? r.history : []
      })),
      assessments: assessments.rows.map(r => ({
        id: r.id,
        title: r.title,
        subject: r.subject,
        date: r.date,
        curriculum: r.curriculum,
        maxMarks: r.max_marks
      })),
      grades: grades.rows.map(r => ({
        studentId: r.student_id,
        assessmentId: r.assessment_id,
        score: r.score,
        grade: r.grade,
        rubricRating: r.rubric_rating,
        remarks: r.remarks || '',
        lastUpdated: r.last_updated
      })),
      attendance: attendance.rows.map(r => ({
        studentId: r.student_id,
        date: r.date,
        status: r.status
      })),
      lmsMaterials: lmsMaterials.rows.map(r => ({
        id: r.id,
        title: r.title,
        subject: r.subject,
        curriculum: r.curriculum,
        type: r.type,
        content: r.content,
        assignedDate: r.assigned_date,
        dueDate: r.due_date,
        imageUrl: r.image_url || ''
      })),
      lmsSubmissions: lmsSubmissions.rows.map(r => ({
        id: r.id,
        materialId: r.material_id,
        studentId: r.student_id,
        submittedAt: r.submitted_at,
        status: r.status,
        content: r.content,
        parentApproved: r.parent_approved,
        parentFeedback: r.parent_feedback || ''
      })),
      dormitories: dormitories.rows.map(r => ({
        id: r.id,
        name: r.name,
        capacity: r.capacity,
        gender: r.gender,
        wardenName: r.warden_name,
        welfareLogs: Array.isArray(r.welfare_logs) ? r.welfare_logs : []
      })),
      busRoutes: busRoutes.rows.map(r => ({
        id: r.id,
        name: r.name,
        driverName: r.driver_name,
        driverPhone: r.driver_phone || '',
        stops: Array.isArray(r.stops) ? r.stops : [],
        status: r.status,
        currentStopIndex: r.current_stop_index || 0
      }))
    };
    console.log('[Somake Neon DB] Successfully loaded database state from PostgreSQL.');
  } catch (err) {
    console.error('[Somake Neon DB] Failed to load data from database:', err);
    dbState = { ...initialData };
  } finally {
    client.release();
  }
  return dbState;
}

export async function saveDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Truncate tables with CASCADE
    await client.query('TRUNCATE schools, staff, school_classes, students, fee_records, assessments, grades, attendance, lms_materials, lms_submissions, dormitories, bus_routes CASCADE');

    // Refill schools
    for (const item of dbState.schools) {
      await client.query(
        'INSERT INTO schools (id, name, code, curriculum, phone, email, address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [item.id, item.name, item.code, item.curriculum, item.phone || '', item.email || '', item.address || '']
      );
    }
    // Refill staff
    for (const item of dbState.staff) {
      await client.query(
        'INSERT INTO staff (id, school_id, name, role, email, phone) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.id, item.schoolId, item.name, item.role, item.email || '', item.phone || '']
      );
    }
    // Refill schoolClasses
    for (const item of dbState.schoolClasses) {
      await client.query(
        'INSERT INTO school_classes (id, school_id, name, teacher_id) VALUES ($1, $2, $3, $4)',
        [item.id, item.schoolId, item.name, item.teacherId]
      );
    }
    // Refill students
    for (const item of dbState.students) {
      await client.query(
        'INSERT INTO students (id, school_id, name, admission_no, gender, grade_level, curriculum, boarding_status, dormitory_id, bus_route_id, parent_email, parent_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [item.id, item.schoolId, item.name, item.admissionNo, item.gender, item.gradeLevel, item.curriculum, item.boardingStatus, item.dormitoryId || '', item.busRouteId || '', item.parentEmail || '', item.parentPhone || '']
      );
    }
    // Refill feeRecords
    for (const item of dbState.feeRecords) {
      await client.query(
        'INSERT INTO fee_records (id, school_id, student_id, term, total_due, paid_amount, status, history) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [item.id, item.schoolId, item.studentId, item.term, item.totalDue, item.paidAmount, item.status, JSON.stringify(item.history)]
      );
    }
    // Refill assessments
    for (const item of dbState.assessments) {
      await client.query(
        'INSERT INTO assessments (id, title, subject, date, curriculum, max_marks) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.id, item.title, item.subject, item.date, item.curriculum, item.maxMarks || null]
      );
    }
    // Refill grades
    for (const item of dbState.grades) {
      await client.query(
        'INSERT INTO grades (student_id, assessment_id, score, grade, rubric_rating, remarks, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [item.studentId, item.assessmentId, item.score || null, item.grade || null, item.rubricRating || null, item.remarks || '', item.lastUpdated]
      );
    }
    // Refill attendance
    for (const item of dbState.attendance) {
      await client.query(
        'INSERT INTO attendance (student_id, date, status) VALUES ($1, $2, $3)',
        [item.studentId, item.date, item.status]
      );
    }
    // Refill lmsMaterials
    for (const item of dbState.lmsMaterials) {
      await client.query(
        'INSERT INTO lms_materials (id, title, subject, curriculum, type, content, assigned_date, due_date, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [item.id, item.title, item.subject, item.curriculum, item.type, item.content, item.assignedDate, item.dueDate || null, item.imageUrl || '']
      );
    }
    // Refill lmsSubmissions
    for (const item of dbState.lmsSubmissions) {
      await client.query(
        'INSERT INTO lms_submissions (id, material_id, student_id, submitted_at, status, content, parent_approved, parent_feedback) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [item.id, item.materialId, item.studentId, item.submittedAt, item.status, item.content, item.parentApproved, item.parentFeedback || '']
      );
    }
    // Refill dormitories
    for (const item of dbState.dormitories) {
      await client.query(
        'INSERT INTO dormitories (id, name, capacity, gender, warden_name, welfare_logs) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.id, item.name, item.capacity, item.gender, item.wardenName, JSON.stringify(item.welfareLogs)]
      );
    }
    // Refill busRoutes
    for (const item of dbState.busRoutes) {
      await client.query(
        'INSERT INTO bus_routes (id, name, driver_name, driver_phone, stops, status, current_stop_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [item.id, item.name, item.driverName, item.driverPhone || '', JSON.stringify(item.stops), item.status, item.currentStopIndex || 0]
      );
    }

    await client.query('COMMIT');
    console.log('[Somake Neon DB] Database state saved and committed successfully to PostgreSQL.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Somake Neon DB] Transaction failed, did rollback:', err);
  } finally {
    client.release();
  }
}

export function getDb(): DatabaseState {
  return dbState;
}
