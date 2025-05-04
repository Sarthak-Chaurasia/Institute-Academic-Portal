import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const Announcement = () => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    heading: '',
    content: '',
    date: '',
    started_by: '',
    flag: false,
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
      history.push("/instructor-dashboard");
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

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      flag: e.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     
        setMessage('Posted on Moodle.');
        setCountdown(5); // start countdown

    } catch (error) {
      console.error('Error posting announcement:', error);
      setMessage('Failed to post. Try again.');
    }
  };

  if (loadingUser) return <p>Loading user info...</p>;

  return (
    <div>
      <h1>Create Announcement</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="heading"
          placeholder="Heading"
          value={formData.heading}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Content"
          value={formData.content}
          onChange={handleChange}
          required
        ></textarea>

<div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px', marginTop: '0px' }}>
  <label htmlFor="importantCheckbox" style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px', cursor: 'pointer' }}>
    <h3>Mark this as Important</h3>
    <input
      type="checkbox"
      id="importantCheckbox"
      checked={formData.flag}
      onChange={handleCheckboxChange}
      style={{ width: '16px', height: '16px', verticalAlign: 'flex-end' }}
    />
  </label>
</div>
        <br />
        <button type="submit">Submit</button>
      </form>
      <p>
          <Link to="/dashboard">Back to Dashboard</Link>
        </p>

      {message && <p>{message}</p>}
      {countdown !== null && countdown > 0 && (
        <p>Redirecting to dashboard in {countdown} second{countdown > 1 ? 's' : ''}...</p>
      )}
    </div>
  );
};

export default Announcement;
