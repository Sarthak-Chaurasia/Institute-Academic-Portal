import React from 'react';
import { BrowserRouter as Router, Switch, Route , Redirect } from 'react-router-dom';
import './styles.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import Courses from './components/Courses';
import Registration from './components/Registration';
import PersonalDetails from './components/PersonalDetails';
import { isRegistered , isUser } from './api';
import InstructorDashboard from './components/InstructorDashboard';
import StudentDashboard from './components/StudentDashboard';




function App() {
  return (
    <Router>
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/registration" render={() => (isUser() ? <Registration /> : <Redirect to="/signup" />)} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" render={() => (isRegistered() ? <Dashboard /> : <Redirect to="/registration" />)} />
        <Route path="/instructor-dashboard" render={() => (isRegistered() ? <InstructorDashboard /> : <Redirect to="/registration" />)} />
        <Route path="/student-dashboard" render={() => (isRegistered() ? <StudentDashboard /> : <Redirect to="/registration" />)} />
        <Route path="/courses" render={() => (isRegistered() ? <Courses /> : <Redirect to="/registration" />)} />
        <Route path="/personal-details" render={() => (isRegistered() ? <PersonalDetails /> : <Redirect to="/registration" />)} />
        <Route path="/" component={Signup} />
      </Switch>
    </Router>
  );
}

export default App;