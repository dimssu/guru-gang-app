import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import "../styles/Layout.css";
import { ChatBot } from "dissu-talks/src/components/ChatBot";
import { FaBars, FaTimes } from "react-icons/fa";

const Layout = ({ children }) => {
  const { role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Generate dynamic context based on user role
  const generateChatbotContext = () => {
    const baseContext = `You are a helpful assistant for VirtualLearn, an interactive learning platform. The platform has courses with slides, quizzes, assignments, concept battles, and a focus room for distraction-free studying.`;
    
    const courseFeatures = `Courses have progress tracking that shows completion percentage as students view slides. Each course has a collection of slides with descriptions and resource links.`;
    
    const progressFeatures = `The platform tracks student progress, displaying completion percentages for each course on the dashboard and in the course listings.`;
    
    let roleSpecificContext = '';
    
    if (role === 'student') {
      roleSpecificContext = `You are speaking to a student. Help them navigate their courses, track progress (currently at the slides level), find learning resources, complete assignments, participate in concept battles, and utilize the focus room for distraction-free studying. Provide study tips and explain course concepts when asked.`;
    } else if (role === 'teacher') {
      roleSpecificContext = `You are speaking to a teacher. Help them create and manage courses, develop slides with content and resources, create quizzes, assign concept battles, and track student progress. Offer teaching strategies and content creation tips.`;
    } else if (role === 'admin') {
      roleSpecificContext = `You are speaking to an admin. Help them manage users, oversee course creation, and monitor platform usage. Provide guidance on administrative functions and platform management.`;
    }
    
    return `${baseContext} ${courseFeatures} ${progressFeatures} ${roleSpecificContext}`;
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-container">
          <div className="logo-container">
            <h1>VIRTUAL LEARN</h1>
          </div>
          
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
            {role === "student" && (
              <>
                <Link to="/student" className="nav-link">Home</Link>
                <Link to="/courses" className="nav-link">Courses</Link>
                <Link to="/assignment" className="nav-link">Assignments</Link>
                <Link to="/focus" className="nav-link">Focus Room</Link>
                <Link to="/view-quiz" className="nav-link">Quizzes</Link>
                <Link to="/concept-battles" className="nav-link">Concept Battles</Link>
              </>
            )}
            {role === "teacher" && (
              <>
                <Link to="/teacher" className="nav-link">Home</Link>
                <Link to="/create-quiz" className="nav-link">Create Quiz</Link>
              </>
            )}
            {role === "admin" && (
              <>
                <Link to="/admin" className="nav-link">Home</Link>
              </>
            )}
            <Link to="/logout" className="logout-btn">Logout</Link>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="main-footer">
        All rights reserved @2025
      </footer>
      <ChatBot
        directLlmConfig={{
          apiEndpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
          apiKey: import.meta.env.VITE_GEMINI_API_KEY, 
          headers: {
            "Content-Type": "application/json"
          },
          formatMessages: (messages, newMessage, context) => ({
            contents: [
              ...(context ? [{ role: "user", parts: [{ text: context }] }] : []),
              ...messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
              })),
              { role: 'user', parts: [{ text: newMessage }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          }),
          parseResponse: (data) => data.candidates[0].content.parts[0].text
        }}
        context={generateChatbotContext()}
        responseType="friendly"
        position="bottom-right"
        welcomeMessage={`Hello! I'm your VirtualLearn assistant. How can I help you with your ${role === 'student' ? 'learning' : role === 'teacher' ? 'teaching' : 'administration'} today?`}
        styling={{ widgetColor: "#4a90e2", textColor: "#ffffff" }}
        theme="light"
        placeholderText="Ask anything..."
      />
    </div>
  );
};

export default Layout; 