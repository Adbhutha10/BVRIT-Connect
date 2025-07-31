
# BVRIT Connect

**BVRIT Connect** is a full-stack web platform built to bridge the gap between alumni and students of B V Raju Institute of Technology. It facilitates networking, mentorship, and career opportunities through a modern and scalable Firebase-backed system.

---

## 🌐 Live Demo

> https://minor-project-64ad1.web.app/

---

## 📁 Project Structure

```
├── .firebase/              # Firebase configuration
├── backend/                # Node.js backend (if separate)
├── dist/                   # Production build (auto-generated)
├── node_modules/           # Project dependencies
├── public/                 # Public assets
├── src/                    # Frontend source code
├── .env                    # Environment variables
├── .firebaserc             # Firebase project settings
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore index configuration
├── storage.rules           # Firebase Storage rules
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite bundler configuration
```

---

## 🚀 Features

- 🔐 **Role-Based Authentication**: Secure login/signup for alumni and students.
- 👥 **Alumni Directory**: View profiles of fellow alumni and batchmates.
- 💼 **Career Board**: Post and discover internships, jobs, and mentorships.
- 📅 **Event Management**: Discover and register for college events.
- 💬 **Smart Chatbot**: Personalized suggestions and interaction.
- 📈 **Real-Time Updates**: Built with Firebase Firestore & Storage.
- 🎨 **Responsive UI**: Built with React + Tailwind CSS for modern look.

---

## ⚙️ Tech Stack

- **Frontend**: React, Tailwind CSS, TypeScript, Vite
- **Backend**: Node.js, Express (in `backend/`)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting / Vercel
- **Tools**: Git, Postman, VS Code

---

## 🛠️ Setup Instructions

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Adbhutha10/BVRIT-Connect.git
   cd BVRIT-Connect
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Setup Environment**  
   Create a `.env` file with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**  
   ```bash
   npm run dev
   ```

---

## 📌 Contributions

This project is open for contributions. Feel free to fork the repo, raise issues, or create PRs for enhancements and bug fixes.

---

## 📄 License

MIT License © 2025 [Adbhutha](https://github.com/Adbhutha10)

---

## 🙌 Acknowledgments

Special thanks to the BVRIT faculty and the open-source community for their support and resources.
