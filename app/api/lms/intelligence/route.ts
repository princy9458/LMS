import { dbConnect } from '@/lib/dbConnect';
import { 
  GET_STUDENT_ANALYTICS,
  GET_RECOMMENDATIONS,
  GENERATE_CERTIFICATE,
  GENERATE_RESUME
} from '@/plugins/lms/api/intelligence';

type DemoRequest = Request & {
  user?: {
    id: string;
  };
};

export const GET = async (req: DemoRequest) => {
  await dbConnect();
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  
  // Mocking auth for now as per plugin focus
  req.user = { id: 'demo-student-id' }; 

  if (type === 'analytics') return GET_STUDENT_ANALYTICS(req);
  if (type === 'recommendations') return GET_RECOMMENDATIONS(req);
  
  return Response.json({ error: 'Invalid type' }, { status: 400 });
};

export const POST = async (req: DemoRequest) => {
  await dbConnect();
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  
  req.user = { id: 'demo-student-id' };

  if (type === 'certificate') return GENERATE_CERTIFICATE(req);
  if (type === 'resume') return GENERATE_RESUME(req);

  return Response.json({ error: 'Invalid type' }, { status: 400 });
};
