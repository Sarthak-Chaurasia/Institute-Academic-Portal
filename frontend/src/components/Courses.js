import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses')
      .then((response) => {
        console.log('Courses:', response.data);
        setCourses(response.data);
      })
      .catch((error) => console.error('Error fetching courses', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>All Courses</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f9f9f9' }}>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Course ID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Description</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Credits</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Department ID</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.course_id}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.course_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.description}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.credits}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.department_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><Link to="/dashboard">Back to Dashboard</Link></p>
    </div>
  );
}

export default Courses;
