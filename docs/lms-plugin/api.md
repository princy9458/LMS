# LMS Core API Specifications

The LMS plugin provides a set of structured API endpoints for managing the learning and career ecosystem.

## 📡 Content APIs (CMS)

### `GET /api/lms/courses`
- **Purpose**: Fetch the course catalog.
- **Implemented in**: `plugins/lms/api/courses.js`

### `GET /api/lms/course/[id]`
- **Purpose**: Fetch detailed syllabus and course data.
- **Implemented in**: `plugins/lms/api/courses.js`

### `POST /api/lms/enroll`
- **Purpose**: Enroll a student in a course.
- **Security**: Requires student role.
- **Implemented in**: `plugins/lms/api/enrollment.js`

## 🎓 Learning & Progress APIs

### `GET /api/lms/lesson/[lessonId]`
- **Purpose**: Fetch lesson details with enrollment verification.
- **Implemented in**: `app/api/lms/lesson/[lessonId]/route.ts`

### `GET /api/lms/courses/[courseId]/syllabus`
- **Purpose**: Fetch hierarchical course structure for the sidebar.
- **Implemented in**: `app/api/lms/courses/[courseId]/syllabus/route.ts`

### `GET /api/lms/enrollment/[courseId]`
- **Purpose**: Fetch a student's enrollment and local progress.
- **Implemented in**: `app/api/lms/enrollment/[courseId]/route.ts`

### `POST /api/lms/progress/update`
- **Body**: `{ courseId, lessonId, status: "completed" }`
- **Logic**: Updates user's progress percentage and returns next lesson ID.
- **Implemented in**: `app/api/lms/progress/update/route.ts`

### `POST /api/lms/quiz/submit`
- **Body**: `{ quizId, answers: {} }`
- **Logic**: Calculates score and returns pass/fail status.
- **Implemented in**: `plugins/lms/api/quizzes.js`

### `GET /api/admin/quizzes/builder/[quizId]`
- **Purpose**: Fetch full quiz structure (including questions) for builder.
- **Implemented in**: `app/api/admin/quizzes/builder/[quizId]/route.ts`

### `POST /api/admin/quizzes/builder/[quizId]/questions`
- **Purpose**: Add a new question to a quiz.
- **Implemented in**: `app/api/admin/quizzes/builder/[quizId]/questions/route.ts`

### `PATCH /api/admin/quizzes/builder/questions/[questionId]`
- **Purpose**: Update an existing question (text, type, points, options).
- **Implemented in**: `app/api/admin/quizzes/builder/questions/[questionId]/route.ts`

### `POST /api/admin/quizzes/builder/[quizId]/questions/import`
- **Purpose**: Bulk import questions from the Question Bank.
- **Implemented in**: `app/api/admin/quizzes/builder/[quizId]/questions/import/route.ts`

## 🧠 Intelligence & Career APIs

### `GET /api/lms/intelligence?type=analytics`
- **Purpose**: Student-specific learning progress and engagement metrics.

### `GET /api/lms/intelligence?type=recommendations`
- **Purpose**: AI-driven course suggestions based on student history.

### `GET /api/lms/jobs/recommended`
- **Purpose**: Best job matches for a student's verified skills.

### `POST /api/lms/intelligence?type=certificate`
- **Body**: `{ enrollmentId }`
- **Purpose**: Generates a professional PDF certificate for 100% completion.

### `POST /api/lms/intelligence?type=resume`
- **Purpose**: Aggregates skills and certificates into a downloadable resume data structure.

## 💼 Career Ecosystem APIs

### `GET /api/lms/jobs`
- **Purpose**: Fetch active job listings.
- **Implemented in**: `plugins/lms/api/jobs.js`

### `POST /api/lms/jobs/apply`
- **Body**: `{ jobId, notes }`
- **Implemented in**: `plugins/lms/api/jobs.js`

### `GET /api/lms/dashboards/admin`
- **Purpose**: Admin analytics aggregation.
- **Implemented in**: `plugins/lms/api/dashboards.js`

### 7. SaaS & Payments (`/api/lms/payment`)
- `POST /create-checkout`: Initialize Stripe session for paid courses.
- `POST /webhook`: Stripe event listener for automated enrollment.

### 8. Settings & Configuration (`/api/admin/settings`)
- `GET /?group=[group]`: Fetch settings by category.
- `POST /`: Bulk update settings (requires admin).

### 9. Tenant Management (`/api/lms/admin`)

## 🔒 Security & SaaS Hardening
- **Multi-Tenancy**: All queries are automatically scoped via `tenantId` extracted from headers.
- **Headers**: Middleware enforces SSL, CSP, and X-Frame limits.
- **Background Scaling**: BullMQ handles heavy async tasks (Certs, Analytics).

## 🛠️ Internal Hooks
The plugin uses a "Logic Bridge" to connect with the host:
- `handleEnrollment(userId, courseId)`: Triggered by the host's payment completion.
- `notifyCertificateIssue(studentId, certificateData)`: Dispatches email.
