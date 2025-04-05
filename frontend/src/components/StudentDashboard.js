import React from 'react';
import { Link } from 'react-router-dom';

function StudentDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Student Dashboard</h1>
      <ul>
        <li><Link to="/registration">Registration</Link></li>
        <li><Link to="/courses">All Courses</Link></li>
        {/* Add more links as needed */}
      </ul>
    </div>
  );
}

export default StudentDashboard;
