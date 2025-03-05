import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setRole(decoded.identity.role);
    }
  }, []);

  if (!role) return <div>Loading...</div>;

  switch (role) {
    case 'student':
      return <StudentDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Unauthorized</div>;
  }
}

export default Dashboard;