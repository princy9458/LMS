import { dbConnect } from '@/lib/dbConnect';
import { GET_JOB_BY_ID, UPDATE_JOB, DELETE_JOB } from '@/plugins/lms/api/jobs';

export const GET = async (...args) => {
  await dbConnect();
  return GET_JOB_BY_ID(...args);
};

export const PUT = async (...args) => {
  await dbConnect();
  return UPDATE_JOB(...args);
};

export const DELETE = async (...args) => {
  await dbConnect();
  return DELETE_JOB(...args);
};
