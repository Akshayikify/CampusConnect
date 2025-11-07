import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./RoleSelection.jsx";
import Login from "./Login.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import ManagerDashboard from "./ManagerDashboard.jsx";
import HODDashboard from "./HODDashboard.jsx";
import AddPlacementDrive from "./AddPlacementDrive.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/add-drive" element={<AddPlacementDrive />} />
        <Route path="/hod/dashboard" element={<HODDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
