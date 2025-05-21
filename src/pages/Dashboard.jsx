import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Dashboard.css";
import { FaBook, FaClipboardList, FaBrain, FaChartLine, FaLaptopCode, FaSpinner } from "react-icons/fa";
import axios from "../api/axios";
import { useAuth } from "../context/Authcontext";
import { getAllCoursesProgress } from "../api/progress";
import crs from "../assets/crs.png";

const Dashboard = () => {
  const { token } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState({});
  const [courseStats, setCourseStats] = useState({
    enrolled: 0,
    completed: 0,
    avgCompletion: 0
  });

  // Fetch all courses progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!token || enrolledCourses.length === 0) return;
      
      try {
        const progressData = await getAllCoursesProgress(token);
        
        // Convert array to object with courseId as key for easier lookup
        const progressMap = {};
        progressData.forEach(item => {
          progressMap[item.courseId] = item;
        });
        
        setCourseProgress(progressMap);
        
        // Calculate stats
        if (progressData.length > 0) {
          const completedCourses = progressData.filter(course => course.progress === 100).length;
          const totalProgress = progressData.reduce((sum, course) => sum + course.progress, 0);
          const avgProgress = Math.round(totalProgress / progressData.length);
          
          setCourseStats(prev => ({
            ...prev,
            completed: completedCourses,
            avgCompletion: avgProgress
          }));
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    };
    
    fetchProgressData();
  }, [token, enrolledCourses]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await axios.get("/api/courses", {
          headers: { "x-auth-token": token }
        });
        
        // Filter courses the user is enrolled in
        const userId = getUserIdFromToken(token);
        const enrolled = response.data.filter(course => 
          course.students && course.students.includes(userId)
        );
        
        setEnrolledCourses(enrolled);
        setCourseStats(prev => ({
          ...prev,
          enrolled: enrolled.length
        }));
        
        setCoursesLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCoursesLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  // Helper function to extract user ID from token
  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  // Get progress for a specific course
  const getProgressForCourse = (courseId) => {
    if (courseProgress[courseId]) {
      return courseProgress[courseId].progress;
    }
    return 0;
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome to EduLearn</h1>
          <p>Your personalized learning journey starts here</p>
          <div className="header-actions">
            <Link to="/courses" className="primary-button">
              <FaBook className="button-icon" /> Browse Courses
            </Link>
            <Link to="/view-quiz" className="secondary-button">
              <FaBrain className="button-icon" /> Take a Quiz
            </Link>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{courseStats.enrolled}</span>
            <span className="stat-label">Courses Enrolled</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{courseStats.completed}</span>
            <span className="stat-label">Courses Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{courseStats.avgCompletion}%</span>
            <span className="stat-label">Average Course Completion</span>
          </div>
        </div>
      </header>

      <section className="dashboard-section courses-section">
        <div className="section-header">
          <h2><FaBook className="section-icon" /> My Courses</h2>
          <Link to="/courses" className="view-all">View All</Link>
        </div>
        
        {coursesLoading ? (
          <div className="courses-loading">
            <FaSpinner className="loading-icon" />
            <p>Loading your courses...</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="no-courses-message">
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="browse-courses-btn">Browse Courses</Link>
          </div>
        ) : (
          <div className="card-grid">
            {enrolledCourses.slice(0, 3).map(course => {
              const progress = getProgressForCourse(course._id);
              
              return (
                <div key={course._id} className="course-card">
                  <div 
                    className="course-image" 
                  >
                    <img src={crs} alt="Course Banner" />
                  </div>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${progress}%`}}></div>
                    </div>
                    <span className="progress-text">{progress}% Complete</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description.substring(0, 80)}...</p>
                  <Link to={`/course/${course._id}`} className="course-button">Continue Learning</Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="dashboard-section assignments-section">
        <div className="section-header">
          <h2><FaClipboardList className="section-icon" /> Upcoming Assignments</h2>
        </div>
        <div className="assignments-list">
          <div className="assignment-card">
            <div className="assignment-status urgent"></div>
            <div className="assignment-content">
              <h3>React Component Project</h3>
              <p>Create a reusable component library with React</p>
              <div className="assignment-meta">
                <span className="due-date">Due: May 15, 2025</span>
                <span className="course-name">Course: Introduction to React</span>
              </div>
            </div>
            <Link to="/assignment" className="assignment-button">Submit Now</Link>
          </div>
          
          <div className="assignment-card">
            <div className="assignment-status upcoming"></div>
            <div className="assignment-content">
              <h3>JavaScript Algorithms</h3>
              <p>Implement common algorithms using JavaScript</p>
              <div className="assignment-meta">
                <span className="due-date">Due: May 22, 2025</span>
                <span className="course-name">Course: Advanced JavaScript</span>
              </div>
            </div>
            <Link to="/assignment" className="assignment-button">Submit Now</Link>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-section focus-section">
          <div className="section-header">
            <h2><FaLaptopCode className="section-icon" /> Focus Room</h2>
          </div>
          <div className="focus-card">
            <h3>Eliminate Distractions</h3>
            <p>Our AI-powered focus room helps you stay productive by monitoring your attention levels.</p>
            <Link to="/focus" className="focus-button">Enter Focus Room</Link>
          </div>
        </section>

        <section className="dashboard-section quiz-section">
          <div className="section-header">
            <h2><FaChartLine className="section-icon" /> Quick Quiz</h2>
          </div>
          <div className="quiz-card">
            <h3>Test Your Knowledge</h3>
            <p>Take a quick quiz to reinforce your learning and track your progress.</p>
            <Link to="/view-quiz" className="quiz-button">Start Quiz</Link>
          </div>
        </section>

        <section className="dashboard-section battles-section">
          <div className="section-header">
            <h2><FaBrain className="section-icon" /> Concept Battles</h2>
          </div>
          <div className="battles-card">
            <h3>Test Your Mastery</h3>
            <p>Battle against concepts and level up your understanding through fun challenges.</p>
            <Link to="/concept-battles" className="battles-button">Enter Battles</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

