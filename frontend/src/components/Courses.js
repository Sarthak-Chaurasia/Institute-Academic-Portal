import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import api from '../api';
import jwt_decode from 'jwt-decode';

function Courses() {
  const [departments, setDepartments]           = useState([]);
  const [courses, setCourses]                   = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [inputQuery, setInputQuery]             = useState('');
  const [searchType, setSearchType]             = useState('id'); // for both departments & courses
  const [filters, setFilters]                   = useState({ credits: [], prereqSatisfied: false });
  const [showFilter, setShowFilter]             = useState(false);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [prerequisites, setPrerequisites]       = useState({});
  const [role, setRole]                         = useState('');
  const [showDepartments, setShowDepartments]   = useState(true);

  const history = useHistory();

  // shared table styles
  const headerStyle = { border: '1px solid #ccc', padding: '10px' };
  const cellStyle   = { border: '1px solid #ddd', padding: '10px' };

  // on mount: fetch departments + student data if needed
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = jwt_decode(token)?.role;
      setRole(userRole);
      if (userRole === 'student') {
        api.get('/student/completed_courses')
           .then(r => setCompletedCourses(r.data.completed || []))
           .catch(console.error);
        api.get('/courses/prerequisites')
           .then(r => {
             const m = {};
             r.data.forEach(i => m[i.course_id] = i.prereqs);
             setPrerequisites(m);
           })
           .catch(console.error);
      }
    }
    api.get('/courses/departments')
       .then(r => setDepartments(r.data || []))
       .catch(console.error);
  }, []);

  // when department selected, fetch its courses
  useEffect(() => {
    if (!selectedDepartment) return;
    const ep = selectedDepartment === 'all'
      ? '/courses'
      : `/courses/department/${selectedDepartment}`;
    api.get(ep)
       .then(r => setCourses(r.data || []))
       .catch(console.error);
  }, [selectedDepartment]);

  // check if student has prereqs
  const checkPrereqs = id =>
    (prerequisites[id] || []).every(p => completedCourses.includes(p));

  // apply credits + prereq filters
  const applyFilters = list =>
    list
      .filter(c => filters.credits.length === 0 || filters.credits.includes(c.credits))
      .filter(c => !filters.prereqSatisfied || checkPrereqs(c.course_id));

  // render departments list (filtered by inputQuery)
  const renderDepartments = () => {
    const q = inputQuery.toLowerCase();
    const filtered = departments.filter(d =>
      searchType === 'id'
        ? String(d.id).toLowerCase().includes(q)
        : (d.name || '').toLowerCase().includes(q)
    );
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li
          onClick={() => { setSelectedDepartment('all'); setShowDepartments(false); }}
          style={{
            cursor: 'pointer',
            padding: '8px',
            backgroundColor: String(selectedDepartment) === 'all' ? '#e9ecef' : 'transparent',
            borderRadius: '4px',
            marginBottom: '5px'
          }}
        >
          All Departments
        </li>
        {filtered.map(d => {
          const did = String(d.id);
          return (
            <li
              key={did}
              onClick={() => { setSelectedDepartment(did); setShowDepartments(false); }}
              style={{
                cursor: 'pointer',
                padding: '8px',
                backgroundColor: selectedDepartment === did ? '#e9ecef' : 'transparent',
                borderRadius: '4px',
                marginBottom: '5px'
              }}
            >
              {d.name || did}
            </li>
          );
        })}
        {filtered.length === 0 && <p>No departments match “{inputQuery}.”</p>}
      </ul>
    );
  };

  // render courses table (with filtering & search)
  const renderCourses = () => {
    let list = applyFilters(courses);
    if (inputQuery.trim()) {
      const q = inputQuery.toLowerCase();
      list = list.filter(c =>
        searchType === 'id'
          ? String(c.course_id).toLowerCase().includes(q)
          : c.name.toLowerCase().includes(q)
      );
    }
    return (
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead style={{ backgroundColor:'#f9f9f9' }}>
          <tr>
            <th style={headerStyle}>Course ID</th>
            <th style={headerStyle}>Name</th>
            <th style={headerStyle}>Description</th>
            <th style={headerStyle}>Credits</th>
            <th style={headerStyle}>Dept ID</th>
          </tr>
        </thead>
        <tbody>
          {list.map(c => (
            <tr key={c.course_id}>
              <td style={cellStyle}>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); history.push(`/courses/${c.course_id}`); }}
                  style={{ color:'#007bff', textDecoration:'underline' }}
                >
                  {c.course_id}
                </a>
              </td>
              <td style={cellStyle}>{c.name}</td>
              <td style={cellStyle}>{c.description}</td>
              <td style={cellStyle}>{c.credits}</td>
              <td style={cellStyle}>{c.department_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container" style={{ padding:'20px', maxWidth:'800px', margin:'0 auto' }}>
      <div className="card" style={{ border:'1px solid #ddd', padding:'20px', borderRadius:'8px' }}>
        <h1 style={{ textAlign:'center', marginBottom:'20px' }}>
          {showDepartments ? 'Select a Department' : `Courses`}
        </h1>

        {/* Search bar & search-type dropdown */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
          <input
            type="text"
            placeholder={
              showDepartments
                ? `Search Departments by ${searchType==='id'?'ID':'Name'}`
                : `Search Courses by ${searchType==='id'?'ID':'Name'}`
            }
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            style={{ flex:1, padding:'8px', border:'1px solid #ccc', borderRadius:'4px' }}
          />
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            style={{ width:'120px', padding:'8px', border:'1px solid #ccc', borderRadius:'4px' }}
          >
            <option value="id">{showDepartments?'Dept ID':'Course ID'}</option>
            <option value="name">{showDepartments?'Dept Name':'Course Name'}</option>
          </select>
          {!showDepartments && (
            <button
              onClick={() => setShowFilter(f => !f)}
              style={{ padding:'8px 16px', borderRadius:'4px', backgroundColor:'#28a745', color:'white', border:'none' }}
            >
              {showFilter ? 'Hide Filters' : 'Show Filters'}
            </button>
          )}
          {!showDepartments && (
  <button
    onClick={() => {
      setSelectedDepartment(null);
      setShowDepartments(true);
      setInputQuery('');
      setSearchType('id');
    }}
    style={{
      padding: '8px 16px',
      marginLeft: '10px',
      borderRadius: '4px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none'
    }}
  >
    Back to Departments
  </button>
)}
        </div>

        {/* Filters panel only in course view */}
        {!showDepartments && showFilter && (
          <div style={{ border:'1px solid #ccc', padding:'15px', marginBottom:'20px', borderRadius:'4px', backgroundColor:'#f9f9f9' }}>
            <h4>Credits</h4>
            {[1,3,6,8].map(cr => (
              <label key={cr} style={{ marginRight:'15px' }}>
                <input
                  type="checkbox"
                  checked={filters.credits.includes(cr)}
                  onChange={() => setFilters(f => ({
                    ...f,
                    credits: f.credits.includes(cr)
                      ? f.credits.filter(x=>x!==cr)
                      : [...f.credits,cr]
                  }))}
                /> {cr}
              </label>
            ))}
            <div style={{ marginTop:'10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={filters.prereqSatisfied}
                  onChange={() => setFilters(f => ({ ...f, prereqSatisfied: !f.prereqSatisfied }))}
                /> Only show courses with satisfied prereqs
              </label>
            </div>
          </div>
        )}

        {/* Department list or Courses table */}
        {showDepartments
          ? renderDepartments()
          : <div style={{ marginTop:'20px' }}>{renderCourses()}</div>
        }

        <p style={{ marginTop:'20px' }}>
          <Link to="/dashboard" style={{ color:'#007bff', textDecoration:'none' }}>
            Back to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Courses;
