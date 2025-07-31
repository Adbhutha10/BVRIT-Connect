import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Search, 
  MessageSquare, 
  ThumbsUp, 
  User, 
  Clock, 
  Filter, 
  PlusCircle, 
  Trash2,
  Edit,
  ChevronDown,
  Globe,
  Code,
  Eye,
  Cloud,
  Cpu,
  Shield,
  Radio,
  Settings,
  Bell,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Firebase imports
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  doc, 
  getDoc,
  updateDoc, 
  addDoc,
  serverTimestamp, 
  orderBy, 
  limit 
} from 'firebase/firestore';

const AlumniCommunity = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('managed');
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState([]);
  const [managedCommunities, setManagedCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [alumniProfile, setAlumniProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showCreateCommunityDialog, setShowCreateCommunityDialog] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: 'tech'
  });
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    postsLastWeek: 0,
    upcomingEvents: 0
  });

  // Mock community data
  const communitiesData = [
    {
      id: "fsd-genai",
      name: "Full Stack Development & GenAI",
      description: "Explore modern web development technologies and generative AI applications. Share projects, discuss frameworks like React, Node.js, and learn about LLMs.",
      category: "tech",
      memberCount: 124,
      newPosts: 8,
      icon: <Code className="h-6 w-6 text-blue-600" />,
      color: "blue",
      leader: {
        id: "alumni123",
        name: "Rahul Sharma",
        title: "Senior Software Engineer at Microsoft",
        imageUrl: "/api/placeholder/32/32"
      }
    },
    {
      id: "computer-vision",
      name: "Computer Vision",
      description: "Discuss computer vision algorithms, image processing techniques, and applications. Share research papers and collaborate on projects involving OpenCV and deep learning models.",
      category: "tech",
      memberCount: 78,
      newPosts: 5,
      icon: <Eye className="h-6 w-6 text-purple-600" />,
      color: "purple",
      leader: {
        id: "alumni456",
        name: "Priya Desai",
        title: "AI Researcher at NVIDIA",
        imageUrl: "/api/placeholder/32/32"
      }
    },
    {
      id: "cloud-computing",
      name: "Cloud Computing",
      description: "Learn about cloud platforms like AWS, Azure, and GCP. Discuss cloud architecture, serverless computing, and best practices for cloud deployments.",
      category: "tech",
      memberCount: 92,
      newPosts: 12,
      icon: <Cloud className="h-6 w-6 text-sky-600" />,
      color: "sky",
      leader: {
        id: "alumni123",
        name: "Arun Kumar",
        title: "Cloud Solutions Architect at AWS",
        imageUrl: "/api/placeholder/32/32"
      }
    },
    {
      id: "quantum-computing",
      name: "Quantum Computing",
      description: "Explore the fundamentals of quantum computing, quantum algorithms, and the latest advancements in quantum hardware. Discuss applications and future implications.",
      category: "research",
      memberCount: 45,
      newPosts: 3,
      icon: <Cpu className="h-6 w-6 text-green-600" />,
      color: "green",
      leader: {
        id: "alumni789",
        name: "Dr. Vijay Reddy",
        title: "Quantum Researcher at IBM",
        imageUrl: "/api/placeholder/32/32"
      }
    },
    {
      id: "cyber-security",
      name: "Cyber Security",
      description: "Discuss network security, ethical hacking, cryptography, and the latest security threats. Share resources and best practices for securing systems and data.",
      category: "tech",
      memberCount: 86,
      newPosts: 9,
      icon: <Shield className="h-6 w-6 text-red-600" />,
      color: "red",
      leader: {
        id: "alumni321",
        name: "Sneha Patel",
        title: "Security Consultant at Deloitte",
        imageUrl: "/api/placeholder/32/32"
      }
    },
    {
      id: "iot",
      name: "Internet of Things",
      description: "Discuss IoT devices, protocols, and applications. Share projects involving Arduino, Raspberry Pi, and other embedded systems. Explore IoT architecture and solutions.",
      category: "tech",
      memberCount: 64,
      newPosts: 7,
      icon: <Radio className="h-6 w-6 text-orange-600" />,
      color: "orange",
      leader: {
        id: "alumni567",
        name: "Karthik Nair",
        title: "IoT Specialist at Bosch",
        imageUrl: "/api/placeholder/32/32"
      }
    }
  ];

  // Mock post data
  const postsData = {
    "fsd-genai": [
      {
        id: "post1",
        author: {
          name: "Rahul Sharma",
          role: "Alumni - Microsoft",
          imageUrl: "/api/placeholder/32/32"
        },
        content: "Just published a new tutorial on building a full-stack app with React and Firebase. Check it out here: [link]. Let me know if you have any questions!",
        timestamp: "2 hours ago",
        likes: 12,
        comments: 5
      },
      {
        id: "post2",
        author: {
          name: "Anusha Reddy",
          role: "Student - 3rd Year CSE",
          imageUrl: "/api/placeholder/32/32"
        },
        content: "Has anyone worked with NextJS 14? I'm trying to understand server components and would appreciate any resources or tips.",
        timestamp: "5 hours ago",
        likes: 7,
        comments: 8
      },
      {
        id: "post3",
        author: {
          name: "Vikram Singh",
          role: "Alumni - Google",
          imageUrl: "/api/placeholder/32/32"
        },
        content: "Excited to announce that we're hosting a workshop on LangChain and building RAG applications next weekend. Looking for student volunteers who want to help and learn along the way!",
        timestamp: "1 day ago",
        likes: 24,
        comments: 15
      }
    ]
  };

  // Mock members data
  const membersData = {
    "fsd-genai": [
      {
        id: "member1",
        name: "Vikram Singh",
        role: "Alumni - Google",
        year: "2015 Batch",
        imageUrl: "/api/placeholder/32/32"
      },
      {
        id: "member2",
        name: "Anusha Reddy",
        role: "Student - CSE",
        year: "3rd Year",
        imageUrl: "/api/placeholder/32/32"
      },
      {
        id: "member3",
        name: "Karan Mehta",
        role: "Alumni - Amazon",
        year: "2018 Batch",
        imageUrl: "/api/placeholder/32/32"
      },
      {
        id: "member4",
        name: "Shreya Gupta",
        role: "Student - IT",
        year: "4th Year",
        imageUrl: "/api/placeholder/32/32"
      },
      {
        id: "member5",
        name: "Rohan Kapoor",
        role: "Alumni - Flipkart",
        year: "2020 Batch",
        imageUrl: "/api/placeholder/32/32"
      }
    ]
  };

  // Mock pending approvals
  const pendingApprovalsData = {
    "fsd-genai": [
      {
        id: "approval1",
        name: "Manish Kumar",
        role: "Student - ECE",
        year: "2nd Year",
        imageUrl: "/api/placeholder/32/32",
        requestDate: "2 days ago"
      },
      {
        id: "approval2",
        name: "Divya Shah",
        role: "Student - IT",
        year: "3rd Year",
        imageUrl: "/api/placeholder/32/32",
        requestDate: "1 day ago"
      }
    ]
  };

  // Mock announcements
  const announcementsData = {
    "fsd-genai": [
      {
        id: "announcement1",
        content: "We'll be hosting a workshop on React and Firebase next Saturday at 2 PM. Please register through the events page!",
        timestamp: "3 days ago"
      },
      {
        id: "announcement2",
        content: "Our community just crossed 100 members! Thanks to everyone for making this a vibrant learning space.",
        timestamp: "1 week ago"
      }
    ]
  };

  // Mock events
  const eventsData = {
    "fsd-genai": [
      {
        id: "event1",
        title: "Workshop: Building Full Stack Applications with React & Firebase",
        date: "May 15, 2025",
        time: "2:00 PM - 4:00 PM",
        location: "Virtual (Zoom)",
        description: "Learn how to build modern web applications using React and Firebase. This hands-on workshop will cover everything from setup to deployment.",
        attendees: 45
      },
      {
        id: "event2",
        title: "Webinar: Introduction to Large Language Models",
        date: "May 22, 2025",
        time: "6:00 PM - 7:30 PM",
        location: "Virtual (Microsoft Teams)",
        description: "Explore the fundamentals of LLMs, their applications, and how you can use them in your projects. Perfect for beginners in AI.",
        attendees: 32
      }
    ]
  };

  // Mock analytics
  const analyticsData = {
    "fsd-genai": {
      totalMembers: 124,
      activeMembers: 87,
      postsLastWeek: 23,
      upcomingEvents: 2
    },
    "computer-vision": {
      totalMembers: 78,
      activeMembers: 54,
      postsLastWeek: 15,
      upcomingEvents: 1
    }
  };

  useEffect(() => {
    // Mock data loading
    setLoading(false);
    setCommunities(communitiesData);
    
    // Set alumni profile
    setAlumniProfile({
      id: "alumni123",
      fullName: "Rahul Sharma",
      graduationYear: "2015",
      branch: "CSE",
      company: "Microsoft",
      jobTitle: "Senior Software Engineer",
      imageUrl: "/api/placeholder/32/32"
    });

    // Set managed and joined communities
    const managed = communitiesData.filter(community => 
      community.leader && community.leader.id === "alumni123"
    );
    setManagedCommunities(managed);
    
    setJoinedCommunities([
      "fsd-genai",
      "computer-vision",
      "cloud-computing"
    ]);
  }, []);

  const filterCommunities = () => {
    if (!searchQuery) return communities;
    
    return communities.filter(
      community => community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  community.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
    
    // Load data for this community
    setPosts(postsData[community.id] || []);
    setMembers(membersData[community.id] || []);
    setPendingApprovals(pendingApprovalsData[community.id] || []);
    setAnnouncements(announcementsData[community.id] || []);
    setEvents(eventsData[community.id] || []);
    setAnalytics(analyticsData[community.id] || {
      totalMembers: 0,
      activeMembers: 0,
      postsLastWeek: 0,
      upcomingEvents: 0
    });
  };

  const handleJoinCommunity = (communityId) => {
    if (joinedCommunities.includes(communityId)) {
      // Leave community logic
      setJoinedCommunities(joinedCommunities.filter(id => id !== communityId));
    } else {
      // Join community logic
      setJoinedCommunities([...joinedCommunities, communityId]);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) return;
    
    // Add new post to the top of the list
    const newPost = {
      id: `new-post-${Date.now()}`,
      author: {
        name: alumniProfile.fullName,
        role: `Alumni - ${alumniProfile.company}`,
        imageUrl: alumniProfile.imageUrl
      },
      content: newPostContent,
      timestamp: "Just now",
      likes: 0,
      comments: 0
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    }));
  };

  const handleCreateCommunity = () => {
    // Create a new community
    const newCommunityData = {
      id: newCommunity.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCommunity.name,
      description: newCommunity.description,
      category: newCommunity.category,
      memberCount: 1,
      newPosts: 0,
      icon: <Code className="h-6 w-6 text-blue-600" />,
      color: "blue",
      leader: {
        id: alumniProfile.id,
        name: alumniProfile.fullName,
        title: `${alumniProfile.jobTitle} at ${alumniProfile.company}`,
        imageUrl: alumniProfile.imageUrl
      }
    };
    
    // Add to communities list
    setCommunities([...communities, newCommunityData]);
    
    // Add to managed communities
    setManagedCommunities([...managedCommunities, newCommunityData]);
    
    // Add to joined communities
    setJoinedCommunities([...joinedCommunities, newCommunityData.id]);
    
    // Reset form and close dialog
    setNewCommunity({
      name: '',
      description: '',
      category: 'tech'
    });
    setShowCreateCommunityDialog(false);
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    
    if (!newAnnouncement.trim()) return;
    
    // Add new announcement to the top of the list
    const announcement = {
      id: `announcement-${Date.now()}`,
      content: newAnnouncement,
      timestamp: "Just now"
    };
    
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement('');
  };

  const handleMemberApproval = (memberId, isApproved) => {
    // Remove from pending list
    const updatedPending = pendingApprovals.filter(
      member => member.id !== memberId
    );
    setPendingApprovals(updatedPending);
    
    if (isApproved) {
      // Get member data
      const approvedMember = pendingApprovals.find(member => member.id === memberId);
      
      if (approvedMember) {
        // Add to members list
        setMembers([...members, approvedMember]);
        
        // Update analytics
        setAnalytics({
          ...analytics,
          totalMembers: analytics.totalMembers + 1
        });
      }
    }
    
    // Show success message (in a real app)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      {!selectedCommunity ? (
        <div className="container mx-auto p-6">
          {/* Communities Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Communities</h1>
                <p className="text-gray-600">
                  Manage your communities, share knowledge, and mentor students in your areas of expertise.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateCommunityDialog(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Create Community
              </Button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                type="text" 
                placeholder="Search communities..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          
          {/* Community Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-4">
              <TabsTrigger value="managed" className="px-4">Managed</TabsTrigger>
              <TabsTrigger value="joined" className="px-4">Joined</TabsTrigger>
              <TabsTrigger value="all" className="px-4">All</TabsTrigger>
              <TabsTrigger value="tech" className="px-4">Tech</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Community Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterCommunities()
              .filter(community => 
                (activeTab === 'all') || 
                (activeTab === 'managed' && managedCommunities.some(c => c.id === community.id)) ||
                (activeTab === 'joined' && joinedCommunities.includes(community.id)) ||
                (activeTab === community.category)
              )
              .map(community => (
                <div key={community.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className={`bg-${community.color}-50 p-4`}>
                    <div className="flex justify-between items-center">
                      <div className={`bg-${community.color}-100 p-3 rounded-full`}>
                        {community.icon}
                      </div>
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                        <Users className="h-3 w-3 mr-1" /> {community.memberCount} members
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">{community.name}</h3>
                      {managedCommunities.some(c => c.id === community.id) && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          Leader
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{community.description}</p>
                    
                    <div className="flex items-center mt-4 mb-5">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden">
                            <User className="h-3 w-3 text-gray-500" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 ml-2">
                        <span className="font-medium">{community.newPosts}</span> new posts this week
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1"
                        onClick={() => handleCommunitySelect(community)}
                      >
                        {managedCommunities.some(c => c.id === community.id) ? "Manage" : "View"}
                      </Button>
                      {!managedCommunities.some(c => c.id === community.id) && (
                        <Button 
                          variant={joinedCommunities.includes(community.id) ? "outline" : "secondary"}
                          className="flex-1"
                          onClick={() => handleJoinCommunity(community.id)}
                        >
                          {joinedCommunities.includes(community.id) ? "Joined" : "Join"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Create Community Dialog */}
          <Dialog open={showCreateCommunityDialog} onOpenChange={setShowCreateCommunityDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Community</DialogTitle>
                <DialogDescription>
                  Create a new community to connect with students and share your expertise.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Community Name
                  </label>
                  <Input 
                    type="text" 
                    placeholder="e.g., Machine Learning" 
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this community is about..." 
                    rows={3}
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                  ></textarea>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Category
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCommunity.category}
                    onChange={(e) => setNewCommunity({...newCommunity, category: e.target.value})}
                  >
                    <option value="tech">Technology</option>
                    <option value="research">Research</option>
                    <option value="career">Career</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateCommunityDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCommunity} 
                  disabled={!newCommunity.name.trim() || !newCommunity.description.trim()}
                >
                  Create Community
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        // Community detail view for alumni/leader
        <div className="container mx-auto p-6">
          {/* Back button */}
          <button 
            className="mb-6 text-blue-600 flex items-center hover:underline"
            onClick={() => setSelectedCommunity(null)}
          >
            ← Back to Communities
          </button>
          
          {/* Community Header */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
            <div className={`bg-${selectedCommunity.color}-50 p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`bg-${selectedCommunity.color}-100 p-4 rounded-full mr-4`}>
                    {selectedCommunity.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedCommunity.name}</h1>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Users className="h-4 w-4 mr-1" /> 
                      {selectedCommunity.memberCount} members
                      <span className="mx-2">•</span>
                      <Globe className="h-4 w-4 mr-1" /> 
                      {managedCommunities.some(c => c.id === selectedCommunity.id) 
                        ? "You are the community leader" 
                        : `Led by ${selectedCommunity.leader?.name}`}
                    </div>
                  </div>
                </div>
                
                {managedCommunities.some(c => c.id === selectedCommunity.id) && (
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Community Settings
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700">{selectedCommunity.description}</p>
              
              {managedCommunities.some(c => c.id === selectedCommunity.id) && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-blue-700">{analytics.totalMembers}</h3>
                    <p className="text-sm text-gray-600">Total Members</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-green-700">{analytics.activeMembers}</h3>
                    <p className="text-sm text-gray-600">Active Members</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-purple-700">{analytics.postsLastWeek}</h3>
                    <p className="text-sm text-gray-600">Posts Last Week</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-orange-700">{analytics.upcomingEvents}</h3>
                    <p className="text-sm text-gray-600">Upcoming Events</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - only for community leaders */}
            {managedCommunities.some(c => c.id === selectedCommunity.id) && (
              <div className="col-span-1">
                {/* Pending approval requests */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Pending Approvals</h2>
                    {pendingApprovals.length > 0 && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        {pendingApprovals.length} New
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {pendingApprovals.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No pending approval requests</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingApprovals.map(member => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                                <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-800">{member.name}</h4>
                                <p className="text-xs text-gray-500">{member.role} • {member.year}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                onClick={() => handleMemberApproval(member.id, false)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
                                onClick={() => handleMemberApproval(member.id, true)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Announcements */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Announcements</h2>
                  </div>
                  
                  <div className="p-4">
                    <form onSubmit={handleAnnouncementSubmit} className="mb-4">
                      <textarea 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        placeholder="Post an announcement for the community..." 
                        rows={3}
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                      ></textarea>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!newAnnouncement.trim()}
                      >
                        Post Announcement
                      </Button>
                    </form>
                    
                    <div className="divide-y divide-gray-100">
                      {announcements.map(announcement => (
                        <div key={announcement.id} className="py-3">
                          <p className="text-sm text-gray-700 mb-1">{announcement.content}</p>
                          <p className="text-xs text-gray-500">{announcement.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Upcoming Events</h2>
                    <Button size="sm" variant="ghost" className="text-blue-600 text-xs">
                      + Add Event
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    {events.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No upcoming events</p>
                    ) : (
                      <div className="space-y-4">
                        {events.map(event => (
                          <div key={event.id} className="border border-gray-100 rounded-lg p-3">
                            <h4 className="font-medium text-gray-800 text-sm">{event.title}</h4>
                            <div className="flex items-center mt-2 text-xs text-gray-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              {event.date}
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{event.description}</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                <Users className="h-3 w-3 inline mr-1" />
                                {event.attendees} attending
                              </span>
                              <Button size="sm" variant="outline" className="text-xs py-1 h-7">
                                Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Main content area */}
            <div className={managedCommunities.some(c => c.id === selectedCommunity.id) ? "col-span-1 lg:col-span-2" : "col-span-3"}>
              {/* Posts */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Discussion</h2>
                </div>
                
                <div className="p-4">
                  <form onSubmit={handlePostSubmit} className="mb-6">
                    <textarea 
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      placeholder="Share something with the community..." 
                      rows={3}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={!newPostContent.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </form>
                  
                  <div className="space-y-6">
                    {posts.map(post => (
                      <div key={post.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                            <img src={post.author.imageUrl} alt={post.author.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-800">{post.author.name}</h4>
                              <span className="mx-2 text-gray-300">•</span>
                              <p className="text-sm text-gray-500">{post.author.role}</p>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{post.timestamp}</p>
                            <div className="text-gray-700 mb-3">{post.content}</div>
                            <div className="flex items-center text-sm text-gray-500">
                              <button 
                                className="flex items-center hover:text-blue-600" 
                                onClick={() => handleLikePost(post.id)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {post.likes}
                              </button>
                              <span className="mx-3">•</span>
                              <button className="flex items-center hover:text-blue-600">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {post.comments} Comments
                              </button>
                            </div>
                          </div>
                          
                          {post.author.name === alumniProfile.fullName && (
                            <div className="ml-auto">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="outline-none">
                                  <Button size="sm" variant="ghost">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem className="flex items-center">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Post
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Members */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">Members</h2>
                  <div className="relative flex-1 max-w-xs ml-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      type="text" 
                      placeholder="Search members..." 
                      className="pl-9 py-1 h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.map(member => (
                      <div key={member.id} className="border border-gray-100 rounded-lg p-3 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                          <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{member.name}</h4>
                          <p className="text-xs text-gray-500">{member.role} • {member.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniCommunity;