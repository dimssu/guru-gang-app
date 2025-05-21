import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { API_URL } from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { token, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3s
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset}>Reset Password</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
