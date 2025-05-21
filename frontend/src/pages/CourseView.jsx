import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import axios from "../api/axios";
import { getSlidesByCourse } from "../api/slides";
import { markSlideViewed, getCourseProgress } from "../api/progress";
import { FaBook, FaLink, FaArrowLeft, FaSpinner, FaCheckCircle } from "react-icons/fa";
import "./CourseView.css";

const CourseView = () => {
  const { courseId } = useParams();
  const { token } = useAuth();
  const [course, setCourse] = useState(null);
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({
    progress: 0,
    viewedCount: 0,
    totalSlides: 0,
    slidesViewed: []
  });

  useEffect(() => {
    const fetchCourseAndSlides = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await axios.get(`/api/courses/${courseId}`, {
          headers: { "x-auth-token": token }
        });
        setCourse(courseResponse.data);
        
        // Fetch slides
        const slidesData = await getSlidesByCourse(courseId, token);
        setSlides(slidesData);
        
        // Fetch progress
        const progressData = await getCourseProgress(courseId, token);
        setProgress(progressData);
        
        // Set active slide to the first one if available
        if (slidesData.length > 0) {
          setActiveSlide(slidesData[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to load course content. Please try again later.");
        setLoading(false);
      }
    };

    if (token && courseId) {
      fetchCourseAndSlides();
    }
  }, [courseId, token]);

  const handleSlideSelect = async (slide) => {
    setActiveSlide(slide);
    
    // Check if slide is already viewed
    const isAlreadyViewed = progress.slidesViewed.includes(slide._id);
    
    // Mark slide as viewed if not already viewed
    if (!isAlreadyViewed) {
      try {
        const updatedProgress = await markSlideViewed(courseId, slide._id, token);
        setProgress(prev => ({
          ...prev,
          viewedCount: updatedProgress.slidesViewed.length,
          progress: Math.round((updatedProgress.slidesViewed.length / slides.length) * 100),
          slidesViewed: updatedProgress.slidesViewed
        }));
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  // Check if a slide has been viewed
  const isSlideViewed = (slideId) => {
    return progress.slidesViewed.includes(slideId);
  };

  if (loading) {
    return (
      <div className="course-view-loading">
        <FaSpinner className="spinner" />
        <p>Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-view-error">
        <p>{error}</p>
        <button onClick={() => window.history.back()} className="back-button">
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="course-view-container">
      <header className="course-view-header">
        <h1><FaBook /> {course?.title}</h1>
        <p>{course?.description}</p>
        <div className="course-progress-bar">
          <div className="progress-bar-outer">
            <div 
              className="progress-bar-inner" 
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {progress.progress}% Complete ({progress.viewedCount}/{progress.totalSlides} slides)
          </span>
        </div>
      </header>

      <div className="course-content-layout">
        {/* Slide Navigation Sidebar */}
        <aside className="slide-navigation">
          <h3>Course Content</h3>
          {slides.length === 0 ? (
            <p className="no-slides-message">No content available for this course yet.</p>
          ) : (
            <ul className="slides-list">
              {slides.map((slide) => (
                <li 
                  key={slide._id} 
                  className={`slide-item ${activeSlide?._id === slide._id ? 'active' : ''} ${isSlideViewed(slide._id) ? 'viewed' : ''}`}
                  onClick={() => handleSlideSelect(slide)}
                >
                  {slide.title}
                  {isSlideViewed(slide._id) && <FaCheckCircle className="viewed-icon" />}
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Slide Content Area */}
        <main className="slide-content">
          {!activeSlide ? (
            <div className="no-slide-selected">
              <p>Select a topic from the sidebar to begin learning.</p>
            </div>
          ) : (
            <div className="active-slide">
              <h2>{activeSlide.title}</h2>
              
              <div className="slide-description">
                {/* Format description to handle paragraphs */}
                {activeSlide.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {activeSlide.resourceLinks && activeSlide.resourceLinks.length > 0 && (
                <div className="resource-links-section">
                  <h3>Resources</h3>
                  <ul className="resource-links">
                    {activeSlide.resourceLinks.map((link, index) => (
                      <li key={index} className="resource-link">
                        <FaLink className="link-icon" />
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseView; 