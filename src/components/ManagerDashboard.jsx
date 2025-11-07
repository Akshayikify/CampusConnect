import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ManagerDashboard() {
  const manager = JSON.parse(localStorage.getItem("manager")) || {};
  const navigate = useNavigate();
  const [placementDrives, setPlacementDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacementDrives();
  }, []);

  const fetchPlacementDrives = async () => {
    try {
      const drivesQuery = query(
        collection(db, 'placementDrives'),
        orderBy('createdAt', 'desc')
      );
      const drivesSnapshot = await getDocs(drivesQuery);
      const drivesList = drivesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlacementDrives(drivesList);
    } catch (error) {
      console.error('Error fetching placement drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("manager");
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
        <h2 className="text-3xl font-bold text-green-800">
          Welcome, {manager?.name || "Placement Manager"} 👨‍💼
        </h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">150</p>
        </div>
        
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Jobs</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
        
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Applications</h3>
          <p className="text-3xl font-bold text-orange-600">45</p>
        </div>
      </div>

      {/* Manager Profile */}
      <div className="bg-white shadow p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4">Manager Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><b>Name:</b> {manager?.name || "Manager Name"}</p>
            <p><b>Email:</b> {manager?.email || "manager@college.edu"}</p>
            <p><b>Department:</b> {manager?.department || "Placement Office"}</p>
          </div>
          <div>
            <p><b>Role:</b> Placement Manager</p>
            <p><b>Experience:</b> {manager?.experience || "5+ years"}</p>
            <p><b>Contact:</b> {manager?.phone || "+91 9876543210"}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/manager/add-drive')}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Add Placement Drive
          </button>
          <button className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
            View Applications
          </button>
          <button className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">
            Student Reports
          </button>
          <button className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700">
            Company Relations
          </button>
        </div>
      </div>

      {/* Placement Drives */}
      <div className="bg-white shadow p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Placement Drives</h3>
          <span className="text-sm text-gray-600">
            Total: {placementDrives.length} drives
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading placement drives...</div>
          </div>
        ) : placementDrives.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Salary (LPA)</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Deadline</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Applications</th>
                </tr>
              </thead>
              <tbody>
                {placementDrives.map((drive) => (
                  <tr key={drive.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{drive.companyName}</td>
                    <td className="px-4 py-3">{drive.roleOffered}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      ₹{drive.salaryOffered}
                    </td>
                    <td className="px-4 py-3">{drive.location || 'Not specified'}</td>
                    <td className="px-4 py-3">
                      {drive.applicationDeadline ? 
                        new Date(drive.applicationDeadline).toLocaleDateString() : 
                        'No deadline'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        drive.status === 'active' ? 'bg-green-200 text-green-800' :
                        drive.status === 'closed' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {drive.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {drive.applicationsCount || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No placement drives added yet</div>
            <button 
              onClick={() => navigate('/manager/add-drive')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Your First Placement Drive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
