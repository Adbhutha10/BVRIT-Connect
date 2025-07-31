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
  Globe,
  Code,
  Eye,
  Cloud,
  Cpu,
  Shield,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const StudentCommunity = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [communityLeader, setCommunityLeader] = useState(null);

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
    ],
    "computer-vision": [
      {
        id: "post1",
        author: {
          name: "Priya Desai",
          role: "Alumni - NVIDIA",
          imageUrl: "/api/placeholder/32/32"
        },
        content: "Just released our research paper on efficient object detection algorithms for embedded devices. Would love to get feedback from CV enthusiasts!",
        timestamp: "3 hours ago",
        likes: 15,
        comments: 7
      }
    ],
    "cloud-computing": [
      {
        id: "post1",
        author: {
          name: "Arun Kumar",
          role: "Alumni - AWS",
          imageUrl: "/api/placeholder/32/32"
        },
        content: "AWS just announced new serverless features that could revolutionize how we build cloud applications. Let's discuss the implications.",
        timestamp: "1 hour ago",
        likes: 18,
        comments: 9
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

  useEffect(() => {
    // Mock data loading
    setLoading(false);
    setCommunities(communitiesData);
    setJoinedCommunities([
      "fsd-genai",
      "computer-vision"
    ]);
    
    // Set student profile
    setStudentProfile({
      id: "student123",
      fullName: "Arjun Sharma",
      year: "3rd",
      branch: "CSE",
      imageUrl: "/api/placeholder/32/32"
    });
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
    // Load posts for this community
    setPosts(postsData[community.id] || []);
    // Load members for this community
    setMembers(membersData[community.id] || []);
    // Set community leader
    setCommunityLeader(community.leader);
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
        name: studentProfile.fullName,
        role: `Student - ${studentProfile.year} Year ${studentProfile.branch}`,
        imageUrl: studentProfile.imageUrl
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Communities</h1>
            <p className="text-gray-600">
              Connect with alumni and peers in interest-based communities. Share knowledge, ask questions, and grow together.
            </p>
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
              <TabsTrigger value="all" className="px-4">All</TabsTrigger>
              <TabsTrigger value="joined" className="px-4">Joined</TabsTrigger>
              <TabsTrigger value="tech" className="px-4">Tech</TabsTrigger>
              <TabsTrigger value="research" className="px-4">Research</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Community Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterCommunities()
              .filter(community => activeTab === 'all' || 
                    (activeTab === 'joined' && joinedCommunities.includes(community.id)) ||
                    (activeTab === community.category))
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
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{community.name}</h3>
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
                        View
                      </Button>
                      <Button 
                        variant={joinedCommunities.includes(community.id) ? "outline" : "secondary"}
                        className="flex-1"
                        onClick={() => handleJoinCommunity(community.id)}
                      >
                        {joinedCommunities.includes(community.id) ? "Joined" : "Join"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        // Community detail view
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
                    Led by {selectedCommunity.leader.name}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700">{selectedCommunity.description}</p>
              
              <div className="flex mt-6 gap-4">
                <Button 
                  variant={joinedCommunities.includes(selectedCommunity.id) ? "outline" : "default"}
                  onClick={() => handleJoinCommunity(selectedCommunity.id)}
                >
                  {joinedCommunities.includes(selectedCommunity.id) ? "Leave Community" : "Join Community"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Community Tabs */}
          <Tabs defaultValue="discussions" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discussions" className="space-y-6 mt-6">
              {/* Create new post */}
              {joinedCommunities.includes(selectedCommunity.id) && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <form onSubmit={handlePostSubmit}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        {studentProfile?.imageUrl ? (
                          <img 
                            src={studentProfile.imageUrl} 
                            alt={studentProfile.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-full h-full p-2 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <textarea
                          className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Share something with the community..."
                          rows={3}
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                        ></textarea>
                        
                        <div className="flex justify-end mt-3">
                          <Button type="submit" disabled={!newPostContent.trim()}>
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Discussion posts */}
              {posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          {post.author?.imageUrl ? (
                            <img 
                              src={post.author.imageUrl} 
                              alt={post.author.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-full h-full p-2 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                              <p className="text-sm text-gray-500">{post.author.role}</p>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {post.timestamp}
                            </div>
                          </div>
                          
                          <div className="mt-3 text-gray-700">
                            {post.content}
                          </div>
                          
                          <div className="mt-4 flex items-center gap-4">
                            <button 
                              className="flex items-center text-gray-500 hover:text-blue-600"
                              onClick={() => handleLikePost(post.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span className="text-sm">{post.likes}</span>
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-blue-600">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span className="text-sm">{post.comments}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No discussions yet</h3>
                  <p className="text-gray-500 mb-6">Be the first to start a discussion in this community</p>
                  {joinedCommunities.includes(selectedCommunity.id) ? (
                    <Button>Create a post</Button>
                  ) : (
                    <Button onClick={() => handleJoinCommunity(selectedCommunity.id)}>
                      Join to Participate
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="members" className="mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Community Leader</h2>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      {communityLeader?.imageUrl ? (
                        <img 
                          src={communityLeader.imageUrl}
                          alt={communityLeader.name}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-full h-full p-3 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{communityLeader?.name}</h4>
                      <p className="text-sm text-gray-500">{communityLeader?.title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Members ({selectedCommunity.memberCount})</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        type="text" 
                        placeholder="Search members" 
                        className="pl-9 h-9 text-sm w-48"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {members.length > 0 ? (
                      members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                              {member.imageUrl ? (
                                <img 
                                  src={member.imageUrl}
                                  alt={member.name}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <User className="w-full h-full p-2 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <p className="text-xs text-gray-500">{member.role} • {member.year}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Profile
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No members found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Community Resources</h2>
                
                {joinedCommunities.includes(selectedCommunity.id) ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800">Latest Tutorials</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-center gap-2 text-blue-600 hover:underline">
                          <BookOpen className="h-4 w-4" />
                          <a href="#">Introduction to {selectedCommunity.name}</a>
                        </li>
                        <li className="flex items-center gap-2 text-blue-600 hover:underline">
                          <BookOpen className="h-4 w-4" />
                          <a href="#">Advanced techniques in {selectedCommunity.name}</a>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800">Useful Links</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Globe className="h-4 w-4" />
                          <a href="#">Official Documentation</a>
                        </li>
                        <li className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Globe className="h-4 w-4" />
                          <a href="#">Community Github Repository</a>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800">Upcoming Events</h3>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-gray-800">Workshop on {selectedCommunity.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">Date: May 5, 2025</p>
                        <p className="text-sm text-gray-600">Time: 2:00 PM - 4:00 PM</p>
                        <p className="text-sm text-gray-600">Location: Virtual (Zoom)</p>
                        <Button size="sm" className="mt-2">Register</Button>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-2 flex items-center justify-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Resource
                    </Button>
                  </div>
                ) : (
                  <Alert className="bg-blue-50 border-blue-100">
                    <AlertDescription>
                      Join the community to access resources shared by members and community leaders.
                    </AlertDescription>
                    <Button 
                      className="mt-4"
                      onClick={() => handleJoinCommunity(selectedCommunity.id)}
                    >
                      Join Community
                    </Button>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default StudentCommunity;