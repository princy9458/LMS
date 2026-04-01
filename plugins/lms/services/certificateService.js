import { jsPDF } from 'jspdf';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';

/**
 * Certificate Generation Service
 * Creates professional PDF certificates for course completion.
 */
export const certificateService = {
  async generateCertificate(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId).populate('course student');
    if (!enrollment || enrollment.status !== 'completed') {
      throw new Error("Course not completed or enrollment not found");
    }

    const student = await Student.findOne({ user: enrollment.student }).populate('user');
    
    // Create PDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Simple Template
    doc.setFontSize(40);
    doc.setTextColor(99, 102, 241); // Primary Indigo
    doc.text("CERTIFICATE OF COMPLETION", 148, 50, { align: 'center' });

    doc.setFontSize(20);
    doc.setTextColor(100);
    doc.text("This is to certify that", 148, 80, { align: 'center' });

    doc.setFontSize(30);
    doc.setTextColor(0);
    doc.text(student.user.name, 148, 100, { align: 'center' });

    doc.setFontSize(20);
    doc.setTextColor(100);
    doc.text("has successfully completed the course", 148, 120, { align: 'center' });

    doc.setFontSize(25);
    doc.setTextColor(99, 102, 241);
    doc.text(enrollment.course.title, 148, 140, { align: 'center' });

    doc.setFontSize(15);
    doc.setTextColor(150);
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 148, 170, { align: 'center' });
    doc.text(`Certificate ID: CERT-${enrollmentId.toString().substring(0, 8).toUpperCase()}`, 148, 180, { align: 'center' });

    // In a real app, we'd save this to S3/Cloudinary. 
    // Here we return the base64 for immediate download/preview.
    return doc.output('datauristring');
  }
};
