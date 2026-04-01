import Lesson from '@/modules/lms/models/Lesson';
import Topic from '@/modules/lms/models/Topic';

export const topicService = {
  async createTopic(data) {
    const topic = await Topic.create(data);

    if (topic.lesson) {
      await Lesson.findByIdAndUpdate(
        topic.lesson,
        { $addToSet: { topics: topic._id } },
        { new: true }
      );
    }

    return topic;
  },

  async listTopicsByLesson(lessonId) {
    return Topic.find({ lesson: lessonId }).sort({ order: 1 });
  },

  async listTopics() {
    return Topic.find({}).sort({ createdAt: -1 });
  },

  async getTopicById(id) {
    return Topic.findById(id);
  },

  async updateTopic(id, payload) {
    return Topic.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });
  },

  async deleteTopic(id) {
    return Topic.findByIdAndDelete(id);
  }
};
