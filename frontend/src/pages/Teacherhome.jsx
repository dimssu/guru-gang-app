import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import axios from "../api/axios";
import { FaBook, FaPlus, FaUsers, FaEdit, FaTrash, FaChalkboardTeacher, FaFileAlt, FaLink, FaArrowUp, FaArrowDown, FaTimes } from "react-icons/fa";
import "./teacherhome.css";
import { getSlidesByCourse, createSlide, updateSlide, deleteSlide } from "../api/slides";
import crs from "../assets/crs.png";

export default function TeacherHome() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showSlidesModal, setShowSlidesModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: ""
  });
  
  // Slide state
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [slideFormData, setSlideFormData] = useState({
    title: "",
    description: "",
    resourceLinks: [{ title: "", url: "" }]
  });
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/courses", {
          headers: { "x-auth-token": token }
        });
        
        // Filter courses where the teacher is the creator
        const teacherCourses = response.data.filter(course => {
          // Extract teacher ID from token
          const payload = JSON.parse(atob(token.split('.')[1]));
          return course.teacherId?._id === payload.id;
        });
        
        setCourses(teacherCourses);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Create a new course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/courses", formData, {
        headers: { "x-auth-token": token }
      });
      
      setCourses([...courses, response.data.course]);
      setShowAddModal(false);
      setFormData({ title: "", description: "", category: "" });
    } catch (error) {
      console.error("Error creating course:", error);
      setError("Failed to create course. Please try again.");
    }
  };

  // Update an existing course
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/courses/${currentCourse._id}`, formData, {
        headers: { "x-auth-token": token }
      });
      
      setCourses(courses.map(course => 
        course._id === currentCourse._id ? response.data.course : course
      ));
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating course:", error);
      setError("Failed to update course. Please try again.");
    }
  };

  // Delete a course
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`/api/courses/${courseId}`, {
          headers: { "x-auth-token": token }
        });
        
        setCourses(courses.filter(course => course._id !== courseId));
      } catch (error) {
        console.error("Error deleting course:", error);
        setError("Failed to delete course. Please try again.");
      }
    }
  };

  // Open edit modal with course data
  const openEditModal = (course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category
    });
    setActiveTab("details");
    setShowEditModal(true);
  };

  // Fetch enrolled students for a course
  const viewEnrolledStudents = async (courseId) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/students`, {
        headers: { "x-auth-token": token }
      });
      
      setEnrolledStudents(response.data.students);
      setCurrentCourse(courses.find(course => course._id === courseId));
      setShowStudentsModal(true);
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      setError("Failed to fetch enrolled students. Please try again.");
    }
  };

  // Slide management functions
  const fetchSlides = async (courseId) => {
    try {
      setSlidesLoading(true);
      const slidesData = await getSlidesByCourse(courseId, token);
      setSlides(slidesData);
      setSlidesLoading(false);
    } catch (error) {
      console.error("Error fetching slides:", error);
      setError("Failed to fetch slides. Please try again.");
      setSlidesLoading(false);
    }
  };

  const openSlidesModal = async (course) => {
    setCurrentCourse(course);
    setShowSlidesModal(true);
    await fetchSlides(course._id);
  };

  const handleSlideInputChange = (e) => {
    const { name, value } = e.target;
    setSlideFormData({
      ...slideFormData,
      [name]: value
    });
  };

  const handleResourceLinkChange = (index, field, value) => {
    const updatedLinks = [...slideFormData.resourceLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    setSlideFormData({
      ...slideFormData,
      resourceLinks: updatedLinks
    });
  };

  const addResourceLink = () => {
    setSlideFormData({
      ...slideFormData,
      resourceLinks: [...slideFormData.resourceLinks, { title: "", url: "" }]
    });
  };

  const removeResourceLink = (index) => {
    const updatedLinks = [...slideFormData.resourceLinks];
    updatedLinks.splice(index, 1);
    setSlideFormData({
      ...slideFormData,
      resourceLinks: updatedLinks.length > 0 ? updatedLinks : [{ title: "", url: "" }]
    });
  };

  const handleCreateSlide = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out empty resource links
      const filteredResourceLinks = slideFormData.resourceLinks.filter(
        link => link.title.trim() !== "" && link.url.trim() !== ""
      );
      
      const newSlideData = {
        ...slideFormData,
        resourceLinks: filteredResourceLinks,
        order: slides.length > 0 ? Math.max(...slides.map(s => s.order)) + 1 : 1
      };
      
      await createSlide(currentCourse._id, newSlideData, token);
      
      // Reset form and refresh slides
      setSlideFormData({
        title: "",
        description: "",
        resourceLinks: [{ title: "", url: "" }]
      });
      
      await fetchSlides(currentCourse._id);
    } catch (error) {
      console.error("Error creating slide:", error);
      setError("Failed to create slide. Please try again.");
    }
  };

  const handleEditSlide = (slide) => {
    setCurrentSlide(slide);
    setSlideFormData({
      title: slide.title,
      description: slide.description,
      resourceLinks: slide.resourceLinks.length > 0 
        ? slide.resourceLinks 
        : [{ title: "", url: "" }]
    });
  };

  const handleUpdateSlide = async (e) => {
    e.preventDefault();
    
    try {
      const filteredResourceLinks = slideFormData.resourceLinks.filter(
        link => link.title.trim() !== "" && link.url.trim() !== ""
      );
      
      await updateSlide(
        currentSlide._id, 
        { 
          ...slideFormData, 
          resourceLinks: filteredResourceLinks 
        }, 
        token
      );
      
      // Reset form and refresh slides
      setSlideFormData({
        title: "",
        description: "",
        resourceLinks: [{ title: "", url: "" }]
      });
      setCurrentSlide(null);
      
      await fetchSlides(currentCourse._id);
    } catch (error) {
      console.error("Error updating slide:", error);
      setError("Failed to update slide. Please try again.");
    }
  };

  const handleDeleteSlide = async (slideId) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      try {
        await deleteSlide(slideId, token);
        await fetchSlides(currentCourse._id);
      } catch (error) {
        console.error("Error deleting slide:", error);
        setError("Failed to delete slide. Please try again.");
      }
    }
  };

  const cancelEditSlide = () => {
    setCurrentSlide(null);
    setSlideFormData({
      title: "",
      description: "",
      resourceLinks: [{ title: "", url: "" }]
    });
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1><FaChalkboardTeacher className="header-icon" /> Teacher Dashboard</h1>
          <p>Manage your courses and track student progress</p>
          <button 
            className="create-course-btn"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Create New Course
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="courses-section">
        <div className="section-header">
          <h2><FaBook className="section-icon" /> My Courses</h2>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="no-courses">
            <p>You haven't created any courses yet.</p>
            <button 
              className="create-course-btn"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> Create Your First Course
            </button>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-image" >
                  <img src={crs} alt="Course Banner" />
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description.substring(0, 100)}...</p>
                  <div className="course-meta">
                    <span className="course-category">{course.category}</span>
                    <span className="student-count">
                      <FaUsers /> {course.students?.length || 0} Students
                    </span>
                  </div>
                </div>
                <div className="course-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => openSlidesModal(course)}
                  >
                    <FaFileAlt /> Slides
                  </button>
                  <button 
                    className="action-btn view-btn"
                    onClick={() => viewEnrolledStudents(course._id)}
                  >
                    <FaUsers /> Students
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => openEditModal(course)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label htmlFor="title">Course Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Course</h2>
            
            <div className="modal-tabs">
              <div 
                className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Course Details
              </div>
              <div 
                className={`modal-tab ${activeTab === 'slides' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('slides');
                  fetchSlides(currentCourse._id);
                }}
              >
                Manage Slides
              </div>
            </div>
            
            <div className={`modal-tab-content ${activeTab === 'details' ? 'active' : ''}`}>
              <form onSubmit={handleUpdateCourse}>
                <div className="form-group">
                  <label htmlFor="edit-title">Course Title</label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-category">Category</label>
                  <input
                    type="text"
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit">Update Course</button>
                </div>
              </form>
            </div>
            
            <div className={`modal-tab-content ${activeTab === 'slides' ? 'active' : ''}`}>
              <div className="slides-management">
                <div className="slides-header">
                  <h3>Course Slides <span className="slide-count">{slides.length}</span></h3>
                </div>
                
                {slidesLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading slides...</p>
                  </div>
                ) : (
                  <>
                    {slides.length === 0 ? (
                      <div className="slides-empty">
                        <p>No slides have been added yet.</p>
                      </div>
                    ) : (
                      <div className="slide-list">
                        {slides.map((slide) => (
                          <div key={slide._id} className="slide-item">
                            <div className="slide-title">{slide.title}</div>
                            <div className="slide-actions">
                              <button 
                                className="slide-action-btn edit"
                                onClick={() => handleEditSlide(slide)}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="slide-action-btn delete"
                                onClick={() => handleDeleteSlide(slide._id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="slide-form">
                      <div className="slide-form-header">
                        <h3>{currentSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
                        {currentSlide && (
                          <button 
                            type="button" 
                            className="slide-action-btn"
                            onClick={cancelEditSlide}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      
                      <form onSubmit={currentSlide ? handleUpdateSlide : handleCreateSlide}>
                        <div className="form-group">
                          <label htmlFor="slide-title">Slide Title</label>
                          <input
                            type="text"
                            id="slide-title"
                            name="title"
                            value={slideFormData.title}
                            onChange={handleSlideInputChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="slide-description">Description</label>
                          <textarea
                            id="slide-description"
                            name="description"
                            value={slideFormData.description}
                            onChange={handleSlideInputChange}
                            required
                            rows="4"
                          ></textarea>
                        </div>
                        
                        <div className="form-group">
                          <label>Resource Links</label>
                          <div className="resource-links">
                            {slideFormData.resourceLinks.map((link, index) => (
                              <div key={index} className="resource-link-item">
                                <input
                                  type="text"
                                  placeholder="Link Title"
                                  value={link.title}
                                  onChange={(e) => handleResourceLinkChange(index, 'title', e.target.value)}
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="url"
                                  placeholder="URL"
                                  value={link.url}
                                  onChange={(e) => handleResourceLinkChange(index, 'url', e.target.value)}
                                  style={{ flex: 2 }}
                                />
                                <button
                                  type="button"
                                  className="slide-action-btn delete"
                                  onClick={() => removeResourceLink(index)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <button
                            type="button"
                            className="add-resource-btn"
                            onClick={addResourceLink}
                          >
                            <FaPlus /> Add Resource Link
                          </button>
                        </div>
                        
                        <div className="slide-actions-container">
                          <button type="submit" className="action-btn">
                            {currentSlide ? 'Update Slide' : 'Add Slide'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
                
                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button onClick={() => setShowEditModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slides Management Modal */}
      {showSlidesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Manage Slides: {currentCourse?.title}</h2>
            
            <div className="slides-management">
              {slidesLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading slides...</p>
                </div>
              ) : (
                <>
                  {slides.length === 0 ? (
                    <div className="slides-empty">
                      <p>No slides have been added to this course yet.</p>
                    </div>
                  ) : (
                    <div className="slide-list">
                      {slides.map((slide) => (
                        <div key={slide._id} className="slide-item">
                          <div className="slide-title">{slide.title}</div>
                          <div className="slide-actions">
                            <button 
                              className="slide-action-btn edit"
                              onClick={() => handleEditSlide(slide)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="slide-action-btn delete"
                              onClick={() => handleDeleteSlide(slide._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="slide-form">
                    <div className="slide-form-header">
                      <h3>{currentSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
                      {currentSlide && (
                        <button 
                          type="button" 
                          className="slide-action-btn"
                          onClick={cancelEditSlide}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    
                    <form onSubmit={currentSlide ? handleUpdateSlide : handleCreateSlide}>
                      <div className="form-group">
                        <label htmlFor="slide-title-modal">Slide Title</label>
                        <input
                          type="text"
                          id="slide-title-modal"
                          name="title"
                          value={slideFormData.title}
                          onChange={handleSlideInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="slide-description-modal">Description</label>
                        <textarea
                          id="slide-description-modal"
                          name="description"
                          value={slideFormData.description}
                          onChange={handleSlideInputChange}
                          required
                          rows="4"
                        ></textarea>
                      </div>
                      
                      <div className="form-group">
                        <label>Resource Links</label>
                        <div className="resource-links">
                          {slideFormData.resourceLinks.map((link, index) => (
                            <div key={index} className="resource-link-item">
                              <input
                                type="text"
                                placeholder="Link Title"
                                value={link.title}
                                onChange={(e) => handleResourceLinkChange(index, 'title', e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <input
                                type="url"
                                placeholder="URL"
                                value={link.url}
                                onChange={(e) => handleResourceLinkChange(index, 'url', e.target.value)}
                                style={{ flex: 2 }}
                              />
                              <button
                                type="button"
                                className="slide-action-btn delete"
                                onClick={() => removeResourceLink(index)}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <button
                          type="button"
                          className="add-resource-btn"
                          onClick={addResourceLink}
                        >
                          <FaPlus /> Add Resource Link
                        </button>
                      </div>
                      
                      <div className="slide-actions-container">
                        <button type="submit" className="action-btn">
                          {currentSlide ? 'Update Slide' : 'Add Slide'}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
              
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button onClick={() => setShowSlidesModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Students Modal */}
      {showStudentsModal && (
        <div className="modal-overlay">
          <div className="modal-content students-modal">
            <h2>Enrolled Students: {currentCourse?.title}</h2>
            {enrolledStudents.length === 0 ? (
              <p className="no-students">No students enrolled in this course yet.</p>
            ) : (
              <div className="students-list">
                {enrolledStudents.map(student => (
                  <div key={student._id} className="student-item">
                    <div className="student-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="student-info">
                      <h4>{student.name}</h4>
                      <p>{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowStudentsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  