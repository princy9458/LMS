import { createCheckoutSession } from '../utils/stripeClient';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Stripe from 'stripe';

/**
 * SaaS Payment Service
 * Handles course purchases and enrollment hooks.
 */
export const paymentService = {
  async createCourseCheckout(courseId: string, studentId: string, studentEmail: string): Promise<string | null> {
    const course = await Course.findById(courseId);
    if (!course || !course.isPaid) throw new Error("Invalid course for payment");

    // Metadata for webhook reconciliation
    const metadata = {
      courseId: courseId.toString(),
      studentId: studentId.toString(),
      tenantId: course.tenant.toString(),
      type: 'course_purchase'
    };

    const session = await createCheckoutSession({
      priceId: course.stripePriceId || 'price_mock_123', // In real app, sync this during course creation
      customerEmail: studentEmail,
      metadata
    });

    return session.url;
  },

  async handleWebhookSuccess(session: Stripe.Checkout.Session): Promise<{ received: boolean }> {
    if (!session.metadata) return { received: true };
    const { courseId, studentId, tenantId, type } = session.metadata;

    if (type === 'course_purchase') {
      // Auto-enroll student after successful payment
      await Enrollment.findOneAndUpdate(
        { tenant: tenantId, user: studentId, course: courseId },
        { status: 'active', progressPercent: 0 },
        { upsert: true, new: true }
      );
    }
    
    return { received: true };
  }
};
