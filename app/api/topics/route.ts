import { createTopic, listTopics } from '@/modules/lms/controllers/topicController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listTopics, 'Failed to load topics');
export const POST = withErrorHandling(createTopic);
