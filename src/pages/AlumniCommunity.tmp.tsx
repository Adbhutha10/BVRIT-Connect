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
  deleteDoc,
  serverTimestamp, 
  orderBy, 
  limit,
  writeBatch
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

  // Real-time listener for current user's alumni profile
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;
      
      const profileQuery = query(
        collection(db, 'alumni_profiles'),
        where('userId', '==', user.uid)
      );
      
      const unsubscribeProfile = onSnapshot(profileQuery, (snapshot) => {
        if (!snapshot.empty) {
          setAlumniProfile({
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
          });
        }
      }, (error) => {
        console.error("Error in profile listener:", error);
      });
      
      return () => unsubscribeProfile();
    });
    
    return () => unsubscribeAuth();
  }, []);

  // Real-time listener for all communities
  useEffect(() => {
    const communitiesQuery = query(collection(db, 'communities'), orderBy('name'));
    
    const unsubscribeCommunities = onSnapshot(communitiesQuery, async (snapshot) => {
      if (snapshot.empty) {
        // Seed the 6 default communities if none exist
        const defaultCommunities = [
          { name: "Full Stack Development & GenAI", description: "Explore modern web development technologies and generative AI applications.", category: "tech", color: "blue" },
          { name: "Computer Vision", description: "Discuss computer vision algorithms, image processing techniques, and applications.", category: "tech", color: "purple" },
          { name: "Cloud Computing", description: "Learn about cloud platforms like AWS, Azure, and GCP.", category: "tech", color: "sky" },
          { name: "Quantum Computing", description: "Explore the fundamentals of quantum computing and algorithms.", category: "research", color: "green" },
          { name: "Cyber Security", description: "Discuss network security, ethical hacking, and cryptography.", category: "tech", color: "red" },
          { name: "Internet of Things", description: "Discuss IoT devices, protocols, and applications.", category: "tech", color: "orange" }
        ];

        for (const comm of defaultCommunities) {
          try {
            await addDoc(collection(db, 'communities'), {
              ...comm,
              memberCount: 0,
              newPosts: 0,
              createdAt: serverTimestamp(),
              creatorId: "system"
            });
          } catch (e) {
            console.error("Error seeding community:", e);
          }
        }
        return;
      }

      const communitiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCommunities(communitiesList);
      setLoading(false);
    });
    
    return () => unsubscribeCommunities();
  }, []);

  // Real-time listener for joined communities
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const joinedQuery = query(
      collection(db, 'communityMembers'),
      where('userId', '==', auth.currentUser.uid)
    );
    
    const unsubscribeJoined = onSnapshot(joinedQuery, (snapshot) => {
      const joinedIds = snapshot.docs.map(doc => doc.data().communityId);
      setJoinedCommunities(joinedIds);
    });
    
    return () => unsubscribeJoined();
  }, []);

  // Real-time listener for managed communities
  // Any community an alumni joins, they become a leader
  useEffect(() => {
    if (!alumniProfile || communities.length === 0) {
      setManagedCommunities([]);
      return;
    }
    
    const managed = communities.filter(c => joinedCommunities.includes(c.id));
    setManagedCommunities(managed);
  }, [alumniProfile, communities, joinedCommunities]);

  const filterCommunities = () => {
    if (!searchQuery) return communities;
    
    return communities.filter(
      community => community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  community.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Listeners for selected community details
  useEffect(() => {
    if (!selectedCommunity) return;

    // Listen to posts
    const postsQuery = query(
      collection(db, 'communityPosts'),
      where('communityId', '==', selectedCommunity.id)
    );
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in posts listener:", error);
    });

    // Listen to members
    const membersQuery = query(
      collection(db, 'communityMembers'),
      where('communityId', '==', selectedCommunity.id)
    );
    const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in members listener:", error);
    });

    // Listen to announcements
    const announcementsQuery = query(
      collection(db, 'communityAnnouncements'),
      where('communityId', '==', selectedCommunity.id)
    );
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in announcements listener:", error);
    });

    // Listen to events
    const eventsQuery = query(
      collection(db, 'communityEvents'),
      where('communityId', '==', selectedCommunity.id)
    );
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in events listener:", error);
    });

    // Listen to pending approvals
    const approvalsQuery = query(
      collection(db, 'communityMembershipRequests'),
      where('communityId', '==', selectedCommunity.id),
      where('status', '==', 'pending')
    );
    const unsubscribeApprovals = onSnapshot(approvalsQuery, (snapshot) => {
      setPendingApprovals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error in approvals listener:", error);
    });

    return () => {
      unsubscribePosts();
      unsubscribeMembers();
      unsubscribeAnnouncements();
      unsubscribeEvents();
      unsubscribeApprovals();
    };
  }, [selectedCommunity]);

  // Update analytics when community data changes
  useEffect(() => {
    if (!selectedCommunity) return;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const lastWeekPosts = posts.filter(post => {
      if (!post.createdAt) return false;
      const postDate = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      return postDate > oneWeekAgo;
    });

    setAnalytics({
      totalMembers: members.length,
      activeMembers: Math.ceil(members.length * 0.85) || 0, // Simulated active count
      postsLastWeek: lastWeekPosts.length,
      upcomingEvents: events.length
    });
  }, [members, posts, events, selectedCommunity]);

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
  };

  const handleJoinCommunity = async (communityId) => {
    if (!auth.currentUser) return;
    
    try {
      if (joinedCommunities.includes(communityId)) {
        // Leave community: find the member doc and delete it
        const q = query(
          collection(db, 'communityMembers'),
          where('communityId', '==', communityId),
          where('userId', '==', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach(doc => batch.delete(doc.ref));
        
        // Update member count
        const communityRef = doc(db, 'communities', communityId);
        batch.update(communityRef, {
          memberCount: Math.max(0, (selectedCommunity?.memberCount || 0) - 1)
        });
        
        await batch.commit();
      } else {
        // Join community
        const batch = writeBatch(db);
        const memberRef = doc(collection(db, 'communityMembers'));
        batch.set(memberRef, {
          communityId,
          userId: auth.currentUser.uid,
          name: alumniProfile?.fullName || auth.currentUser.displayName || 'Anonymous',
          role: alumniProfile ? `Alumni - ${alumniProfile.company}` : 'Student',
          imageUrl: alumniProfile?.imageUrl || auth.currentUser.photoURL || '',
          joinedAt: serverTimestamp()
        });
        
        // Update member count
        const communityRef = doc(db, 'communities', communityId);
        batch.update(communityRef, {
          memberCount: (communities.find(c => c.id === communityId)?.memberCount || 0) + 1
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error("Error joining/leaving community:", error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !selectedCommunity || !auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'communityPosts'), {
        communityId: selectedCommunity.id,
        authorId: auth.currentUser.uid,
        author: {
          name: alumniProfile?.fullName || auth.currentUser.displayName || 'Anonymous',
          role: alumniProfile ? `Alumni - ${alumniProfile.company}` : 'Student',
          imageUrl: alumniProfile?.imageUrl || auth.currentUser.photoURL || ''
        },
        content: newPostContent,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0
      });
      setNewPostContent('');
    } catch (error) {
      console.error("Error posting to community:", error);
    }
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    }));
  };

  const handleCreateCommunity = async () => {
    if (!alumniProfile) return;
    
    try {
      const communityData = {
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category,
        memberCount: 1,
        newPosts: 0,
        creatorId: alumniProfile.userId,
        leader: {
          id: alumniProfile.userId,
          name: alumniProfile.fullName,
          title: `${alumniProfile.jobTitle} at ${alumniProfile.company}`,
          imageUrl: alumniProfile.imageUrl || ''
        },
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'communities'), communityData);
      
      // Auto-join the creator
      await addDoc(collection(db, 'communityMembers'), {
        communityId: docRef.id,
        userId: alumniProfile.userId,
        name: alumniProfile.fullName,
        role: `Alumni - ${alumniProfile.company}`,
        imageUrl: alumniProfile.imageUrl || '',
        joinedAt: serverTimestamp()
      });
      
      setNewCommunity({ name: '', description: '', category: 'tech' });
      setShowCreateCommunityDialog(false);
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim() || !selectedCommunity) return;
    
    try {
      await addDoc(collection(db, 'communityAnnouncements'), {
        communityId: selectedCommunity.id,
        content: newAnnouncement,
        authorName: alumniProfile?.fullName || auth.currentUser?.displayName || "Alumni Leader",
        authorTitle: alumniProfile ? `Alumni - ${alumniProfile.company}` : "Community Leader",
        createdAt: serverTimestamp()
      });
      setNewAnnouncement('');
    } catch (error) {
      console.error("Error posting announcement:", error);
    }
  };

  const handleMemberApproval = async (requestId, isApproved) => {
    if (!selectedCommunity) return;
    
    try {
      const batch = writeBatch(db);
      const requestRef = doc(db, 'communityMembershipRequests', requestId);
      
      if (isApproved) {
        const requestDoc = pendingApprovals.find(r => r.id === requestId);
        if (requestDoc) {
          // Add to members
          const memberRef = doc(collection(db, 'communityMembers'));
          batch.set(memberRef, {
            communityId: selectedCommunity.id,
            userId: requestDoc.userId,
            name: requestDoc.name,
            role: requestDoc.role,
            imageUrl: requestDoc.imageUrl || '',
            joinedAt: serverTimestamp()
          });
          
          // Update member count
          const communityRef = doc(db, 'communities', selectedCommunity.id);
          batch.update(communityRef, {
            memberCount: (selectedCommunity.memberCount || 0) + 1
          });
        }
      }
      
      // Update request status or delete it
      batch.update(requestRef, { status: isApproved ? 'approved' : 'rejected', updatedAt: serverTimestamp() });
      
      await batch.commit();
    } catch (error) {
      console.error("Error approving member:", error);
    }
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
                      <div className={`bg-${community.color || 'blue'}-100 p-3 rounded-full`}>
                        {community.name === "Computer Vision" ? <Eye className="h-6 w-6 text-purple-600" /> :
                         community.name === "Cloud Computing" ? <Cloud className="h-6 w-6 text-sky-600" /> :
                         community.name === "Quantum Computing" ? <Cpu className="h-6 w-6 text-green-600" /> :
                         community.name === "Cyber Security" ? <Shield className="h-6 w-6 text-red-600" /> :
                         community.name === "Internet of Things" ? <Radio className="h-6 w-6 text-orange-600" /> :
                         <Code className="h-6 w-6 text-blue-600" />}
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
                  <div className={`bg-${selectedCommunity.color || 'blue'}-100 p-4 rounded-full mr-4`}>
                    {selectedCommunity.name === "Computer Vision" ? <Eye className="h-6 w-6 text-purple-600" /> :
                     selectedCommunity.name === "Cloud Computing" ? <Cloud className="h-6 w-6 text-sky-600" /> :
                     selectedCommunity.name === "Quantum Computing" ? <Cpu className="h-6 w-6 text-green-600" /> :
                     selectedCommunity.name === "Cyber Security" ? <Shield className="h-6 w-6 text-red-600" /> :
                     selectedCommunity.name === "Internet of Things" ? <Radio className="h-6 w-6 text-orange-600" /> :
                     <Code className="h-6 w-6 text-blue-600" />}
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
                            <p className="text-xs text-gray-400 mb-2">{formatTimestamp(post.createdAt)}</p>
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
