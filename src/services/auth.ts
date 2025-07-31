interface RegisterStudentData {
  email: string;
  name: string;
  password: string;
  enrollmentYear: string;
  branch: string;
  interests: string[];
}

interface RegisterAlumniData {
  email: string;
  name: string;
  password: string;
  graduationYear: string;
  company: string;
  position: string;
  bio: string;
  collegeId?: string;  // College ID for verification
  department?: string; // Department for cross-verification
}

// Mock student database table - REMOVE SAMPLE DATA
const studentDatabase = [];

// Mock verification data for CSE department only with added names for alumni
const verifiedCSEAlumni = [];

// Mock authentication service
// In a real application, this would connect to your backend
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export const authService = {
  registerStudent: async (data: RegisterStudentData): Promise<{ success: boolean, message: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: data.name
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
    
      // Email validation for college domain
      if (!data.email.endsWith('.edu') && !data.email.endsWith('.ac.in') && !data.email.endsWith('@bvrit.ac.in')) {
        return { 
          success: false, 
          message: 'Please use a valid college email address (.edu, .ac.in or @bvrit.ac.in domain)' 
        };
      }
    
      // Verify student email exists in database (case-insensitive)
      const studentRecord = studentDatabase.find(
        student => student.email.toLowerCase() === data.email.toLowerCase()
      );
    
      if (!studentRecord) {
        // Add the student to the mock database
        studentDatabase.push({
          rollNumber: "TEMP" + Date.now().toString(), // Generate a temporary roll number
          name: data.name,
          email: data.email
        });
      }
    
      // Store in localStorage for demo purposes
      localStorage.setItem('current_user', JSON.stringify({
        ...data,
        type: 'student',
        id: user.uid,
        rollNumber: "TEMP" + Date.now().toString() // Use the temporary roll number
      }));
    
      return { 
        success: true, 
        message: 'Registration successful! Welcome to the Alumni Network.' 
      };
    } catch (error: any) {
      console.error("Firebase registration error:", error.message);
      return { success: false, message: `Registration failed: ${error.message}` };
    }
  },
  
  registerAlumni: async (data: RegisterAlumniData): Promise<{ success: boolean, message: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: data.name
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
    
      // Email validation - allow both college and regular emails for alumni
      const isBvritEmail = data.email.endsWith('@bvrit.ac.in');
      const isCollegeEmail = data.email.endsWith('.edu') || data.email.endsWith('.ac.in') || isBvritEmail;
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    
      if (!isValidEmail) {
        return { 
          success: false, 
          message: 'Please enter a valid email address' 
        };
      }
    
      let isVerified = false;
      let verificationMessage = '';
      let foundAlumni = null;
    
      // Verify if the alumni is from CSE department at BVRIT
      if (data.collegeId) {
        // Check for new format (like 23211A0501)
        const isNewFormat = /^\d{2}211A\d{4}$/i.test(data.collegeId);
        // Check for old format (like BVRIT2010CS001)
        const isOldFormat = /^BVRIT\d{4}CS\d{3}$/i.test(data.collegeId);
      
        if (!isNewFormat && !isOldFormat) {
          return {
            success: false,
            message: 'Invalid details: College ID format is incorrect. Please enter a valid BVRIT CSE College ID (e.g., 23211A0501 or BVRIT2017CS001)'
          };
        }
      
        // Verify against our CSE-specific database (case-insensitive)
        foundAlumni = verifiedCSEAlumni.find(
          alumni => (alumni.collegeId.toLowerCase() === data.collegeId?.toLowerCase()) && 
                    (alumni.graduationYear === data.graduationYear)
        );
      
        if (!foundAlumni) {
          return {
            success: false,
            message: 'Invalid details: We could not verify your alumni status. Please ensure your College ID and Graduation Year are correct for the CSE department.'
          };
        }
      
        // Add name validation for alumni
        if (foundAlumni.name.toLowerCase() !== data.name.toLowerCase()) {
          return {
            success: false,
            message: 'Invalid details: The name provided does not match our records for this College ID.'
          };
        }
      
        isVerified = true;
        verificationMessage = 'Verified via College ID, Name, and Graduation Year';
      } 
      // Method 2: If no college ID, check for BVRIT email domain 
      else if (!isCollegeEmail) {
        return {
          success: false,
          message: 'Invalid details: Please use your college email (@bvrit.ac.in, .edu or .ac.in domain) or provide your College ID for verification.'
        };
      }
    
      // Method 3: Special case for @bvrit.ac.in emails - automatic CSE validation
      if (isBvritEmail && !isVerified) {
        // Extract college ID from email if it matches the pattern like 23211a0501@bvrit.ac.in
        const emailIdMatch = data.email.match(/^(\d{2}211[aA]\d{4})@bvrit\.ac\.in$/i);
        if (emailIdMatch && emailIdMatch[1]) {
          // Find this ID in our verified list (case-insensitive)
          foundAlumni = verifiedCSEAlumni.find(
            alumni => alumni.collegeId.toLowerCase() === emailIdMatch[1].toUpperCase().toLowerCase()
          );
        
          if (!foundAlumni) {
            return {
              success: false,
              message: 'Invalid details: Your email suggests you are from BVRIT CSE, but we could not verify your alumni status. Please use your College ID for verification.'
            };
          }
        
          // Check if graduation year matches
          if (foundAlumni.graduationYear !== data.graduationYear) {
            return {
              success: false,
              message: 'Invalid details: The graduation year provided does not match our records for your College ID.'
            };
          }
        
          // Add name validation for alumni when using email
          if (foundAlumni.name.toLowerCase() !== data.name.toLowerCase()) {
            return {
              success: false,
              message: 'Invalid details: The name provided does not match our records for this College ID.'
            };
          }
        
          isVerified = true;
          verificationMessage = 'Verified via BVRIT Email, Name, and Graduation Year';
        }
      }
    
      // Store in localStorage for demo purposes
      localStorage.setItem('current_user', JSON.stringify({
        ...data,
        type: 'alumni',
        id: user.uid,
        department: 'Computer Science', // Always CSE for this version
        verified: true,
        verificationMethod: verificationMessage || 'College Email Domain'
      }));
    
      return { 
        success: true, 
        message: 'Registration successful! Welcome back to your Alumni Network.' 
      };
    } catch (error: any) {
      console.error("Firebase registration error:", error.message);
      return { success: false, message: `Registration failed: ${error.message}` };
    }
  },
  
  logout: () => {
    localStorage.removeItem('current_user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  },
  
  isLoggedIn: () => {
    return localStorage.getItem('current_user') !== null;
  },
  
  // Expose student database for display purposes
  getStudentDatabase: () => {
    return studentDatabase;
  },
  
  // Expose verified alumni database for display purposes
  getVerifiedAlumni: () => {
    return verifiedCSEAlumni;
  }
};
