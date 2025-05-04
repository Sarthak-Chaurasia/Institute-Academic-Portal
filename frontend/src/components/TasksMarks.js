import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import jwt_decode from 'jwt-decode';

function TasksMarks() {
  const { courseId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState('');
  const [newTask, setNewTask] = useState({ name: '', due_date: '', max_marks: '' });
  const [editTask, setEditTask] = useState(null); // Track task to edit
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setRole(decoded?.role);

      api.get(`/courses/${courseId}/tasks`).then(res => setTasks(res.data));
    }
  }, [courseId]);

  const handleEditTaskClick = (task) => {
    setEditTask({ ...task, prev_name: task.name }); // Set prev_name for editing
    setNewTask({
      name: task.name,
      due_date: task.due_date,
      max_marks: task.max_marks,
    });
    setShowAddForm(true); // Open the form in Edit mode
  };

  const handleDeleteTask = (prev_name) => {
    api.post(`/courses/${courseId}/tasks`, { action: 'delete', prev_name }).then(res => {
      setTasks(prev => prev.filter(task => task.name !== prev_name));
    });
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();

    const taskData = {
      name: newTask.name,
      max_marks: newTask.max_marks,
      due_date: newTask.due_date,
      prev_name: editTask ? editTask.name : null, // Pass prev_name if editing
    };

    const apiCall = editTask
      ? api.post(`/courses/${courseId}/tasks`, taskData) // Edit Task
      : api.post(`/courses/${courseId}/tasks`, taskData); // Add Task

    apiCall.then(res => {
      if (editTask) {
        setTasks(prev => prev.map(task =>
          task.name === res.data.name ? res.data : task
        ));
      } else {
        setTasks(prev => [...prev, res.data]);
      }
      setNewTask({ name: '', due_date: '', max_marks: '' });
      setEditTask(null);
      setShowAddForm(false); // Close form after submitting
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Tasks</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Due Date</th>
            <th>Release Date</th>
            <th>Max Marks</th>
            {role === 'instructor' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.name}> {/* Using task.name as key */}
              {role === 'instructor' ? (
                <>
                  <td>{task.name}</td>
                  <td>{new Date(task.due_date).toLocaleString()}</td>
                  <td>{new Date(task.release_date).toLocaleString()}</td> {/* Display Release Date */}
                  <td>{task.max_marks}</td>
                  <td>
                    <button onClick={() => handleEditTaskClick(task)}>Edit</button>
                    <button onClick={() => handleDeleteTask(task.name)} style={{ marginLeft: '10px', color: 'red' }}>
                      Delete
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{task.name}</td>
                  <td>{new Date(task.due_date).toLocaleString()}</td>
                  <td>{new Date(task.release_date).toLocaleString()}</td> {/* Display Release Date */}
                  <td>{task.max_marks}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {role === 'instructor' && (
        <>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              marginTop: '15px',
              color: 'blue',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Add Task
          </button>

          {showAddForm && (
            <form onSubmit={handleSubmitTask} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Name"
                value={newTask.name}
                onChange={e => setNewTask({ ...newTask, name: e.target.value })}
              />
              <input
                type="datetime-local"
                value={newTask.due_date}
                onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Marks"
                value={newTask.max_marks}
                onChange={e => setNewTask({ ...newTask, max_marks: e.target.value })}
              />
              <button type="submit">{editTask ? 'Update Task' : 'Add Task'}</button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default TasksMarks;
