import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import jwt_decode from 'jwt-decode';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';



function AboutCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [role, setRole] = useState('');
  const history = useHistory();
  let newcourseid = courseId; // Initialize newcourseid with courseId
  const [showMarksDialog, setShowMarksDialog] = useState(false); // To show/hide marks dialog
  const [marksData, setMarksData] = useState({ name: '', marks: '' }); // To store the name and marks


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      const user_id = parseInt(decoded?.sub);
      const userRole = decoded?.role;
      setRole(userRole);
      if(userRole === 'instructor'){
        api.get(`/courses/${courseId}?need_offerings=true`)
          .then((res) => setOfferings(res.data))
          .catch((err) => console.error('Error loading course', err));
      }
      console.log('User ID:', user_id);
      console.log('User Role:', userRole);
      console.log("offerings", offerings);
    }

    api.get(`/courses/${courseId}`)
      .then((res) => setCourse(res.data))
      .catch((err) => console.error('Error loading course', err));
    // api.get(`/courses/tasks?course_id=${courseId}`)
  }, []);

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

  const handleSubmitEditCourse = (e) => {
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

  const handleWaitlistAction = (student_id,action) => {
    api.post(`/courses/${courseId}/wl_enrl?action=${action}&student_id=${student_id}`)
      .then((response) => {console.log('Waitlist action successful:', response.data);})
      .catch((error) => {console.error('Error performing waitlist action:', error);});
  };

  //empty handle functions for buttons
  const handleGrade = () => {
    api.post(`/courses/${courseId}?grading_scheme=absolute`) 
    // Add your logic here
  };

  const [showEdit, setShowEdit] = useState(false);
  const [descInput, setDescInput] = useState("");
  const handleSubmitDescription = () => {
    api.post('/courses/edit-course', { prev_course_id: courseId, description: descInput })
      .then((response) => {
        console.log('Description edited successfully:', response.data); 
        setShowEdit(false); // Hide the edit form after submission
        setDescInput(""); // Clear the input field
      })
      .catch((error) => {
        console.error('Error editing description:', error);
      });
  };

  const [showEditPrereq, setShowEditPrereq] = useState(false);
  const handleEditPrerequisites = () => {
    setShowEditPrereq(true);
  };
  const handleSubmitEditPrereq = () => {
    setFormData((prev) => ({ ...prev, prev_course_id: courseId }));
    api.post('/courses/edit-course',{ ...formData, prev_course_id: courseId })
      .then((response) => {
        console.log('Prerequisites edited successfully:', response.data);
        setShowEditPrereq(false); // Hide the edit form after submission
        setPrereqInput(""); // Clear the input field
        setFormData((prev) => ({ ...prev, prerequisites: [] })); // Clear the prerequisites list
      })
      .catch((error) => {
        console.error('Error editing prerequisites:', error);
      });
  };

  const handleClearWaitlist = () => {
    api.post(`/courses/${courseId}/wl_enrl?action=clear_waitlist&student_id=all`)
      .then((response) => {
        console.log('Waitlist cleared successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error clearing waitlist:', error);
      });
  };
  const handleMoodleAnnouncement = () => {
    console.log("Moodle Announcement button clicked");
    // Add your logic here
  };
  const handleTasksAndDeadline = () => {
    history.push(`/tasks-marks/${courseId}`);
  };
  const handleEnrollmentAction = (student_id, action) => {
    if (action === "DAC") {
      history.push("/DAC", { student_id, course_id: courseId });
    } else if (action === "marks") {
      // Trigger dialog to enter name and marks
      setShowMarksDialog(true);
    } else {
      // For other actions (like kick), just send the action to API
      api.post(`/courses/${courseId}/wl_enrl?action=${action}&student_id=${student_id}`)
        .then((response) => {
          console.log('Enrollment action successful:', response.data);
        })
        .catch((error) => {
          console.error('Error performing enrollment action:', error);
        });
    }
  };

  const handleMarksSubmit = (e,student_id) => {
    e.preventDefault();

    // Send the marks along with the name to the API
    api.post(`/courses/${courseId}/wl_enrl?action=marks&student_id=${student_id}`, {
      name: marksData.name,
      marks: marksData.marks
    })
      .then((response) => {
        console.log('Marks action successful:', response.data);
        setShowMarksDialog(false); // Close the dialog after submission
        setMarksData({ name: '', marks: '' }); // Clear form data
      })
      .catch((error) => {
        console.error('Error performing marks action:', error);
      });
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>Course Details: {course.course_id}</h2>
      <p><strong>Name:</strong> {course.name}</p>
      <p>
      <strong>Description:</strong> {course.description}
        <button
          onClick={() => setShowEdit(true)}
          style={{
            color: "blue",
            textDecoration: "underline",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginLeft: "10px"
          }}
        >
          Edit
        </button>
      </p>

      {showEdit && (
        <div style={{ marginTop: "8px" }}>
          <textarea
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            rows={3}
            style={{ width: "100%", marginBottom: "6px" }}
          />
          <button
            onClick={handleSubmitDescription}
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "none",
              padding: "6px 12px",
              cursor: "pointer"
            }}
          >
            Submit
          </button>
        </div>
      )}

      <p><strong>Credits:</strong> {course.credits}</p>
      <p><strong>Department:</strong> {course.department_id}</p>
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

          {course.prerequisites && course.prerequisites.length > 0 ? (
            <div>
              <h3>Prerequisites</h3>
              <ul>
                {course.prerequisites.map((p, idx) => (
                  <li key={idx}>
                    Prerequisite ID: {p.prerequisite_id}, Prerequisite Course ID: {p.prereq_course_id}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleEditPrerequisites}
                style={{
                  background: "none",
                  border: "none",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  marginTop: "8px"
                }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h3 style={{ margin: 0 }}>Prerequisites</h3>
              <button
                onClick={handleEditPrerequisites}
                style={{
                  background: "none",
                  border: "none",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  marginTop: "2px"
                }}
              >
                Add Prerequisites
              </button>
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
      <button
        style={{ backgroundColor: "blue", color: "white", padding: "10px 20px", margin: "5px", border: "none", cursor: "pointer" }}
        onClick={handleGrade}
      >
        Grade
      </button>

      {showEditPrereq && (
        <div style={{ marginTop: "10px" }}>
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
          <button
            onClick={handleSubmitEditPrereq}
            style={{ marginTop: "10px", backgroundColor: "blue", color: "white", padding: "6px 12px", border: "none" }}
          >
            Submit
          </button>
        </div>
      )}

      <button
        style={{ backgroundColor: "red", color: "white", padding: "10px 20px", margin: "5px", border: "none", cursor: "pointer" }}
        onClick={handleClearWaitlist}
      >
        Clear Waitlist
      </button>
      <button
        style={{ backgroundColor: "purple", color: "white", padding: "10px 20px", margin: "5px", border: "none", cursor: "pointer" }}
        onClick={handleMoodleAnnouncement}
      >
        Moodle Announcement
      </button>
      <button
        style={{ backgroundColor: "orange", color: "white", padding: "10px 20px", margin: "5px", border: "none", cursor: "pointer" }}
        onClick={handleTasksAndDeadline}
      >
        Tasks and Deadline
      </button>

      {role === 'admin' && (
        <>
          <button onClick={() => setShowForm(true)} style={{ marginTop: "16px" }}>
            Edit Course Details
          </button>

          {showForm && (
            <form onSubmit={handleSubmitEditCourse} style={{ marginTop: "16px", border: "1px solid #ccc", padding: "12px" }}>
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
     {role === 'instructor' && offerings && offerings.length > 0 && (
      <div>
        <h3>Offerings for this Course</h3>
        {offerings.map((offering, index) => (
          <div key={index} className="offering-section" style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
            <p><strong>Offering ID:</strong> {offering.offering_id}</p>
            <p><strong>Semester ID:</strong> {offering.semester_id}</p>
            <p><strong>Instructor ID:</strong> {offering.instructor_id}</p>
            <p><strong>Max Seats:</strong> {offering.max_seats}</p>
            <p><strong>Current Seats:</strong> {offering.current_seats}</p>

            <h4>Enrollments</h4>
              {offering.enrollments.length === 0 ? (
                <p>No enrollments yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Enrollment ID</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Student ID</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Date</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tag</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Marks</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Grade</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offering.enrollments.map((enroll) => (
                      <tr key={enroll.enrollment_id}>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{enroll.enrollment_id}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{enroll.student_id}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{enroll.status}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{new Date(enroll.enrollment_date).toLocaleDateString()}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{enroll.tag}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{enroll.total_marks?.toFixed(2) ?? 'NA'}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{enroll.grade?.grade || "NA"}</td>
                        {/* Action Buttons */}
                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                          <button 
                            style={{ backgroundColor: "red", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" }} 
                            onClick={() => handleEnrollmentAction(enroll.student_id, "DAC")}
                          >
                            DAC
                          </button>
                          <button 
                            style={{ backgroundColor: "orange", color: "white", padding: "5px 10px", border: "none", cursor: "pointer", marginLeft: "5px" }} 
                            onClick={() => handleEnrollmentAction(enroll.student_id, "kick")}
                          >
                            Kick
                          </button>
                          <button
                            style={{ backgroundColor: "green", color: "white", padding: "5px 10px", border: "none", cursor: "pointer", marginLeft: "5px" }}
                            onClick={() => handleEnrollmentAction(enroll.student_id, "marks")}
                          >
                            Marks
                          </button>

                          {/* Marks Dialog */}
                          {showMarksDialog && (
                            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                              <h3>Enter Marks</h3>
                              <form onSubmit={(e) => handleMarksSubmit(e, enroll.student_id)}>
                                <div>
                                  <label>Name: </label>
                                  <input
                                    type="text"
                                    value={marksData.name}
                                    onChange={(e) => setMarksData({ ...marksData, name: e.target.value })}
                                    required
                                  />
                                </div>
                                <div>
                                  <label>Percentage Marks: </label>
                                  <input
                                    type="number"
                                    value={marksData.marks}
                                    onChange={(e) => setMarksData({ ...marksData, marks: e.target.value })}
                                    required
                                  />
                                </div>
                                <div>
                                  <button type="submit" style={{ marginRight: '10px' }}>Submit</button>
                                  <button type="button" onClick={() => setShowMarksDialog(false)}>Cancel</button>
                                </div>
                              </form>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}



            <h4>Waitlist</h4>
            {offering.waitlists.length === 0 ? (
              <p>No students on waitlist.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Waitlist ID</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Student ID</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Position</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tag</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Timestamp</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offering.waitlists.map((wait) => (
                    <tr key={wait.waitlist_id}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{wait.waitlist_id}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{wait.student_id}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{wait.position}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{wait.tag}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {new Date(wait.timestamp).toLocaleString()}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        <button
                          onClick={() => handleWaitlistAction(wait.student_id, "accept")}
                          style={{ marginRight: "8px" }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleWaitlistAction(wait.student_id, "decline")}
                        >
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        ))}
      </div>
    )}


      {role === 'student' && (
        <div>
          <h3>Course Registration</h3>
          <p>To register for this course, please contact your instructor or administrator.</p>
        </div>
      )
     }

      <p><Link to="/instructor-dashboard">Back to Dashboard</Link></p>
    </div>
  );
}

export default AboutCourse;
