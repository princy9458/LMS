# LMS Module Specifications

Detailed breakdown of the essential modules within the LMS Plugin ecosystem.

## 💼 Jobs & Internships Module
This module handles the professional placement side of the platform.

### Logic & Features:
- **Employer Verification**: Jobs are only visible if the company is "Verified".
- **Application Logic**: Students apply using their "Lms-Resume" which is auto-generated from their course certificates.
- **Filtering Engine**: Filter jobs by Salary, Location, and "Skills Required" (matched against course categories).

## 🎓 Student Roster & Tracking
A centralized hub for managing learning lifecycles.

### Essential Data Tracking:
- **Course Progress**: Aggregate percentage across all enrolled courses.
- **Skill Points**: Earned by completing specific lesson tags (e.g., earning "CSS" points by finishing the Styling Module).
- **Achievements**: Automatic badges awarded for consistency (e.g., "7-Day Learning Streak").

## 🎬 Immersive Learning Experience
A high-premium, distraction-free environment for students.

### Features:
- **Netflix-Style Player**: Dark-themed, video-first interface optimized for deep learning.
- **Hierarchical Syllabus**: Dynamic sidebar allowing students to track their journey through Modules and Lessons.
- **State Serialization**: Automatically saves progress and allows resuming exactly where the student left off.
- **Transition Logic**: Seamlessly moves to the next lesson or quiz upon completion of the current item.

## 🏢 Employer Dashboard
A restricted portal for recruitment partners.

### Features:
- **Postings Manager**: CRUD for job and internship listings.
- **Candidate Review**: View applicant profiles, check their course performance, and download resumes.
- **Analytics**: See how many students have viewed their postings vs. applied.

## 📝 Advanced Assessment Module
The assessment engine powers all quizzes and tests within the LMS.

### Features & Data Structure:
- **Polymorphic Questions**: Supports multiple types (Single, Multiple, Boolean, Short) within a single schema.
- **Answer Selection Engine**: Dynamic answer editor with correct answer marking and point assignment.
- **Question Bank**: A central repository within each tenant allowing questions to be reused across multiple quizzes without duplication.
- **Auto-Grading**: Real-time evaluation of student submissions based on the defined correct answers.

## ⚙️ System Settings (The "Plugin" Control)
Internal configuration to control the LMS ecosystem.

### Key Configs:
- **Platform Fees**: Percentage taken from course sales if instructors are external.
- **Certificate Templates**: Choose between different visual styles for generated PDFs.
- **Quiz Constraints**: Global settings for max attempts per quiz or mandatory cooling-off periods.
- **Email Triggers**: Configure when the system sends notifications (Course bought, Quiz failed, Job interview invited).
