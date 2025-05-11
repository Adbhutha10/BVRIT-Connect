// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Events from "./pages/Events";
import Opportunities from "./pages/Opportunities";
import About from "./pages/About";
import Profile from "./pages/Profile";
import DatabaseDetails from "./pages/DatabaseDetails";
import { authService } from "@/services/auth";
import StudentIntroForm from "./pages/StudentIntroForm";
import AlumniProfileForm from "./pages/AlumniProfileForm";
import Verification from "./pages/Verification";
import StudentDashboard from "./pages/StudentDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import StudentCommunity from "./pages/StudentCommunity"; // Add this import
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = authService.isLoggedIn();
  const currentUser = authService.getCurrentUser();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user type
  if (currentUser?.type === 'student' && location.pathname.startsWith('/alumni')) {
    return <Navigate to="/student/dashboard" replace />;
  } else if (currentUser?.type === 'alumni' && location.pathname.startsWith('/student')) {
    return <Navigate to="/alumni/dashboard" replace />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Index />} />
            <Route path="/StudentIntroForm" element={<StudentIntroForm />} />
            <Route path="/alumni/profile-form" element={<AlumniProfileForm />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
            
            {/* Add StudentCommunity routes */}
            <Route
              path="/student/communities"
              element={
                <PrivateRoute>
                  <StudentCommunity />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <Events />
                </PrivateRoute>
              }
            />
            <Route
              path="/opportunities"
              element={
                <PrivateRoute>
                  <Opportunities />
                </PrivateRoute>
              }
            />

            <Route
              path="/about"
              element={
                <PrivateRoute>
                  <About />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:section"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/database-details"
              element={
                <PrivateRoute>
                  <DatabaseDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <PrivateRoute>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/alumni/dashboard"
              element={
                <PrivateRoute>
                  <AlumniDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;