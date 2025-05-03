import React from 'react';
import { Link } from 'react-router-dom';

// import api from '../api'; // Import the API instance
// import { useHistory } from 'react-router-dom';

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('registered');
  window.location.href = '/login'; // Redirect to the login page
}

function StudentDashboard() {
  return (
    <div className="container">
      <div className="card">
      <h1 style={{ textAlign: 'center' }}>Student Dashboard</h1>
      <ul>
        <li><Link to="/courses">All Courses</Link></li>
        <li><Link to="/personal-details">Personal Details</Link></li>
        <li><Link to="/register_courses">Register for Courses</Link></li>
        <button onClick={handleLogout}>Logout</button>
        {/* Add more links as needed */}
      </ul>
    </div>
    </div>
  );
}

export default StudentDashboard;
