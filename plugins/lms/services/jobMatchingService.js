import Enrollment from '../models/Enrollment';
import Job from '../models/Job';
import Student from '../models/Student';

/**
 * Intelligent Job Matching Engine
 * Compares student skill tags and completed courses with job requirements.
 */
export const jobMatchingService = {
  async getRecommendedJobs(studentId) {
    const student = await Student.findOne({ user: studentId });
    if (!student) return [];

    const studentSkills = student.skillTags || [];
    const enrollments = await Enrollment.find({ student: studentId, status: 'completed' }).populate('course');
    const completedCourseCategories = enrollments.map(e => e.course.category);

    const jobs = await Job.find({ status: 'active' }).populate('employer');

    const matchedJobs = jobs.map(job => {
      let score = 0;
      const jobReqs = job.requirements || [];

      // 1. Skill Matching (Highest Weight)
      const skillMatches = jobReqs.filter(req => 
        studentSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
      );
      score += skillMatches.length * 25;

      // 2. Category Alignment
      if (completedCourseCategories.includes(job.category)) {
        score += 30;
      }

      // 3. Experience Match (Heuristic)
      if (student.experienceLevel === job.experienceLevel) {
        score += 15;
      }

      return {
        ...job.toObject(),
        matchScore: Math.min(100, score),
        matchReason: skillMatches.length > 0 ? `Matches your skills: ${skillMatches.join(', ')}` : "Aligned with your learning path"
      };
    });

    // Sort by score and return top matches
    return matchedJobs
      .filter(j => j.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }
};
