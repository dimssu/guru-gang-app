import React, { useEffect, useState } from "react";
import axios, { API_URL } from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./attemptQuiz.css";

const AttemptQuiz = () => {
  const { quizId, courseId } = useParams(); 
  const { token } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/quizzes/course/${courseId}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        const foundQuiz = res.data.find((q) => q._id === quizId);
        if (foundQuiz) setQuiz(foundQuiz);
        else setMessage("Quiz not found in course.");
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setMessage("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, quizId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnswer) {
      setMessage("Please select an answer.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/quizzes/${quizId}/submit`,
        { answers: [selectedAnswer] },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      navigate("/result", { state: res.data });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setMessage("Failed to submit quiz.");
      setLoading(false);
    }
  };

  if (loading && !quiz) {
    return <div className="attempt-quiz-container">
      <p className="loading-message">Loading quiz...</p>
    </div>;
  }

  if (!quiz) {
    return <div className="attempt-quiz-container">
      <div className="quiz-content">
        <p className="error-message">{message || "Quiz not found"}</p>
        <button className="submit-button" onClick={() => navigate("/view-quiz")}>
          Back to Quizzes
        </button>
      </div>
    </div>;
  }

  const question = quiz.questions[0];

  return (
    <div className="attempt-quiz-container">
      <div className="quiz-content">
        <h2 className="quiz-title">{quiz.topic}</h2>
        <p className="quiz-question">{question.question}</p>

        <form onSubmit={handleSubmit}>
          <div className="quiz-options">
            {question.options.map((opt, idx) => (
              <div key={idx} className="option-item">
                <label className="option-label">
                  <input
                    type="radio"
                    name="option"
                    value={opt}
                    checked={selectedAnswer === opt}
                    onChange={() => setSelectedAnswer(opt)}
                    className="option-radio"
                  />
                  {opt}
                </label>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </form>

        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default AttemptQuiz;
