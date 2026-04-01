import Job from '../models/Job';
import Application from '../models/Application';
import Employer from '../models/Employer';
import Student from '../models/Student';

export const jobService = {
  /**
   * Fetch all active jobs
   */
  async getActiveJobs() {
    return await Job.find({ isPublished: true })
      .populate('employer', 'companyName logo industry')
      .sort({ createdAt: -1 });
  },

  /**
   * Apply for a job
   */
  async applyForJob(studentId, jobId, notes) {
    const student = await Student.findOne({ user: studentId });
    if (!student) throw new Error('Student profile required');

    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');

    const application = await Application.create({
      job: jobId,
      student: student._id,
      notes,
      status: 'Pending'
    });

    // Update job and student references
    await Job.updateOne({ _id: jobId }, { $push: { applications: application._id } });
    await Student.updateOne({ _id: student._id }, { $push: { applications: application._id } });

    return application;
  },

  /**
   * Get employer's posted jobs and applications
   */
  async getEmployerDashboard(userId) {
    const employer = await Employer.findOne({ user: userId }).populate({
      path: 'jobs',
      populate: {
        path: 'applications',
        populate: { path: 'student', populate: { path: 'user', select: 'name email' } }
      }
    });
    
    if (!employer) throw new Error('Employer profile not found');
    return employer;
  }
};
