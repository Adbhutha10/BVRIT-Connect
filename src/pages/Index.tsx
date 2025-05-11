import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import ChatbotUI from '@/components/Chatbot/ChatbotUI';
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
  ShieldCheck
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 md:pb-24 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
            BVRIT Alumni-Student Connect
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Building bridges between generations of BVRIT talent through mentorship, 
            networking, and career opportunities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-lg px-6 py-6 h-auto">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-6 py-6 h-auto border-2">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="container mx-auto px-4 py-16 bg-white rounded-t-3xl shadow-sm">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Who Is This Platform For?</h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-sm border border-blue-100 transform transition-all hover:scale-105">
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold ml-4 text-blue-800">For Students</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                <span>Get mentorship from experienced alumni in your field</span>
              </li>
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                <span>Access exclusive internship and job opportunities</span>
              </li>
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                <span>Join technical communities based on your interests</span>
              </li>
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                <span>Attend networking events and technical workshops</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl shadow-sm border border-purple-100 transform transition-all hover:scale-105">
            <div className="flex items-center mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold ml-4 text-purple-800">For Alumni</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                <span>Give back to BVRIT by mentoring current students</span>
              </li>
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                <span>Post job openings at your company for fellow graduates</span>
              </li>
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                <span>Host events and share your professional insights</span>
              </li>
              <li className="flex items-start">
                <ThumbsUp className="h-5 w-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                <span>Reconnect with college friends and expand your network</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Platform Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Alumni Directory</h3>
            <p className="text-gray-600">
              Browse and connect with BVRIT alumni across industries, locations, and graduation years. Filter by skills, company, or department.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <Briefcase className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Opportunities Board</h3>
            <p className="text-gray-600">
              Exclusive internships, jobs, and freelance work posted by alumni. Apply directly through the platform and track your applications.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <Calendar className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Events Management</h3>
            <p className="text-gray-600">
              Attend networking sessions, webinars, reunions, and hackathons organized by alumni. RSVP and get reminders for upcoming events.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <Handshake className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Mentorship Program</h3>
            <p className="text-gray-600">
              Connect with mentors in your field of interest. Get career guidance, technical advice, and professional development support.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Communities</h3>
            <p className="text-gray-600">
              Join interest-based groups for Full Stack Development, IoT, Computer Vision, Cloud Computing, and more with alumni as community leads.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <MessageCircle className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Chatbot Assistant</h3>
            <p className="text-gray-600">
              Get instant help navigating the platform, personalized recommendations, and answers to frequently asked questions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-3xl my-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-6 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold text-blue-600 shadow-md">1</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Sign Up & Verify</h3>
              <p className="text-gray-700">Students register with their @bvrit.ac.in email. Alumni undergo a verification process to confirm their BVRIT connection.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-6 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold text-blue-600 shadow-md">2</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-gray-700">Fill in your educational background, skills, and interests to get personalized recommendations and connections.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-6 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold text-blue-600 shadow-md">3</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Connect & Engage</h3>
              <p className="text-gray-700">Browse the alumni directory, join communities, and participate in events to expand your network.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-6 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold text-blue-600 shadow-md">4</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Grow & Give Back</h3>
              <p className="text-gray-700">Find opportunities if you're a student or offer mentorship and post opportunities if you're an alumnus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Community Voices</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">RS</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold">Nikhil Mamila</h4>
                <p className="text-sm text-gray-500">CSE Batch of 2023-2027, Software Engineer at Google</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "This platform helped me reconnect with my college friends and give back to BVRIT by mentoring talented students. The structured mentorship program makes it easy to contribute meaningfully."
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">AP</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold">Adbhutha Beere</h4>
                <p className="text-sm text-gray-500">CSE Student, 2nd Year</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "I found my internship through the opportunities board posted by an alumnus. The mentorship I received from Nikhil Mamilla helped me prepare for interviews and build the skills needed for the role."
            </p>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="container mx-auto px-4 py-12 mb-8">
        <div className="flex items-center justify-center mb-6">
          <ShieldCheck className="h-8 w-8 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold">Secure & BVRIT Exclusive</h3>
        </div>
        <p className="text-center text-gray-600 max-w-2xl mx-auto">
          Our platform is exclusively for BVRIT students and alumni. We verify all users and maintain strict privacy controls to ensure a safe and trustworthy community.
        </p>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the BVRIT Network?</h2>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
          Connect with peers, find mentors, and discover opportunities in our exclusive community.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto">
              Sign Up Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
          <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto">
              Login
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Chatbot Component */}
      <div className="fixed bottom-8 right-8 z-50">
        <ChatbotUI />
      </div>
    </div>
  );
};

export default Index;
