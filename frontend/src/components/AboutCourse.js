import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import jwt_decode from 'jwt-decode';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

function AboutCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [role, setRole] = useState('');
  const history = useHistory();
  let newcourseid = courseId; // Initialize newcourseid with courseId

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      const userRole = decoded?.role;
      setRole(userRole);
    }

    api.get(`/courses/${courseId}`)
      .then((res) => setCourse(res.data))
      .catch((err) => console.error('Error loading course', err));
  }, [courseId]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    prev_course_id: courseId,
    course_id: "",
    name: "",
    prev_semester: "",
    semester: "",
    max_seats: "",
    credits: "",
    prerequisites: [],
    description: "",
    tags: [],
    instructor_id: "",
    department_id: "",
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
      if (tagInput.trim()) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
        setTagInput("");
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
    console.log("Editing Course:", formData);
    // Add your API call or form handling logic here
    api.post('/courses/edit-course', formData)
      .then((response) => {
        newcourseid = response.data.course_id; // Update courseId with the new course ID from the response
        console.log('Course edited successfully:', response.data);
        setShowForm(false); // Hide the form after submission
        setFormData({
          prev_course_id: newcourseid,
          course_id: "",
          name: "",
          semester: "",
          prev_semester: "",
          max_seats: "",
          credits: "",
          prerequisites: [],
          description: "",
          tags: [],
          instructor_id: "",
          department_id: "",
        });
      history.push(`/courses/${newcourseid}`); // Redirect to the new course page
        // Optionally, refresh the courses list or show a success message
      })
      .catch((error) => {
        console.error('Error editing course:', error);
      });
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>Course Details: {course.course_id}</h2>
      <p><strong>Name:</strong> {course.name}</p>
      <p><strong>Description:</strong> {course.description}</p>
      <p><strong>Credits:</strong> {course.credits}</p>
      <p><strong>Department:</strong> {course.department_id}</p>

      {role === 'admin' && (
        <>
          {course.offerings && course.offerings.length > 0 && (
            <div>
              <h3>Offerings</h3>
              <ul>
                {course.offerings.map((o, idx) => (
                  <li key={idx}>
                    Offering ID: {o.offering_id}, Semester ID: {o.semester_id}, Instructor ID: {o.instructor_id}, Max Seats: {o.max_seats}, Current Seats: {o.current_seats}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <h3>Prerequisites</h3>
              <ul>
                {course.prerequisites.map((p, idx) => (
                  <li key={idx}>
                    Prerequisite ID: {p.prerequisite_id}, Prerequisite Course ID: {p.prereq_course_id}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.allowed_tags && course.allowed_tags.length > 0 && (
            <div>
              <h3>Allowed Tags</h3>
              <ul>
                {course.allowed_tags.map((tag, idx) => (

                  <li key={idx}>
                    Allowed Tag ID: {tag.allowed_tag_id}, Department ID: {tag.department_id}, Tag ID: {tag.tag_id}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setShowForm(true)} style={{ marginTop: "16px" }}>
            Edit Course Details
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: "16px", border: "1px solid #ccc", padding: "12px" }}>
              <h3>Edit Course Details</h3>
              <div style={{ marginBottom: "8px" }}>
                <label>Course ID: </label>
                <input type="text" name="course_id" value={formData.course_id} onChange={handleChange} />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label>Course Name: </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}  />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label>Previous Semester: </label>
                <input type="number" name="prev_semester" value={formData.prev_semester} onChange={handleChange}  />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label>Semester: </label>
                <input type="number" name="semester" value={formData.semester} onChange={handleChange} />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label>Max Seats: </label>
                <input type="number" name="max_seats" value={formData.max_seats} onChange={handleChange}  />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label>Credits: </label>
                <input type="number" name="credits" value={formData.credits} onChange={handleChange}  />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label>Instructor ID: </label>
                <input type="text" name="instructor_id" value={formData.instructor_id} onChange={handleChange}  />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label>Department ID: </label>
                <input type="number" name="department_id" value={formData.department_id} onChange={handleChange}  />
              </div>
            
              {/* Prerequisites Input */}
              <div style={{ marginBottom: "8px" }}>
                <label>Prerequisites: </label>
                <input
                  type="text"
                  value={prereqInput}
                  onChange={(e) => setPrereqInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddToList("prerequisites"))}
                  placeholder="Enter and press Enter"
                />
                <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {formData.prerequisites.map((item, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "4px 8px",
                        background: "#eee",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromList("prerequisites", index)}
                        style={{ marginLeft: "6px", cursor: "pointer", border: "none", background: "transparent" }}
                      >
                        ❌
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            
              {/* Tags Input */}
              <div style={{ marginBottom: "8px" }}>
                <label>Tags: </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddToList("tags"))}
                  placeholder="Enter and press Enter"
                />
                <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {formData.tags.map((item, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "4px 8px",
                        background: "#eee",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromList("tags", index)}
                        style={{ marginLeft: "6px", cursor: "pointer", border: "none", background: "transparent" }}
                      >
                        ❌
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            
              <div style={{ marginBottom: "8px" }}>
                <label>Description: </label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
              </div>
            
              <button type="submit">Submit</button>
            </form>
        )}
        </>
      )
    }

      <p><Link to="/courses">Back to Courses</Link></p>
    </div>
  );
}

export default AboutCourse;
