import { dbConnect } from '@/lib/dbConnect';
import { GET_COURSE_STRUCTURE } from '@/plugins/lms/api/core';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = async (request: Request, context: RouteContext) => {
  await dbConnect();
  return GET_COURSE_STRUCTURE(request, context);
};
