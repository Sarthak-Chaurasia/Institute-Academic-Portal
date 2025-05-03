import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import jwt_decode from "jwt-decode";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/signup', formData);
      console.log("Ye mila hai", response);
      console.log("Ye mila hai", response.data);
      console.log("Okay");
      const { access_token, user } = response.data;
      if (!access_token) {
        setError('Access token not found in response');
        return;
      }
      localStorage.setItem('token', access_token);
      try {
        const decoded = jwt_decode(access_token);
        const role = decoded?.role;
        if (role === 'admin') {
          history.push('/dashboard');
        }
        console.log("Decoded JWT:", decoded);
      } catch (error) {
        console.error("JWT Decode Error:", error.message);
      }
      history.push('/registration');

    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during signup');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Role:</label>
            <select
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
        <p>Already have an account? <Link to="/login">Log in here</Link></p>
      </div>
    </div>
  );
};

export default Signup;
