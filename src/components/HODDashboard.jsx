import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function HODDashboard() {
  const hod = JSON.parse(localStorage.getItem("hod")) || {};
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const hodDepartment = hod.department || 'Computer Science';
      const q = query(
        collection(db, 'hodRequests'),
        where('department', '==', 'CSE'), // Match department
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      // Update HOD request status
      await updateDoc(doc(db, 'hodRequests', request.id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: hod.name || 'HOD'
      });

      // Update student approval status
      await updateDoc(doc(db, 'students', request.studentId), {
        approved: true,
        approvedAt: new Date().toISOString()
      });

      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== request.id));
      
      alert(`✅ Student ${request.studentName} approved successfully!`);
    } catch (error) {
      console.error('Error approving student:', error);
      alert('Error approving student. Please try again.');
    }
  };

  const handleReject = async (request) => {
    try {
      await updateDoc(doc(db, 'hodRequests', request.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: hod.name || 'HOD'
      });

      setPendingRequests(prev => prev.filter(req => req.id !== request.id));
      
      alert(`❌ Student ${request.studentName} request rejected.`);
    } catch (error) {
      console.error('Error rejecting student:', error);
      alert('Error rejecting student. Please try again.');
    }
  };

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

      {/* Student Approval Requests */}
      <div className="bg-white shadow p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4">Student Approval Requests</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading approval requests...</div>
          </div>
        ) : pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        {request.studentName?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{request.studentName}</h4>
                        <p className="text-sm text-gray-600">{request.studentEmail}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Department:</span>
                        <span className="ml-2 text-gray-600">{request.department}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Branch:</span>
                        <span className="ml-2 text-gray-600">{request.branch}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Requested:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(request)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No pending approval requests</div>
            <p className="text-sm text-gray-400">All students in your department are approved</p>
          </div>
        )}
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
