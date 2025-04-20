import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import jwt_decode from 'jwt-decode';

function Courses() {
  const [courses, setCourses] = useState([]);
  const history = useHistory();
  const [role, setRole] = useState('');
  let decoded = null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    decoded = jwt_decode(token);
    const role = decoded?.role;
    setRole(role);
    api.get('/courses')
      .then((response) => {
        console.log('Courses:', response.data);
        setCourses(response.data);
      })
      .catch((error) => console.error('Error fetching courses', error));
  }, []);

  const handleCourseClick = (id) => {
    // Optional: verify the course exists or prefetch it
    history.push(`/courses/${id}`);
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    name: "",
    semester: "",
    max_seats: "",
    credits: "",
    prerequisites: [],
    description: "",
    tags: [],
  });
  const [prereqInput, setPrereqInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const handleAddToList = (type) => {
    if (type === "prerequisites" && prereqInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prereqInput.trim()],
      }));
      setPrereqInput("");
    } else if (type === "tags" && tagInput.trim()) {
      // Tags can't be empty
      if (tagInput.trim()) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
        setTagInput("");
      } else {
        alert('Tag cannot be empty');
      }
    }
  };

  const handleRemoveFromList = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting new course:", formData);
    // Add your API call or form handling logic here
    api.post('/courses/add-course', formData)
      .then((response) => {
        console.log('Course added successfully:', response.data);
        setShowForm(false); // Hide the form after submission
        setFormData({
          course_id: "",
          name: "",
          semester: "",
          max_seats: "",
          credits: "",
          prerequisites: [],
          description: "",
          tags: [],
        });
        // Optionally, refresh the courses list or show a success message
      })
      .catch((error) => {
        console.error('Error adding course:', error);
      });
  };

  return (
    <div className="container">
      <div className="card">
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
                <td>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCourseClick(course.course_id);
                    }}
                    style={{ color: '#007bff', textDecoration: 'underline' }}
                  >
                    {course.course_id}
                  </a>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.description}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.credits}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{course.department_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {role === 'admin' && (
          <>
            <button onClick={() => setShowForm(true)} style={{ marginTop: '16px' }}>
              Add New Course
            </button>
  
            {showForm && (
              <form onSubmit={handleSubmit} style={{ marginTop: '16px', border: '1px solid #ccc', padding: '12px' }}>
                <h3>Add New Course</h3>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Course ID<span style={{ color: 'red' }}> *</span>: </label>
                  <input type="text" name="course_id" value={formData.course_id} onChange={handleChange} required />
                </div>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Course Name<span style={{ color: 'red' }}> *</span>: </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Semester: </label>
                  <input type="number" name="semester" value={formData.semester} onChange={handleChange} />
                </div>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Max Seats<span style={{ color: 'red' }}> *</span>: </label>
                  <input type="number" name="max_seats" value={formData.max_seats} onChange={handleChange} required />
                </div>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Credits<span style={{ color: 'red' }}> *</span>: </label>
                  <input type="number" name="credits" value={formData.credits} onChange={handleChange} required />
                </div>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Prerequisites: </label>
                  <input
                    type="text"
                    value={prereqInput}
                    onChange={(e) => setPrereqInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList('prerequisites'))}
                    placeholder="Enter and press Enter"
                  />
                  <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formData.prerequisites.map((item, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 8px',
                          background: '#eee',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromList('prerequisites', index)}
                          style={{ marginLeft: '6px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                        >
                          ❌
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Tags<span style={{ color: 'red' }}> *</span>: </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToList('tags'))}
                    placeholder="Enter and press Enter"
                  />
                  <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formData.tags.map((item, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 8px',
                          background: '#eee',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromList('tags', index)}
                          style={{ marginLeft: '6px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                        >
                          ❌
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
  
                <div style={{ marginBottom: '8px' }}>
                  <label>Description: </label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
                </div>
  
                <button type="submit">Submit</button>
                <button onClick={() => setShowForm(false)} style={{ marginLeft: '8px' }}>
                  Cancel
                </button>
              </form>
            )}
          </>
        )}
  
        <p>
          <Link to="/dashboard">Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
};

export default Courses;
