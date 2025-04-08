import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import api from '../api';
import { Link } from 'react-router-dom';

const PersonalDetails = () => {
  const [details, setStudentDetails] = useState({});
  const [userRole, setRole] = useState('');
      useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwt_decode(token);
          console.log('Decoded JWT:', decoded);
          const user_id = parseInt(decoded?.sub);
          const userRole = decoded?.role;
          setRole(userRole);
          // const response = await api.get(`/register/personal-details`);
          api.get(`/register/personal-details`)
          .then(res => setStudentDetails(res.data))
          .catch(err => console.error('Failed to fetch student data:', err));
        }
      }, []);

  return (
    <div className="container">
      <div className="card">
      <h2>Personal Details</h2>
      <p><strong>Name:</strong> {details.Name}</p>
      <p><strong>Identity:</strong> {details.Identity}</p>
      <p><strong>Email:</strong> {details.Email}</p>

      {userRole === 'student' && (
        <>
          <p><strong>Program:</strong> {details.Program}</p>
          <p><strong>Department:</strong> {details.Department}</p>
          <p><strong>Year of Admission:</strong> {details["Year of Admission"]}</p>
          <p><strong>Contact Number:</strong> {details["Contact Number"]}</p>
          <p><strong>Hostel:</strong> {details.Hostel}</p>
          <p><strong>DOB:</strong> {details.DOB}</p>
          <p><strong>Nationality:</strong> {details.Nationality}</p>
          <p><strong>Additional Info:</strong> {details["Additional Personal Info"]}</p>
        </>
      )}

      {userRole === 'instructor' && (
        <>
          <p><strong>Department:</strong> {details.Department}</p>
          <p><strong>Research Areas:</strong> {details["Research Areas"]}</p>
        </>
      )}
      <p><Link to="/dashboard">Back to Dashboard</Link></p>
    </div>
    </div>
    
  );
};

export default PersonalDetails;