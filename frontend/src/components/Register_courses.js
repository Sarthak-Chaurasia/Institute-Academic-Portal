import React, { useState, useEffect } from "react";
import api from '../api';

function RegisterCourses() {
  const [courseCode, setCourseCode] = useState("");
  const [courseInfo, setCourseInfo] = useState(null);
  const [error, setError] = useState("");

  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  const [eligibility, setEligibility] = useState({ allowed: false, reason: "" });

  const [regCart, setRegCart] = useState([]);

  // Fetch and reset tags & eligibility whenever a course is loaded
  useEffect(() => {
    if (!courseInfo) {
      setTags([]);
      setEligibility({ allowed: false, reason: "" });
      return;
    }
  }, [courseInfo]);

  const handleSearch = async () => {
    try {
      const response = await api.get(`/register_courses/get_course/${courseCode}`);
      setCourseInfo(response.data);
      setSelectedTag("");
      setError("");
    } catch (err) {
      setCourseInfo(null);
      setTags([]);
      setError("Course not found or error fetching data.");
    }
  
    try {
      const response = await api.get(`/register_courses/tags/${courseCode}`);
  
      console.log("tags", response.data);
      setTags(response.data.tags);
      setSelectedTag("");
      setError("");
    }
    catch (err) {
      console.error("Error fetching tags:", err.response?.data || err.message);
      setTags([]);
      setError("Tags not found or error fetching data.");
    }
  };
  

  const handleAddToCart = () => {
    if (!eligibility.allowed) {
      alert(`Cannot add: ${eligibility.reason}`);
      return;
    }

    const entry = {
      ...courseInfo,
      tag: selectedTag
    };

    setRegCart(prev => [...prev, entry]);
    // Clear current selection
    setCourseInfo(null);
    setCourseCode("");
  };

  const totalCredits = regCart.reduce((sum, c) => sum + (c.credits || 0), 0);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register Course Offering</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Course Code:</label>
        <input
          type="text"
          value={courseCode}
          onChange={e => setCourseCode(e.target.value)}
          className="border p-2 w-full rounded"
          placeholder="e.g., CS101"
        />
        <button
          onClick={handleSearch}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {courseInfo && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p><strong>Course ID:</strong> {courseInfo.course_id}</p>
          <p><strong>Course Name:</strong> {courseInfo.course_name}</p>
          <p><strong>Credits:</strong> {courseInfo.credits}</p>
          <p><strong>Instructor:</strong> {courseInfo.instructor_name}</p>
          <p><strong>Semester:</strong> {courseInfo.semester_name}</p>
          <p><strong>Max Seats:</strong> {courseInfo.max_seats}</p>
          <p><strong>Current Seats:</strong> {courseInfo.current_seats}</p>

          <div className="mt-2">
            <label className="block text-sm font-medium">Tag:</label>
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="" disabled>Select tag</option>
              {(tags || []).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <p className={`mt-2 ${eligibility.allowed ? 'text-green-600' : 'text-red-600'}`}>
            {eligibility.allowed ? 'You are eligible to register.' : `Not eligible: ${eligibility.reason}`}
          </p>

          <button
            onClick={handleAddToCart}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Add to RegCart
          </button>
        </div>
      )}

      {/* Registration Cart */}
      {regCart.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">RegCart</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Course</th>
                <th className="border p-2">Credits</th>
                <th className="border p-2">Semester</th>
                <th className="border p-2">Tag</th>
              </tr>
            </thead>
            <tbody>
              {regCart.map((c, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{c.course_name} ({c.course_id})</td>
                  <td className="border p-2">{c.credits}</td>
                  <td className="border p-2">{c.semester_name}</td>
                  <td className="border p-2">{c.tag}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border p-2 font-bold">Total:</td>
                <td className="border p-2 font-bold">{totalCredits}</td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default RegisterCourses;
