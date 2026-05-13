import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  User, 
  Send, 
  Bell, 
  Calendar, 
  Video, 
  MoreVertical,
  Filter,
  CheckCircle,
  Clock,
  ArrowLeft,
  Settings,
  Plus,
  FileText,
  Star,
  Trash2,
  Download,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';

interface Conversation {
  id: string;
  participantName: string;
  participantPhoto?: string;
  participantRole: 'mentor' | 'peer' | 'admin';
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
  online?: boolean;
  participantId: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

const formatRelativeTime = (timestamp?: Timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
};

const StudentCommunication: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Mocking conversations based on active mentorships for now
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const mentorshipsQuery = query(
      collection(db, "mentorships"),
      where("studentId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(mentorshipsQuery, (snapshot) => {
      const convs: Conversation[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          participantName: data.mentorName || 'Mentor',
          participantPhoto: data.mentorPhotoURL,
          participantRole: 'mentor',
          lastMessage: data.lastMessage || "No messages yet",
          lastMessageTime: data.lastMessageTime || data.createdAt || Timestamp.now(),
          unreadCount: 0,
          online: false,
          participantId: data.mentorId
        };
      });
      setConversations(convs);
    });
    return () => unsubscribe();
  }, []);

  // Fetch participant status for all conversations
  useEffect(() => {
    if (conversations.length === 0) return;

    // Listen to all participant profiles to track online status
    const participantIds = conversations.map(c => c.participantId);
    // Firestore "in" query limited to 10 IDs, but mentorships are usually fewer
    // For now, we'll focus on the selected chat or just implement for all if small
    
    const alumniQuery = query(
      collection(db, 'alumni_profiles'),
      where('userId', 'in', participantIds.slice(0, 10))
    );

    const unsubscribeAlumni = onSnapshot(alumniQuery, (snapshot) => {
      const statusMap: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const lastActive = data.lastActive?.toDate();
        const isOnline = lastActive ? (new Date().getTime() - lastActive.getTime()) < 300000 : false;
        statusMap[data.userId] = isOnline;
      });

      setConversations(prev => prev.map(conv => ({
        ...conv,
        online: statusMap[conv.participantId] || false
      })));
    });

    return () => unsubscribeAlumni();
  }, [conversations.length]); // Re-run when number of conversations changes

  // Real-time message listener
  useEffect(() => {
    if (!selectedChat) return;

    const messagesQuery = query(
      collection(db, "mentorships", selectedChat.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribeMessages();
  }, [selectedChat]);

  // Shared documents listener
  useEffect(() => {
    if (!selectedChat) return;

    const docsQuery = query(
      collection(db, "mentorships", selectedChat.id, "documents"),
      orderBy("timestamp", "desc")
    );

    const unsubscribeDocs = onSnapshot(docsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSharedDocs(docs);
    });

    return () => unsubscribeDocs();
  }, [selectedChat]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    try {
      setIsUploading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const fileRef = ref(storage, `mentorship_docs/${selectedChat.id}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // 1. Add document record
      await addDoc(collection(db, "mentorships", selectedChat.id, "documents"), {
        name: file.name,
        url: downloadURL,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        type: file.type
      });

      // 2. Add message about file
      await addDoc(collection(db, "mentorships", selectedChat.id, "messages"), {
        senderId: currentUser.uid,
        text: `Shared a document: ${file.name}`,
        fileUrl: downloadURL,
        timestamp: serverTimestamp()
      });

      toast({ description: "File uploaded and shared successfully!" });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({ description: "Failed to upload file." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat) return;
    
    if (confirm("Are you sure you want to clear chat history? This cannot be undone.")) {
      try {
        const messagesRef = collection(db, "mentorships", selectedChat.id, "messages");
        const snapshot = await getDocs(messagesRef);
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Update parent mentorship to clear last message
        const mentorshipRef = doc(db, "mentorships", selectedChat.id);
        await updateDoc(mentorshipRef, {
          lastMessage: "No messages yet",
          lastMessageTime: serverTimestamp()
        });
        
        toast({ description: "Chat history cleared." });
        setShowSettings(false);
      } catch (error) {
        console.error("Error clearing chat:", error);
        toast({ description: "Failed to clear chat." });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // 1. Save message to Firestore subcollection
      const messagesPath = `mentorships/${selectedChat.id}/messages`;
      console.log(`Attempting to send message to: ${messagesPath}`);
      await addDoc(collection(db, "mentorships", selectedChat.id, "messages"), {
        senderId: currentUser.uid,
        text: newMessage,
        timestamp: serverTimestamp()
      });
      console.log("Message sent successfully!");

      // 2. Update parent mentorship document with last message info
      const mentorshipRef = doc(db, "mentorships", selectedChat.id);
      await updateDoc(mentorshipRef, {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp()
      });

      // 3. Trigger notification for the recipient
      console.log(`Attempting to send notification to: notifications`);
      await addDoc(collection(db, "notifications"), {
        recipientId: selectedChat.participantId,
        content: `New message from student: ${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
        type: 'message',
        timestamp: serverTimestamp(),
        readAt: null,
        senderName: currentUser.displayName || 'Student'
      });
      console.log("Notification sent successfully!");
      
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message or notification:", error);
      console.error("Error details:", error.code, error.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50/50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-in fade-in duration-500">
      
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-50">
              <Plus className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10 rounded-2xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border-none cursor-pointer">All</Badge>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-gray-500 cursor-pointer hover:bg-gray-100 border-none">Mentors</Badge>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-gray-500 cursor-pointer hover:bg-gray-100 border-none">Peers</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {conversations.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${
                selectedChat?.id === chat.id ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {chat.participantPhoto ? <img src={chat.participantPhoto} className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-gray-400" />}
                </div>
                {chat.online && <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-gray-900 truncate">{chat.participantName}</h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatRelativeTime(chat.lastMessageTime)}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-xl bg-gray-100 overflow-hidden">
                  {selectedChat.participantPhoto ? <img src={selectedChat.participantPhoto} className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-gray-400 mt-2 ml-2" />}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none">{selectedChat.participantName}</h2>
                  <p className={`text-xs flex items-center ${selectedChat.online ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full mr-2 ${selectedChat.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {selectedChat.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="rounded-full"><Video className="h-5 w-5 text-gray-500" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><Calendar className="h-5 w-5 text-gray-500" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              <div className="text-center">
                <Badge variant="outline" className="bg-white text-gray-400 border-gray-100 font-normal">
                  Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Badge>
              </div>
              


              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'} gap-3`}>
                  {msg.senderId !== auth.currentUser?.uid && (
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl shadow-sm text-sm max-w-[80%] ${
                    msg.senderId === auth.currentUser?.uid 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl ring-1 ring-gray-200 focus-within:ring-blue-200 transition-all">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl text-gray-400 hover:text-blue-600"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                >
                  <Paperclip className={`h-5 w-5 ${isUploading ? 'animate-pulse' : ''}`} />
                </Button>
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isUploading}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-10 shadow-md transition-all active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
              <MessageSquare className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Conversations</h2>
            <p className="text-gray-500 mt-2 max-w-xs">
              Select a mentor or peer from the left to start a conversation and share insights.
            </p>
            <Button className="mt-8 bg-blue-600 rounded-xl px-8" onClick={() => {/* Search */}}>
              Start New Chat
            </Button>
          </div>
        )}
      </div>

      {/* Right Panel - Info (Optional, hidden on smaller screens) */}
      {selectedChat && (
        <div className="hidden lg:flex w-72 bg-gray-50/50 border-l border-gray-100 flex-col p-6">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-md mb-4 ring-1 ring-gray-100">
              <div className="h-full w-full rounded-2xl bg-indigo-100 overflow-hidden">
                {selectedChat.participantPhoto ? <img src={selectedChat.participantPhoto} className="h-full w-full object-cover" /> : <User className="h-12 w-12 text-indigo-400 mt-6 ml-6" />}
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900">{selectedChat.participantName}</h3>
            <Badge className="mt-2 bg-indigo-50 text-indigo-600 border-none capitalize">{selectedChat.participantRole}</Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shared Documents</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {sharedDocs.length > 0 ? sharedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 group">
                    <div className="flex items-center min-w-0 mr-2">
                      <FileText className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">{doc.name}</span>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                    </a>
                  </div>
                )) : (
                  <div className="text-[10px] text-gray-400 italic">No shared documents yet.</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                onClick={() => toast({ description: "Conversation history feature is active. Scroll up to view older messages." })}
              >
                <Clock className="h-4 w-4 mr-3" /> Conversation History
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-xl ${showSettings ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-3" /> Chat Settings
              </Button>
              
              {showSettings && (
                <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 space-y-2 mt-2 animate-in slide-in-from-top-2 duration-200">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:bg-red-100 text-xs h-8"
                    onClick={handleClearChat}
                  >
                    <Trash2 className="h-3 w-3 mr-2" /> Clear Chat History
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCommunication;
