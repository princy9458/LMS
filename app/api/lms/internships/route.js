import { dbConnect } from '@/lib/dbConnect';
import { GET_INTERNSHIPS, CREATE_INTERNSHIP } from '@/plugins/lms/api/internships';

export const GET = async (...args) => {
  await dbConnect();
  return GET_INTERNSHIPS(...args);
};

export const POST = async (...args) => {
  await dbConnect();
  return CREATE_INTERNSHIP(...args);
};
