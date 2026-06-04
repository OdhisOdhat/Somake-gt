/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  Student, 
  StudentGrade, 
  AttendanceRecord, 
  LMSMaterial, 
  LMSSubmission, 
  OfflineAction, 
  School, 
  Staff, 
  SchoolClass, 
  FeeRecord 
} from './src/types';
import { loadDatabase, saveDatabase, getDb, pool } from './server/db';
import { generatePersonalizedRemark } from './server/geminiService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini Initialization Helper
let geminiClientCache: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClientCache) return geminiClientCache;
  if (!process.env.GEMINI_API_KEY) {
    console.log('Gemini API key is not defined. AI reports comments generation will be temporarily run via smart local template.');
    return null;
  }
  try {
    geminiClientCache = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return geminiClientCache;
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
    return null;
  }
}

// REST APIs
app.get('/api/state', (req, res) => {
  const db = getDb();
  res.json({
    students: db.students,
    assessments: db.assessments,
    grades: db.grades,
    attendance: db.attendance,
    lmsMaterials: db.lmsMaterials,
    lmsSubmissions: db.lmsSubmissions,
    dormitories: db.dormitories,
    busRoutes: db.busRoutes,
    schools: db.schools,
    staff: db.staff,
    schoolClasses: db.schoolClasses,
    feeRecords: db.feeRecords
  });
});

// Sync changes endpoint
app.post('/api/sync', async (req, res) => {
  const actions: OfflineAction[] = req.body.actions || [];
  console.log(`Received ${actions.length} offline actions for sync.`);

  const db = getDb();
  const syncResults = [];

  for (const action of actions) {
    try {
      const { actionType, payload } = action;
      switch (actionType) {
        case 'create_student': {
          const newStudent: Student = {
            id: payload.id || String(db.students.length + 101),
            schoolId: payload.schoolId,
            name: payload.name,
            admissionNo: payload.admissionNo || `ADM-${Math.floor(1000 + Math.random() * 9000).toString()}`,
            gender: payload.gender,
            gradeLevel: payload.gradeLevel,
            curriculum: payload.curriculum,
            boardingStatus: payload.boardingStatus,
            dormitoryId: payload.dormitoryId,
            busRouteId: payload.busRouteId,
            parentEmail: payload.parentEmail || 'parent@example.com',
            parentPhone: payload.parentPhone || '0700000000'
          };
          db.students.push(newStudent);
          syncResults.push({ id: action.id, status: 'success', message: `Student ${newStudent.name} synced.` });
          break;
        }

        case 'grade_student': {
          const index = db.grades.findIndex(
            g => g.studentId === payload.studentId && g.assessmentId === payload.assessmentId
          );
          const newGrade: StudentGrade = {
            studentId: payload.studentId,
            assessmentId: payload.assessmentId,
            score: payload.score,
            grade: payload.grade,
            rubricRating: payload.rubricRating,
            remarks: payload.remarks || '',
            lastUpdated: payload.lastUpdated || new Date().toISOString().split('T')[0]
          };

          if (index !== -1) {
            db.grades[index] = newGrade;
          } else {
            db.grades.push(newGrade);
          }
          syncResults.push({ id: action.id, status: 'success', message: 'Grade updated successfully.' });
          break;
        }

        case 'mark_attendance': {
          const payloadList: AttendanceRecord[] = Array.isArray(payload) ? payload : [payload];
          for (const item of payloadList) {
            const idx = db.attendance.findIndex(
              a => a.studentId === item.studentId && a.date === item.date
            );
            if (idx !== -1) {
              db.attendance[idx].status = item.status;
            } else {
              db.attendance.push({
                studentId: item.studentId,
                date: item.date,
                status: item.status
              });
            }
          }
          syncResults.push({ id: action.id, status: 'success', message: 'Attendance records updated.' });
          break;
        }

        case 'submit_lms': {
          const submission: LMSSubmission = {
            id: payload.id || `sub-${Math.floor(1000 + Math.random() * 9000)}`,
            materialId: payload.materialId,
            studentId: payload.studentId,
            submittedAt: payload.submittedAt || new Date().toISOString(),
            status: payload.status || 'Pending',
            content: payload.content,
            parentApproved: payload.parentApproved || false,
            parentFeedback: payload.parentFeedback || ''
          };
          const idx = db.lmsSubmissions.findIndex(s => s.id === submission.id || (s.studentId === submission.studentId && s.materialId === submission.materialId));
          if (idx !== -1) {
            db.lmsSubmissions[idx] = { ...db.lmsSubmissions[idx], ...submission };
          } else {
            db.lmsSubmissions.push(submission);
          }
          syncResults.push({ id: action.id, status: 'success', message: 'LMS Submission recorded.' });
          break;
        }

        case 'add_material': {
          const material: LMSMaterial = {
            id: payload.id || `m-${Math.floor(100 + Math.random() * 900)}`,
            title: payload.title,
            subject: payload.subject,
            curriculum: payload.curriculum,
            type: payload.type,
            content: payload.content,
            assignedDate: payload.assignedDate || new Date().toISOString().split('T')[0],
            dueDate: payload.dueDate,
            imageUrl: payload.imageUrl || ''
          };
          db.lmsMaterials.push(material);
          syncResults.push({ id: action.id, status: 'success', message: `Material ${material.title} uploaded.` });
          break;
        }

        case 'parent_approve': {
          const idx = db.lmsSubmissions.findIndex(s => s.id === payload.submissionId);
          if (idx !== -1) {
            db.lmsSubmissions[idx].parentApproved = payload.parentApproved;
            db.lmsSubmissions[idx].parentFeedback = payload.parentFeedback;
            if (payload.parentApproved) {
              db.lmsSubmissions[idx].status = 'Approved';
            }
            syncResults.push({ id: action.id, status: 'success', message: 'Parent approval recorded.' });
          } else {
            syncResults.push({ id: action.id, status: 'failed', error: 'Submission not found on server.' });
          }
          break;
        }

        case 'create_school': {
          const newSchool: School = {
            id: payload.id || `school-${db.schools.length + 101}`,
            name: payload.name,
            code: payload.code || `SCH-${Math.floor(100 + Math.random() * 900)}`,
            curriculum: payload.curriculum,
            phone: payload.phone || '',
            email: payload.email || '',
            address: payload.address || ''
          };
          db.schools.push(newSchool);
          syncResults.push({ id: action.id, status: 'success', message: `School ${newSchool.name} synced.` });
          break;
        }

        case 'create_staff': {
          const newStaff: Staff = {
            id: payload.id || `staff-${db.staff.length + 101}`,
            schoolId: payload.schoolId,
            name: payload.name,
            role: payload.role,
            email: payload.email || '',
            phone: payload.phone || ''
          };
          db.staff.push(newStaff);
          syncResults.push({ id: action.id, status: 'success', message: `Staff ${newStaff.name} synced.` });
          break;
        }

        case 'link_staff': {
          const { staffId, schoolId } = payload;
          const idx = db.staff.findIndex(s => s.id === staffId);
          if (idx !== -1) {
            db.staff[idx].schoolId = schoolId;
            syncResults.push({ id: action.id, status: 'success', message: `Staff member linked to school ID ${schoolId}.` });
          } else {
            syncResults.push({ id: action.id, status: 'failed', error: `Staff ${staffId} not found to link.` });
          }
          break;
        }

        case 'create_class': {
          const newClass: SchoolClass = {
            id: payload.id || `class-${db.schoolClasses.length + 101}`,
            schoolId: payload.schoolId,
            name: payload.name,
            teacherId: payload.teacherId
          };
          db.schoolClasses.push(newClass);
          syncResults.push({ id: action.id, status: 'success', message: `Class ${newClass.name} synced.` });
          break;
        }

        case 'record_payment': {
          const index = db.feeRecords.findIndex(f => f.id === payload.id || (f.studentId === payload.studentId && f.term === payload.term));
          if (index !== -1) {
            db.feeRecords[index].paidAmount += payload.amount;
            db.feeRecords[index].status = db.feeRecords[index].paidAmount >= db.feeRecords[index].totalDue ? 'Paid' : 'Partial';
            db.feeRecords[index].history.push({
              date: payload.date || new Date().toISOString().split('T')[0],
              amount: payload.amount,
              reference: payload.reference || 'MPESA-TX'
            });
          } else {
            db.feeRecords.push({
              id: payload.id || `fee-${db.feeRecords.length + 101}`,
              schoolId: payload.schoolId,
              studentId: payload.studentId,
              term: payload.term || 'Term 2 2026',
              totalDue: payload.totalDue || 45000,
              paidAmount: payload.amount,
              status: payload.amount >= (payload.totalDue || 45000) ? 'Paid' : 'Partial',
              history: [{
                date: payload.date || new Date().toISOString().split('T')[0],
                amount: payload.amount,
                reference: payload.reference || 'MPESA-TX'
              }]
            });
          }
          syncResults.push({ id: action.id, status: 'success', message: `Fee payment logged.` });
          break;
        }

        default:
          syncResults.push({ id: action.id, status: 'failed', error: `Unknown actionType: ${actionType}` });
      }
    } catch (e: any) {
      console.error('Sync action processing failed:', e);
      syncResults.push({ id: action.id, status: 'failed', error: e.message || 'Unknown processing error' });
    }
  }

  // Persist state updates to server database
  await saveDatabase();

  res.json({
    success: true,
    results: syncResults,
    state: {
      students: db.students,
      assessments: db.assessments,
      grades: db.grades,
      attendance: db.attendance,
      lmsMaterials: db.lmsMaterials,
      lmsSubmissions: db.lmsSubmissions,
      dormitories: db.dormitories,
      busRoutes: db.busRoutes,
      schools: db.schools,
      staff: db.staff,
      schoolClasses: db.schoolClasses,
      feeRecords: db.feeRecords
    }
  });
});

// Single operations to server database (for online mode edits)
app.post('/api/student', async (req, res) => {
  const student = req.body;
  if (!student.name || !student.gender || !student.curriculum) {
    return res.status(400).json({ error: 'Missing required student fields' });
  }

  const db = getDb();
  const newStudent: Student = {
    id: student.id || String(db.students.length + 101),
    schoolId: student.schoolId || '',
    name: student.name,
    admissionNo: student.admissionNo || `ADM-${Math.floor(1000 + Math.random() * 9000).toString()}`,
    gender: student.gender,
    gradeLevel: student.gradeLevel,
    curriculum: student.curriculum,
    boardingStatus: student.boardingStatus,
    dormitoryId: student.dormitoryId,
    busRouteId: student.busRouteId,
    parentEmail: student.parentEmail || 'parent@example.com',
    parentPhone: student.parentPhone || '0700000000'
  };

  db.students.push(newStudent);
  await saveDatabase();

  res.json({ success: true, student: newStudent });
});

app.post('/api/grade', async (req, res) => {
  const payload = req.body;
  const db = getDb();
  const index = db.grades.findIndex(
    g => g.studentId === payload.studentId && g.assessmentId === payload.assessmentId
  );
  
  const updatedGrade: StudentGrade = {
    studentId: payload.studentId,
    assessmentId: payload.assessmentId,
    score: payload.score,
    grade: payload.grade,
    rubricRating: payload.rubricRating,
    remarks: payload.remarks || '',
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  if (index !== -1) {
    db.grades[index] = updatedGrade;
  } else {
    db.grades.push(updatedGrade);
  }

  await saveDatabase();

  res.json({ success: true, grade: updatedGrade });
});

// Real full-stack delete APIs
app.delete('/api/student/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.students = db.students.filter(s => s.id !== id);
  db.grades = db.grades.filter(g => g.studentId !== id);
  db.attendance = db.attendance.filter(a => a.studentId !== id);
  db.feeRecords = db.feeRecords.filter(f => f.studentId !== id);
  await saveDatabase();
  res.json({ success: true, message: `Student ${id} deleted.` });
});

app.delete('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.staff = db.staff.filter(s => s.id !== id);
  await saveDatabase();
  res.json({ success: true, message: `Staff ${id} deleted.` });
});

app.delete('/api/school/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.schools = db.schools.filter(s => s.id !== id);
  db.students = db.students.filter(s => s.schoolId !== id);
  db.staff = db.staff.filter(s => s.schoolId !== id);
  db.schoolClasses = db.schoolClasses.filter(s => s.schoolId !== id);
  db.feeRecords = db.feeRecords.filter(s => s.schoolId !== id);
  await saveDatabase();
  res.json({ success: true, message: `School ${id} deleted.` });
});

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { email, name, password, role, schoolId } = req.body;
  if (!email || !name || !password || !role) {
    return res.status(400).json({ error: 'Missing required signup fields' });
  }

  const client = await pool.connect();
  try {
    const checkUser = await client.query('SELECT * FROM app_users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    await client.query(
      'INSERT INTO app_users (email, name, password, role, school_id) VALUES ($1, $2, $3, $4, $5)',
      [email, name, password, role, schoolId || '']
    );

    // If enrolling as a teacher, register staff profile
    if (role === 'teacher' && schoolId) {
      const db = getDb();
      const staffId = `staff-${db.staff.length + 101}`;
      const newStaff: Staff = {
        id: staffId,
        schoolId: schoolId,
        name: name,
        role: 'Teacher',
        email: email,
        phone: '0700000000'
      };
      db.staff.push(newStaff);
      await saveDatabase();
    }

    res.json({
      success: true,
      user: { email, name, role, schoolId }
    });
  } catch (err: any) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: err.message || 'Unknown registration error' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const client = await pool.connect();
  try {
    const checkUser = await client.query('SELECT * FROM app_users WHERE email = $1', [email]);
    if (checkUser.rows.length === 0) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    const user = checkUser.rows[0];
    if (user.password !== password) {
      return res.status(400).json({ error: 'Incorrect password provided' });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.school_id
      }
    });
  } catch (err: any) {
    console.error('Login failed:', err);
    res.status(500).json({ error: err.message || 'Unknown authentication error' });
  } finally {
    client.release();
  }
});

app.post('/api/staff/link', async (req, res) => {
  const { staffId, schoolId } = req.body;
  if (!staffId || !schoolId) {
    return res.status(400).json({ error: 'Missing staffId or schoolId' });
  }

  const db = getDb();
  const idx = db.staff.findIndex(s => s.id === staffId);
  if (idx !== -1) {
    db.staff[idx].schoolId = schoolId;
    await saveDatabase();
    res.json({ success: true, message: 'Staff successfully reassigned/linked.' });
  } else {
    res.status(404).json({ error: 'Staff member not found.' });
  }
});

// Gemini endpoint for Report-Card Remark Generation
app.post('/api/gemini/report-comment', async (req, res) => {
  const { studentId, studentName, curriculum, gradesList, subjectsAvg } = req.body;

  // 1. Support the direct database-driven service layer route first
  if (studentId) {
    try {
      console.log(`[Server] Generating personalized database-driven remark for student ID: ${studentId}`);
      const result = await generatePersonalizedRemark(studentId);
      return res.json({
        text: result.text,
        isFallback: result.isFallback,
        metrics: result.metrics
      });
    } catch (err: any) {
      console.error('[Server] Database-driven remark generation failed:', err);
      return res.status(500).json({ error: err.message || 'Personalized comment generation failed.' });
    }
  }

  // 2. Backward compatibility with standard payload
  if (!studentName || !curriculum) {
    return res.status(400).json({ error: 'Either studentId or both studentName & curriculum are required.' });
  }

  const aiClient = getGeminiClient();

  if (!aiClient) {
    // Elegant fallback comment generator so it fully works even without a real API key in the environment
    console.log('Generating local template-based school comment fallback...');
    let recommendation = '';
    if (curriculum === 'CBE') {
      const eeCount = (gradesList || []).filter((g: any) => g.rubricRating === 'EE').length;
      const meCount = (gradesList || []).filter((g: any) => g.rubricRating === 'ME').length;
      const aeCount = (gradesList || []).filter((g: any) => g.rubricRating === 'AE').length;

      if (eeCount > meCount) {
        recommendation = `${studentName} exhibits exceptional competencies in critical thinking, communication, and self-efficacy. She/He consistently exceeds learning outcomes. Keep up the brilliant energy!`;
      } else if (meCount >= aeCount) {
        recommendation = `${studentName} successfully meets all core learning expectations across subjects. Demonstrates healthy citizenship and regular active collaboration in group tasks. Recommended to continue practicing reading skills.`;
      } else {
        recommendation = `${studentName} is approaching standard expectations in key strands. She/He is advised to actively participate in peer tutoring groups and focus on regular revision.`;
      }
    } else {
      // Cambridge
      const numericAvg = subjectsAvg || 75;
      if (numericAvg >= 85) {
        recommendation = `${studentName} has performed outstandingly this term, achieving excellent marks. Her/His dedication to academic studies reflects the school standards perfectly. Recommended for advanced level track.`;
      } else if (numericAvg >= 65) {
        recommendation = `${studentName} maintains a strong academic standard, showing solid comprehension in most testing strands. Dedicated revision on analytical assessments will secure higher grades next term.`;
      } else {
        recommendation = `${studentName} has shown satisfactory progress but faces challenges in structural examination skills. Needs regular assessment training and focused subject support.`;
      }
    }

    return res.json({
      text: `[Academic Remark (Local Backup Generator)]\n\n${recommendation}\n\nTeacher signature: Somake ERP Registrar.`,
      isFallback: true
    });
  }

  try {
    let contextPrompt = '';
    if (curriculum === 'CBE') {
      contextPrompt = `Generate a personalized, highly professional end-of-term academic remark for student "${studentName}" under the Kenyan Competency-Based Education (CBE) framework.
Here is the grading rubric information:
- EE: Exceeding Expectations
- ME: Meeting Expectations
- AE: Approaching Expectations
- BE: Below Expectations

Student's assessments grades data:
${JSON.stringify(gradesList || [])}

Use Kenyan CBE-appropriate terminology such as "learning strands", "core competencies" (like citizenship, self-efficacy, critical thinking, digital literacy), and "formative appraisals". Write in an encouraging, constructive tone suitable for report cards, detailing their strengths and areas of growth. Keep it under 110 words.`;
    } else {
      contextPrompt = `Generate a personalized, highly professional end-of-term academic remark for student "${studentName}" under the Cambridge International Curriculum framework.
Grades range from A* to U depending on marks.

Student's assessments grades data:
${JSON.stringify(gradesList || [])}

Use Cambridge-appropriate academic terms like "academic rigor", "testing objectives", "analytical precision", and "structural performance". Write in a balanced, encouraging, and clear tone. Provide specific encouragement for exam skills. Keep it under 110 words.`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: 'You are the expert Principal/Lead Evaluator at Somake International & National School. You write flawless, compassionate, and precise report card assessments.'
      }
    });

    res.json({
      text: response.text,
      isFallback: false
    });
  } catch (err: any) {
    console.error('Gemini API execution error:', err);
    res.status(500).json({ error: err.message || 'Gemini comment generation failed.' });
  }
});

// Gemini endpoint for drafting Principal-to-Teacher message
app.post('/api/gemini/draft-teacher-message', async (req, res) => {
  const { teacherName, role, purpose, extraContext } = req.body;

  if (!teacherName || !purpose) {
    return res.status(400).json({ error: 'Teacher name and message purpose are required.' });
  }

  const aiClient = getGeminiClient();

  if (!aiClient) {
    console.log('Generating local template-based teacher drafting fallback...');
    // Fallback:
    let draftedMessage = '';
    const subject = `Memo: ${purpose} - ${teacherName}`;
    if (purpose.includes('Performance')) {
      draftedMessage = `Subject: ${subject}\n\nDear ${teacherName},\n\nI hope this message finds you well. As part of our ongoing commitment to academic excellence, I wanted to reach out regarding a standard performance appraisal review. Your dedication inside the classroom is highly valued.\n\nRegarding the focus area: "${extraContext || 'standard course delivery'}", let's align our efforts to ensure we achieve our educational and professional standards. Thank you for your continued leadership and support.\n\nWarm regards,\nLead Principal / Director`;
    } else if (purpose.includes('Lesson Plans')) {
      draftedMessage = `Subject: ${subject}\n\nDear ${teacherName},\n\nI hope you are having a productive week. This is a gentle request to review and update the curriculum lesson plans and learning guides for your designated streams.\n\nRegarding: "${extraContext || 'weekly lesson submission guidelines'}", please ensure your outline is fully aligned with our educational framework so we remain synchronized. Let me know if you require any instructional aids.\n\nThank you for your tireless efforts.\n\nBest regards,\nOffice of the Principal`;
    } else if (purpose.includes('Parent Concerns')) {
      draftedMessage = `Subject: ${subject}\n\nDear ${teacherName},\n\nI am writing to share some feedback points received during our recent parent-teacher community deliberations.\n\nConcerning: "${extraContext || 'classroom student welfare and feedback'}", I would appreciate it if we could schedule a short sync to discuss friendly remedies and support strategies for the affected learners. Your insight into student welfare is crucial.\n\nSincerely,\nLead Principal / Director`;
    } else {
      draftedMessage = `Subject: ${subject}\n\nDear ${teacherName},\n\nI am reaching out regarding: ${purpose}.\n\nSpecifically: "${extraContext || 'colleague review standards'}". Thank you for your incredible stewardship of our learning environments. Please let me know your thoughts or feedback on this matter at your earliest convenience.\n\nKind regards,\nSchool Principal`;
    }

    return res.json({
      text: draftedMessage,
      isFallback: true
    });
  }

  try {
    const contextPrompt = `Draft a highly professional, encouraging, and clear message/memo from the School Principal to the teacher named "${teacherName}" (Role: ${role || 'Classroom Teacher'}).
The purpose of the message is: "${purpose}".
Additional context/points to cover: "${extraContext || 'general progress and coordination'}".

Write in a warm yet authoritative tone. Format it as a clear memo/letter with a professional Subject: line and structured body. Keep it around 150-180 words. Do not use markdown asterisk styling inside the text block.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: 'You are the School Principal at a top tier national academy. You communicate clearly, professionally, and supportively to inspire other educators and staff.'
      }
    });

    res.json({
      text: response.text,
      isFallback: false
    });
  } catch (err: any) {
    console.error('Gemini API drafting message execution error:', err);
    res.status(500).json({ error: err.message || 'Draft message generation failed.' });
  }
});

// CSV bulk-import students and fee balances route
app.post('/api/students/bulk-import', async (req, res) => {
  const { students, feeRecords } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'No student records received' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const stud of students) {
      const q = `
        INSERT INTO students (id, school_id, name, admission_no, gender, grade_level, boarding_status, curriculum, parent_email, parent_phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          admission_no = EXCLUDED.admission_no,
          gender = EXCLUDED.gender,
          grade_level = EXCLUDED.grade_level;
      `;
      const params = [
        stud.id,
        stud.schoolId,
        stud.name,
        stud.admissionNo,
        stud.gender || 'Male',
        stud.gradeLevel || 'Grade 4',
        stud.boardingStatus || 'Day',
        stud.curriculum || 'CBE',
        stud.parentEmail || '',
        stud.parentPhone || ''
      ];
      await client.query(q, params);
    }

    if (Array.isArray(feeRecords) && feeRecords.length > 0) {
      for (const fee of feeRecords) {
        const q = `
          INSERT INTO fee_records (id, student_id, school_id, total_due, paid_amount)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            total_due = EXCLUDED.total_due,
            paid_amount = EXCLUDED.paid_amount;
        `;
        const params = [
          fee.id,
          fee.studentId,
          fee.schoolId,
          fee.totalDue || 0,
          fee.paidAmount || 0
        ];
        await client.query(q, params);
      }
    }

    await client.query('COMMIT');
    await loadDatabase();

    res.json({ success: true, count: students.length });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Bulk import database error:', err);
    res.status(500).json({ error: err.message || 'Database bulk import transaction failure.' });
  } finally {
    client.release();
  }
});

// Start dev or production asset hosting
async function startServer() {
  await loadDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Somake ERP DB] Server operating on http://0.0.0.0:${PORT}`);
  });
}

startServer();
