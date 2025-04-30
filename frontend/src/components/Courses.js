import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import jwt_decode from 'jwt-decode';

function Courses() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // Default to search by name
  const [sortBy, setSortBy] = useState('course_id');
  const [showFilter, setShowFilter] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({});
  const history = useHistory();
  const [role, setRole] = useState('');
  let decoded = null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      decoded = jwt_decode(token);
      setRole(decoded?.role);
    }
    api.get('/courses/departments')
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => console.error('Error fetching departments', error));
  }, []);

  useEffect(() => {
    const endpoint = selectedDepartment
      ? selectedDepartment === 'all'
        ? '/courses'
        : `/courses/departments/${selectedDepartment}/courses`
      : '/courses'; // For global search before selecting department
    api.get(endpoint)
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching courses', error);
        setCourses([]);
      });
  }, [selectedDepartment]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => {
        if (searchTerm) {
          if (searchType === 'name') {
            return course.name.toLowerCase().includes(searchTerm.toLowerCase());
          } else if (searchType === 'course_id') {
            return course.course_id.toLowerCase().includes(searchTerm.toLowerCase());
          }
        }
        return true;
      })
      .filter(course => {
        for (const [key, value] of Object.entries(filterCriteria)) {
          if (course[key] !== value) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'course_id') {
          return a.course_id.localeCompare(b.course_id);
        } else if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'credits') {
          return a.credits - b.credits;
        }
        return 0;
      });
  }, [courses, searchTerm, searchType, sortBy, filterCriteria]);

  const handleCourseClick = (id) => {
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
    department_id: "",
    instructor_id: ""
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
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
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
    api.post('/courses/add-course', formData)
      .then((response) => {
        console.log('Course added successfully:', response.data);
        setShowForm(false);
        setFormData({
          course_id: "",
          name: "",
          semester: "",
          max_seats: "",
          credits: "",
          prerequisites: [],
          description: "",
          tags: [],
          department_id: "",
          instructor_id: ""
        });
        if (selectedDepartment && (selectedDepartment === 'all' || selectedDepartment === formData.department_id)) {
          api.get(selectedDepartment === 'all' ? '/courses' : `/courses/departments/${selectedDepartment}/courses`)
            .then((response) => setCourses(response.data));
        }
      })
      .catch((error) => {
        console.error('Error adding course', error);
      });
  };

  const handleFilterChange = (key, value) => {
    setFilterCriteria(prev => ({ ...prev, [key]: value }));
  };

  if (!selectedDepartment) {
    return (
      <div className="container">
        <div className="card">
          <h1 style={{ textAlign: 'center' }}>Departments</h1>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: '8px', padding: '5px' }}
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ padding: '5px' }}
            >
              <option value="name">Search by Name</option>
              <option value="course_id">Search by Course ID</option>
            </select>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li
              onClick={() => setSelectedDepartment('all')}
              style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
            >
              All Departments
            </li>
            {departments.map(dept => (
              <li
                key={dept.department_id}
                onClick={() => setSelectedDepartment(dept.department_id)}
                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
              >
                {dept.name}
              </li>
            ))}
          </ul>
          <p><Link to="/dashboard">Back to Dashboard</Link></p>
        </div>
      </div>
    );
  }

  const departmentName = selectedDepartment === 'all'
    ? 'All Departments'
    : departments.find(d => d.department_id === selectedDepartment)?.name || 'Unknown';

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ textAlign: 'center' }}>Courses in {departmentName}</h1>
        <button onClick={() => setSelectedDepartment(null)} style={{ marginBottom: '16px' }}>
          Back to Departments
        </button>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search courses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginRight: '8px', padding: '5px' }}
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{ marginRight: '8px', padding: '5px' }}
          >
            <option value="name">Search by Name</option>
            <option value="course_id">Search by Course ID</option>
          </select>
          <button onClick={() => setShowFilter(!showFilter)} style={{ padding: '5px' }}>
            Filter
          </button>
        </div>
        {showFilter && (
          <div style={{ marginBottom: '16px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Filter Options</h3>
            <div>
              <label>Credits: </label>
              <input
                type="number"
                onChange={(e) => handleFilterChange('credits', parseInt(e.target.value))}
              />
            </div>
            {/* Add more filters as needed */}
          </div>
        )}
        {filteredCourses.length === 0 ? (
          <p>No courses available for this department.</p>
        ) : (
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
              {filteredCourses.map((course) => (
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
        )}

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
                  <label>Department ID<span style={{ color: 'red' }}> *</span>: </label>
                  <input type="number" name="department_id" value={formData.department_id} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label>Instructor ID: </label>
                  <input type="text" name="instructor_id" value={formData.instructor_id} onChange={handleChange} />
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
        <p><Link to="/dashboard">Back to Dashboard</Link></p>
      </div>
    </div>
  );
};

export default Courses;