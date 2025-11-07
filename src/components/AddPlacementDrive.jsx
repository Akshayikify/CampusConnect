import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function AddPlacementDrive() {
  const [formData, setFormData] = useState({
    companyName: '',
    salaryOffered: '',
    roleOffered: '',
    jobDescription: '',
    requirements: '',
    location: '',
    jobType: 'Full-time',
    applicationDeadline: '',
    interviewDate: '',
    eligibilityCriteria: '',
    cgpaCriteria: '',
    contactEmail: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to add placement drives');
        return;
      }

      // Create placement drive document
      const driveData = {
        ...formData,
        salaryOffered: parseFloat(formData.salaryOffered),
        cgpaCriteria: parseFloat(formData.cgpaCriteria) || 0,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: new Date().toISOString(),
        status: 'active',
        applicationsCount: 0
      };

      await addDoc(collection(db, 'placementDrives'), driveData);
      
      setSuccess('Placement drive added successfully!');
      setTimeout(() => {
        navigate('/manager/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error adding placement drive:', error);
      setError('Failed to add placement drive. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Add New Placement Drive</h1>
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Google, Microsoft, Amazon"
              />
            </div>

            {/* Role Offered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Offered *
              </label>
              <input
                type="text"
                name="roleOffered"
                value={formData.roleOffered}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Software Engineer, Data Analyst"
              />
            </div>

            {/* Salary Offered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Offered (LPA) *
              </label>
              <input
                type="number"
                name="salaryOffered"
                value={formData.salaryOffered}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 12.5"
              />
            </div>

            {/* CGPA Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum CGPA Required *
              </label>
              <input
                type="number"
                name="cgpaCriteria"
                value={formData.cgpaCriteria}
                onChange={handleInputChange}
                required
                min="0"
                max="10"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 7.5"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Bangalore, Mumbai, Remote"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Interview Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date
              </label>
              <input
                type="date"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="hr@company.com"
              />
            </div>
          </div>

          {/* Full-width fields */}
          <div className="mt-6 space-y-6">
            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Required skills, experience, qualifications..."
              />
            </div>

            {/* Eligibility Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eligibility Criteria
              </label>
              <textarea
                name="eligibilityCriteria"
                value={formData.eligibilityCriteria}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="CGPA requirements, branch restrictions, etc..."
              />
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Any other relevant information..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/manager/dashboard')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Adding Drive...' : 'Add Placement Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
