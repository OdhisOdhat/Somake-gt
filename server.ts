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
import { loadDatabase, saveDatabase, getDb } from './server/db';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Boot active persistent database
loadDatabase();

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
app.post('/api/sync', (req, res) => {
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
            dueDate: payload.dueDate
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
  saveDatabase();

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
app.post('/api/student', (req, res) => {
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
  saveDatabase();

  res.json({ success: true, student: newStudent });
});

app.post('/api/grade', (req, res) => {
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

  saveDatabase();

  res.json({ success: true, grade: updatedGrade });
});

// Real full-stack delete APIs
app.delete('/api/student/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.students = db.students.filter(s => s.id !== id);
  db.grades = db.grades.filter(g => g.studentId !== id);
  db.attendance = db.attendance.filter(a => a.studentId !== id);
  db.feeRecords = db.feeRecords.filter(f => f.studentId !== id);
  saveDatabase();
  res.json({ success: true, message: `Student ${id} deleted.` });
});

app.delete('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.staff = db.staff.filter(s => s.id !== id);
  saveDatabase();
  res.json({ success: true, message: `Staff ${id} deleted.` });
});

app.delete('/api/school/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.schools = db.schools.filter(s => s.id !== id);
  db.students = db.students.filter(s => s.schoolId !== id);
  db.staff = db.staff.filter(s => s.schoolId !== id);
  db.schoolClasses = db.schoolClasses.filter(s => s.schoolId !== id);
  db.feeRecords = db.feeRecords.filter(s => s.schoolId !== id);
  saveDatabase();
  res.json({ success: true, message: `School ${id} deleted.` });
});

// Gemini endpoint for Report-Card Remark Generation
app.post('/api/gemini/report-comment', async (req, res) => {
  const { studentName, curriculum, gradesList, subjectsAvg } = req.body;

  if (!studentName || !curriculum) {
    return res.status(400).json({ error: 'Student name and curriculum type are required.' });
  }

  const aiClient = getGeminiClient();

  if (!aiClient) {
    // Elegant fallback comment generator so it fully works even without a real API key in the environment
    console.log('Generating local template-based school comment fallback...');
    let recommendation = '';
    if (curriculum === 'CBE') {
      const eeCount = gradesList.filter((g: any) => g.rubricRating === 'EE').length;
      const meCount = gradesList.filter((g: any) => g.rubricRating === 'ME').length;
      const aeCount = gradesList.filter((g: any) => g.rubricRating === 'AE').length;

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
${JSON.stringify(gradesList)}

Use Kenyan CBE-appropriate terminology such as "learning strands", "core competencies" (like citizenship, self-efficacy, critical thinking, digital literacy), and "formative appraisals". Write in a encouraging, constructive tone suitable for report cards, detailing their strengths and areas of growth. Keep it under 110 words.`;
    } else {
      contextPrompt = `Generate a personalized, highly professional end-of-term academic remark for student "${studentName}" under the Cambridge International Curriculum framework.
Grades range from A* to U depending on marks.

Student's assessments grades data:
${JSON.stringify(gradesList)}

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

// Start dev or production asset hosting
async function startServer() {
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
