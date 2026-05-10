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
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  serverTimestamp
} from 'firebase/firestore';

interface Conversation {
  id: string;
  participantName: string;
  participantPhoto?: string;
  participantRole: 'mentor' | 'peer' | 'admin';
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
  online?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

const StudentCommunication: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");

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
          participantName: data.mentorName,
          participantPhoto: data.mentorPhotoURL,
          participantRole: 'mentor',
          lastMessage: "Hey! Looking forward to our session.",
          lastMessageTime: data.startDate,
          unreadCount: 0,
          online: Math.random() > 0.5
        };
      });
      setConversations(convs);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    // In a real app, this would write to a 'messages' subcollection
    const msg: Message = {
      id: Date.now().toString(),
      senderId: auth.currentUser?.uid || "",
      text: newMessage,
      timestamp: Timestamp.now()
    };
    
    setMessages([...messages, msg]);
    setNewMessage("");
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
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">2m ago</span>
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
                  <h2 className="font-bold text-gray-900">{selectedChat.participantName}</h2>
                  <p className="text-xs text-green-500 flex items-center">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></span>
                    Online
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
                <Badge variant="outline" className="bg-white text-gray-400 border-gray-100 font-normal">Today, Oct 10</Badge>
              </div>
              
              <div className="flex justify-start gap-3 max-w-[80%]">
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex-shrink-0"></div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-800 text-sm">
                  Hey! I reviewed your project proposal. It looks solid! Let's discuss the implementation details in our next meeting.
                </div>
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className="flex justify-end gap-3">
                  <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-md text-white text-sm max-w-[80%]">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl ring-1 ring-gray-200 focus-within:ring-blue-200 transition-all">
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-blue-600"><Plus className="h-5 w-5" /></Button>
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
                  disabled={!newMessage.trim()}
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
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Shared Media</h4>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="aspect-square bg-white rounded-xl border border-gray-100 shadow-sm"></div>)}
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                <FileText className="h-4 w-4 mr-3" /> Shared Documents
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                <Clock className="h-4 w-4 mr-3" /> Conversation History
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 rounded-xl">
                <Settings className="h-4 w-4 mr-3" /> Chat Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCommunication;
