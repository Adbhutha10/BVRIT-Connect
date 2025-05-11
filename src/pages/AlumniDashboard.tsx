import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Handshake, 
  BookOpen, 
  MessageCircle, 
  Settings, 
  Home, 
  ChevronRight, 
  Bell, 
  User,
  Clock,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
  BarChart,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  CheckCircle,
  XCircle,
  Building2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ChatbotUI from '@/components/Chatbot/ChatbotUI';
import StudentDirectory from '@/pages/StudentDirectory';
import AlumniEvent from '@/pages/AlumniEvent';
import AlumniOpportunities from '@/pages/AlumniOpportunities';
import AlumniCommunity from '@/pages/AlumniCommunity';
import MentorshipPanel from '@/pages/MentorshipPanel';
import RequestLists from '@/pages/RequestLists';
import ChatScheduling from '@/pages/ChatScheduling';
import CommunicationTracker from '@/pages/CommunicationTracker';
import ProfileAndVerification from '@/pages/ProfileAndVerification';
import AlumniSettings from '@/pages/AlumniSettings';

// Firebase imports
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc
} from 'firebase/firestore';

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [alumniProfile, setAlumniProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // States for real-time data
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mentorshipActivity, setMentorshipActivity] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [postedOpportunities, setPostedOpportunities] = useState([]);
  const [communitiesManaged, setCommunitiesManaged] = useState([]);
  
  // Dashboard metrics
  const [metrics, setMetrics] = useState({
    pendingRequestsCount: 0,
    studentsmentored: 0,
    upcomingMeetingsCount: 0,
    eventsRegisteredCount: 0
  });

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        // If not authenticated, redirect to login
        navigate('/login');
        return;
      }
      
      // Get alumni profile
      const getAlumniProfile = async () => {
        const profileQuery = query(
          collection(db, 'alumni_profiles'),
          where('userId', '==', user.uid)
        );
        
        try {
          const profileSnapshot = await getDocs(profileQuery);
          if (!profileSnapshot.empty) {
            setAlumniProfile({
              id: profileSnapshot.docs[0].id,
              ...profileSnapshot.docs[0].data()
            });
          } else {
            // If user doesn't have an alumni profile, redirect to create one
            navigate('/alumni/create-profile');
          }
        } catch (error) {
          console.error("Error getting alumni profile:", error);
        }
      };
      
      getAlumniProfile();
    });
    
    return () => unsubscribeAuth();
  }, [navigate]);

  // Load notifications when alumni profile is available
  useEffect(() => {
    if (!alumniProfile) return;
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', alumniProfile.userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        read: doc.data().readAt !== null,
        time: formatTimestamp(doc.data().timestamp)
      }));
      
      setNotifications(notificationsList);
    });
    
    return () => unsubscribeNotifications();
  }, [alumniProfile]);

  // Load pending mentorship requests
  useEffect(() => {
    if (!alumniProfile) return;
    
    const requestsQuery = query(
      collection(db, 'mentorshipRequests'),
      where('mentorId', '==', alumniProfile.userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeRequests = onSnapshot(requestsQuery, async (snapshot) => {
      const requestsList = [];
      
      // Process each document
      for (const doc of snapshot.docs) {
        const requestData = doc.data();
        
        // Get student details
        try {
          const studentQuery = query(
            collection(db, 'students'),
            where('userId', '==', requestData.studentId)
          );
          
          const studentSnapshot = await getDocs(studentQuery);
          if (!studentSnapshot.empty) {
            const studentData = studentSnapshot.docs[0].data();
            
            requestsList.push({
              id: doc.id,
              student: studentData.fullName,
              branch: studentData.branch,
              year: `${studentData.year}${getYearSuffix(studentData.year)} Year`,
              requestType: requestData.type,
              date: formatTimestamp(requestData.createdAt),
              studentId: requestData.studentId
            });
          }
        } catch (error) {
          console.error("Error getting student details:", error);
        }
      }
      
      setPendingRequests(requestsList);
      setMetrics(prev => ({...prev, pendingRequestsCount: requestsList.length}));
    });
    
    return () => unsubscribeRequests();
  }, [alumniProfile]);

  // Load mentorship activity
  useEffect(() => {
    if (!alumniProfile) return;
    
    const mentorshipsQuery = query(
      collection(db, 'mentorships'),
      where('mentorId', '==', alumniProfile.userId),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );
    
    const unsubscribeMentorships = onSnapshot(mentorshipsQuery, async (snapshot) => {
      const mentorshipsList = [];
      let mentorshipCount = 0;
      
      for (const doc of snapshot.docs) {
        const mentorshipData = doc.data();
        
        try {
          const studentQuery = query(
            collection(db, 'students'),
            where('userId', '==', mentorshipData.studentId)
          );
          
          const studentSnapshot = await getDocs(studentQuery);
          if (!studentSnapshot.empty) {
            const studentData = studentSnapshot.docs[0].data();
            
            mentorshipsList.push({
              id: doc.id,
              student: studentData.fullName,
              topic: mentorshipData.topic,
              status: mentorshipData.status,
              date: formatTimestamp(mentorshipData.updatedAt || mentorshipData.createdAt)
            });
            
            if (mentorshipData.status === 'active' || mentorshipData.status === 'completed') {
              mentorshipCount++;
            }
          }
        } catch (error) {
          console.error("Error getting student details for mentorship:", error);
        }
      }
      
      setMentorshipActivity(mentorshipsList);
      setMetrics(prev => ({...prev, studentsmentored: mentorshipCount}));
    });
    
    return () => unsubscribeMentorships();
  }, [alumniProfile]);

  // Load upcoming meetings
  useEffect(() => {
    if (!alumniProfile) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const meetingsQuery = query(
      collection(db, 'meetings'),
      where('alumniId', '==', alumniProfile.userId),
      where('startTime', '>=', today),
      orderBy('startTime', 'asc'),
      limit(5)
    );
    
    const unsubscribeMeetings = onSnapshot(meetingsQuery, async (snapshot) => {
      const meetingsList = [];
      
      for (const doc of snapshot.docs) {
        const meetingData = doc.data();
        
        try {
          // Get student details
          const studentQuery = query(
            collection(db, 'students'),
            where('userId', '==', meetingData.studentId)
          );
          
          const studentSnapshot = await getDocs(studentQuery);
          if (!studentSnapshot.empty) {
            const studentData = studentSnapshot.docs[0].data();
            
            const startTime = meetingData.startTime.toDate();
            
            meetingsList.push({
              id: doc.id,
              with: studentData.fullName,
              topic: meetingData.topic,
              date: startTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              time: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            });
          }
        } catch (error) {
          console.error("Error getting student details for meeting:", error);
        }
      }
      
      setUpcomingMeetings(meetingsList);
      setMetrics(prev => ({...prev, upcomingMeetingsCount: meetingsList.length}));
    });
    
    return () => unsubscribeMeetings();
  }, [alumniProfile]);

  // Load upcoming events
  useEffect(() => {
    if (!alumniProfile) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get alumni's own events (where they are host)
    const hostedEventsQuery = query(
      collection(db, 'events'),
      where('creatorId', '==', alumniProfile.userId),
      where('eventDate', '>=', today),
      orderBy('eventDate', 'asc')
    );
    
    // Get events alumni has registered for
    const registrationsQuery = query(
      collection(db, 'eventRegistrations'),
      where('userId', '==', alumniProfile.userId)
    );
    
    const loadEvents = async () => {
      try {
        // Get hosted events
        const hostedSnapshot = await getDocs(hostedEventsQuery);
        const hostedEvents = hostedSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          date: formatTimestamp(doc.data().eventDate),
          status: 'Hosting',
          attendees: doc.data().attendeeCount || 0
        }));
        
        // Get registered events
        const registrationsSnapshot = await getDocs(registrationsQuery);
        const registeredEventIds = registrationsSnapshot.docs.map(doc => doc.data().eventId);
        
        const registeredEvents = [];
        for (const eventId of registeredEventIds) {
          const eventDoc = await getDocs(query(
            collection(db, 'events'),
            where('__name__', '==', eventId),
            where('eventDate', '>=', today)
          ));
          
          if (!eventDoc.empty) {
            const eventData = eventDoc.docs[0].data();
            registeredEvents.push({
              id: eventDoc.docs[0].id,
              title: eventData.title,
              date: formatTimestamp(eventData.eventDate),
              status: 'Attending',
              attendees: eventData.attendeeCount || 0
            });
          }
        }
        
        // Combine and sort events
        const allEvents = [...hostedEvents, ...registeredEvents]
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setUpcomingEvents(allEvents);
        setMetrics(prev => ({
          ...prev, 
          eventsRegisteredCount: registeredEvents.length + hostedEvents.length
        }));
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };
    
    loadEvents();
    
    // We don't set up a real-time listener for events to reduce reads
    // Instead, refresh events when navigating to the events page
    const refreshInterval = setInterval(loadEvents, 300000); // refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [alumniProfile]);

  // Load posted opportunities
  useEffect(() => {
    if (!alumniProfile) return;
    
    const opportunitiesQuery = query(
      collection(db, 'opportunities'),
      where('creatorId', '==', alumniProfile.userId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeOpportunities = onSnapshot(opportunitiesQuery, async (snapshot) => {
      const opportunitiesList = [];
      
      for (const doc of snapshot.docs) {
        const opportunityData = doc.data();
        
        // Count applications for this opportunity
        try {
          const applicationsQuery = query(
            collection(db, 'applications'),
            where('opportunityId', '==', doc.id)
          );
          
          const applicationsSnapshot = await getDocs(applicationsQuery);
          const applicationsCount = applicationsSnapshot.size;
          
          opportunitiesList.push({
            id: doc.id,
            title: opportunityData.title,
            company: opportunityData.company,
            applications: applicationsCount,
            posted: formatTimestamp(opportunityData.createdAt)
          });
        } catch (error) {
          console.error("Error counting applications:", error);
          
          opportunitiesList.push({
            id: doc.id,
            title: opportunityData.title,
            company: opportunityData.company,
            applications: 0,
            posted: formatTimestamp(opportunityData.createdAt)
          });
        }
      }
      
      setPostedOpportunities(opportunitiesList);
    });
    
    return () => unsubscribeOpportunities();
  }, [alumniProfile]);

  // Load communities
  useEffect(() => {
    if (!alumniProfile) return;
    
    const communitiesQuery = query(
      collection(db, 'communities'),
      where('creatorId', '==', alumniProfile.userId)
    );
    
    const unsubscribeCommunities = onSnapshot(communitiesQuery, async (snapshot) => {
      const communitiesList = [];
      
      for (const doc of snapshot.docs) {
        const communityData = doc.data();
        
        // Count members
        try {
          const membersQuery = query(
            collection(db, 'communityMembers'),
            where('communityId', '==', doc.id)
          );
          
          const membersSnapshot = await getDocs(membersQuery);
          const membersCount = membersSnapshot.size;
          
          // Count new posts in the last 7 days
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const postsQuery = query(
            collection(db, 'communityPosts'),
            where('communityId', '==', doc.id),
            where('createdAt', '>=', oneWeekAgo)
          );
          
          const postsSnapshot = await getDocs(postsQuery);
          const newPostsCount = postsSnapshot.size;
          
          communitiesList.push({
            id: doc.id,
            name: communityData.name,
            members: membersCount,
            newPosts: newPostsCount
          });
        } catch (error) {
          console.error("Error counting community metrics:", error);
          
          communitiesList.push({
            id: doc.id,
            name: communityData.name,
            members: 0,
            newPosts: 0
          });
        }
      }
      
      setCommunitiesManaged(communitiesList);
    });
    
    return () => unsubscribeCommunities();
  }, [alumniProfile]);

  // Helper function for formatting timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Convert Firebase timestamp to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function for formatting year suffix
  const getYearSuffix = (year) => {
    if (year === '1') return 'st';
    if (year === '2') return 'nd';
    if (year === '3') return 'rd';
    return 'th';
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllAsRead = async () => {
    // Update notifications in Firestore
    const batch = db.batch();
    
    notifications.forEach(notification => {
      if (!notification.read) {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, {
          readAt: serverTimestamp()
        });
      }
    });
    
    try {
      await batch.commit();
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Handle request acceptance
  const handleAcceptRequest = async (requestId, studentId) => {
    try {
      // Update request status
      const requestRef = doc(db, 'mentorshipRequests', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });
      
      // Create new mentorship
      const requestData = pendingRequests.find(r => r.id === requestId);
      
      await addDoc(collection(db, 'mentorships'), {
        mentorId: alumniProfile.userId,
        studentId: studentId,
        status: 'active',
        topic: requestData.requestType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Create notification for student
      await addDoc(collection(db, 'notifications'), {
        recipientId: studentId,
        content: `${alumniProfile.fullName} accepted your mentorship request`,
        type: 'mentorship_accepted',
        timestamp: serverTimestamp(),
        readAt: null
      });
      
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  // Handle request declination
  const handleDeclineRequest = async (requestId, studentId) => {
    try {
      // Update request status
      const requestRef = doc(db, 'mentorshipRequests', requestId);
      await updateDoc(requestRef, {
        status: 'declined',
        updatedAt: serverTimestamp()
      });
      
      // Create notification for student
      await addDoc(collection(db, 'notifications'), {
        recipientId: studentId,
        content: `${alumniProfile.fullName} declined your mentorship request`,
        type: 'mentorship_declined',
        timestamp: serverTimestamp(),
        readAt: null
      });
      
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  if (!alumniProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex-shrink-0 fixed h-full z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BVRIT Connect</h1>
          <p className="text-sm text-gray-500">Alumni Dashboard</p>
        </div>
        <nav className="mt-6">
          <ul>
            {[
              { id: 'home', name: 'Home', icon: <Home className="w-5 h-5" /> },
              { id: 'students', name: 'Student Directory', icon: <Users className="w-5 h-5" /> },
              { id: 'events', name: 'Events', icon: <Calendar className="w-5 h-5" /> },
              { id: 'opportunities', name: 'Opportunities Board', icon: <Briefcase className="w-5 h-5" /> },
              { id: 'communities', name: 'Communities', icon: <BookOpen className="w-5 h-5" /> },
              { id: 'mentorship', name: 'Mentorship Panel', icon: <Handshake className="w-5 h-5" /> },
              { id: 'requests', name: 'Requests List', icon: <MessageSquare className="w-5 h-5" /> },
              { id: 'schedule', name: 'Chat Scheduling', icon: <Clock className="w-5 h-5" /> },
              { id: 'communication', name: 'Communication Tracker', icon: <BarChart className="w-5 h-5" /> },
              { id: 'profile', name: 'Profile & Verification', icon: <User className="w-5 h-5" /> },
              { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center w-full p-3 px-6 ${
                    activePage === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-5">
          <div className="text-lg font-semibold text-gray-800">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b hover:bg-gray-50 ${notification.read ? '' : 'bg-blue-50'}`}
                        >
                          <p className="text-sm">{notification.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No notifications yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {alumniProfile.profilePictureUrl ? (
                <img 
                  src={alumniProfile.profilePictureUrl} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{alumniProfile.fullName}</div>
                <div className="text-xs text-gray-500">{alumniProfile.company}</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="p-8">
          {activePage === 'home' && (
            <div className="space-y-8">
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                      <h3 className="text-3xl font-bold mt-1">{metrics.pendingRequestsCount}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <MessageSquare className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                      onClick={() => setActivePage('requests')}
                    >
                      View all requests
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Students Mentored</p>
                      <h3 className="text-3xl font-bold mt-1">{metrics.studentsmentored}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <GraduationCap className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                      onClick={() => setActivePage('mentorship')}
                    >
                      View mentorship activity
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Upcoming Meetings</p>
                      <h3 className="text-3xl font-bold mt-1">{metrics.upcomingMeetingsCount}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full">
                      <CalendarIcon className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                      onClick={() => setActivePage('schedule')}
                    >
                      View calendar
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registered Events</p>
                      <h3 className="text-3xl font-bold mt-1">{metrics.eventsRegisteredCount}</h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                      <Calendar className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                      onClick={() => setActivePage('events')}
                    >
                      View all events
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Pending Requests Section */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Pending Mentorship Requests</h2>
                  {pendingRequests.length > 0 && (
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setActivePage('requests')}
                    >
                      View all
                    </Button>
                  )}
                </div>
                
                <div className="p-6">
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.slice(0, 3).map(request => (
                        <div key={request.id} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{request.student}</h3>
                              <p className="text-sm text-gray-600">
                                {request.branch} • {request.year}
                              </p>
                              <p className="text-sm mt-1">
                                <span className="text-blue-600 font-medium">Request: </span>
                                {request.requestType}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Requested on {request.date}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeclineRequest(request.id, request.studentId)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAcceptRequest(request.id, request.studentId)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">No pending requests</h3>
                      <p className="text-gray-500 mt-1">You're all caught up for now!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setActivePage('schedule')}
                    >
                      Schedule new
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    {upcomingMeetings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingMeetings.map(meeting => (
                          <div key={meeting.id} className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <div className="bg-purple-100 rounded-full p-3 mr-4">
                              <ClockIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{meeting.topic}</h4>
                              <p className="text-sm text-gray-600">with {meeting.with}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {meeting.date}
                                <span className="mx-2">•</span>
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {meeting.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <CalendarIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">No upcoming meetings</h3>
                        <p className="text-gray-500 mt-1">Schedule a meeting with a student</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setActivePage('schedule')}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mentorship Activity */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Mentorship Activity</h2>
                  </div>
                  
                  <div className="p-6">
                    {mentorshipActivity.length > 0 ? (
                      <div className="space-y-4">
                        {mentorshipActivity.map(activity => (
                          <div key={activity.id} className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <div className={`rounded-full p-3 mr-4 ${
                              activity.status === 'active' ? 'bg-green-100' : 
                              activity.status === 'completed' ? 'bg-blue-100' : 'bg-yellow-100'
                            }`}>
                              <GraduationCap className={`h-5 w-5 ${
                                activity.status === 'active' ? 'text-green-600' : 
                                activity.status === 'completed' ? 'text-blue-600' : 'text-yellow-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{activity.student}</h4>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  activity.status === 'active' ? 'bg-green-100 text-green-700' : 
                                  activity.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">Topic: {activity.topic}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                Last updated: {activity.date}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Handshake className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">No mentorship activity yet</h3>
                        <p className="text-gray-500 mt-1">Accept mentorship requests to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Events & Opportunities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Your Events</h2>
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setActivePage('events')}
                    >
                      Create event
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingEvents.map(event => (
                          <div key={event.id} className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <div className="bg-red-100 rounded-full p-3 mr-4">
                              <Calendar className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{event.title}</h4>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  event.status === 'Hosting' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {event.date}
                                <span className="mx-2">•</span>
                                <Users className="h-3 w-3 mr-1" />
                                {event.attendees} attendees
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">No upcoming events</h3>
                        <p className="text-gray-500 mt-1">Create or register for alumni events</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setActivePage('events')}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Posted Opportunities */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Your Posted Opportunities</h2>
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setActivePage('opportunities')}
                    >
                      Post new
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    {postedOpportunities.length > 0 ? (
                      <div className="space-y-4">
                        {postedOpportunities.map(opportunity => (
                          <div key={opportunity.id} className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <div className="bg-green-100 rounded-full p-3 mr-4">
                              <Briefcase className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{opportunity.title}</h4>
                              <p className="text-sm text-gray-600">{opportunity.company}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {opportunity.applications} applications
                                <span className="mx-2">•</span>
                                <Clock className="h-3 w-3 mr-1" />
                                Posted: {opportunity.posted}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">No opportunities posted</h3>
                        <p className="text-gray-500 mt-1">Share job and internship opportunities</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setActivePage('opportunities')}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Post Opportunity
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Communities Managed */}
              {communitiesManaged.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Communities You Manage</h2>
                    <Button 
                      variant="ghost" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setActivePage('communities')}
                    >
                      View all
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {communitiesManaged.map(community => (
                        <div key={community.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-3">
                            <div className="bg-blue-100 rounded-full p-3">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                              {community.members} Members
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{community.name}</h3>
                          <p className="text-sm text-blue-600 mt-2">
                            {community.newPosts} new posts this week
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-4"
                            onClick={() => navigate(`/communities/${community.id}`)}
                          >
                            Manage
                          </Button>
                        </div>
                      ))}
                      
                      <div className="border border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 rounded-full p-3 mb-3">
                          <PlusCircle className="h-5 w-5 text-gray-600" />
                        </div>
                        <h3 className="font-semibold text-gray-700">Create Community</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Start a new professional group
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => navigate('/communities/create')}
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Chatbot UI */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">BVRIT Connect Assistant</h2>
                </div>
                <div className="p-6">
                  <ChatbotUI />
                </div>
              </div>
            </div>
          )}
          
          {/* Sub-pages */}
          {activePage === 'students' && <StudentDirectory />}
          {activePage === 'events' && <AlumniEvent />}
          {activePage === 'opportunities' && <AlumniOpportunities />}
          {activePage === 'communities' && <AlumniCommunity />}
          {activePage === 'mentorship' && <MentorshipPanel />}
          {activePage === 'requests' && <RequestLists />}
          {activePage === 'schedule' && <ChatScheduling />}
          {activePage === 'communication' && <CommunicationTracker />}
          {activePage === 'profile' && <ProfileAndVerification />}
          {activePage === 'settings' && <AlumniSettings />}
        </main>
      </div>
    </div>
  );
};

export default AlumniDashboard;