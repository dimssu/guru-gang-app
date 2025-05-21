import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrophy, FaStar, FaArrowRight, FaLock, FaSpinner } from "react-icons/fa";
import "../styles/ConceptBattles.css";
import { fetchLevels } from "../api/conceptBattle";

const ConceptBattles = () => {
  const [levels, setLevels] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const data = await fetchLevels();
      setLevels(data);
      
      // Find the user's current level and points from the progress
      const userProgress = data.find(level => !level.completed);
      if (userProgress) {
        setUserLevel(userProgress.requiredLevel);
        setUserPoints(userProgress.requiredLevel * 1000 - 1000);
      }
    } catch (err) {
      setError("Failed to load levels. Please try again later.");
      console.error("Error loading levels:", err);
    } finally {
      setLoading(false);
    }
  };

  const startBattle = (levelId) => {
    navigate(`/concept-battle/${levelId}`);
  };

  if (loading) {
    return (
      <div className="battles-container loading">
        <FaSpinner className="spinner" />
        <p>Loading levels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="battles-container error">
        <p>{error}</p>
        <button onClick={loadLevels} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="battles-container">
      <div className="battles-header">
        <h1>Concept Battles</h1>
        <div className="user-stats">
          <div className="level-indicator">
            <FaTrophy className="trophy-icon" />
            <span>Level {userLevel}</span>
          </div>
          <div className="points-indicator">
            <span>{userPoints} XP</span>
          </div>
        </div>
      </div>

      <div className="levels-container">
        {levels.map((level) => (
          <div 
            key={level._id} 
            className={`level-card ${level.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="level-header">
              <h3>{level.name}</h3>
              <span className={`difficulty ${level.difficulty.toLowerCase()}`}>
                {level.difficulty}
              </span>
            </div>
            
            <div className="level-stars">
              {[...Array(3)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < level.stars ? "star filled" : "star empty"} 
                />
              ))}
            </div>
            
            {level.unlocked ? (
              <button 
                className="battle-button" 
                onClick={() => startBattle(level._id)}
              >
                {level.completed ? "Battle Again" : "Start Battle"} <FaArrowRight />
              </button>
            ) : (
              <div className="locked-message">
                <FaLock /> Unlock at Level {level.requiredLevel}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptBattles;
