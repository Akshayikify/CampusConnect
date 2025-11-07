import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function HODDashboard() {
  const hod = JSON.parse(localStorage.getItem("hod")) || {};
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("hod");
      localStorage.removeItem("selectedRole");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-800">
          Welcome, {hod?.name || "Head of Department"} 👨‍🏫
        </h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Department Students</h3>
          <p className="text-3xl font-bold text-purple-600">85</p>
        </div>
        
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Placed Students</h3>
          <p className="text-3xl font-bold text-green-600">67</p>
        </div>
        
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Placement Rate</h3>
          <p className="text-3xl font-bold text-blue-600">79%</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Companies</h3>
          <p className="text-3xl font-bold text-orange-600">8</p>
        </div>
      </div>

      {/* HOD Profile */}
      <div className="bg-white shadow p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4">HOD Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><b>Name:</b> {hod?.name || "Dr. Department Head"}</p>
            <p><b>Email:</b> {hod?.email || "hod@college.edu"}</p>
            <p><b>Department:</b> {hod?.department || "Computer Science"}</p>
          </div>
          <div>
            <p><b>Role:</b> Head of Department</p>
            <p><b>Experience:</b> {hod?.experience || "15+ years"}</p>
            <p><b>Qualification:</b> {hod?.qualification || "Ph.D. Computer Science"}</p>
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Recent Placements</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>John Doe - Google</span>
              <span className="text-green-600 font-semibold">₹25 LPA</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Jane Smith - Microsoft</span>
              <span className="text-green-600 font-semibold">₹22 LPA</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Mike Johnson - Amazon</span>
              <span className="text-green-600 font-semibold">₹20 LPA</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Department Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Placement Rate</span>
                <span className="text-sm font-medium">79%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '79%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Average Package</span>
                <span className="text-sm font-medium">₹8.5 LPA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Student Satisfaction</span>
                <span className="text-sm font-medium">4.2/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '84%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Administrative Actions */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Administrative Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">
            Review Applications
          </button>
          <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            Department Reports
          </button>
          <button className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
            Approve Policies
          </button>
          <button className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700">
            Faculty Management
          </button>
        </div>
      </div>
    </div>
  );
}
