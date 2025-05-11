import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Upload, 
  Github, 
  Linkedin, 
  GraduationCap,
  BookOpen,
  Code,
  Briefcase,
  User
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/firebase'; // Import Firebase services
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AlumniProfileForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    graduationYear: '',
    branch: '',
    currentJobTitle: '',
    companyName: '',
    yearsOfExperience: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    areaOfExpertise: '',
    availableForMentorship: false,
    typeOfSupport: [],
    shortBio: '',
    skills: '',
    interests: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({ ...prev, availableForMentorship: checked }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      let newSupport = [...prev.typeOfSupport];
      if (checked) {
        newSupport.push(value);
      } else {
        newSupport = newSupport.filter(item => item !== value);
      }
      return { ...prev, typeOfSupport: newSupport };
    });
  };

  const handleResumeChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePictureFile(e.target.files[0]);
    }
  };

  // Function to upload a file to Firebase Storage
  const uploadFileToStorage = async (file, path) => {
    if (!file) return null;
    
    const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Upload profile picture if exists
      const profilePictureURL = profilePictureFile 
        ? await uploadFileToStorage(profilePictureFile, 'profile-pictures')
        : null;
      
      // Upload resume if exists
      const resumeURL = resumeFile 
        ? await uploadFileToStorage(resumeFile, 'resumes')
        : null;
      
      // Prepare data for Firestore
      const alumniData = {
        ...formData,
        profilePictureURL,
        resumeURL,
        userId: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add document to Firestore collection
      const docRef = await addDoc(collection(db, 'alumni_profiles'), alumniData);
      
      toast({
        title: "Profile Created Successfully!",
        description: "Your alumni profile has been saved to our database.",
      });
      
      // Also save to localStorage as a backup
      localStorage.setItem('alumni_profile_id', docRef.id);
      
      navigate('/alumni/dashboard');
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-12 w-12 mr-4" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Alumni Profile Form</h1>
                <p className="mt-2 text-lg opacity-95">
                  Share your professional journey and connect with fellow BVRITians.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-blue-800 border-b pb-3">
                  <User className="mr-3 h-6 w-6" />
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="fullName" className="text-gray-800 font-medium">Full Name</Label>
                    <Input 
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear" className="text-gray-800 font-medium">Graduation Year</Label>
                    <Input 
                      id="graduationYear"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter graduation year"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Professional Details Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-blue-800 border-b pb-3">
                  <Briefcase className="mr-3 h-6 w-6" />
                  Professional Details
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="branch" className="text-gray-800 font-medium">Branch</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange(value, 'branch')}
                      value={formData.branch}
                    >
                      <SelectTrigger className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                        <SelectItem value="IT">Information Technology</SelectItem>
                        <SelectItem value="ECE">Electronics & Communication</SelectItem>
                        <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                        <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                        <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentJobTitle" className="text-gray-800 font-medium">Current Job Title</Label>
                    <Input 
                      id="currentJobTitle"
                      name="currentJobTitle"
                      value={formData.currentJobTitle}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName" className="text-gray-800 font-medium">Company Name</Label>
                    <Input 
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsOfExperience" className="text-gray-800 font-medium">Experience</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange(value, 'yearsOfExperience')}
                      value={formData.yearsOfExperience}
                    >
                      <SelectTrigger className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 Year</SelectItem>
                        <SelectItem value="2-5">2-5 Years</SelectItem>
                        <SelectItem value="6+">6+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-800 font-medium">Location</Label>
                    <Input 
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter location"
                    />
                  </div>
                </div>
              </div>
              
              {/* Skills & Interests Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-blue-800 border-b pb-3">
                  <Code className="mr-3 h-6 w-6" />
                  Skills & Interests
                </h2>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="skills" className="text-gray-800 font-medium">Technical Skills</Label>
                    <Textarea 
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Java, Python, React, Machine Learning..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interests" className="text-gray-800 font-medium">Areas of Interest</Label>
                    <Textarea 
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Web Development, AI, Cloud Computing..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              {/* Social Links Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-blue-800 border-b pb-3">
                  <Linkedin className="mr-3 h-6 w-6" />
                  Professional Links
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="linkedinUrl" className="text-gray-800 font-medium">LinkedIn URL</Label>
                    <Input 
                      id="linkedinUrl"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="githubUrl" className="text-gray-800 font-medium">GitHub URL</Label>
                    <Input 
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>
              
              {/* Mentorship Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-blue-800 border-b pb-3">
                  <BookOpen className="mr-3 h-6 w-6" />
                  Mentorship Options
                </h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="availableForMentorship" className="text-gray-800 font-medium">Available for Mentorship?</Label>
                      <p className="text-sm text-gray-500 mt-1">Toggle to indicate mentorship availability</p>
                    </div>
                    <Switch 
                      id="availableForMentorship" 
                      checked={formData.availableForMentorship} 
                      onCheckedChange={handleSwitchChange} 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-gray-800 font-medium">Support Types</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <Input 
                          type="checkbox" 
                          id="mentorship" 
                          value="Mentorship" 
                          onChange={handleCheckboxChange} 
                          className="h-5 w-5"
                        />
                        <Label htmlFor="mentorship" className="text-gray-800">Career Mentorship</Label>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <Input 
                          type="checkbox" 
                          id="resumeReview" 
                          value="Resume Review" 
                          onChange={handleCheckboxChange} 
                          className="h-5 w-5"
                        />
                        <Label htmlFor="resumeReview" className="text-gray-800">Resume Review</Label>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <Input 
                          type="checkbox" 
                          id="jobReferrals" 
                          value="Job Referrals" 
                          onChange={handleCheckboxChange} 
                          className="h-5 w-5"
                        />
                        <Label htmlFor="jobReferrals" className="text-gray-800">Job Referrals</Label>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <Input 
                          type="checkbox" 
                          id="technicalGuidance" 
                          value="Technical Guidance" 
                          onChange={handleCheckboxChange} 
                          className="h-5 w-5"
                        />
                        <Label htmlFor="technicalGuidance" className="text-gray-800">Technical Guidance</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Documents Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-blue-800 border-b pb-3">
                  <FileText className="mr-3 h-6 w-6" />
                  Documents & Media
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <Label className="text-gray-800 font-medium block mb-4">Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-white border-blue-300 hover:bg-blue-100"
                        onClick={() => document.getElementById('profilePicture').click()}
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        {profilePictureFile ? 'Change File' : 'Upload Photo'}
                      </Button>
                      <Input
                        id="profilePicture"
                        type="file"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                        accept="image/*"
                      />
                      {profilePictureFile && (
                        <span className="text-sm text-blue-700 font-medium">
                          {profilePictureFile.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">JPEG or PNG, max 5MB</p>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <Label className="text-gray-800 font-medium block mb-4">Resume/CV</Label>
                    <div className="flex items-center gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-white border-purple-300 hover:bg-purple-100"
                        onClick={() => document.getElementById('resume').click()}
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        {resumeFile ? 'Change File' : 'Upload Resume'}
                      </Button>
                      <Input
                        id="resume"
                        type="file"
                        className="hidden"
                        onChange={handleResumeChange}
                        accept=".pdf,.doc,.docx"
                      />
                      {resumeFile && (
                        <span className="text-sm text-purple-700 font-medium">
                          {resumeFile.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">PDF or Word, max 10MB</p>
                  </div>
                </div>
              </div>
              
              {/* Short Bio Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                  <Code className="mr-2 h-5 w-5" />
                  Short Bio / Message to Students
                </h2>
                <div>
                  <Label htmlFor="shortBio" className="text-gray-700">Share a message with students</Label>
                  <Textarea 
                    id="shortBio"
                    name="shortBio"
                    value={formData.shortBio}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write a short bio or a message to current students"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-10">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? "Creating Profile..." : "Create My Profile"}
              </Button>
              <p className="text-center text-gray-500 mt-4 text-sm">
                By submitting, you agree to the platform's terms and conditions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileForm;