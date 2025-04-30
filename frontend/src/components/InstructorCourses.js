import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import jwt_decode from 'jwt-decode';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const InstrcutorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [userRole, setRole] = useState('');
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      console.log('Decoded JWT:', decoded);
      const user_id = parseInt(decoded?.sub);
      const userRole = decoded?.role;
      if (userRole !== 'instructor') {
        alert('You are not authorized to view this page.');
        history.push('/dashboard'); // Redirect to the dashboard or another page
      }
      setRole(userRole);
      console.log(api)
      api.get(`/courses/mycourses`)
        .then(res => setCourses(res.data))
        .catch(err => console.error('Failed to fetch instructor courses:', err));
    }
  }, []);

  const handleCourseClick = (id) => {
    // Optional: verify the course exists or prefetch it
    history.push(`/courses/${id}`);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Instructor Courses</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Course Code</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Running Semester</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Max Seats</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Current Seats</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCourseClick(course.course_id);
                    }}
                    style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                  >
                    {course.course_id}
                  </a>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.semester_id}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.max_seats}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{course.current_seats}</td>
              </tr>
            ))}
          </tbody>
        </table>


        <Link to="/instructor-dashboard" style={{ display: "inline-block", marginTop: "16px" }}>
          Back to Instructor Dashboard
        </Link>
      </div>
    </div>
  );
};
export default InstrcutorCourses;
