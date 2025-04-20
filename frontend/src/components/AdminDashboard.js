import React from 'react';
import { Link } from 'react-router-dom';

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('registered');
  window.location.href = '/login'; // Redirect to the login page
}

function AdminDashboard() {
  return (
    <div className="container">
      <div className="card">
      <h1 style={{ textAlign: 'center' }}>Admin Dashboard</h1>
      <ul>
        <li><Link to="/courses">All Courses</Link></li>
        <button onClick={handleLogout}>Logout</button>
        {/* Add more links as needed */}
      </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
