import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../api'; // Adjust the import based on your project structure
import { useHistory } from 'react-router-dom';

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
  });

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
    //   const response = await axios.post('http://localhost:5000/api/register', formData);
    console.log("Token in localStorage:", localStorage.getItem('token'));  
    const response = await api.post('/register', formData); 
    alert('Registration successful!');
    console.log(response.data);
    console.log("Token in localStorage:", localStorage.getItem('token'));
    } catch (error) {
      console.error('Error during registration:', error.response?.data || error.message);
      alert('Registration failed.');
    }
  };

  return (
    <div>
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
            {/* Add more departments as needed */}
          </select>
        </div>


        <div>
          <label>Year of Admission:</label>
          <input
            type="number"
            name="year_of_admission"
            value={formData.year_of_admission}
            onChange={handleChange}
            required
          />
        </div>

        {/* Optional Fields */}
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
      <p><Link to="/dashboard">Back to Dashboard</Link></p>
    </div>
  );
};

export default Registration;
