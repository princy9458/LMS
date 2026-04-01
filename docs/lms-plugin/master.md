# LMS Course Engine (LearnDash Style)

## Data Models

### Course
- Root entity.
- Lessons: `mongoose.Types.ObjectId[]`

### Lesson
- Linked to Course.
- Topics: `mongoose.Types.ObjectId[]`
- Quizzes: `mongoose.Types.ObjectId[]`

### Topic
- Linked to Lesson.
- Quizzes: `mongoose.Types.ObjectId[]`

### Quiz
- Linked to Lesson or Topic.
- Questions: `mongoose.Types.ObjectId[]`

### Question
- Linked to Quiz.
- Answers: `mongoose.Types.ObjectId[]`

### Answer
- Linked to Question.
- text, isCorrect, order.

---

## API Routes

### Core CRUD
- `/api/lms/courses`
- `/api/lms/lessons?courseId=[id]`
- `/api/lms/topics?lessonId=[id]`
- `/api/lms/quizzes`
- `/api/lms/questions?quizId=[id]`

### Builder
* `GET /api/lms/courses/[id]/builder`: Returns full hierarchical tree.
* `POST /api/lms/reorder`: Persists lesson/topic order.
* `POST /api/lms/bulk`: Multi-select delete/move for Lessons/Topics/Quizzes.

### Student Experience
* `POST /api/lms/attempts`: Logs student quiz performance.
* `GET /api/lms/progress`: Dynamic calculation of completion %.

---

## Technical Edge Cases & Orphan Management

- **Deleted Parents**: The system enforces hierarchy by clearing child references or performing cascade operations when parents (Lessons/Topics) are deleted.
- **Dynamic Progress**: Completion percentage is always calculated live (`Completed Items / Total Curriculum Items`) to ensure accuracy even after syllabus changes.

## UI/UX Standards

- **Skeleton Loaders**: Custom `skeletonStyles` ensure a high-end feel during data fetching.
- **Toast Notifications**: `react-hot-toast` used for real-time CRUD feedback.
- **Drag-and-Drop**: Ergonomic tree-view reordering powered by `@dnd-kit`.
