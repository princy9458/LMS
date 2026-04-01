import { dbConnect } from '@/lib/dbConnect';
import { ADD_ITEM, UPDATE_ORDER } from '@/plugins/lms/api/builder';

export const POST = async (...args: Parameters<typeof ADD_ITEM>) => {
  await dbConnect();
  return ADD_ITEM(...args);
};

export const PATCH = async (...args: Parameters<typeof UPDATE_ORDER>) => {
  await dbConnect();
  return UPDATE_ORDER(...args);
};
