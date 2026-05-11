import Topic from '@/modules/lms/models/Topic';
import { TOPIC_RELATIONS_POPULATE, getTopicTreeById, getTopicTreeByLesson } from '@/modules/lms/utils/learningTree';

export const topicService = {
  async createTopic(data) {
    return Topic.create(data);
  },

  async listTopicsByLesson(lessonId) {
    return getTopicTreeByLesson(lessonId);
  },

  async listTopics() {
    return Topic.find({}).sort({ createdAt: -1 }).populate(TOPIC_RELATIONS_POPULATE);
  },

  async getTopicById(id) {
    return getTopicTreeById(id);
  },

  async updateTopic(id, payload) {
    const topic = await Topic.findById(id);
    if (!topic) return null;
    topic.set(payload);
    await topic.save();
    return topic;
  },

  async deleteTopic(id) {
    return Topic.findByIdAndDelete(id);
  }
};
