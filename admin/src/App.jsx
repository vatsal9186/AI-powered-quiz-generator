import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Content from './pages/Content';
import Questions from './pages/Questions';
import Quizzes from './pages/Quizzes';
import Assessment from './pages/Assessment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public login route */}
        <Route path="login" element={<Login />} />

        {/* Protected admin pages nested under the main layout */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="content" element={<Content />} />
          <Route path="questions" element={<Questions />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

