import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
// import AdminDashboard from './AdminDashboard';

function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      console.log('Decoded JWT:', decoded);
      const user_id = parseInt(decoded?.sub);
      const userRole = decoded?.role;
      setRole(userRole);
      // setRole(decoded.identity.role);
    }
  }, []);

  if (!role) {
    // return <div>Loading...</div>;
    return (
      <div className="container">
      <div className="card">
        <h1>Loading...</h1>
        <p>Role unidentified please login again. Role: {role}</p>
        <p>Click <a href="/login">here</a> to login.</p>
        </div>
      </div>
    );
  }

  switch (role) {
    case 'student':
      return <StudentDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    // case 'admin':
    //   return <AdminDashboard />;
    default:
      // return <div>Unauthorized</div>;
      return (
        <div className="container">
      <div className="card">
          <h1>Unauthorized</h1>
          <p>You do not have permission to access this page.</p>
          </div>
        </div>
      );
  }
}

export default Dashboard;