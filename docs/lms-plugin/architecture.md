# LMS Plugin Architecture Overview

This document describes how the LMS system functions as a modular "plugin" engine within an existing Next.js E-commerce project.

## 🧩 Architectural Philosophy
The LMS is designed to be **loosely coupled** but **highly integrated**. It shares the core infrastructure (Next.js, MongoDB, Auth) of the host e-commerce app but maintains its own isolated business logic layer.

### Integration Points
1. **Shared Database**: Uses the same MongoDB instance but with namespaced or distinct collections.
2. **Unified Auth**: Leverages the existing Next.js Auth session but injects LMS-specific roles (`instructor`, `student`, `admin`).
3. **Common UI Library**: Utilizes the same Tailwind config and ShadCN components for visual consistency.

## 📦 Directory Structure (Plugin Architecture)

```text
/plugins/lms/
├── api/               # AI & Recruitment APIs
├── components/        # Intelligence widgets
├── hooks/             # AI match & analytics hooks
├── middleware/        # Role guards
├── models/            # Multi-Tenant schemas (Course, Setting, etc.)
├── services/          # Settings & AI logic, Payment/Video services
├── utils/             # Stripe & BullMQ clients
├── types/             # SaaS TypeScript interfaces
└── validation/        # Payload verification
```

## 🔄 Core Logic Flows

### 1. The Learning Engine
The engine manages the hierarchy: **Course -> Section -> Lesson -> Quiz**.
- **Progress Tracking**: Hooks into every "Lesson View" to update the student's progress record.
- **Completion Logic**: Triggers on the final quiz or last lesson to generate certificates.

### 2. The Opportunity Ecosystem (Jobs & Internships)
Acts as a bridge between Learning and E-commerce.
- **Employer Role**: Can post listings.
- **Student Role**: Linked to their success metrics in Courses.

### 3. Plugin Hook System
The LMS can "emit" events that the host project can listen to:
- `onCourseBought`: Syncs with the e-commerce checkout.
- `onCertificateIssued`: Updates the user's main profile.
