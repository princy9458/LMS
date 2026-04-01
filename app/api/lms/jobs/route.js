import { dbConnect } from '@/lib/dbConnect';
import { GET_JOBS, CREATE_JOB } from '@/plugins/lms/api/jobs';

export const GET = async (...args) => {
  await dbConnect();
  return GET_JOBS(...args);
};

export const POST = async (...args) => {
  await dbConnect();
  return CREATE_JOB(...args);
};
