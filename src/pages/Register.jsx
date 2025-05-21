import React, { useState } from "react";
import "./register.css"; // Import the dedicated CSS file
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = form;

    // Validate form fields
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    // Set loading state while waiting for response
    setLoading(true);
    setError(""); // Clear previous error if any

    try {
      await axios.post("/api/auth/register", { name, email, password, role });

      setSuccess("User registered successfully. Please log in.");
      setForm({ name: "", email: "", password: "", role: "student" });

      setTimeout(() => {
        navigate("/login");
      }, 1000); // Redirect after 1 second
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Register</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        
        <div className="login-link-container">
          <p>
            Already have an account?{" "}
            <span className="login-link" onClick={goToLogin}>
              Login Here
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
