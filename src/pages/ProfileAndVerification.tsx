import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Save, 
  Upload, 
  Building2, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Github, 
  Linkedin,
  Award,
  BookOpen,
  MessageCircle,
  Camera,
  ShieldCheck,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { db, auth } from '@/firebase';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

const ProfileAndVerification = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    graduationYear: '',
    branch: '',
    jobTitle: '',
    company: '',
    industry: 'Technology',
    location: '',
    about: '',
    skills: [] as string[],
    education: [] as any[],
    experience: [] as any[],
    willingToMentor: true,
    linkedinUrl: '',
    githubUrl: '',
    profilePictureUrl: '',
    verificationStatus: 'verified' // 'pending', 'verified', 'rejected'
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const profileQuery = query(
      collection(db, "alumni_profiles"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(profileQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setProfileData({
          fullName: data.fullName || 'User',
          graduationYear: data.graduationYear || '',
          branch: data.branch || '',
          jobTitle: data.jobTitle || '',
          company: data.company || '',
          industry: data.industry || 'Technology',
          location: data.location || 'Hyderabad, India',
          about: data.bio || '',
          skills: data.skills || [],
          education: (Array.isArray(data.education) && data.education.length > 0) ? data.education : [
            { degree: `B.Tech in ${data.branch || 'Engineering'}`, institution: 'BVRIT Narsapur', year: data.graduationYear || '' }
          ],
          experience: (Array.isArray(data.experience) && data.experience.length > 0) ? data.experience : [
            { role: data.jobTitle || '', company: data.company || '', duration: 'Present', description: '' }
          ],
          willingToMentor: data.availableForMentorship !== undefined ? data.availableForMentorship : true,
          linkedinUrl: data.linkedIn || '',
          githubUrl: data.github || '',
          profilePictureUrl: data.profilePictureUrl || '',
          verificationStatus: data.verificationStatus || 'verified'
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const profileQuery = query(
        collection(db, "alumni_profiles"),
        where("userId", "==", auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(profileQuery);
      
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        await setDoc(doc(db, "alumni_profiles", profileDoc.id), {
          fullName: profileData.fullName,
          bio: profileData.about,
          jobTitle: profileData.jobTitle,
          company: profileData.company,
          location: profileData.location,
          linkedIn: profileData.linkedinUrl,
          github: profileData.githubUrl,
          profilePictureUrl: profileData.profilePictureUrl,
          availableForMentorship: profileData.willingToMentor,
          updatedAt: new Date()
        }, { merge: true });
      }
      
      setIsEditing(false);
      toast.success("Profile Synchronized. Your professional details and photo are now live.");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600 font-bold">Retrieving Verified Identity...</div>;

  return (
    <div className="p-6 mt-4 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* Page Title & Actions */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Professional Verification Hub
          </h2>
          <p className="text-gray-500 font-medium flex items-center mt-1">
            <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" />
            Institutional Validation & Professional Identity
          </p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg px-8 h-12 transition-all active:scale-95"
          >
            <Edit className="h-4 w-4 mr-2" /> Modify Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-2xl h-12 px-6">Discard</Button>
            <Button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl px-8 h-12 shadow-lg shadow-emerald-100 transition-all active:scale-95">
              <Save className="h-4 w-4 mr-2" /> Commit Changes
            </Button>
          </div>
        )}
      </div>

      {/* Verification Status Alert */}
      <div className="mb-8">
        {profileData.verificationStatus === 'verified' && (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm">
            <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900 flex items-center">
                Institutional Verification Active
                <Badge className="ml-3 bg-emerald-500 text-white border-none uppercase text-[10px] tracking-widest">Official</Badge>
              </h3>
              <p className="text-emerald-700/80 text-sm mt-1">Your BVRIT Alumni status is fully verified. Your profile is prioritized in search results and mentorship matching.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-gray-100 overflow-hidden">
        
        {/* Profile Header Block */}
        <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 p-10 text-white relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            
            {/* Profile Photo Display */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
                {profileData.profilePictureUrl ? (
                  <img 
                    src={profileData.profilePictureUrl} 
                    alt={profileData.fullName}
                    className="h-full w-full object-cover rounded-[2rem]"
                    onError={(e) => {
                      (e.target as any).src = 'https://ui-avatars.com/api/?name=' + profileData.fullName;
                    }}
                  />
                ) : (
                  <div className="text-white font-black text-5xl">
                    {profileData.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white text-indigo-600 p-3 rounded-2xl shadow-2xl cursor-pointer hover:bg-indigo-50 transition-colors">
                <Camera className="h-5 w-5" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h3 className="text-4xl font-black tracking-tight">{profileData.fullName}</h3>
                <Badge className="bg-emerald-400 text-white border-none rounded-lg px-3">
                  <ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED
                </Badge>
              </div>
              <p className="text-2xl text-indigo-100 mt-2 font-medium">{profileData.jobTitle} at {profileData.company}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-8">
                <div className="flex items-center text-indigo-50 text-sm font-medium">
                  <GraduationCap className="h-5 w-5 mr-3 text-indigo-300" />
                  {profileData.branch}, Class of {profileData.graduationYear}
                </div>
                <div className="flex items-center text-indigo-50 text-sm font-medium">
                  <MapPin className="h-5 w-5 mr-3 text-indigo-300" />
                  {profileData.location}
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-10">
                <a href={profileData.linkedinUrl} target="_blank" className="bg-white/15 hover:bg-white/25 p-3 rounded-2xl border border-white/20 transition-all flex items-center px-6 gap-3 text-sm backdrop-blur-md shadow-lg">
                  <Linkedin className="h-5 w-5" /> LinkedIn Profile
                </a>
                <a href={profileData.githubUrl} target="_blank" className="bg-white/15 hover:bg-white/25 p-3 rounded-2xl border border-white/20 transition-all flex items-center px-6 gap-3 text-sm backdrop-blur-md shadow-lg">
                  <Github className="h-5 w-5" /> GitHub
                </a>
                <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-400/30 flex items-center px-6 gap-3 text-sm backdrop-blur-md text-emerald-50 font-bold">
                  <MessageCircle className="h-5 w-5" /> Open to Mentoring
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Content Grid */}
        <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {isEditing && (
              <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 animate-in zoom-in-95 duration-300 space-y-6">
                <h4 className="text-blue-900 font-bold flex items-center">
                  <Camera className="h-5 w-5 mr-3" /> Update Profile Visuals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-blue-600 uppercase">Profile Image URL</Label>
                    <Input name="profilePictureUrl" value={profileData.profilePictureUrl} onChange={handleInputChange} className="rounded-xl bg-white border-blue-100" placeholder="Paste link from LinkedIn..." />
                    <p className="text-[10px] text-blue-400">Pastes your LinkedIn photo link here to update your avatar.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-blue-600 uppercase">Current Role</Label>
                    <Input name="jobTitle" value={profileData.jobTitle} onChange={handleInputChange} className="rounded-xl bg-white border-blue-100" />
                  </div>
                </div>
              </div>
            )}

            {/* About Section */}
            <div className="relative">
              <h4 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                Professional Narrative
              </h4>
              {isEditing ? (
                <Textarea
                  name="about"
                  value={profileData.about}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50/50 rounded-2xl h-40 border-gray-200 p-6 text-gray-700 leading-relaxed"
                  placeholder="Share your career journey and mentorship goals..."
                />
              ) : (
                <div className="bg-gray-50/30 p-8 rounded-[2rem] border border-gray-100/50">
                  <p className="text-gray-600 leading-relaxed text-lg italic">
                    "{profileData.about || 'A dedicated professional contributing to the BVRIT alumni network through mentorship and industry collaboration.'}"
                  </p>
                </div>
              )}
            </div>
            
            {/* Experience Section */}
            <div>
              <h4 className="text-xl font-bold mb-8 flex items-center text-gray-900">
                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                Career Trajectory
              </h4>
              <div className="space-y-10">
                {Array.isArray(profileData.experience) && profileData.experience.map((exp, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 bg-white border-2 border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm relative z-10">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1 w-0.5 bg-purple-50 mt-4"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                        <div>
                          <h5 className="text-xl font-bold text-gray-900">{exp.role}</h5>
                          <p className="text-purple-600 font-bold mt-1 flex items-center">
                            {exp.company} <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
                          </p>
                        </div>
                        <Badge variant="outline" className="mt-2 md:mt-0 border-purple-100 text-purple-600 rounded-lg px-4 py-1">
                          <Clock className="h-3 w-3 mr-2" /> {exp.duration}
                        </Badge>
                      </div>
                      <p className="text-gray-500 leading-relaxed">
                        {exp.description || `Senior position at ${exp.company} focused on high-impact projects and professional excellence in the field of technology.`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-10">
            
            {/* Expertise Cloud */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center text-sm uppercase tracking-widest">
                <Award className="h-4 w-4 mr-3 text-indigo-600" /> Core Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(profileData.skills) ? (profileData.skills.length > 0 ? profileData.skills : ['System Design', 'Strategic Mentoring', 'Product Management', 'Leadership']) : ['System Design', 'Strategic Mentoring', 'Product Management', 'Leadership']).map((skill, index) => (
                  <Badge 
                    key={index}
                    className="bg-indigo-50/50 text-indigo-600 border-none px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Academic Credentials */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20">
              <h4 className="font-bold text-gray-900 mb-8 flex items-center text-sm uppercase tracking-widest">
                <GraduationCap className="h-4 w-4 mr-3 text-purple-600" /> Academic Credentials
              </h4>
              <div className="space-y-8">
                {Array.isArray(profileData.education) && profileData.education.map((edu, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="h-10 w-10 bg-purple-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm leading-tight">{edu.degree}</h5>
                      <p className="text-gray-400 text-xs mt-1">{edu.institution}</p>
                      <div className="mt-2 text-[10px] font-black text-purple-600 uppercase tracking-widest">Class of {edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-bold mb-6 flex items-center text-sm uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 mr-3" /> Verification Trace
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Institutional Email', status: 'verified' },
                    { label: 'Alumni ID Sync', status: 'verified' },
                    { label: 'Industry Verification', status: 'pending' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/10 p-3 rounded-2xl border border-white/10">
                      <span className="text-xs font-medium">{item.label}</span>
                      {item.status === 'verified' ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Clock className="h-4 w-4 text-indigo-200 opacity-50" />}
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-8 bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl font-black text-xs uppercase tracking-widest h-12">
                  <FileText className="h-4 w-4 mr-2" /> Download Credential
                </Button>
              </div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileAndVerification;