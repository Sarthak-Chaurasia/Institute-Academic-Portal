
import React, { useState, useEffect } from "react";
import { useHistory,useLocation } from "react-router-dom"; // for v5. For v6 use useNavigate

const ReportStudent = () => {
  const history = useHistory();
  const location = useLocation(); // for v5. For v6 use useNavigate
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    reason: "",
    evidence: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const studentId = location.state?.studentId || ""; // Get studentId from location state if available
  const courseId = location.state?.courseId || ""; // Get courseId from location state if available
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally send formData to server here
    // may PASS DAC requests to ADMIN here
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (submitted && countdown === 0) {
      history.push(`/courses/${courseId}`); // or any other route
    }
  }, [submitted, countdown, history]);

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <h2>Report Student to DAC Committee</h2>
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={formData.studentName}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
            value={formData.studentId}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <textarea
            name="reason"
            placeholder="Reason for reporting"
            value={formData.reason}
            onChange={handleChange}
            required
            rows={4}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <input
            type="text"
            name="evidence"
            placeholder="Evidence URL or notes"
            value={formData.evidence}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "red", color: "#fff", border: "none" }}>
            Submit Report
          </button>
        </form>
      ) : (
        <div>
          <h3>Report successfully submitted to DAC committee for student: {studentId}</h3>
          <p>Redirecting in {countdown}...</p>
        </div>
      )}
    </div>
  );
};

export default ReportStudent;
