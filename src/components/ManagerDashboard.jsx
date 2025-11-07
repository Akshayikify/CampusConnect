import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, query, orderBy, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG } from "../config/emailjs";
import { TEST_MODE, mockEmailSend } from "../config/testMode";

export default function ManagerDashboard() {
  const manager = JSON.parse(localStorage.getItem("manager")) || {};
  const navigate = useNavigate();
  const [placementDrives, setPlacementDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacementDrives();
    
    // Set up real-time listener for applications
    const setupApplicationsListener = async () => {
      const unsubscribe = await fetchApplications();
      return unsubscribe;
    };
    
    let unsubscribe;
    setupApplicationsListener().then(unsub => {
      unsubscribe = unsub;
    });

    // Cleanup listener on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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

  const fetchApplications = async () => {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        orderBy('appliedAt', 'desc')
      );
      
      // Use real-time listener for instant updates
      const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
        const applicationsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsList);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Handle application status updates
  const handleStatusChange = async (appId, newStatus, studentEmail, companyName, studentName) => {
    try {
      // Update application status in Firestore
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: manager.name || 'Placement Manager'
      });

      // Prepare email parameters
      const emailParams = {
        to_email: studentEmail,
        to_name: studentName,
        company_name: companyName,
        status: newStatus,
        message: `Your application for ${companyName} has been ${newStatus}. Please check the placement portal for more details.`,
        from_name: 'Placement Cell'
      };

      // Check if we're in test mode or EmailJS is not configured
      const isEmailJSConfigured = !(EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' || 
                                   EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
                                   EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY');

      if (TEST_MODE.enabled || !isEmailJSConfigured) {
        // Use mock email in test mode or when EmailJS is not configured
        try {
          await mockEmailSend(emailParams);
          alert(`✅ Status updated to "${newStatus}"!\n\n📧 ${TEST_MODE.enabled ? 'Test email sent (check console)' : 'Email notifications not configured - using test mode'}`);
        } catch (error) {
          alert(`✅ Status updated to "${newStatus}"!\n\n⚠️ Mock email failed (this is just for testing)`);
        }
      } else {
        // Send real email via EmailJS
        try {
          await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            emailParams,
            EMAILJS_CONFIG.PUBLIC_KEY
          );

          alert(`✅ Status updated to "${newStatus}" and email sent to ${studentName}!`);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          alert(`✅ Status updated to "${newStatus}"!\n\n⚠️ Email notification failed to send. Please check EmailJS configuration.`);
        }
      }

    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error updating status. Please try again.');
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
                  <th className="px-4 py-2 text-left">Min CGPA</th>
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
                    <td className="px-4 py-3 text-blue-600 font-semibold">
                      {drive.cgpaCriteria || 'No limit'}
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

      {/* Email Configuration Status */}
      {TEST_MODE.enabled ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Test Mode Enabled
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>✅ Status updates work normally. Email notifications are simulated (check browser console).</p>
                <p className="mt-1">To enable real emails: Set up EmailJS and disable test mode in <code className="bg-blue-100 px-1 rounded">src/config/testMode.js</code></p>
              </div>
            </div>
          </div>
        </div>
      ) : (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' || 
            EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
            EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Email Notifications Not Configured
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Status updates will work, but email notifications are disabled. To enable email notifications:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Set up EmailJS account at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">emailjs.com</a></li>
                  <li>Update credentials in <code className="bg-yellow-100 px-1 rounded">src/config/emailjs.js</code></li>
                  <li>See <code className="bg-yellow-100 px-1 rounded">EMAILJS_SETUP.md</code> for detailed instructions</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Applications */}
      <div className="bg-white shadow p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Student Applications</h3>
          {!TEST_MODE.enabled && !(EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' || 
            EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
            EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') && (
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Email notifications enabled</span>
            </div>
          )}
        </div>
        
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Student Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Branch</th>
                  <th className="px-4 py-2 text-left">CGPA</th>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Applied Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{application.studentName}</td>
                    <td className="px-4 py-3 text-sm">{application.studentEmail}</td>
                    <td className="px-4 py-3">{application.studentBranch}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{application.studentCGPA}</td>
                    <td className="px-4 py-3 font-semibold">{application.companyName}</td>
                    <td className="px-4 py-3">{application.roleOffered}</td>
                    <td className="px-4 py-3">{new Date(application.appliedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        application.status === 'Approved' ? 'bg-green-200 text-green-800' :
                        application.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                        application.status === 'On Hold' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleStatusChange(
                            application.id, 
                            'Approved', 
                            application.studentEmail, 
                            application.companyName,
                            application.studentName
                          )}
                          disabled={application.status === 'Approved'}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            application.status === 'Approved' 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(
                            application.id, 
                            'Rejected', 
                            application.studentEmail, 
                            application.companyName,
                            application.studentName
                          )}
                          disabled={application.status === 'Rejected'}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            application.status === 'Rejected' 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          ❌ Reject
                        </button>
                        <button
                          onClick={() => handleStatusChange(
                            application.id, 
                            'On Hold', 
                            application.studentEmail, 
                            application.companyName,
                            application.studentName
                          )}
                          disabled={application.status === 'On Hold'}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            application.status === 'On Hold' 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-yellow-500 text-white hover:bg-yellow-600'
                          }`}
                        >
                          ⏸️ Hold
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No applications received yet</div>
            <p className="text-sm text-gray-400">Students will appear here when they apply to placement drives</p>
          </div>
        )}
      </div>
    </div>
  );
}
