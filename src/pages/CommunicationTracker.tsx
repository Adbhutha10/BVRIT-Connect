import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  MessageSquare, 
  Handshake, 
  Calendar, 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Download,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  Plus,
  X,
  TrendingUp,
  Star,
  MoreVertical,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore';

const CommunicationTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    averageRating: 0,
    upcomingSessions: 0,
    uniqueStudents: 0
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const meetingsQuery = query(
      collection(db, "meetings"),
      where("mentorId", "==", currentUser.uid),
      orderBy("dateTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(meetingsQuery, (snapshot) => {
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().dateTimestamp?.toDate().toLocaleDateString() || 'N/A',
        time: doc.data().timeString || 'N/A'
      }));
      
      setCommunications(meetingsData);
      calculateStats(meetingsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching communications:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const calculateStats = (data: any[]) => {
    const completed = data.filter(c => c.status === 'Completed' || c.status === 'completed');
    const scheduled = data.filter(c => c.status === 'Scheduled' || c.status === 'scheduled');
    
    setStats({
      totalSessions: completed.length,
      totalHours: completed.reduce((sum, c) => sum + (parseInt(c.duration) || 30), 0) / 60,
      averageRating: 4.8, // Mocked rating for now
      upcomingSessions: scheduled.length,
      uniqueStudents: new Set(data.map(c => c.studentId)).size
    });
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading communication impact...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
            Communication & Impact
          </h1>
          <p className="text-gray-500 mt-1 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Track your mentorship footprint and student interactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200">
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md">
            <Plus className="h-4 w-4 mr-2" /> New Interaction
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: stats.totalSessions, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Hours Gifted', value: stats.totalHours.toFixed(1), icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Rating', value: `${stats.averageRating}/5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Upcoming', value: stats.upcomingSessions, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Mentees', value: stats.uniqueStudents, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <stat.icon className={`h-5 w-5 ${stat.color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100/80 p-1 rounded-xl mb-8">
          <TabsTrigger value="analytics" className="rounded-lg px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Impact Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Interaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <BarChart className="h-5 w-5 mr-3 text-blue-600" />
                Mentorship Growth
              </h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="w-full bg-blue-100 group-hover:bg-blue-500 rounded-t-xl transition-all duration-500 cursor-pointer relative"
                      style={{ height: `${[20, 45, 30, 65, 55, 85, 40][i]}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {[5, 12, 8, 15, 13, 20, 10][i]} sessions
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-4 font-medium">{month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Mentor Spotlight</h3>
                <p className="text-blue-100 text-sm mb-6">You're in the top 5% of active mentors this month!</p>
                
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <p className="text-xs text-blue-100 uppercase tracking-widest font-bold">Most Active Topic</p>
                    <p className="text-xl font-bold mt-1">Career Strategy</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <p className="text-xs text-blue-100 uppercase tracking-widest font-bold">Student Rating</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xl font-bold mr-2">4.9</p>
                      <div className="flex text-amber-400"><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /></div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-8 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold">
                  View Achievements
                </Button>
              </div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search interactions..." className="pl-10 rounded-xl bg-gray-50 border-none" />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full"><Filter className="h-4 w-4 text-gray-400" /></Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type / Topic</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {communications.map((comm) => (
                    <tr key={comm.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                            {comm.studentName?.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">{comm.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{comm.type || 'Mentorship'}</span>
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">{comm.topic}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span className="font-bold text-gray-800">{comm.date}</span>
                          <span className="text-gray-400">{comm.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`border-none rounded-lg px-3 py-1 ${
                          comm.status?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          comm.status?.toLowerCase() === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {comm.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center text-sm">
              <p className="text-gray-500">Showing <span className="font-bold">{communications.length}</span> records</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg h-8 border-gray-200">Previous</Button>
                <Button variant="outline" size="sm" className="rounded-lg h-8 border-gray-200">Next</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationTracker;