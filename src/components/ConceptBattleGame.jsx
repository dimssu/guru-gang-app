import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBrain, FaCheckCircle, FaTimesCircle, FaTrophy, FaSpinner, FaStar } from "react-icons/fa";
import "../styles/ConceptBattleGame.css";
import { fetchQuestions, submitResult } from "../api/conceptBattle";

const ConceptBattleGame = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  
  useEffect(() => {
    loadQuestions();
  }, [levelId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await fetchQuestions(levelId);
      setQuestions(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load questions. Please try again later.");
      console.error("Error loading questions:", err);
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameOver || loading || error || !questions.length) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!showFeedback) {
            handleAnswer(null);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestion, gameOver, showFeedback, loading, questions]);
  
  const handleAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    // Check if answer is correct
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 100 + timeLeft);
    }
    
    // After 2 seconds, move to next question or end game
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
      } else {
        finishGame();
      }
    }, 2000);
  };
  
  const finishGame = async () => {
    try {
      setGameOver(true);
      const timeBonus = timeLeft;
      const results = await submitResult(levelId, score, timeBonus);
      
      setGameResults(results);
      setEarnedStars(results.stars);
      setUserLevel(results.newLevel);
    } catch (err) {
      setError("Failed to submit results. Please try again.");
      console.error("Error submitting results:", err);
    }
  };
  
  const goToLevels = () => {
    navigate('/concept-battles');
  };
  
  const retryLevel = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameResults(null);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="battle-game-container loading">
        <FaSpinner className="spinner" />
        <p>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="battle-game-container error">
        <p>{error}</p>
        <button onClick={goToLevels} className="continue-button">
          Back to Levels
        </button>
      </div>
    );
  }

  return (
    <div className="battle-game-container">
      {!gameOver ? (
        <>
          <div className="battle-header">
            <div className="question-counter">
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <div className="score-display">
              Score: {score}
            </div>
            <div className="timer">
              Time: {timeLeft}s
            </div>
          </div>
          
          <div className="question-container">
            <div className="question-icon">
              <FaBrain size={30} />
            </div>
            <h2>{questions[currentQuestion]?.question}</h2>
            
            <div className="options-container">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    showFeedback
                      ? index === questions[currentQuestion].correctAnswer
                        ? "correct"
                        : selectedAnswer === index
                        ? "incorrect"
                        : ""
                      : ""
                  } ${selectedAnswer === index ? "selected" : ""}`}
                  onClick={() => !showFeedback && handleAnswer(index)}
                  disabled={showFeedback}
                >
                  {option}
                  {showFeedback && index === questions[currentQuestion].correctAnswer && (
                    <FaCheckCircle className="feedback-icon correct" />
                  )}
                  {showFeedback && 
                    selectedAnswer === index && 
                    index !== questions[currentQuestion].correctAnswer && (
                    <FaTimesCircle className="feedback-icon incorrect" />
                  )}
                </button>
              ))}
            </div>
            
            {showFeedback && (
              <div className="feedback-container">
                <p>{questions[currentQuestion]?.explanation}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="results-container">
          <div className="results-header">
            <FaTrophy className="trophy-icon" />
            <h2>Battle Complete!</h2>
          </div>
          
          <div className="results-score">
            <p>Your Score: {gameResults?.totalScore || score}</p>
            {gameResults && (
              <p className="total-points">Total XP: {gameResults.totalPoints}</p>
            )}
            <div className="earned-stars">
              {[...Array(3)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < earnedStars ? "star filled" : "star empty"} 
                />
              ))}
            </div>
          </div>
          
          <div className="results-message">
            {earnedStars === 3 ? (
              <p>Perfect! You've mastered this concept!</p>
            ) : earnedStars === 2 ? (
              <p>Great job! You're getting the hang of it!</p>
            ) : earnedStars === 1 ? (
              <p>Good effort! Keep practicing to improve!</p>
            ) : (
              <p>Don't give up! Try again to earn some stars!</p>
            )}
            {gameResults?.newLevel > userLevel && (
              <p className="level-up">Level Up! You're now level {gameResults.newLevel}!</p>
            )}
          </div>
          
          <div className="results-actions">
            <button className="retry-button" onClick={retryLevel}>
              Try Again
            </button>
            <button className="continue-button" onClick={goToLevels}>
              Back to Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptBattleGame;
