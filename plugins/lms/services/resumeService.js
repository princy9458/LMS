import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Course from '../models/Course';

/**
 * Resume Builder Service
 * Aggregates student data, skills, and certifications for a professional resume.
 */
export const resumeService = {
  async getResumeData(studentId) {
    const student = await Student.findOne({ user: studentId }).populate('user');
    if (!student) throw new Error("Student profile not found");

    const completedEnrollments = await Enrollment.find({ 
      student: studentId, 
      status: 'completed' 
    }).populate('course');

    return {
      personalInfo: {
        name: student.user.name,
        email: student.user.email,
        bio: student.bio,
        location: student.location,
      },
      skills: student.skillTags || [],
      education: [
        {
          institution: "LMS Academy",
          degree: "Professional Certifications",
          details: completedEnrollments.map(e => e.course.title).join(', ')
        }
      ],
      certifications: completedEnrollments.map(e => ({
        title: e.course.title,
        date: e.updatedAt,
        id: `CERT-${e._id.toString().substring(0, 8).toUpperCase()}`
      }))
    };
  }
};
