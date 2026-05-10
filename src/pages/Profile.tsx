import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Briefcase, 
  User, 
  Save, 
  Users, 
  FileText, 
  Paperclip, 
  Camera, 
  MapPin, 
  Linkedin, 
  Mail,
  GraduationCap,
  Award,
  Clock
} from 'lucide-react';
import { db, auth } from '@/firebase';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc,
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mentorships: 0,
    events: 0,
    opportunities: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    interests: '',
    skills: '',
    graduationYear: '',
    company: '',
    position: '',
    profilePictureUrl: '',
    linkedin: '',
    branch: '',
    location: ''
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // 1. Real-time User Data
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentUser({ id: docSnap.id, ...data });
        setFormData({
          name: data.fullName || data.name || '',
          bio: data.bio || '',
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || ''),
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
          graduationYear: data.graduationYear || '',
          company: data.company || '',
          position: data.position || '',
          profilePictureUrl: data.profilePictureUrl || '',
          linkedin: data.linkedin || '',
          branch: data.branch || '',
          location: data.location || 'Hyderabad, India'
        });
      }
      setLoading(false);
    });

    // 2. Fetch Stats
    const fetchStats = async () => {
      const mentorshipsQ = query(collection(db, "mentorships"), where("mentorId", "==", user.uid));
      const mSnap = await getDocs(mentorshipsQ);
      
      const oppsQ = query(collection(db, "opportunities"), where("postedBy", "==", user.uid));
      const oSnap = await getDocs(oppsQ);

      setStats({
        mentorships: mSnap.size,
        events: 0,
        opportunities: oSnap.size
      });
    };

    fetchStats();
    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        fullName: formData.name,
        bio: formData.bio,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
        skills: formData.skills.split(',').map(i => i.trim()).filter(i => i),
        graduationYear: formData.graduationYear,
        company: formData.company,
        position: formData.position,
        linkedin: formData.linkedin,
        branch: formData.branch,
        location: formData.location,
        profilePictureUrl: formData.profilePictureUrl,
        updatedAt: new Date()
      }, { merge: true });
      
      toast({
        title: "Profile Updated",
        description: "Your professional details are now live.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error saving your changes.",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Synchronizing your professional profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Premium Profile Header */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative h-full">
          <div className="absolute -bottom-16 left-4 md:left-8 flex flex-col md:flex-row items-end gap-6">
            <div className="relative group">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl bg-white p-1 shadow-2xl overflow-hidden ring-4 ring-white/20">
                {formData.profilePictureUrl ? (
                  <img src={formData.profilePictureUrl} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <div className="h-full w-full bg-blue-50 flex items-center justify-center rounded-2xl">
                    <User className="h-16 w-16 text-blue-200" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 text-white md:text-gray-900 pb-2">
              <h1 className="text-3xl font-black md:text-white drop-shadow-md">{formData.name}</h1>
              <p className="text-blue-100 flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-2" />
                {formData.position} at {formData.company}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-blue-50">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {formData.location}</span>
                <span className="flex items-center"><GraduationCap className="h-4 w-4 mr-1" /> Class of {formData.graduationYear}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Socials */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-md">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-600 flex items-center">
                  <Award className="h-4 w-4 mr-2" /> Mentorship Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-2xl font-black text-blue-600">{stats.mentorships}</p>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Mentees</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl">
                    <p className="text-2xl font-black text-purple-600">{stats.opportunities}</p>
                    <p className="text-[10px] font-bold text-purple-400 uppercase">Jobs Posted</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">LinkedIn Profile</span>
                    <a href={formData.linkedin} target="_blank" className="text-blue-600 font-bold hover:underline flex items-center">
                      View <Linkedin className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Official Email</span>
                    <span className="text-gray-900 font-medium truncate ml-4">{currentUser?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm p-6 bg-white">
              <h3 className="font-bold text-gray-900 mb-4">Core Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {formData.skills.split(',').map((skill, i) => (
                  <Badge key={i} className="bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-none rounded-lg px-3 py-1 transition-colors">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Edit Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <Tabs defaultValue="details" className="w-full">
                <div className="px-8 pt-6 border-b border-gray-50">
                  <TabsList className="bg-transparent gap-8 p-0 h-12">
                    <TabsTrigger value="details" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 font-bold text-gray-400 data-[state=active]:text-blue-600">
                      Professional Details
                    </TabsTrigger>
                    <TabsTrigger value="experience" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 font-bold text-gray-400 data-[state=active]:text-blue-600">
                      Experience & Bio
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="details" className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Full Name</Label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl bg-gray-50 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Current Position</Label>
                      <Input value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="rounded-xl bg-gray-50 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Company</Label>
                      <Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="rounded-xl bg-gray-50 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Location</Label>
                      <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="rounded-xl bg-gray-50 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Profile Image URL</Label>
                      <Input 
                        value={formData.profilePictureUrl} 
                        onChange={e => setFormData({...formData, profilePictureUrl: e.target.value})} 
                        className="rounded-xl bg-gray-50 border-none" 
                        placeholder="Paste image link from LinkedIn, etc." 
                      />
                      <p className="text-[10px] text-gray-400">Right-click a photo online and select "Copy Image Address" to get a link.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">LinkedIn URL</Label>
                      <Input value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="rounded-xl bg-gray-50 border-none" placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Graduation Year</Label>
                      <Input value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: e.target.value})} className="rounded-xl bg-gray-50 border-none" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Professional Bio</Label>
                    <Textarea 
                      value={formData.bio} 
                      onChange={e => setFormData({...formData, bio: e.target.value})} 
                      className="rounded-2xl bg-gray-50 border-none min-h-[150px]" 
                      placeholder="Share your journey and how you can help students..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Interests (Separated by commas)</Label>
                    <Input value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})} className="rounded-xl bg-gray-50 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Skills (Separated by commas)</Label>
                    <Input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="rounded-xl bg-gray-50 border-none" />
                  </div>
                </TabsContent>

                <div className="p-8 border-t border-gray-50 flex justify-end gap-4">
                  <Button variant="ghost" className="rounded-xl" onClick={() => navigate(-1)}>Discard</Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 shadow-md">
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
