# BVRIT Connect

<div align="center">
  <h3>Bridging the Gap Between Alumni & Students of B V Raju Institute of Technology</h3>
  <p>
    <a href="https://bvrit-connect-14bf0.web.app">🌐 Live Demo</a> •
    <a href="#features">✨ Features</a> •
    <a href="#tech-stack">🛠️ Tech Stack</a> •
    <a href="#setup">🚀 Setup</a> •
    <a href="#project-structure">📁 Structure</a>
  </p>

  ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
  ![License: MIT](https://img.shields.io/badge/License-MIT-green)
</div>

---

## 📖 About

**BVRIT Connect** is a full-stack web application designed to create a strong professional network between students and alumni of B V Raju Institute of Technology (BVRIT). The platform provides role-based dashboards, real-time data synchronization, and a suite of community features that empower students in their career journeys and keep alumni connected to their alma mater.

---

## 🌐 Live Demo

> **Hosted on Firebase**: [https://bvrit-connect-14bf0.web.app](https://bvrit-connect-14bf0.web.app)

---

## ✨ Features

### 🎓 Student Dashboard
- **Profile Management**: Create and update your student profile with photo, bio, branch, and year.
- **Mentorship Requests**: Browse alumni profiles and send mentorship requests.
- **Opportunities Board**: Discover internships, jobs, and project opportunities posted by alumni. Apply directly from the platform.
- **My Applications**: Track all submitted applications with real-time status updates (Pending → Reviewing → Interview → Accepted/Rejected).
- **Meetings**: View all mentorship sessions and chats scheduled by your mentor/alumni.
- **Community Hub**: Participate in discussions, events, and resource sharing within student communities.
- **Events**: Browse and register for college events.
- **AI Chatbot**: Get personalized career suggestions and answers to common queries.

### 🏛️ Alumni Dashboard
- **Profile & Verification**: Build a professional alumni profile with work experience, skills, and company details.
- **Mentorship Panel**: Manage mentorship requests from students, accept or decline requests, and schedule chat sessions.
- **Opportunities Board**:
  - Post jobs, internships, and project opportunities for BVRIT students.
  - Manage your posted opportunities (Edit / Delete).
  - **View Applicants**: Open a dedicated panel showing all students who applied, with their name, email, application message, resume link, and a status dropdown to manage their pipeline.
- **Alumni Community**: Participate in tabbed community sections — Discussions, Announcements, Events, Members, and Resources. Community leaders can approve pending members.
- **Alumni Directory**: Search and connect with fellow alumni.
- **Communication Tracker**: Track your outreach and communication history with students.
- **Settings**: Update personal details and notification preferences.

### 🔒 Authentication & Security
- Role-based authentication (Student / Alumni) powered by Firebase Auth.
- Firestore security rules restrict read/write access to authenticated users.
- Users can only edit/delete resources they own.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Backend** | Node.js + Express (in `/backend`) |
| **Database** | Firebase Firestore (NoSQL, real-time) |
| **Authentication** | Firebase Authentication |
| **File Storage** | Firebase Storage |
| **Hosting** | Firebase Hosting |
| **Version Control** | Git + GitHub |

---

## 📁 Project Structure

```
BVRIT-Connect/
├── backend/                    # Node.js Express backend
│   ├── index.js                # Entry point
│   ├── uploads/                # Uploaded verification documents
│   └── package.json
│
├── public/                     # Static public assets
│
├── src/
│   ├── components/
│   │   └── ui/                 # shadcn/ui reusable components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── tabs.tsx
│   │       └── ...
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── services/               # Firebase service helpers
│   ├── types/                  # TypeScript type definitions
│   │
│   ├── pages/
│   │   ├── Index.tsx                   # Landing page
│   │   ├── Login.tsx                   # Login page
│   │   ├── Register.tsx                # Registration page
│   │   ├── ForgotPassword.tsx          # Password recovery
│   │   │
│   │   ├── StudentDashboard.tsx        # Student main dashboard
│   │   ├── StudentProfile.tsx          # Student profile view
│   │   ├── StudentIntroForm.tsx        # Student onboarding form
│   │   ├── StudentOpportunities.tsx    # Browse & apply for opportunities
│   │   ├── StudentCommunity.tsx        # Student community hub
│   │   ├── StudentCommunication.tsx    # Student messaging
│   │   ├── StudentMeetings.tsx         # View scheduled meetings/sessions
│   │   ├── StudentMentorshipPanel.tsx  # Student mentorship view
│   │   ├── StudentDirectory.tsx        # Student directory
│   │   ├── StudentEvents.tsx           # Events for students
│   │   ├── StudentSettings.tsx         # Student settings
│   │   │
│   │   ├── AlumniDashboard.tsx         # Alumni main dashboard
│   │   ├── AlumniProfileForm.tsx       # Alumni profile editor
│   │   ├── AlumniOpportunities.tsx     # Post & manage opportunities + view applicants
│   │   ├── AlumniCommunity.tsx         # Alumni community with tabbed layout
│   │   ├── AlumniCommunication.tsx     # Alumni messaging
│   │   ├── AlumniDirectory.tsx         # Alumni directory
│   │   ├── AlumniEvent.tsx             # Alumni event management
│   │   ├── AlumniSettings.tsx          # Alumni settings
│   │   │
│   │   ├── MentorshipPanel.tsx         # Mentor request management
│   │   ├── MentorshipRequests.tsx      # Mentor request list
│   │   ├── ChatScheduling.tsx          # Schedule mentorship sessions
│   │   ├── ProfileAndVerification.tsx  # Profile verification flow
│   │   ├── RequestLists.tsx            # Mentor request manager
│   │   ├── CommunicationTracker.tsx    # Outreach tracker
│   │   ├── Chatbot.tsx                 # AI Chatbot
│   │   └── About.tsx                   # About page
│   │
│   ├── AuthContext.tsx          # Firebase Auth context provider
│   ├── firebase.ts              # Firebase app initialization
│   └── main.tsx                 # App entry point
│
├── .firebaserc                  # Firebase project binding
├── firebase.json                # Firebase hosting config
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore composite indexes
├── storage.rules                # Firebase Storage rules
├── tailwind.config.ts           # Tailwind configuration
├── vite.config.ts               # Vite bundler config
└── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- npm v9+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, and Storage enabled

### 1. Clone the Repository

```bash
git clone https://github.com/Adbhutha10/BVRIT-Connect.git
cd BVRIT-Connect
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

### 5. Start the Development Servers

**Frontend:**
```bash
npm run dev
```

**Backend (in a separate terminal):**
```bash
cd backend
npm run dev
```

The app will be available at `http://localhost:8080`.

---

## 🔥 Firebase Deployment

### Build & Deploy

```bash
# Build the production bundle
npm run build

# Deploy to Firebase Hosting
npx firebase deploy --only hosting
```

### Deploy Firestore Rules

```bash
npx firebase deploy --only firestore:rules
```

---

## 🗃️ Firestore Data Model

### Collections

| Collection | Description |
|---|---|
| `students` | Student user profiles |
| `alumni_profiles` | Alumni user profiles |
| `opportunities` | Job/internship/project postings by alumni |
| `applications` | Student applications for opportunities |
| `mentorships` | Active mentorship relationships |
| `mentorshipRequests` | Pending mentorship requests |
| `meetings` | Scheduled mentorship sessions |
| `communities` | Community group metadata |
| `notifications` | User notifications |

### Key Fields — `applications`

| Field | Type | Description |
|---|---|---|
| `opportunityId` | string | Reference to the opportunity |
| `studentId` | string | UID of the applying student |
| `studentName` | string | Display name |
| `studentEmail` | string | Contact email |
| `message` | string | Cover message from student |
| `resume` | string | Link to resume/portfolio |
| `status` | string | `pending` / `reviewing` / `interview` / `accepted` / `rejected` |
| `appliedAt` | timestamp | When the application was submitted |

---

## 🔑 User Roles

| Role | Access |
|---|---|
| **Student** | Apply for opportunities, request mentorship, join communities, view meetings |
| **Alumni** | Post opportunities, view applicants, manage mentorship, schedule sessions, lead communities |

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

MIT License © 2025 [Adbhutha](https://github.com/Adbhutha10)

---

## 🙏 Acknowledgments

- BVRIT faculty and administration for their support.
- The open-source community — React, Firebase, shadcn/ui, and Vite teams.
- All contributors and early testers of the platform.
