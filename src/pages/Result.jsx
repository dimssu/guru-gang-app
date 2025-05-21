import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./result.css";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  // Function to determine score class for color coding
  const getScoreClass = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage < 50) return "low";
    if (percentage < 75) return "medium";
    return "high";
  };

  if (!result) {
    return (
      <div className="result-container">
        <div className="result-content">
          <p className="result-error">No result data found.</p>
          <button className="result-button" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const scoreClass = getScoreClass(result.score, result.total);

  return (
    <div className="result-container">
      <div className="result-content">
        <h2 className="result-title">Quiz Result</h2>
        
        <div className={`result-score ${scoreClass}`}>
          {result.score} / {result.total}
        </div>
        
        <div className="result-details">
          <p className="result-summary">
            <strong>Summary:</strong> {result.summary}
          </p>
        </div>

        <button 
          className="result-button" 
          onClick={() => navigate("/student")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Result;
