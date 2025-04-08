import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../api';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
// import { useNavigate } from 'react-router-dom';



const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student',
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const history = useHistory(); // Use useHistory hook for navigation
  // const navigate = useNavigate(); // Use useNavigate hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Sending request with formData:', formData);
    setMessage('');
    setError('');

    try {
      // const response = await axios.post('/api/auth/signup', formData); // Using proxy
      const response = await api.post('/auth/signup', formData); // Using axios instance with base URL
      const { access_token, user } = response.data;
      console.log('Response received:', response.data);
      if (!access_token) {
        setError('Access token not found in response');
        console.error('Access token not found in response');
        return;
      }
      localStorage.setItem('token', access_token);
      history.push('/registration'); // Redirect to registration page after successful signup
    } catch (err) {
      console.error('Signup error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'An error occurred during signup');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <p>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default Signup;