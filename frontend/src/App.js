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
import RegisterCourses from './components/Register_courses';
import InstructorCourses from './components/InstructorCourses';
import AdminDashboard from './components/AdminDashboard';
import AboutCourse from './components/AboutCourse';
import ReportStudent from './components/Textbox';
import TasksMarks from './components/TasksMarks';
import Announcement from './components/Announcement';
import Feedback from './components/Feedback';


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
        <Route path="/courses/:courseId" render={() => (isRegistered() ? <AboutCourse /> : <Redirect to="/registration" />)} />
        <Route path="/courses" render={() => (isRegistered() ? <Courses /> : <Redirect to="/registration" />)} />
        <Route path="/personal-details" render={() => (isRegistered() ? <PersonalDetails /> : <Redirect to="/registration" />)} />
        <Route path="/register_courses" render={() => (isRegistered() ? <RegisterCourses /> : <Redirect to="/registration" />)} />
        <Route path="/instructor-courses" render={() => (isRegistered() ? <InstructorCourses /> : <Redirect to="/registration" />)} />
        {/* <Route path="/add-course" render={() => (isRegistered() ? <InstrcutorCourses /> : <Redirect to="/signup" />)} /> */}
        <Route path="/admin-dashboard" render={() => (isRegistered() ? <AdminDashboard /> : <Redirect to="/registration" />)} />
        <Route path="/DAC" render={() => (isRegistered() ? <ReportStudent /> : <Redirect to="/registration" />)} />
        <Route path="/tasks-marks/:courseId" render={() => (isRegistered() ? <TasksMarks /> : <Redirect to="/registration" />)} />
        <Route path="/announcement" render={() => (isRegistered() ? <Announcement /> : <Redirect to="/registration" />)} />
        <Route path="/feedback" render={() => (isRegistered() ? <Feedback /> : <Redirect to="/registration" />)} />
        <Route path="/" component={Signup} />
      </Switch>
    </Router>
  );
}

export default App;