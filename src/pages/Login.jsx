import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import axios from "../api/axios";
import "./login.css"; // Import the dedicated CSS file

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      console.log("Trying login with: ", email, password);

      const res = await axios.post("https://gurugang-server.dimssu.com/api/auth/login", { email, password });
      const token = res.data.token;
      console.log(res.data);

      setError("");
      login({ token }); // ✅ Updated to pass only token to match new AuthContext

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role || "student"; // fallback role

      // Navigate based on role
      if (role === "teacher") {
        navigate("/teacher", { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/student", { replace: true });
      }

    } catch (error) {
      console.error(error);
      setError(error.response?.data?.msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailForReset) {
      setError("Please provide an email address");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("https://gurugang-server.dimssu.com/api/auth/forgot-password", { email: emailForReset });
      setError(res.data.message || "Password reset email sent successfully!");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Error in sending reset link");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      {showForgotPassword ? (
        <div className="forgot-password-form">
          <h2>Forgot Password</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            value={emailForReset}
            onChange={(e) => setEmailForReset(e.target.value)}
          />
          <button onClick={handleForgotPassword} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <button className="back-button" onClick={() => setShowForgotPassword(false)}>
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
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
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="login-links">
            <p>
              <span
                className="login-link"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </span>
            </p>

            <p>
              Don't have an account?{" "}
              <span
                className="register-link"
                onClick={goToRegister}
              >
                Register Here
              </span>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;


