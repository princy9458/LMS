import { dbConnect } from '@/lib/dbConnect';
import { ADD_ITEM, UPDATE_ORDER } from '@/plugins/lms/api/builder';

export const POST = async (...args) => {
  await dbConnect();
  return ADD_ITEM(...args);
};

export const PUT = async (...args) => {
  await dbConnect();
  return UPDATE_ORDER(...args);
};
