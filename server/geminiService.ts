import { getDb } from './db';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy Gemini Initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return geminiClient;
  } catch (err) {
    console.error('[GeminiService] Initialization failed:', err);
    return null;
  }
}

export interface StudentPerformanceMetrics {
  studentName: string;
  admissionNo: string;
  curriculum: string;
  gradeLevel: string;
  boardingStatus: string;
  parentEmail: string;
  parentPhone: string;
  
  // Academic Metrics
  totalAssessmentsGraded: number;
  gradesList: Array<{
    assessmentTitle: string;
    subject: string;
    score?: number;
    grade?: string;
    rubricRating?: string;
    remarks: string;
  }>;
  numericAverage?: number;
  rubricCounts?: {
    EE: number; // Exceeding Expectations
    ME: number; // Meeting Expectations
    AE: number; // Approaching Expectations
    BE: number; // Below Expectations
  };

  // Attendance Metrics
  attendanceStats: {
    totalDays: number;
    present: number;
    absent: number;
    excused: number;
    rate: number; // percentage
  };

  // LMS metrics
  lmsStats: {
    totalAssigned: number;
    submitted: number;
    approvedByParent: number;
    completionRate: number; // percentage
  };
}

/**
 * Service to fetch performance metrics from database for a student
 * and compile them into a unified structure.
 */
export async function getStudentMetrics(studentId: string): Promise<StudentPerformanceMetrics | null> {
  const db = getDb();
  const student = db.students.find(s => s.id === studentId);
  if (!student) return null;

  // 1. Fetch academic grading performance
  const studentGrades = db.grades.filter(g => g.studentId === studentId);
  const gradesList = studentGrades.map(g => {
    const ass = db.assessments.find(a => a.id === g.assessmentId);
    return {
      assessmentTitle: ass ? ass.title : 'General Assessment',
      subject: ass ? ass.subject : 'General',
      score: g.score,
      grade: g.grade,
      rubricRating: g.rubricRating,
      remarks: g.remarks || ''
    };
  });

  // Calculate Average/Distributions
  let numericAverage: number | undefined;
  let rubricCounts: { EE: number; ME: number; AE: number; BE: number } | undefined;

  if (student.curriculum === 'CBE') {
    rubricCounts = { EE: 0, ME: 0, AE: 0, BE: 0 };
    studentGrades.forEach(g => {
      if (g.rubricRating === 'EE') rubricCounts!.EE++;
      else if (g.rubricRating === 'ME') rubricCounts!.ME++;
      else if (g.rubricRating === 'AE') rubricCounts!.AE++;
      else if (g.rubricRating === 'BE') rubricCounts!.BE++;
    });
  } else {
    // Cambridge
    const withScores = studentGrades.filter(g => g.score !== undefined && g.score !== null);
    if (withScores.length > 0) {
      const sum = withScores.reduce((acc, current) => acc + (current.score || 0), 0);
      numericAverage = Math.round(sum / withScores.length);
    } else {
      numericAverage = 75; // sensible default
    }
  }

  // 2. Fetch attendance
  const studentAttendance = db.attendance.filter(a => a.studentId === studentId);
  const totalDays = studentAttendance.length;
  const present = studentAttendance.filter(a => a.status === 'Present').length;
  const absent = studentAttendance.filter(a => a.status === 'Absent').length;
  const excused = studentAttendance.filter(a => a.status === 'Excused').length;
  const rate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 100;

  // 3. Fetch LMS Submissions
  const relevantMaterials = db.lmsMaterials.filter(m => m.curriculum === student.curriculum);
  const studentSubmissions = db.lmsSubmissions.filter(s => s.studentId === studentId);
  const totalAssigned = relevantMaterials.length;
  const submitted = studentSubmissions.length;
  const approvedByParent = studentSubmissions.filter(s => s.parentApproved).length;
  const completionRate = totalAssigned > 0 ? Math.round((submitted / totalAssigned) * 100) : 0;

  return {
    studentName: student.name,
    admissionNo: student.admissionNo,
    curriculum: student.curriculum,
    gradeLevel: student.gradeLevel,
    boardingStatus: student.boardingStatus,
    parentEmail: student.parentEmail,
    parentPhone: student.parentPhone,
    totalAssessmentsGraded: studentGrades.length,
    gradesList,
    numericAverage,
    rubricCounts,
    attendanceStats: {
      totalDays,
      present,
      absent,
      excused,
      rate
    },
    lmsStats: {
      totalAssigned,
      submitted,
      approvedByParent,
      completionRate
    }
  };
}

/**
 * Service to generate personalized end-of-term reporting remarks via Gemini AI or analytical fallback.
 */
export async function generatePersonalizedRemark(studentId: string): Promise<{ text: string; isFallback: boolean; metrics: StudentPerformanceMetrics }> {
  const metrics = await getStudentMetrics(studentId);
  if (!metrics) {
    throw new Error(`Student with identity "${studentId}" was not found in the database system context.`);
  }

  const aiClient = getGeminiClient();

  // If no API key is specified, fallback directly to service-level metric evaluations
  if (!aiClient) {
    const remark = generateMetricsFallbackRemark(metrics);
    return {
      text: remark,
      isFallback: true,
      metrics
    };
  }

  try {
    const isCbe = metrics.curriculum === 'CBE';
    let performanceOverview = '';

    if (isCbe && metrics.rubricCounts) {
      performanceOverview = `CBE Rubric Rating evaluations:
- Consistently Exceeding Expectations (EE): ${metrics.rubricCounts.EE} learning strand(s).
- Meeting Expectations (ME): ${metrics.rubricCounts.ME} learning strand(s).
- Approaching Expectations (AE): ${metrics.rubricCounts.AE} learning strand(s).
- Below Expectations (BE): ${metrics.rubricCounts.BE} learning strand(s).`;
    } else {
      performanceOverview = `Cambridge Academic marks average: ${metrics.numericAverage}% across learning assessment metrics.`;
    }

    const contextPrompt = `Generate a highly personalized, warm, encouraging, yet very professional end-of-term report card remark addressed to the parents of ${metrics.studentName}.
Student details:
- Name: ${metrics.studentName}
- Registration Number: ${metrics.admissionNo}
- Grade / Level: ${metrics.gradeLevel} (Curriculum: ${metrics.curriculum})
- Hostel boarding status: ${metrics.boardingStatus}

${performanceOverview}

Term metrics context:
- Grade breakdown history: ${JSON.stringify(metrics.gradesList)}
- Attendance percentage: ${metrics.attendanceStats.rate}% (Present: ${metrics.attendanceStats.present}/${metrics.attendanceStats.totalDays} sessions)
- Interactive LMS learning assignment upload rate: ${metrics.lmsStats.completionRate}% (Submitted: ${metrics.lmsStats.submitted}/${metrics.lmsStats.totalAssigned})

Guidelines for feedback:
1. Actively reference their academic metrics (their score average or competency distribution).
2. Synthesize their active attendance (${metrics.attendanceStats.rate}%) and lms material completion (${metrics.lmsStats.completionRate}%) to convey a holistic picture.
3. Use vocabulary compliant with their curriculum framework (${isCbe ? 'Kenyan CBE Competency-Based Education keywords' : 'Cambridge Assessment objectives'}).
4. Offer constructive advice for further reading or term preparations.
5. Keep the report comment brief (under 120 words).`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: 'You are the Senior Academic Director and Student Welfare Registrar at Somake National & International School. You write flawless, professional, and inspiring remarks that reflect precise database learning facts.'
      }
    });

    return {
      text: response.text || generateMetricsFallbackRemark(metrics),
      isFallback: false,
      metrics
    };
  } catch (err: any) {
    console.error('[GeminiService] API prompt failed, serving smart fallback:', err);
    return {
      text: generateMetricsFallbackRemark(metrics),
      isFallback: true,
      metrics
    };
  }
}

/**
 * High-quality analytical local backup text generator based on standard database criteria
 */
function generateMetricsFallbackRemark(metrics: StudentPerformanceMetrics): string {
  const isCbe = metrics.curriculum === 'CBE';
  const attendancePhrase = metrics.attendanceStats.totalDays > 0
    ? `maintains an active attendance score of ${metrics.attendanceStats.rate}%`
    : `has settled in well this academic term`;

  const lmsPhrase = metrics.lmsStats.totalAssigned > 0
    ? `, completing ${metrics.lmsStats.completionRate}% of parent-reviewed LMS tasks`
    : '';

  let academicParagraph = '';

  if (isCbe && metrics.rubricCounts) {
    const { EE, ME, AE, BE } = metrics.rubricCounts;
    const total = EE + ME + AE + BE;
    if (total === 0) {
      academicParagraph = `demonstrates a solid foundational mindset in initial competence reviews. Constructive appraisal is advised for learning areas.`;
    } else if (EE > 0 && EE >= ME) {
      academicParagraph = `consistently demonstrates exemplary progress. Consistently exceeds standard expectations in critical learning strands to design creative solutions. A natural leader in self-efficacy.`;
    } else if (ME >= AE) {
      academicParagraph = `successfully meets all core outcomes for their grade स्तर. Active collaboration in group strands coordinates nicely with classmates. Steady effort will continue reinforcing skills.`;
    } else {
      academicParagraph = `is currently approaching expectations across some core learning areas. Continuous personal revision and participation in remedial pathways is encouraged.`;
    }
  } else {
    const avg = metrics.numericAverage || 75;
    if (avg >= 85) {
      academicParagraph = `performs exceptionally well under our rigorous curriculum standards, securing a top-tier score average of ${avg}%. Solves problems with analytical precision and robust exam readiness.`;
    } else if (avg >= 68) {
      academicParagraph = `maintains a strong and steady academic record, average ${avg}%. Comprehends key topics excellently. Directing focus on exam speeds will elevate grades further.`;
    } else {
      academicParagraph = `shows warm determination with a general average of ${avg}%. Requires consistent exercise drills in focus topics to increase proficiency level before final papers.`;
    }
  }

  return `[Principal Report Card Remark - Smart System Automated Appraisal]\n\n${metrics.studentName} (${metrics.admissionNo}) ${attendancePhrase}${lmsPhrase}. Academically, ${metrics.studentName} ${academicParagraph} Recommended for normal promotion with supportive guides.`;
}
