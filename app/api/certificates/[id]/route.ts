import { deleteCertificate, getCertificate, updateCertificate } from '@/modules/lms/controllers/certificateController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(getCertificate, 'Failed to load certificate');
export const PUT = withErrorHandling(updateCertificate, 'Failed to update certificate');
export const DELETE = withErrorHandling(deleteCertificate, 'Failed to delete certificate');
