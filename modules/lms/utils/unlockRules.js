/**
 * Logic to determine if a lesson is unlocked for a user.
 */
export const isLessonUnlocked = (lesson, allLessons, userProgress, enrollmentDate) => {
  // Find current lesson order
  const currentIndex = allLessons.findIndex(l => l._id.toString() === lesson._id.toString());
  
  // 1. Completion Based: Check if all previous lessons are completed
  for (let i = 0; i < currentIndex; i++) {
    const prevLessonId = allLessons[i]._id.toString();
    if (!userProgress[prevLessonId]) {
      return { unlocked: false, reason: 'Please complete previous lessons first.' };
    }
  }

  // 2. Time Based: Check if enough days have passed since enrollment
  if (lesson.unlockType === 'time' && lesson.unlockAfterDays > 0) {
    const now = new Date();
    const enrollDate = new Date(enrollmentDate);
    const diffTime = Math.abs(now - enrollDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < lesson.unlockAfterDays) {
      return { 
        unlocked: false, 
        reason: `This lesson will unlock in ${lesson.unlockAfterDays - diffDays} more days.` 
      };
    }
  }

  return { unlocked: true };
};
