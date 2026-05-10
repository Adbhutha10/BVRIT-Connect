import React, { useState, useEffect } from 'react';
import { 
  Handshake, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Calendar, 
  Search,
  Filter,
  Trash2,
  BarChart,
  User,
  Building2,
  AlertTriangle,
  Users,
  Video,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  orderBy, 
  Timestamp,
  getDocs
} from 'firebase/firestore';

interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentBranch: string;
  studentYear: string;
  requestDate: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
  topic: string;
  message: string;
  studentPhotoURL?: string;
}

interface ActiveMentorship {
  id: string;
  studentId: string;
  studentName: string;
  studentBranch: string;
  studentYear: string;
  studentPhotoURL?: string;
  startDate: Timestamp;
  lastSessionDate?: Timestamp;
  topic: string;
  sessions: MentorshipSession[];
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

interface MentorshipSession {
  id: string;
  date: Timestamp;
  duration: number; // in minutes
  topic: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const MentorshipPanel: React.FC = () => {
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [activeMentorships, setActiveMentorships] = useState<ActiveMentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMentorship, setSelectedMentorship] = useState<ActiveMentorship | null>(null);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    date: "",
    time: "",
    duration: 30,
    topic: "",
    notes: ""
  });
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("You must be logged in to view mentorship data");
      setLoading(false);
      return;
    }

    // Requests Query
    const requestsQuery = query(
      collection(db, "mentorshipRequests"),
      where("mentorId", "==", currentUser.uid),
      orderBy("requestDate", "desc")
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requests: MentorshipRequest[] = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as MentorshipRequest);
      });
      setMentorshipRequests(requests);
    }, (error) => {
      console.error("Error fetching mentorship requests:", error);
      setError("Error loading requests. Ensure Firestore indexes are built.");
    });

    // Mentorships Query
    const mentorshipsQuery = query(
      collection(db, "mentorships"),
      where("mentorId", "==", currentUser.uid),
      orderBy("startDate", "desc")
    );

    const unsubscribeMentorships = onSnapshot(mentorshipsQuery, (snapshot) => {
      const mentorships: ActiveMentorship[] = [];
      snapshot.forEach((doc) => {
        mentorships.push({ id: doc.id, ...doc.data() } as ActiveMentorship);
      });
      setActiveMentorships(mentorships);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching active mentorships:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeMentorships();
    };
  }, []);

  const handleAcceptRequest = async (request: MentorshipRequest) => {
    try {
      const requestRef = doc(db, "mentorshipRequests", request.id);
      await updateDoc(requestRef, { status: "accepted" });

      const mentorshipData = {
        mentorId: auth.currentUser?.uid,
        studentId: request.studentId,
        studentName: request.studentName,
        studentBranch: request.studentBranch,
        studentYear: request.studentYear,
        studentPhotoURL: request.studentPhotoURL,
        startDate: Timestamp.now(),
        topic: request.topic,
        sessions: [],
        status: "active",
        requestId: request.id
      };

      await addDoc(collection(db, "mentorships"), mentorshipData);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (request: MentorshipRequest) => {
    try {
      const requestRef = doc(db, "mentorshipRequests", request.id);
      await updateDoc(requestRef, { status: "rejected" });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleAddSession = async () => {
    if (!selectedMentorship) return;
    try {
      const sessionDate = new Date(`${newSessionData.date}T${newSessionData.time}`);
      const newSession: MentorshipSession = {
        id: Date.now().toString(),
        date: Timestamp.fromDate(sessionDate),
        duration: newSessionData.duration,
        topic: newSessionData.topic,
        notes: newSessionData.notes,
        status: "scheduled"
      };
      
      const mentorshipRef = doc(db, "mentorships", selectedMentorship.id);
      const updatedSessions = [...(selectedMentorship.sessions || []), newSession];
      await updateDoc(mentorshipRef, {
        sessions: updatedSessions,
        lastUpdated: Timestamp.now()
      });
      
      setNewSessionDialogOpen(false);
    } catch (error) {
      console.error("Error adding session:", error);
    }
  };

  // Stats
  const stats = {
    pending: mentorshipRequests.filter(r => r.status === 'pending').length,
    active: activeMentorships.filter(m => m.status === 'active').length,
    completed: activeMentorships.filter(m => m.status === 'completed').length,
    total: mentorshipRequests.length
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading mentorship dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Alumni Mentorship Panel
        </h1>
        <p className="text-gray-500 mt-1 flex items-center">
          <Handshake className="h-4 w-4 mr-2" />
          Empower the next generation through expert guidance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Requests', value: stats.pending, icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Students', value: stats.active, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Requests', value: stats.total, icon: BarChart, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm hover:scale-[1.02] transition-transform`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-inner">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <TabsList className="bg-gray-100/80 p-1 rounded-xl">
            <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              New Requests
              {stats.pending > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{stats.pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              My Mentees
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search students..." 
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="requests" className="mt-0">
          {mentorshipRequests.filter(r => r.status === 'pending').length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
              <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No pending requests</h3>
              <p className="text-gray-500">Student requests will appear here when they seek your mentorship.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {mentorshipRequests.filter(r => r.status === 'pending').map((request) => (
                <div key={request.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-indigo-200 transition-colors">
                  <div className="flex gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                      {request.studentPhotoURL ? <img src={request.studentPhotoURL} className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-gray-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.studentName}</h3>
                      <p className="text-sm text-gray-500">{request.studentBranch} • Year {request.studentYear}</p>
                      <div className="mt-3">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-none">Topic: {request.topic}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-4 rounded-xl italic">"{request.message}"</p>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col justify-end gap-2">
                    <Button onClick={() => handleAcceptRequest(request)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                      <CheckCircle className="h-4 w-4 mr-2" /> Accept
                    </Button>
                    <Button onClick={() => handleRejectRequest(request)} variant="outline" className="rounded-xl text-red-600 hover:bg-red-50 border-red-100">
                      <XCircle className="h-4 w-4 mr-2" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-0">
          {activeMentorships.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
              <Handshake className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No active mentees</h3>
              <p className="text-gray-500">Accept a request to start your mentorship journey.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeMentorships.map((mentorship) => (
                <div key={mentorship.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden">
                          {mentorship.studentPhotoURL ? <img src={mentorship.studentPhotoURL} className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-indigo-400" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{mentorship.studentName}</h3>
                          <p className="text-sm text-gray-500">{mentorship.studentBranch}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-none">{mentorship.status.toUpperCase()}</Badge>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="font-bold mr-2 text-gray-800">Goal:</span> {mentorship.topic}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="font-bold mr-2 text-gray-800">Started:</span> {formatDate(mentorship.startDate)}
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-bold text-gray-700">NEXT SESSION</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {mentorship.sessions?.find(s => s.status === 'scheduled')?.topic || 'None scheduled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-50">
                    <Dialog open={newSessionDialogOpen} onOpenChange={setNewSessionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="flex-1 rounded-none py-6 h-auto hover:bg-indigo-50 hover:text-indigo-600"
                          onClick={() => setSelectedMentorship(mentorship)}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Schedule Session</DialogTitle>
                          <DialogDescription>Arrange a meeting with {selectedMentorship?.studentName}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input type="date" value={newSessionData.date} onChange={e => setNewSessionData({...newSessionData, date: e.target.value})} />
                            <Input type="time" value={newSessionData.time} onChange={e => setNewSessionData({...newSessionData, time: e.target.value})} />
                          </div>
                          <Input placeholder="Session Topic" value={newSessionData.topic} onChange={e => setNewSessionData({...newSessionData, topic: e.target.value})} />
                          <Select value={newSessionData.duration.toString()} onValueChange={v => setNewSessionData({...newSessionData, duration: parseInt(v)})}>
                            <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 Minutes</SelectItem>
                              <SelectItem value="60">60 Minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddSession} className="w-full bg-indigo-600">Create Session</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <div className="w-[1px] bg-gray-50"></div>
                    <Button variant="ghost" className="flex-1 rounded-none py-6 h-auto hover:bg-indigo-50 hover:text-indigo-600">
                      <MessageCircle className="h-4 w-4 mr-2" /> Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorshipPanel;