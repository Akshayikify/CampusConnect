import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ApprovalPending() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("student")) || {};

  const handleBackToRoleSelection = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("selectedRole");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Pending Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Approval Pending</h2>
        </div>

        {/* Student Info */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Student Name</p>
            <p className="font-semibold text-gray-800">{student.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-semibold text-gray-800">{student.email}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Department</p>
            <p className="font-semibold text-gray-800">{student.department || 'CSE'}</p>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-yellow-800 font-medium">Waiting for HOD Approval</p>
            </div>
            <p className="text-sm text-yellow-700">
              Your account has been created successfully. Please wait for your Head of Department to approve your access to the placement portal.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              Your request has been sent to the HOD
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              HOD will review your application
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              You'll receive access once approved
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              Try logging in again after approval
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check Status Again
          </button>
          <button
            onClick={handleBackToRoleSelection}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Role Selection
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact your department HOD or placement office.
          </p>
        </div>
      </div>
    </div>
  );
}
