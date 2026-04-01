import { dbConnect } from '@/lib/dbConnect';
import { PERFORM_BULK_ACTION } from '@/plugins/lms/api/core';

export const POST = async (...args: Parameters<typeof PERFORM_BULK_ACTION>) => {
  await dbConnect();
  return PERFORM_BULK_ACTION(...args);
};
