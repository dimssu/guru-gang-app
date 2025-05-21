import React, { useState, useContext } from "react";
import axios, { API_URL } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CreateQuiz = () => {
  const { token } = useAuth();
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("No authentication token found");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/quizzes/create`, 
        { topic, content, courseId },
        {
          headers: {
      "x-auth-token": token, 
    },
        }
      );
      setMessage("Quiz created successfully!");
    } catch (error) {
      console.error("Error during quiz creation:", error.response || error.message);
      setMessage("Failed to create quiz. Please check your connection and try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Quiz</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Course ID:</label>
          <input
            type="text"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Content (Summary / Notes):</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            style={styles.textarea}
          ></textarea>
        </div>
        <button type="submit" style={styles.button}>Generate Quiz</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.7rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default CreateQuiz;
