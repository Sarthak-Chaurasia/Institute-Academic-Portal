import React from 'react';
import { Link } from 'react-router-dom';

function handleLogout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('registered');
  window.location.href = '/login'; // Redirect to the login page
}

function InstructorDashboard() {
  return (
    <div className="container">
      <div className="card">
      <h1 style={{ textAlign: 'center' }}>Instructor Dashboard</h1>
      <ul>
        <li><Link to="/courses">All Courses</Link></li>
        <li><Link to="/personal-details">Personal Details</Link></li>
        <li><Link to="/instructor-courses">My Courses</Link></li>
        <button onClick={handleLogout}>Logout</button>
        {/* Add more links as needed */}
      </ul>
      </div>
    </div>
  );
}

export default InstructorDashboard;
