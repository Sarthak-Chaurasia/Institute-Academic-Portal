import React from 'react';
import { Link } from 'react-router-dom';

function handleLogout() {
  localStorage.removeItem('token'); // Remove the token from local storage
  window.location.href = '/login'; // Redirect to the login page
}

function InstructorDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Instructor Dashboard</h1>
      <ul>
        <li><Link to="/courses">All Courses</Link></li>
        <li><Link to="/personal-details">Personal Details</Link></li>
        <button onClick={handleLogout}>Logout</button>
        {/* Add more links as needed */}
      </ul>
    </div>
  );
}

export default InstructorDashboard;
