import { dbConnect } from '@/lib/dbConnect';
import { GET_EMPLOYERS, CREATE_EMPLOYER } from '@/plugins/lms/api/employers';

export const GET = async (...args) => {
  await dbConnect();
  return GET_EMPLOYERS(...args);
};

export const POST = async (...args) => {
  await dbConnect();
  return CREATE_EMPLOYER(...args);
};
