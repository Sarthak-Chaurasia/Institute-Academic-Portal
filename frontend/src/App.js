import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import Courses from './components/Courses';
import Registration from './components/Registration';
import PersonalDetails from './components/PersonalDetails';


function App() {
  return (
    <Router>
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/courses" component={Courses} />
        <Route path="/registration" component={Registration} />
        <Route path="/personal-details" component={PersonalDetails} />
        <Route path="/" component={Signup} />
      </Switch>
    </Router>
  );
}

export default App;