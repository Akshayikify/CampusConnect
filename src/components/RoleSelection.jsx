import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Store the selected role in localStorage for now
    localStorage.setItem('selectedRole', role);
    navigate('/login');
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <h1 className="title">Welcome to Placement Portal</h1>
        <p className="subtitle">Please select your role to continue</p>
        
        <div className="role-options">
          <div 
            className="role-card student-card"
            onClick={() => handleRoleSelect('student')}
          >
            <div className="role-icon">🎓</div>
            <h3>Student</h3>
            <p>Access job opportunities, apply for positions, and track your applications</p>
            <button className="role-btn student-btn">Login as Student</button>
          </div>

          <div 
            className="role-card manager-card"
            onClick={() => handleRoleSelect('manager')}
          >
            <div className="role-icon">💼</div>
            <h3>Placement Manager</h3>
            <p>Manage job postings, review applications, and coordinate placements</p>
            <button className="role-btn manager-btn">Login as Manager</button>
          </div>

          <div 
            className="role-card hod-card"
            onClick={() => handleRoleSelect('hod')}
          >
            <div className="role-icon">👨‍🏫</div>
            <h3>Head of Department</h3>
            <p>Oversee departmental placements, approve policies, and monitor student progress</p>
            <button className="role-btn hod-btn">Login as HOD</button>
          </div>
        </div>

        <div className="footer">
          <p>New to the platform? Contact your administrator for account setup.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
