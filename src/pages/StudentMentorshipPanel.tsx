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
  User,
  Building2,
  AlertTriangle,
  GraduationCap,
  Video,
  FileText,
  Star
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
import { toast } from '@/hooks/use-toast';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  orderBy, 
  Timestamp,
  getDoc
} from 'firebase/firestore';

interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  requestDate: Timestamp;
  status: string;
  topic: string;
  message: string;
  mentorPhotoURL?: string;
}

interface ActiveMentorship {
  id: string;
  mentorId: string;
  mentorName: string;
  startDate: Timestamp;
  lastSessionDate?: Timestamp;
  topic: string;
  sessions: MentorshipSession[];
  status: 'active' | 'completed' | 'paused';
  mentorPhotoURL?: string;
  mentorExpertise?: string[];
  mentorPosition?: string;
}

interface MentorshipSession {
  id: string;
  date: Timestamp;
  duration: number; 
  topic: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
}

const StudentMentorshipPanel: React.FC = () => {
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [activeMentorships, setActiveMentorships] = useState<ActiveMentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMentorship, setSelectedMentorship] = useState<ActiveMentorship | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("You must be logged in to view your mentorships");
      setLoading(false);
      return;
    }

    // 1. Listen for my mentorship requests
    const requestsQuery = query(
      collection(db, "mentorshipRequests"),
      where("studentId", "==", currentUser.uid)
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requests: MentorshipRequest[] = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as MentorshipRequest);
      });
      setMentorshipRequests(requests);
    }, (error) => {
      console.error("Error fetching mentorship requests:", error);
      setError("Failed to load requests. Please try again later.");
    });

    // 2. Listen for my active mentorships
    const mentorshipsQuery = query(
      collection(db, "mentorships"),
      where("studentId", "==", currentUser.uid),
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
      console.error("Error fetching mentorships:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeMentorships();
    };
  }, []);

  // Handle cancelling a pending request
  const handleCancelRequest = async (requestId: string) => {
    try {
      const requestRef = doc(db, "mentorshipRequests", requestId);
      
      // Before deleting, let's verify it's still pending
      const requestSnap = await getDoc(requestRef);
      if (!requestSnap.exists()) {
        toast({
          title: "Request not found",
          description: "This request may have already been processed.",
          variant: "destructive"
        });
        return;
      }

      if (requestSnap.data().status.toLowerCase() !== 'pending') {
        toast({
          title: "Cannot cancel request",
          description: "This request has already been accepted or declined.",
          variant: "destructive"
        });
        return;
      }

      // Delete the request
      await updateDoc(requestRef, {
        status: 'Cancelled',
        cancelledAt: Timestamp.now()
      });
      
      // Actually, standard behavior for "cancel" before it's seen might be deletion, 
      // but marking as 'Cancelled' is better for history.
      // However, if the user expects it to DISAPPEAR, we should delete it or filter it out.
      // Let's mark it as cancelled for now.
      
      toast({
        title: "Success",
        description: "Mentorship request cancelled successfully.",
      });
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Format date from Timestamp
  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "Just now";
    try {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    } catch (e) {
      return "Just now";
    }
  };

  // Get filtered data
  const getFilteredRequests = () => {
    return mentorshipRequests.filter(r => {
      // Don't show cancelled requests in the main list
      if (r.status.toLowerCase() === 'cancelled') return false;

      const statusMatch = filterStatus === "all" || 
        r.status.toLowerCase() === filterStatus.toLowerCase();
      
      const name = r.mentorName || 'Alumni';
      const topic = r.topic || 'Mentorship';
      
      const searchMatch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          topic.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && searchMatch;
    });
  };

  const getFilteredMentorships = () => {
    return activeMentorships.filter(m => 
      (filterStatus === "all" || m.status === filterStatus) &&
      (m.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) || m.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // Stats
  const stats = {
    active: activeMentorships.filter(m => m.status.toLowerCase() === 'active').length,
    pending: mentorshipRequests.filter(r => r.status.toLowerCase() === 'pending').length,
    sessions: activeMentorships.reduce((acc, m) => acc + (m.sessions?.filter(s => s.status.toLowerCase() === 'completed').length || 0), 0),
    total: activeMentorships.length + mentorshipRequests.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Mentorship Dashboard
          </h1>
          <p className="text-gray-500 mt-1 flex items-center">
            <GraduationCap className="h-4 w-4 mr-2" />
            Connect with alumni and track your professional growth
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
          onClick={() => { /* Navigate to alumni directory */ }}
        >
          <Search className="h-4 w-4 mr-2" />
          Find New Mentor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Mentors', value: stats.active, icon: Handshake, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Requests', value: stats.pending, icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sessions Completed', value: stats.sessions, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Connections', value: stats.total, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white shadow-inner`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <TabsList className="bg-gray-100/50 p-1 rounded-xl">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              My Mentors
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Sent Requests
              {stats.pending > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full">
                  {stats.pending}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search mentors or topics..." 
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* My Mentors Tab */}
        <TabsContent value="active" className="mt-0">
          {getFilteredMentorships().length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm mb-4">
                <Handshake className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">No active mentorships yet</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                Once an alumni accepts your request, they will appear here as your active mentor.
              </p>
              <Button variant="outline" className="mt-6 rounded-xl">Explore Alumni Directory</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredMentorships().map((mentorship) => (
                <div key={mentorship.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center overflow-hidden ring-4 ring-indigo-50">
                            {mentorship.mentorPhotoURL ? (
                              <img src={mentorship.mentorPhotoURL} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-8 w-8 text-indigo-500" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {mentorship.mentorName}
                          </h3>
                          <p className="text-sm text-gray-500">{mentorship.mentorPosition || 'Senior Alumni Mentor'}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mentorship.mentorExpertise?.slice(0, 3).map((exp, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-none">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        mentorship.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600'
                      }>
                        {mentorship.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="font-medium">Focus:</span>
                        <span className="ml-2 text-gray-800">{mentorship.topic}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="font-medium">Started:</span>
                        <span className="ml-2">{formatDate(mentorship.startDate)}</span>
                      </div>
                    </div>

                    {/* Next Session Preview */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-bold text-gray-700 uppercase">Upcoming Session</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600">Scheduled</Badge>
                      </div>
                      <p className="text-sm mt-2 text-gray-600">
                        {mentorship.sessions?.find(s => s.status === 'scheduled')?.topic || 'No upcoming sessions scheduled'}
                      </p>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-50">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="flex-1 rounded-none py-6 h-auto hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Mentorship Sessions</DialogTitle>
                          <DialogDescription>Scheduled meetings with {mentorship.mentorName}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {mentorship.sessions?.length ? mentorship.sessions.map((session, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-100">
                              <div>
                                <p className="font-medium text-sm">{session.topic}</p>
                                <p className="text-xs text-gray-500">{formatDate(session.date)} • {session.duration}m</p>
                              </div>
                              <Button size="sm" variant={session.status === 'scheduled' ? 'default' : 'secondary'} disabled={session.status !== 'scheduled'}>
                                {session.status === 'scheduled' ? 'Join' : 'Completed'}
                              </Button>
                            </div>
                          )) : (
                            <p className="text-center text-gray-500 py-4">No sessions found.</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="w-[1px] bg-gray-50"></div>
                    <Button variant="ghost" className="flex-1 rounded-none py-6 h-auto hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab Content */}
        <TabsContent value="requests" className="mt-0">
          <div className="grid grid-cols-1 gap-4">
            {getFilteredRequests().length === 0 ? (
              <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No pending requests found.</p>
              </div>
            ) : (
              getFilteredRequests().map((request) => (
                <div key={request.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                      {(request.mentorName || 'A').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{request.mentorName || 'Alumni Mentor'}</h4>
                      <p className="text-sm text-gray-500">Requested: {formatDate(request.requestDate)}</p>
                    </div>
                  </div>
                  <div className="flex-1 px-4">
                    <p className="text-sm text-gray-700 font-medium line-clamp-1">Topic: {request.topic}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{request.message}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={
                      request.status.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                      request.status.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                      'bg-red-100 text-red-700 hover:bg-red-100'
                    }>
                      {request.status.toUpperCase()}
                    </Badge>
                    {(request.status === 'pending' || request.status === 'Pending') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentMentorshipPanel;
