import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import jwt_decode from 'jwt-decode';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Registration = () => {
  const [formData, setFormData] = useState({
    program: '',
    department: '',
    year_of_admission: '',
    contact_number: '',
    hostel: '',
    dob: '',
    nationality: '',
    additional_info: '',
    research_areas: '',
    username: '',
  });
  const [userRole, setRole] = useState('');
  const history = useHistory();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      const user_id = parseInt(decoded?.sub);
      const userRole = decoded?.role;
      setRole(userRole);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', formData);
      alert('Registration successful!');
      console.log(response.data);
      localStorage.setItem('registered', true);
      history.push('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'An error occurred during registration');
      console.error('Error during registration:', error.response?.data || error.message);
      alert('Registration failed.');
    }
  };

  if (userRole == 'student') {
    return (
      <div className="container">
        <div className="card">
          <h2>Student Registration</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Program:</label>
              <select name="program" value={formData.program} onChange={handleChange} required>
                <option value="">--Select--</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label>Department:</label>
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">--Select--</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Humanities and Social Sciences">Humanities and Social Sciences</option>
              </select>
            </div>

            <div>
              <label>Year of Admission:</label>
              <input type="number" name="year_of_admission" value={formData.year_of_admission} onChange={handleChange} required />
            </div>

            <div>
              <label>Contact Number:</label>
              <input name="contact_number" value={formData.contact_number} onChange={handleChange} />
            </div>

            <div>
              <label>Hostel:</label>
              <input name="hostel" value={formData.hostel} onChange={handleChange} />
            </div>

            <div>
              <label>Date of Birth:</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>

            <div>
              <label>Nationality:</label>
              <input name="nationality" value={formData.nationality} onChange={handleChange} />
            </div>

            <div>
              <label>Additional Info:</label>
              <textarea name="additional_info" value={formData.additional_info} onChange={handleChange} />
            </div>

            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    );
  } else if (userRole == 'instructor') {
    return (
      <div className="container">
        <div className="card">
          <h2>Instructor Registration</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Department:</label>
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">--Select--</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Humanities and Social Sciences">Humanities and Social Sciences</option>
              </select>
            </div>

            <div>
              <label>Enter desired username</label><br />
              <input type="text" name="username" pattern="^[A-Za-z][A-Za-z0-9_]*$" value={formData.username} onChange={handleChange} />
            </div>

            <div>
              <label>Research Areas:</label>
              <textarea name="research_areas" value={formData.research_areas} onChange={handleChange} />
            </div>

            <button type="submit">Register</button>
          </form>
          {message && <p className="success-message">{message}</p>}
          <p><Link to="/login">Already Registered? Proceed to Login</Link></p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container">
        <div className="card">
          <h2>Registration</h2>
          <p>User role not recognized.</p>
        </div>
      </div>
    );
  }
};

export default Registration;