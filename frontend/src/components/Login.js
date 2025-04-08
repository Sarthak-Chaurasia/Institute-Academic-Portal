import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api';
import { Link } from 'react-router-dom';


function Login() {
  const [Id, setId] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { Id, password });
      //print response data to console
      console.log('Login response:', response.data);
      if(response.data.access_token){
        localStorage.setItem('token', response.data.access_token);
        console.log('Token stored in localStorage:', response.data.access_token);
      }
      else{
        setError('Access token not found in response');
        console.error('Access token not found in response');
        return;
      }
      history.push('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={Id}
        onChange={(e) => setId(e.target.value)}
        placeholder="ID"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </form>
  );
}

export default Login;