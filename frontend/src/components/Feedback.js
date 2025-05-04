import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const Feedback = () => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    content: '',
    suggestion: '',
  });

  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserAndSetDate = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No token found");

        const decoded = jwt_decode(token);
        const user_id = parseInt(decoded?.sub);

        const today = new Date().toISOString().split('T')[0];

        setFormData(prev => ({
          ...prev,
          started_by: user_id,
          date: today,
        }));
      } catch (err) {
        console.error("Failed to load user:", err);
        setFormData(prev => ({
          ...prev,
          started_by: 'unknown',
          date: new Date().toISOString().split('T')[0],
        }));
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndSetDate();
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      history.push("/student-dashboard");
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setMessage('Feedback is required.');
      return;
    }

    try {
      // Replace this with API call if needed: await api.post('/feedback', formData);
      setMessage('Thank you for your feedback!');
      setCountdown(5); // start countdown
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('Failed to submit. Please try again.');
    }
  };

  if (loadingUser) return <p>Loading user info...</p>;

  return (
    <div>
      <h1>Course Feedback</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="content">
          What is your feedback for this course? <span style={{ color: 'red' }}>*</span>
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          style={{ width: '100%', height: '100px', marginBottom: '10px' }}
        />

        <label htmlFor="suggestion">
          Do you have some suggestions you would like to share?
        </label>
        <textarea
          id="suggestion"
          name="suggestion"
          value={formData.suggestion}
          onChange={handleChange}
          style={{ width: '100%', height: '80px', marginBottom: '10px' }}
        />

        <button type="submit">Submit</button>
      </form>

      <p><Link to="/dashboard">Back to Dashboard</Link></p>

      {message && <p>{message}</p>}
      {countdown !== null && countdown > 0 && (
        <p>Redirecting to dashboard in {countdown} second{countdown > 1 ? 's' : ''}...</p>
      )}
    </div>
  );
};

export default Feedback;
