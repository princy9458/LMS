import { dbConnect } from '@/lib/dbConnect';
import { GET_INTERNSHIP_BY_ID, UPDATE_INTERNSHIP, DELETE_INTERNSHIP } from '@/plugins/lms/api/internships';

export const GET = async (...args) => {
  await dbConnect();
  return GET_INTERNSHIP_BY_ID(...args);
};

export const PUT = async (...args) => {
  await dbConnect();
  return UPDATE_INTERNSHIP(...args);
};

export const DELETE = async (...args) => {
  await dbConnect();
  return DELETE_INTERNSHIP(...args);
};
