import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader, 
  RefreshCw,
  BookOpen,
  Users,
  Briefcase,
  GraduationCap,
  MessageSquareMore,
  Paperclip,
  Mic,
  MicOff,
  Navigation,
  FileText,
  ChevronRight
} from 'lucide-react';
import { db, auth } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState('Friend');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // API Config (Dynamic for production)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const AI_API_URL = `${API_BASE_URL}/api/ai/chat`;

  // Real-time user personalization
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserName(docSnap.data().fullName || docSnap.data().name || 'Friend');
      }
    });
    return () => unsubscribe();
  }, []);

  // Load default message on mount
  useEffect(() => {
    setDefaultMessage();
  }, [userName]);

  const setDefaultMessage = () => {
    setMessages([{
      id: 1,
      text: `Hi ${userName}! I'm your BVRIT AI. I can review your resume, find mentors, or guide your career. What's on your mind?`,
      isBot: true,
      timestamp: new Date(),
      actions: [
        { label: 'View Mentors', path: '/mentorship-panel' },
        { label: 'Career Hub', path: '/communication-tracker' }
      ]
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Recognition Logic
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      handleSendMessage(transcript);
    };
    recognition.start();
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const recentMessages = updatedMessages.slice(-6);
      const apiMessages = [
        { 
          role: "system", 
          content: `You are the BVRIT AI Concierge. User: ${userName}.
          Rules:
          - Be brief (2-3 sentences).
          - Use a professional, elite tone.
          - If the user wants to see mentors, suggest the /mentorship-panel.
          - If they want to see their impact/communication, suggest /communication-tracker.
          - If they want to update profile, suggest /profile-verification.
          IMPORTANT: If you suggest a page, include it in this format at the end: [ACTION: Label | Path]` 
        },
        ...recentMessages.map(msg => ({
          role: msg.isBot ? "assistant" : "user",
          content: msg.text
        }))
      ];

      // Call our secure backend instead of Groq directly
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages.filter(m => m.content)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI Backend Error:', errorData);
        throw new Error(errorData.message || 'AI engine is temporarily resting');
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI engine');
      }

      const rawText = data.choices[0].message.content;
      
      // Parse Actions
      const actionMatch = rawText.match(/\[ACTION:\s*(.*?)\s*\|\s*(.*?)\s*\]/);
      const cleanText = rawText.replace(/\[ACTION:.*?\]/g, '').trim();
      const actions = actionMatch ? [{ label: actionMatch[1], path: actionMatch[2] }] : [];

      const botMessage = {
        id: Date.now() + 1,
        text: cleanText,
        isBot: true,
        timestamp: new Date(),
        actions: actions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `📄 Uploaded: ${file.name}. Can you review this for me?`,
        isBot: false,
        timestamp: new Date()
      }]);
      // Simulate AI Review
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: `I've analyzed your resume, ${userName}. Your "Technical Skills" section is strong, but I recommend adding more quantifiable results to your projects. Would you like to see a sample project description?`,
          isBot: true,
          timestamp: new Date()
        }]);
      }, 1500);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 hover:scale-110 shadow-2xl transition-all flex items-center justify-center group rounded-2xl shadow-indigo-200"
          >
            <MessageSquareMore className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 w-[calc(100vw-32px)] md:w-[380px] h-[500px] md:h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Elite Header */}
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-purple-800 p-6 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <Bot className="h-6 w-6 text-indigo-100" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-none">BVRIT AI</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Llama 3 Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Canvas */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-gray-50/50">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.isBot ? 'items-start' : 'items-end'} group`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-xs leading-relaxed ${
                  message.isBot 
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm' 
                    : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100'
                }`}>
                  {message.text}
                </div>
                
                {/* Action Buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className="flex items-center gap-2 bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Navigation className="h-2.5 w-2.5" />
                        {action.label}
                        <ChevronRight className="h-2.5 w-2.5 opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-[9px] mt-1 font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center animate-pulse">
                  <Loader className="h-4 w-4 text-indigo-600 animate-spin" />
                </div>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Syncing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Console */}
          <div className="p-6 bg-white border-t border-gray-100 shrink-0">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-indigo-200 focus-within:bg-white transition-all">
                <button 
                  onClick={handleFileUpload}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                  title="Upload Resume"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Ask BVRIT AI..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] resize-none py-1"
                  rows={1}
                />

                <button 
                  onClick={startListening}
                  className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-gray-400 hover:text-indigo-600 hover:bg-white'}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="flex justify-between items-center px-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <FileText className="h-2.5 w-2.5 mr-2" /> Resume Mode
                </p>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;