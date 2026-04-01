import { dbConnect } from '@/lib/dbConnect';
import { GET_JOB_MATCHES } from '@/plugins/lms/api/intelligence';

type DemoRequest = Request & {
  user?: {
    id: string;
  };
};

export const GET = async (req: DemoRequest) => {
  await dbConnect();
  req.user = { id: 'demo-student-id' };
  return GET_JOB_MATCHES(req);
};
