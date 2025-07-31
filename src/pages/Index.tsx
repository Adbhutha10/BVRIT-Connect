import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot';  
import ForgotPassword from './ForgotPassword';
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Handshake, 
  BookOpen, 
  Building2, 
  MessageCircle, 
  ThumbsUp, 
  ShieldCheck,
  Star,
  Sparkles,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const BVRITAlumniConnect = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation handlers
  const handleLogin = () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  const handleSignup = () => {
    // Redirect to register/signup page
    window.location.href = '/register';
  };

  const handleGetStarted = () => {
    // Redirect to register page
    window.location.href = '/register';
  };

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreFeatures = () => {
    // Scroll to features section
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleForgotPassword = () => {
    // Redirect to forgot password page
    window.location.href = '/forgot-password';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation with scroll effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 10 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      } border-b border-gray-100`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BVRIT Alumni Connect</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Community', 'Events', 'Mentorship'].map((item, index) => (
                <button
                  key={item}
                  className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => {
                    if (item === 'Features') handleExploreFeatures();
                  }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogin}
                className="hidden md:block px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-lg"
              >
                Login
              </button>
              <button 
                onClick={handleGetStarted}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                Get Started
              </button>
              <button 
                className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
            <div className="container mx-auto px-6 py-4 space-y-4">
              {['Features', 'Community', 'Events', 'Mentorship'].map((item) => (
                <button
                  key={item}
                  className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => {
                    if (item === 'Features') handleExploreFeatures();
                    setIsMenuOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
              <button 
                onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                className="block w-full text-left text-gray-600 hover:text-blue-600 font-medium py-2"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with animations */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-700 font-medium">Connect • Mentor • Grow</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-gray-900 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              BVRIT Alumni
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Connect Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              Building bridges between generations of BVRIT talent through mentorship, 
              networking, and exclusive career opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <button 
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                <span className="flex items-center justify-center">
                  Join the Network
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={handleExploreFeatures}
                className="group px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-700 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                <span className="flex items-center justify-center">
                  Explore Features
                  <ChevronDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 animate-fade-in-up">
            Who Is This Platform For?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-left">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 text-blue-900">For Students</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Get mentorship from experienced BVRIT alumni',
                  'Access exclusive internship and job opportunities',
                  'Join technical communities and skill groups',
                  'Attend networking events and workshops'
                ].map((item, index) => (
                  <li key={index} className="flex items-start animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ThumbsUp className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-right">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 text-purple-900">For Alumni</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Give back by mentoring current BVRIT students',
                  'Post job openings and hire talented graduates',
                  'Host events and share professional insights',
                  'Reconnect with college friends and expand network'
                ].map((item, index) => (
                  <li key={index} className="flex items-start animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ThumbsUp className="h-5 w-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features-section" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 animate-fade-in-up">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Everything you need to connect, learn, and grow in your career
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <Users className="h-12 w-12" />,
                title: "Alumni Directory",
                description: "Browse and connect with BVRIT alumni across industries, locations, and graduation years.",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-200"
              },
              {
                icon: <Briefcase className="h-12 w-12" />,
                title: "Opportunities Board",
                description: "Exclusive internships, jobs, and freelance work posted by alumni and partner companies.",
                color: "text-green-600",
                bg: "bg-green-50",
                border: "border-green-200"
              },
              {
                icon: <Calendar className="h-12 w-12" />,
                title: "Events Management",
                description: "Attend networking sessions, webinars, reunions, and hackathons organized by the community.",
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-200"
              },
              {
                icon: <Handshake className="h-12 w-12" />,
                title: "Mentorship Program",
                description: "Connect with mentors in your field and get personalized career guidance.",
                color: "text-orange-600",
                bg: "bg-orange-50",
                border: "border-orange-200"
              },
              {
                icon: <BookOpen className="h-12 w-12" />,
                title: "Technical Communities",
                description: "Join skill-based groups led by experienced alumni and industry professionals.",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-200"
              },
              {
                icon: <MessageCircle className="h-12 w-12" />,
                title: "AI Assistant",
                description: "Get instant help with platform navigation, recommendations, and career advice.",
                color: "text-pink-600",
                bg: "bg-pink-50",
                border: "border-pink-200"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`group p-8 rounded-2xl ${feature.bg} border ${feature.border} hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 animate-fade-in-up">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: "1",
                title: "Sign Up & Verify",
                description: "Students register with @bvrit.ac.in email. Alumni complete verification to confirm BVRIT connection."
              },
              {
                step: "2", 
                title: "Complete Your Profile",
                description: "Add your educational background, skills, and interests for personalized recommendations."
              },
              {
                step: "3",
                title: "Connect & Engage", 
                description: "Browse alumni directory, join communities, and participate in events to expand your network."
              },
              {
                step: "4",
                title: "Grow & Give Back",
                description: "Find opportunities as a student or offer mentorship and post jobs as an alumnus."
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-8 animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-fade-in-up">
              Ready to Join the BVRIT Network?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Connect with peers, find mentors, and discover opportunities in our exclusive community.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <button 
                onClick={handleSignup}
                className="group px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={handleLogin}
                className="px-8 py-4 border-2 border-white hover:bg-white hover:text-blue-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Footer */}
      <section className="py-12 px-6 bg-white border-t border-gray-100">
        <div className="container mx-auto text-center animate-fade-in-up">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Secure & BVRIT Exclusive</h3>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform is exclusively for verified BVRIT students and alumni. 
            We maintain strict privacy controls to ensure a safe and trustworthy community.
          </p>
        </div>
      </section>

      {/* Chatbot Component */}
      <Chatbot />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes fade-in-left {
          from { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes fade-in-right {
          from { 
            opacity: 0; 
            transform: translateX(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes bounce-gentle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 0.8s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.3s ease-out forwards; }
        .animate-bounce-gentle { animation: bounce-gentle 3s infinite; }
      `}</style>
    </div>
  );
};

export default BVRITAlumniConnect;