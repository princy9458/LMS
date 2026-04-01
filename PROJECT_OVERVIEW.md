# LMS Management System - Project Overview

Comprehensive documentation of the LMS Platform's architecture, tech stack, and development roadmap.

## 🚀 Tech Stack

### Core Framework
- **Frontend/Backend**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### Styling & UI
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### State Management
- **Store**: [Redux Toolkit](https://redux-toolkit.js.org/)

### Database & Auth
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM**: [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) & [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Middleware**: Custom `proxy.ts` for route protection

---

## 🏗️ System Flow

### Administrative Flow
1. **Seeding**: On server start, `db.js` automatically ensures a default Admin user (`admin@lms.com`) exists.
2. **Access Control**:
   - `/admin/*` routes are protected via `proxy.ts`.
   - Only users with `role: "admin"` in their JWT payload can enter the Admin Portal.
3. **Dedicated API**: `/api/admin/login` provides case-insensitive role verification and 7-day session persistence.

### Student & Employer Flow
1. **Registration**: Standard email/password registration with role defaulting to "student".
2. **Learning**: Access to courses, lessons, and quizzes based on enrollment status.
3. **Recruitment**: Employers can manage job and internship listings.

---

## ✅ Features Developed (So Far)

### 1. Foundation & Security
- [x] **Next.js 16 Migration**: Successfully moved to the `proxy.ts` convention for Turbopack compatibility.
- [x] **Robust Admin Seeder**: Automatic creation and self-healing of admin credentials.
- [x] **Secure Auth**: Centralized bcrypt password hashing and validated JWT issuance.

### 2. Admin Portal UI
- [x] **Command Center Dashboard**: Real-time analytics cards and statistical charts.
- [x] **Responsive Layout**: Sidebar-driven navigation with premium dark-mode aesthetics.

### 3. Content Management (CMS)
- [x] **Course Builder**: Full CRUD for courses with thumbnail management.
- [x] **Lesson Engine**: Structured lesson modules with reordering capabilities.
- [x] **Quiz System**: Dynamic question builder with multiple-choice validation.

---

## 📅 Development Roadmap (Future Phases)

### Phase 7: Opportunities Management
- [ ] **Job Board**: Admin interface to moderate and post manual job listings.
- [ ] **Internship Portal**: tracking and management of active internship programs.

### Phase 8: Comprehensive User Management
- [ ] **Employer Directory**: Profile management for partner companies.
- [ ] **Student Tracking**: Detailed roster with course progress and completion status.

### Phase 9: Advanced Features
- [ ] **Certificate Generation**: Automated PDF generation for course graduates.
- [ ] **Payment Integration**: Support for paid courses and premium memberships.
