import { deleteTopic, getTopic, updateTopic } from '@/modules/lms/controllers/topicController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(getTopic, 'Failed to load topic');
export const PUT = withErrorHandling(updateTopic, 'Failed to update topic');
export const DELETE = withErrorHandling(deleteTopic, 'Failed to delete topic');
