import React, { useEffect, useState } from 'react';
import api from '../api';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/my_courses')
      .then((response) => setCourses(response.data))
      .catch((error) => console.error('Error fetching courses', error));
  }, []);

  return (
    <div>
      <h1>My Courses</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default StudentDashboard;