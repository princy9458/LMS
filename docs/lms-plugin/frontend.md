# Frontend Inventory & UX Flow

The LMS plugin provides a set of high-premium templates designed for the Next.js App Router.

## 🏛️ Page Inventory

### Student Views
- **`/lms/courses`**: The Course Catalog. Premium grid view with search.
- **`/lms/course/[id]`**: Course Detail page with syllabus and enrollment.
- **`/lms/learn/[id]`**: Immersive Course Resume redirector.
- **`/lms/learn/[courseId]/lesson/[lessonId]`**: Modern Netflix-style Learning Player.
- **`/lms/dashboard/student`**: Student hub with progress tracking and certificates.
- **`/lms/jobs`**: Job board for enrolled students.

### Admin & Employer Views
- **`/admin/lms-dashboard`**: High-level platform analytics using Recharts.
- **`/admin/settings`**: Platform configuration (General, Learning, Email, etc.).
- **`/admin/courses/builder/[id]`**: Recursive Course Structure Builder (Sections -> Lessons -> Topics/Quizzes).
- **`/admin/quizzes/builder/[id]`**: Advanced Quiz Builder (LearnDash Style).
- **`/lms/dashboard/employer`**: Recruitment dashboard and applicant pipeline.

> [!NOTE]
> The Admin Settings module features a professional **WordPress/LearnDash-inspired UI** with:
> - **3-Column Layout**: Sidebar (Primary) | Settings Navigation (Vertical icons) | Form Content.
> - **Row-Based Forms**: Clean, dense configuration with labels on the left and inputs on the right.
> - **Modern Controls**: Compact toggles, system-style radios, and optimized spacing for a premium SaaS experience.

(Employer views integrated into `/lms/dashboard/employer`)

## 🌊 Core UX Flows

### 1. The Enrollment Loop
1. User browses `/courses`.
2. Selects a course -> land on `/courses/[slug]`.
3. Clicks "Enroll" (Host project handles checkout if paid).
4. Redirect to `/learn/[courseId]` to start Lesson 1.

### 2. The Learning & Assessment Cycle
1. Student watches Lesson Video.
2. Clicks "Complete & Next".
3. Trigger a "Quiz" once they reach the end of a section.
4. If score > Passing%, unlock next module.

### 3. The Employment Bridge
1. Student finishes "Advanced Next.js" course.
2. System triggers a "Profile Update" alert.
3. Student sees a recommended job on their dashboard.
4. Clicks "Apply with LMS Score" -> Application sent to Employer.

## 🎨 UI Components & Tokens
- **CourseCard**: Displays thumbnail, price, difficulty, and rating.
- **ProgressRing**: Circular indicator of completion status.
- **CoursePlayer**: Immersive dark-themed video experience featuring:
  - Unified header with progress indicators.
  - Hierarchical Syllabus Sidebar (Modules -> Lessons).
  - Custom Video Player with auto-play next lesson support.
  - Resume functionality to continue from the last accessed position.
- **StatCard**: Premium dashboard cards using glassmorphism effects.
