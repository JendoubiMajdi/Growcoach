import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CandidateSignup from './components/Candidate/CandidateSignup';
import CompanySignup from './components/Company/CompanySignup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import VerifyResetCode from './components/VerifyResetCode';
import ResetPassword from './components/ResetPassword';
import AuthCallback from './components/AuthCallback';
import CandidateDashboard from './components/Candidate/CandidateDashboard';
import CandidateProfile from './components/Candidate/CandidateProfile';
import CompanyDashboard from './components/Company/CompanyDashboard';
import CompanyProfile from './components/Company/CompanyProfile';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<CandidateSignup />} />
          <Route path="/company-signup" element={<CompanySignup />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/candidate-profile" element={<CandidateProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
