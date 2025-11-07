import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const student = JSON.parse(localStorage.getItem("student"));
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("student");
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
        <h2 className="text-3xl font-bold text-blue-800">
          Welcome, {student?.name || "Student"} 👋
        </h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Student Profile */}
      <div className="bg-white shadow p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4">Student Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><b>Name:</b> {student?.name}</p>
            <p><b>Email:</b> {student?.email}</p>
            <p><b>Branch:</b> {student?.branch}</p>
          </div>
          <div>
            <p><b>CGPA:</b> {student?.cgpa}</p>
            <p><b>Year:</b> {student?.year}</p>
            <p><b>Role:</b> Student</p>
          </div>
        </div>
      </div>

      {/* Firebase Auth Status */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Authentication Status</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-semibold">Authenticated via Firebase</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          User ID: {auth.currentUser?.uid}
        </p>
        <p className="text-sm text-gray-600">
          Email Verified: {auth.currentUser?.emailVerified ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
}
