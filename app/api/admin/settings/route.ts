import { dbConnect } from '@/lib/dbConnect';
import { GET_SETTINGS, UPDATE_SETTINGS } from '@/plugins/lms/api/settings';

export const GET = async (...args: Parameters<typeof GET_SETTINGS>) => {
  await dbConnect();
  return GET_SETTINGS(...args);
};

export const POST = async (...args: Parameters<typeof UPDATE_SETTINGS>) => {
  await dbConnect();
  return UPDATE_SETTINGS(...args);
};
