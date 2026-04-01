import { dbConnect } from '@/lib/dbConnect';
import { analyticsService } from '../services/analyticsService';
import { recommendationService } from '../services/recommendationService';
import { jobMatchingService } from '../services/jobMatchingService';
import { certificateService } from '../services/certificateService';
import { resumeService } from '../services/resumeService';

/**
 * AI & Intelligence API Handlers
 */

// GET /api/lms/student/analytics
export const GET_STUDENT_ANALYTICS = async (req) => {
  try {
    await dbConnect();
    const studentId = req.user.id; // From authMiddleware
    const stats = await analyticsService.getStudentAnalytics(studentId);
    return Response.json({ success: true, data: stats });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};

// GET /api/lms/recommendations
export const GET_RECOMMENDATIONS = async (req) => {
  try {
    await dbConnect();
    const studentId = req.user.id;
    const items = await recommendationService.getRecommendations(studentId);
    return Response.json({ success: true, data: items });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};

// GET /api/lms/jobs/recommended
export const GET_JOB_MATCHES = async (req) => {
  try {
    await dbConnect();
    const studentId = req.user.id;
    const matches = await jobMatchingService.getRecommendedJobs(studentId);
    return Response.json({ success: true, data: matches });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};

// POST /api/lms/certificate/generate
export const GENERATE_CERTIFICATE = async (req) => {
  try {
    await dbConnect();
    const { enrollmentId } = await req.json();
    const pdfData = await certificateService.generateCertificate(enrollmentId);
    return Response.json({ success: true, data: pdfData });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};

// POST /api/lms/resume/generate
export const GENERATE_RESUME = async (req) => {
  try {
    await dbConnect();
    const studentId = req.user.id;
    const resumeData = await resumeService.getResumeData(studentId);
    return Response.json({ success: true, data: resumeData });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};
