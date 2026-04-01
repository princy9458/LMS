# Project Guidelines and Constraints

## 1. Core Principles
- **Modularity:** The LMS must function as an independent plugin/module. Avoid deep coupling between the main application state and the LMS logic.
- **Modern Standards:** Use modern Next.js features (App Router, Server Components where applicable, Client Components for interactivity).
- **Type Safety / Predictability:** While JavaScript is mentioned in the architecture, utilizing TypeScript or rigorous JSDoc is highly encouraged to prevent schema and prop related errors.
- **Design Excellence:** Use Tailwind CSS combined with ShadCN UI. Focus on a modern, accessible, and highly responsive user interface with rich aesthetics.

## 2. Directory Structure Conventions
All LMS specific code MUST be scoped under `/modules/lms/` where possible, keeping the root `app/` strictly for routing.
- `/modules/lms/courses/` - Core components for courses (CourseCard, LessonPlayer, etc).
- `/modules/lms/opportunities/` - Components for jobs and internships.
- `/modules/lms/models/` - Mongoose schemas.
- `/modules/lms/services/` - Reusable logic and database queries that the API routes will call.
- `/modules/lms/utils/` - Utility functions like lesson unlocks.

## 3. Database Constraints
- **Connection String:** Always use the provided MongoDB user and cluster to connect. 
  `mongodb+srv://princyjb9458_db_user:<password>@clusterprince.jcdgire.mongodb.net/lms_platform`
- **Mongoose Configuration:** Ensure a cached connection logic is used to prevent exhausting MongoDB connections during Next.js Hot Module Replacement in development mode.
- **Indexes:** Remember to build indexes on commonly queried fields like `title` in Courses and `company` in Jobs.

## 4. State Management (Redux)
- Use **Redux Toolkit (RTK)** for defining pieces of global state like User Progress, Current Enrollment, and Global Settings.
- Avoid storing complex non-serializable objects (like raw MongoDB Documents) in Redux. Map them to plain objects first.

## 5. Step-by-Step workflow
Always follow this progression for new feature development:
1. **Schema & Model:** Define the structural representation in mongoose.
2. **Service & API Controller:** Create the DB interaction logic, followed by an API route `app/api/...` to expose it.
3. **State & Fetching:** If required, set up Redux Thunks or RTK Query / basic fetch to get the data.
4. **UI Components:** Develop the ShadCN + Tailwind components.
5. **Integration & Page Route:** Tie the components into a page route under `app/...`.

## 6. Review & Formatting
- **Linting:** Use ESLint and Prettier rules standard to Next.js projects.
- **Commit/Documentation:** For every major chunk of progress, update this file or `implementation_plan.md` to reflect the latest status.
