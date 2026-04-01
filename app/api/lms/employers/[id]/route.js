import { dbConnect } from '@/lib/dbConnect';
import { GET_EMPLOYER_BY_ID, UPDATE_EMPLOYER, DELETE_EMPLOYER } from '@/plugins/lms/api/employers';

export const GET = async (...args) => {
  await dbConnect();
  return GET_EMPLOYER_BY_ID(...args);
};

export const PUT = async (...args) => {
  await dbConnect();
  return UPDATE_EMPLOYER(...args);
};

export const PATCH = async (...args) => {
  await dbConnect();
  return UPDATE_EMPLOYER(...args);
};

export const DELETE = async (...args) => {
  await dbConnect();
  return DELETE_EMPLOYER(...args);
};
