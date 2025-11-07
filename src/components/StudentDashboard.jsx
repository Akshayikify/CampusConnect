import React, { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const student = JSON.parse(localStorage.getItem("student"));
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [placementDrives, setPlacementDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch placement drives and applications
  useEffect(() => {
    fetchPlacementDrives();
    
    // Set up real-time listener for applications
    const setupApplicationsListener = async () => {
      const unsubscribe = await fetchMyApplications();
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
      // Try both collection names to see where drives are stored
      console.log('🔍 Checking for drives in both collections...');
      
      // Check 'drives' collection first
      let drivesSnapshot = await getDocs(collection(db, 'drives'));
      console.log('📊 Drives in "drives" collection:', drivesSnapshot.docs.length);
      
      // If no drives found, check 'placementDrives' collection
      if (drivesSnapshot.docs.length === 0) {
        drivesSnapshot = await getDocs(collection(db, 'placementDrives'));
        console.log('📊 Drives in "placementDrives" collection:', drivesSnapshot.docs.length);
      }
      const drives = drivesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter active drives and check CGPA eligibility
      const eligibleDrives = drives.filter(drive => {
        const studentCGPA = parseFloat(student?.cgpa) || 0;
        const requiredCGPA = drive.cgpaCriteria || 0;
        return drive.status === 'active' && studentCGPA >= requiredCGPA;
      });
      
      setPlacementDrives(eligibleDrives);
    } catch (error) {
      console.error('Error fetching placement drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('studentId', '==', auth.currentUser?.uid)
      );
      
      // Use real-time listener for instant status updates
      const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyApplications(applications);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = async (drive) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please login to apply');
        return;
      }

      // Check if already applied
      const existingApplication = myApplications.find(app => app.driveId === drive.id);
      if (existingApplication) {
        alert('You have already applied to this drive!');
        return;
      }

      // Create application
      await addDoc(collection(db, 'applications'), {
        driveId: drive.id,
        studentId: user.uid,
        studentName: student.name,
        studentEmail: student.email,
        studentBranch: student.branch,
        studentCGPA: student.cgpa,
        companyName: drive.companyName,
        roleOffered: drive.roleOffered,
        status: 'Applied',
        appliedAt: new Date().toISOString()
      });

      alert('✅ Applied successfully!');
      fetchMyApplications(); // Refresh applications
    } catch (error) {
      console.error('Error applying to drive:', error);
      alert('Error applying to drive. Please try again.');
    }
  };

  // Generate initials for default avatar
  const getInitials = (name) => {
    if (!name) return "ST";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

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
      {/* Header with Profile */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-800">
          Welcome, {student?.name || "Student"} 👋
        </h2>
        
        {/* Profile Section */}
        <div className="flex items-center space-x-4">
          {/* Profile Image/Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              {student?.profileImage ? (
                <img
                  src={student.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover hover:border-blue-600 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm hover:bg-blue-700 transition-colors border-2 border-blue-500">
                  {getInitials(student?.name)}
                </div>
              )}
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    {student?.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {getInitials(student?.name)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{student?.name || "Student"}</p>
                      <p className="text-sm text-gray-600">{student?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      // Add profile edit functionality later
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>View Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      // Add settings functionality later
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </button>
                  
                  <hr className="my-2" />
                  
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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

      {/* Available Placement Drives */}
      <div className="bg-white shadow p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Available Placement Drives</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Real-time updates active 🟢</span>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          📊 Showing {placementDrives.length} eligible drives | Your CGPA: {student?.cgpa || 'Not set'}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading placement drives...</div>
          </div>
        ) : placementDrives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {placementDrives.map((drive) => {
              const hasApplied = myApplications.some(app => app.driveId === drive.id);
              return (
                <div key={drive.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-semibold text-blue-700">{drive.companyName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      hasApplied ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                    }`}>
                      {hasApplied ? 'Applied' : 'Open'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p><span className="font-medium text-gray-700">Role:</span> {drive.roleOffered}</p>
                    <p><span className="font-medium text-gray-700">Salary:</span> <span className="text-green-600 font-semibold">₹{drive.salaryOffered} LPA</span></p>
                    <p><span className="font-medium text-gray-700">Min CGPA:</span> <span className="text-blue-600 font-semibold">{drive.cgpaCriteria || 'No limit'}</span></p>
                    <p><span className="font-medium text-gray-700">Location:</span> {drive.location || 'Not specified'}</p>
                    {drive.applicationDeadline && (
                      <p><span className="font-medium text-gray-700">Deadline:</span> {new Date(drive.applicationDeadline).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {drive.jobDescription && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">{drive.jobDescription}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleApply(drive)}
                    disabled={hasApplied}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      hasApplied 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {hasApplied ? '✅ Applied' : 'Apply Now'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No placement drives available</div>
            <p className="text-sm text-gray-400">
              {student?.cgpa ? 
                `Your CGPA: ${student.cgpa} - Check back later for new opportunities!` :
                'Update your CGPA in profile to see eligible drives'
              }
            </p>
          </div>
        )}
      </div>

      {/* Recent Status Updates */}
      {myApplications.some(app => app.status !== 'Applied') && (
        <div className="bg-white shadow p-6 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4">📢 Recent Updates</h3>
          <div className="space-y-3">
            {myApplications
              .filter(app => app.status !== 'Applied')
              .slice(0, 3)
              .map((application) => (
                <div key={application.id} className={`p-4 rounded-lg border-l-4 ${
                  application.status === 'Approved' ? 'bg-green-50 border-green-500' :
                  application.status === 'Rejected' ? 'bg-red-50 border-red-500' :
                  'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {application.companyName} - {application.roleOffered}
                      </p>
                      <p className={`text-sm font-medium ${
                        application.status === 'Approved' ? 'text-green-700' :
                        application.status === 'Rejected' ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>
                        Status: {application.status}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {application.status === 'Approved' ? '🎉' :
                       application.status === 'Rejected' ? '😔' : '⏳'}
                    </div>
                  </div>
                  {application.updatedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(application.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* My Applications */}
      <div className="bg-white shadow p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4">My Applications</h3>
        
        {myApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Applied Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {myApplications.map((application) => (
                  <tr key={application.id} className="border-b hover:bg-gray-50">
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
                        {application.status === 'Approved' ? '✅ Approved' :
                         application.status === 'Rejected' ? '❌ Rejected' :
                         application.status === 'On Hold' ? '⏸️ On Hold' :
                         '📝 Applied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">No applications yet</div>
            <p className="text-sm text-gray-400">Apply to placement drives to see them here</p>
          </div>
        )}
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
