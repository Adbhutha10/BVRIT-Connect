import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MessageCircle, 
  Video,
  CheckCircle,
  XCircle,
  VideoIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

// Firebase imports
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '@/firebase';

const StudentMeetings = () => {
  const user = auth.currentUser;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch all meetings and filter in memory to avoid composite index requirement
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "meetings"),
      where("studentId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcoming = [];
      const past = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const meetingDate = data.dateTimestamp?.toDate() || new Date(0);
        
        const meetingInfo = {
          id: doc.id,
          ...data,
          date: data.dateString
        };
        
        if (meetingDate >= today) {
          upcoming.push(meetingInfo);
        } else {
          past.push(meetingInfo);
        }
      });
      
      // Sort upcoming (ascending)
      upcoming.sort((a, b) => {
        const dateA = a.dateTimestamp?.toDate().getTime() || 0;
        const dateB = b.dateTimestamp?.toDate().getTime() || 0;
        if (dateA !== dateB) return dateA - dateB;
        return (a.timeString || "").localeCompare(b.timeString || "");
      });
      
      // Sort past (descending)
      past.sort((a, b) => {
        const dateA = a.dateTimestamp?.toDate().getTime() || 0;
        const dateB = b.dateTimestamp?.toDate().getTime() || 0;
        if (dateA !== dateB) return dateB - dateA;
        return (b.timeString || "").localeCompare(a.timeString || "");
      });
      
      setUpcomingMeetings(upcoming);
      setPastMeetings(past);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching meetings:", error);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">Scheduled Meetings</h2>
        <p className="text-gray-600 font-medium">View and join your upcoming mentorship sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Upcoming</p>
            <p className="text-2xl font-bold text-blue-900">{upcomingMeetings.length}</p>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <CheckCircle className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-800">Completed</p>
            <p className="text-2xl font-bold text-indigo-900">{pastMeetings.length}</p>
          </div>
        </div>
      </div>

      {/* Meetings Tabs */}
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-gray-100/80 p-1 rounded-xl">
          <TabsTrigger value="upcoming" className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="past" className="px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Past Meetings</TabsTrigger>
        </TabsList>

        {/* Upcoming Meetings */}
        <TabsContent value="upcoming" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <Card key={meeting.id} className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{meeting.mentorName}</h4>
                          <p className="text-xs text-gray-500">Mentor</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                        {meeting.status || 'Scheduled'}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{meeting.topic}</h3>
                    
                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl">
                      <div className="flex items-center text-sm text-gray-700">
                        <CalendarIcon className="h-4 w-4 mr-3 text-blue-500" /> 
                        <span className="font-medium">{meeting.dateString}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock className="h-4 w-4 mr-3 text-blue-500" /> 
                        <span className="font-medium">{meeting.timeString}</span>
                        <span className="ml-2 text-gray-500">({meeting.duration})</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <VideoIcon className="h-4 w-4 mr-3 text-blue-500" /> 
                        <span className="font-medium">{meeting.platform}</span>
                      </div>
                    </div>
                    
                    {meeting.notes && (
                      <div className="mb-6 text-sm text-gray-600 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100/50">
                        <span className="font-semibold block mb-1">Agenda / Notes:</span> 
                        {meeting.notes}
                      </div>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      {meeting.link ? (
                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                            onClick={() => window.open(meeting.link, '_blank')}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                          <p className="text-sm text-amber-700 flex items-center justify-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Waiting for mentor to provide link
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm mb-4">
                  <CalendarIcon className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">No upcoming meetings</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  When your mentor schedules a chat, it will appear here.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Past Meetings */}
        <TabsContent value="past" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastMeetings.length > 0 ? (
              pastMeetings.map((meeting) => (
                <Card key={meeting.id} className="p-6 border border-gray-100 opacity-80 hover:opacity-100 transition-opacity rounded-3xl">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-700">{meeting.mentorName}</h4>
                        </div>
                      </div>
                      <Badge className={meeting.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 border-none'}>
                        {meeting.status === 'Cancelled' ? 'Cancelled' : 'Completed'}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{meeting.topic}</h3>
                    
                    <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-3" /> 
                        <span>{meeting.dateString} at {meeting.timeString}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MessageCircle className="h-4 w-4 mr-3" /> 
                        <span>{meeting.duration} via {meeting.platform}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No past meetings found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentMeetings;
