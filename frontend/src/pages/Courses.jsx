import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/Authcontext";
import { getAllCoursesProgress } from "../api/progress";
import { FaBook, FaSearch, FaFilter, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import crs from "../assets/crs.png";
import "./courses.css";

const Courses = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});

  // Get user ID from token
  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  // Load enrolled courses from localStorage on component mount
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      const storedEnrollments = localStorage.getItem(`enrolledCourses_${userId}`);
      if (storedEnrollments) {
        const parsedEnrollments = JSON.parse(storedEnrollments);
        setEnrollmentStatus(prev => ({
          ...prev,
          ...parsedEnrollments
        }));
      }
    }
  }, [token]);

  // Fetch course progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await getAllCoursesProgress(token);
        
        // Convert array to object with courseId as key
        const progressMap = {};
        progressData.forEach(item => {
          progressMap[item.courseId] = item;
        });
        
        setCourseProgress(progressMap);
      } catch (error) {
        console.error("Error fetching course progress:", error);
      }
    };

    if (token && enrolledCourses.length > 0) {
      fetchProgress();
    }
  }, [token, enrolledCourses]);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/courses", {
          headers: { "x-auth-token": token }
        });
        
        setCourses(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(course => course.category))];
        setCategories(uniqueCategories);
        
        const userId = getUserId();
        
        // Identify which courses the student is enrolled in
        const enrolled = response.data.filter(course => 
          course.students && course.students.includes(userId)
        );
        
        setEnrolledCourses(enrolled);
        
        // Create enrollment status object
        const statusObj = {};
        response.data.forEach(course => {
          statusObj[course._id] = course.students && course.students.includes(userId);
        });
        
        // Update enrollment status and save to localStorage
        setEnrollmentStatus(prev => {
          const updatedStatus = { ...prev, ...statusObj };
          if (userId) {
            localStorage.setItem(`enrolledCourses_${userId}`, JSON.stringify(updatedStatus));
          }
          return updatedStatus;
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again later.");
        setLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  // Get progress percentage for a course
  const getProgressPercentage = (courseId) => {
    if (courseProgress[courseId]) {
      return courseProgress[courseId].progress;
    }
    return 0;
  };

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      setEnrollmentStatus(prev => ({ ...prev, [courseId]: 'pending' }));
      
      await axios.post(`/api/courses/${courseId}/enroll`, {}, {
        headers: { "x-auth-token": token }
      });
      
      // Update enrollment status
      const userId = getUserId();
      setEnrollmentStatus(prev => {
        const updatedStatus = { ...prev, [courseId]: true };
        if (userId) {
          localStorage.setItem(`enrolledCourses_${userId}`, JSON.stringify(updatedStatus));
        }
        return updatedStatus;
      });
      
      // Update enrolled courses
      const enrolledCourse = courses.find(course => course._id === courseId);
      setEnrolledCourses(prev => [...prev, enrolledCourse]);
      
    } catch (error) {
      console.error("Error enrolling in course:", error);
      setEnrollmentStatus(prev => ({ ...prev, [courseId]: false }));
      setError("Failed to enroll in course. Please try again.");
    }
  };

  // Filter courses based on search term and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="courses-wrapper">
      <header className="courses-header">
        <div className="header-content">
          <h1><FaBook className="header-icon" /> Explore Courses</h1>
          <p>Discover new skills and expand your knowledge with our diverse course offerings</p>
        </div>
      </header>

      <section className="courses-search-section">
        <div className="search-container">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <FaFilter className="filter-icon" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      {enrolledCourses.length > 0 && (
        <section className="courses-section enrolled-courses">
          <div className="section-header">
            <h2><FaUserGraduate className="section-icon" /> My Enrolled Courses</h2>
          </div>
          <div className="card-grid">
            {enrolledCourses.map(course => {
              const progressPercent = getProgressPercentage(course._id);
              return (
                <div key={course._id} className="course-card enrolled">
                  <div className="course-image" >
                    <img src={crs} alt="Course Banner" />
                  </div>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${progressPercent}%`}}></div>
                    </div>
                    <span className="progress-text">{progressPercent}% Complete</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description.substring(0, 100)}...</p>
                  <div className="course-meta">
                    <span className="course-category">{course.category}</span>
                    <span className="course-instructor">
                      <FaChalkboardTeacher /> {course.teacherId?.name || "Instructor"}
                    </span>
                  </div>
                  <Link to={`/course/${course._id}`} className="course-button">Continue Learning</Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="courses-section available-courses">
        <div className="section-header">
          <h2><FaBook className="section-icon" /> Available Courses</h2>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>No courses found matching your criteria.</p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredCourses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-image" style={{backgroundImage: `url('/course-${course.category.toLowerCase().replace(/\s+/g, '-')}.jpg')`}}></div>
                <h3>{course.title}</h3>
                <p>{course.description.substring(0, 100)}...</p>
                <div className="course-meta">
                  <span className="course-category">{course.category}</span>
                  <span className="course-instructor">
                    <FaChalkboardTeacher /> {course.teacherId?.name || "Instructor"}
                  </span>
                </div>
                {enrollmentStatus[course._id] === true ? (
                  <button 
                    className="course-button enrolled disabled"
                    disabled={true}
                  >
                    Enrolled
                  </button>
                ) : (
                  <button 
                    onClick={() => handleEnroll(course._id)} 
                    className="course-button enroll"
                    disabled={enrollmentStatus[course._id] === 'pending'}
                  >
                    {enrollmentStatus[course._id] === 'pending' ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Courses;
