import React, { useState } from "react";
import axios, { API_URL } from "../api/axios";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import "./quizzes.css";

const Quizzes = () => {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  // Add course options for the dropdown
  const courseOptions = [
    { label: "React", value: "6804d932953c8689c9b24a04" },
    { label: "Java", value: "68227b2442b12b2b6f4f1c65" },
    { label: "React Basics", value: "6804d932953c8689c9b24a04" },
    // You can add more course options here
  ];

  const fetchQuizzes = async () => {
    if (!token) {
      setMessage("You must be logged in as a student.");
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/quizzes/course/${courseId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      setQuizzes(res.data);
      setMessage(res.data.length ? "" : "No quizzes found for this course.");
    } catch (error) {
      console.error("Error fetching quizzes:", error.response || error.message);
      setMessage("Failed to fetch quizzes. Please try again.");
    }
  };

  // Modified to handle dropdown change
  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    setCourseId(selectedCourseId);
  };

  // Keep this for potential manual submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseId.trim()) {
      setMessage("Please select a Course.");
      return;
    }
    fetchQuizzes();
  };

  const handleQuizClick = (quizId) => {
    navigate(`/attempt/${courseId}/${quizId}`);
  };

  return (
    <div className="quizzes-container">
      <div className="quizzes-header">
        <h2 className="quizzes-title">View Quizzes</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="quizzes-form">
        <select
          value={courseId}
          onChange={handleCourseChange}
          className="quizzes-select"
        >
          <option value="">Select a Course</option>
          {courseOptions.map((course) => (
            <option key={course.value} value={course.value}>
              {course.label}
            </option>
          ))}
        </select>
        <button type="submit" className="quizzes-button">Fetch Quizzes</button>
      </form>

      {message && <p className="quizzes-message">{message}</p>}

      <div className="quizzes-list">
        {quizzes.map((quiz, index) => (
          <div
            key={quiz._id || index}
            className="quiz-card"
            onClick={() => handleQuizClick(quiz._id)}
          >
            <h4>{quiz.topic}</h4>
            <p>{quiz.content}</p>
            <p className="attempt-link">Click to Attempt</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quizzes;

