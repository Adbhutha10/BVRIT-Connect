// src/main.tsx
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './firebase' // Ensure firebase is initialized

createRoot(document.getElementById("root")!).render(<App />);
