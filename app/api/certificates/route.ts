import { createCertificate, listCertificates } from '@/modules/lms/controllers/certificateController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listCertificates, 'Failed to load certificates');
export const POST = withErrorHandling(createCertificate);
