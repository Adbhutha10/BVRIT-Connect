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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, db } from '@/firebase'; // Use your existing firebase config
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
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';

const CommunicationTracker = () => {
  // State variables
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    averageRating: 0,
    upcomingSessions: 0,
    uniqueStudents: 0
  });
  const [unsubscribe, setUnsubscribe] = useState(null);

  // New state for modal and form
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    student: '',
    studentId: '',
    type: 'mentorship',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    expectedDuration: 30,
    notes: ''
  });
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch students when modal opens
  useEffect(() => {
    if (showNewMeetingModal && currentUser) {
      fetchStudents();
    }
  }, [showNewMeetingModal, currentUser]);

  // Fetch students from your Firestore
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      // This query should be adjusted based on your data structure
      // It assumes mentorships or meeting requests where the current user is the mentor
      const mentorshipsRef = collection(db, 'mentorships');
      const mentorshipsQuery = query(
        mentorshipsRef,
        where('mentorId', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(mentorshipsQuery);
      
      // Extract unique students
      const uniqueStudents = new Map();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.studentId && data.studentName) {
          uniqueStudents.set(data.studentId, {
            id: data.studentId,
            name: data.studentName
          });
        }
      });
      
      setStudents(Array.from(uniqueStudents.values()));
    } catch (err) {
      console.error("Error fetching students: ", err);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch communications based on filters - this effect will re-run when filters change
  useEffect(() => {
    if (!currentUser) return;

    // Cleanup previous listener if it exists
    if (unsubscribe) {
      unsubscribe();
    }

    const fetchCommunications = async () => {
      setLoading(true);
      try {
        // Create base query
        let meetingsRef = collection(db, 'meetings');
        let constraints = [];

        // Add user filter (mentor or student)
        constraints.push(where('mentorId', '==', currentUser.uid));
        // You could also add OR logic for when the user is a student with a more complex query

        // Add time period filter if needed
        if (selectedPeriod === 'week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          constraints.push(where('date', '>=', Timestamp.fromDate(oneWeekAgo)));
        } else if (selectedPeriod === 'month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          constraints.push(where('date', '>=', Timestamp.fromDate(oneMonthAgo)));
        }
        
        // Add type filter if selected
        if (selectedType !== 'all') {
          constraints.push(where('type', '==', selectedType));
        }
        
        // Add status filter if selected
        if (selectedStatus !== 'all') {
          constraints.push(where('status', '==', selectedStatus));
        }
        
        // Add sorting
        constraints.push(orderBy('date', sortOrder));
        
        // Create the final query
        const meetingsQuery = query(meetingsRef, ...constraints);
        
        // Set up real-time listener
        const unsubscribeSnapshot = onSnapshot(meetingsQuery, (snapshot) => {
          const meetingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore Timestamp to JS Date for easier handling
            date: doc.data().date?.toDate().toISOString().split('T')[0] || '',
            time: doc.data().date?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''
          }));
          
          // Apply text search filter client-side
          const filteredData = searchQuery ? 
            meetingsData.filter(comm => 
              comm.student?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              comm.topic?.toLowerCase().includes(searchQuery.toLowerCase())
            ) : meetingsData;
          
          setCommunications(filteredData);
          calculateStats(filteredData);
          generateMonthlyData(meetingsData);
          setLoading(false);
        }, (err) => {
          console.error("Error fetching communications: ", err);
          setError("Failed to load communications. Please try again.");
          setLoading(false);
        });
        
        // Save unsubscribe function
        setUnsubscribe(() => unsubscribeSnapshot);
      } catch (err) {
        console.error("Error setting up communications listener: ", err);
        setError("Failed to set up communications tracker. Please try again.");
        setLoading(false);
      }
    };

    fetchCommunications();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, selectedPeriod, selectedType, selectedStatus, sortOrder]);

  // Handle search separately to avoid excessive Firestore queries
  useEffect(() => {
    if (!communications.length) return;
    
    // Filter the existing communications based on search
    const filteredData = searchQuery ? 
      communications.filter(comm => 
        comm.student?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        comm.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      ) : communications;
    
    calculateStats(filteredData);
  }, [searchQuery, communications]);

  // Calculate statistics from communications data
  const calculateStats = (data) => {
    const completed = data.filter(c => c.status === 'completed');
    const scheduled = data.filter(c => c.status === 'scheduled');
    
    const totalSessions = completed.length;
    const totalHours = completed.reduce((sum, current) => sum + (current.duration || 0), 0) / 60;
    
    const ratingsData = completed.filter(c => c.rating > 0);
    const averageRating = ratingsData.length ? 
      ratingsData.reduce((sum, current) => sum + current.rating, 0) / ratingsData.length : 0;
    
    const upcomingSessions = scheduled.length;
    const uniqueStudents = new Set(data.map(c => c.studentId)).size;
    
    setStats({
      totalSessions,
      totalHours,
      averageRating,
      upcomingSessions,
      uniqueStudents
    });
  };

  // Generate monthly data for chart
  const generateMonthlyData = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCount = Array(12).fill(0);
    
    data.forEach(comm => {
      if (comm.status === 'completed' && comm.date) {
        const month = new Date(comm.date).getMonth();
        monthlyCount[month]++;
      }
    });
    
    setMonthlyData(months.map((month, index) => ({
      month,
      count: monthlyCount[index]
    })));
  };

  // Handle sort click
  const handleSortClick = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (column) => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }
    return null;
  };

  // Format date in readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle input changes for new meeting form
  const handleNewMeetingChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If student select changes, also update the studentId
    if (name === 'student') {
      const selectedStudent = students.find(s => s.name === value);
      if (selectedStudent) {
        setNewMeeting(prev => ({
          ...prev,
          studentId: selectedStudent.id
        }));
      }
    }
  };

  // Create a new meeting
  const createMeeting = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Combine date and time into a single Date object
      const [year, month, day] = newMeeting.date.split('-').map(Number);
      const [hours, minutes] = newMeeting.time.split(':').map(Number);
      const meetingDate = new Date(year, month - 1, day, hours, minutes);
      
      // Create meeting object
      const meetingData = {
        mentorId: currentUser.uid,
        studentId: newMeeting.studentId,
        student: newMeeting.student,
        type: newMeeting.type,
        topic: newMeeting.topic,
        date: Timestamp.fromDate(meetingDate),
        expectedDuration: parseInt(newMeeting.expectedDuration) || 30,
        notes: newMeeting.notes,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'meetings'), meetingData);
      
      // Close modal and reset form
      setShowNewMeetingModal(false);
      setNewMeeting({
        student: '',
        studentId: '',
        type: 'mentorship',
        topic: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        expectedDuration: 30,
        notes: ''
      });
      
      // Success is handled by the onSnapshot listener
    } catch (err) {
      console.error("Error creating meeting: ", err);
      setError("Failed to create meeting. Please try again.");
    }
  };

  // Update meeting status
  const updateMeetingStatus = async (meetingId, newStatus, duration = 0, rating = 0) => {
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      
      if (newStatus === 'completed') {
        updateData.duration = duration;
        if (rating > 0) updateData.rating = rating;
      }
      
      await updateDoc(meetingRef, updateData);
      // Success is handled by the onSnapshot listener
    } catch (err) {
      console.error("Error updating meeting: ", err);
      setError("Failed to update meeting. Please try again.");
    }
  };

  // Export data as CSV
  const exportData = () => {
    if (!communications.length) return;
    
    const headers = ['Student', 'Type', 'Topic', 'Date', 'Time', 'Duration', 'Status', 'Rating', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...communications.map(comm => [
        comm.student,
        comm.type,
        `"${comm.topic.replace(/"/g, '""')}"`, // Handle quotes in topic
        comm.date,
        comm.time,
        comm.duration || 0,
        comm.status,
        comm.rating || 0,
        `"${(comm.notes || '').replace(/"/g, '""')}"` // Handle quotes in notes
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `communications_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to access the Communication Tracker.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Communication Tracker</h1>
        <p className="text-gray-600">Track, analyze, and manage your student interactions and mentorship sessions</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{stats.totalSessions}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Hours Mentored</h3>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Unique Students</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{stats.uniqueStudents}</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <BarChart className="h-5 w-5 text-blue-600 mr-2" />
            Communication Analytics
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={exportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {monthlyData.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="bg-blue-500 hover:bg-blue-600 rounded-t w-full transition-all cursor-pointer relative group"
                style={{ height: `${data.count > 0 ? (data.count * 20) + 20 : 8}px` }}
              >
                {data.count > 0 && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.count} sessions
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by student name or topic..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedPeriod === 'all' ? 'default' : 'outline'} 
              className={selectedPeriod === 'all' ? 'bg-blue-600' : ''} 
              onClick={() => setSelectedPeriod('all')}
            >
              All Time
            </Button>
            <Button 
              variant={selectedPeriod === 'month' ? 'default' : 'outline'} 
              className={selectedPeriod === 'month' ? 'bg-blue-600' : ''} 
              onClick={() => setSelectedPeriod('month')}
            >
              Last Month
            </Button>
            <Button 
              variant={selectedPeriod === 'week' ? 'default' : 'outline'} 
              className={selectedPeriod === 'week' ? 'bg-blue-600' : ''} 
              onClick={() => setSelectedPeriod('week')}
            >
              Last Week
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Type</label>
              <select 
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="mentorship">Mentorship</option>
                <option value="project">Project Collaboration</option>
                <option value="career">Career Guidance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By Rating</label>
              <select 
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                onChange={(e) => {
                  setSortBy('rating');
                  setSortOrder(e.target.value);
                }}
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Add New Communication Button */}
      <div className="mb-6">
        <Button 
          className="flex items-center bg-blue-600"
          onClick={() => setShowNewMeetingModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Meeting
        </Button>
      </div>

      {/* Communication List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Communication History</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Loading communications...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
                    <button 
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSortClick('student')}
                    >
                      Student {getSortIcon('student')}
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
                    Type / Topic
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
                    <button 
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSortClick('date')}
                    >
                      Date {getSortIcon('date')}
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
                    Duration
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-6">
                    <button 
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSortClick('rating')}
                    >
                      Rating {getSortIcon('rating')}
                    </button>
                  </th>
                  <th className="relative py-3 px-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {communications.map((comm) => (
                  <tr key={comm.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{comm.student}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          comm.type === 'mentorship' ? 'bg-purple-100 text-purple-800' :
                          comm.type === 'project' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {comm.type?.charAt(0).toUpperCase() + comm.type?.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">{comm.topic}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{formatDate(comm.date)}</div>
                      <div className="text-sm text-gray-500">{comm.time}</div>
                    </td>
                    <td className="py-4 px-6">
                      {comm.status === 'completed' ? (
                        <span className="text-sm text-gray-900">{comm.duration} min</span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        comm.status === 'completed' ? 'bg-green-100 text-green-800' :
                        comm.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {comm.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {comm.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                        {comm.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                        {comm.status?.charAt(0).toUpperCase() + comm.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {comm.rating > 0 ? (
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span>{comm.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button size="sm" variant="outline" className="flex items-center text-xs">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {communications.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No communication records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{communications.length}</span> communications
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Schedule New Meeting</h3>
              <button 
                onClick={() => setShowNewMeetingModal(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={createMeeting} className="p-4">
              {/* Student Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                {loadingStudents ? (
                  <p className="text-sm text-gray-500">Loading students...</p>
                ) : (
                  <select
                    name="student"
                    value={newMeeting.student}
                    onChange={handleNewMeetingChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.name}>{student.name}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Meeting Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                <select
                  name="type"
                  value={newMeeting.type}
                  onChange={handleNewMeetingChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                  required
                >
                  <option value="mentorship">Mentorship</option>
                  <option value="project">Project Collaboration</option>
                  <option value="career">Career Guidance</option>
                </select>
              </div>
              
              {/* Topic */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <Input
                  type="text"
                  name="topic"
                  value={newMeeting.topic}
                  onChange={handleNewMeetingChange}
                  placeholder="What will you discuss?"
                  required
                />
              </div>
              
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    name="date"
                    value={newMeeting.date}
                    onChange={handleNewMeetingChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <Input
                    type="time"
                    name="time"
                    value={newMeeting.time}
                    onChange={handleNewMeetingChange}
                    required
                  />
                </div>
              </div>
              
              {/* Expected Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Duration (minutes)
                </label>
                <Input
                  type="number"
                  name="expectedDuration"
                  value={newMeeting.expectedDuration}
                  onChange={handleNewMeetingChange}
                  min="5"
                  max="240"
                  required
                />
              </div>
              
              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={newMeeting.notes}
                  onChange={handleNewMeetingChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                  rows="3"
                  placeholder="Add any additional details or agenda items"
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewMeetingModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600">
                  <Save className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationTracker;