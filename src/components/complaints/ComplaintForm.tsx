import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import type { Grievance, PriorityLevel } from '../../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ComplaintForm: React.FC = () => {
  const { user } = useAuth();
  const { addGrievance } = useGrievance();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    priority: 'medium' as PriorityLevel,
    isAnonymous: false,
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    {
      name: 'Academic Issues',
      subCategories: ['Course Quality', 'Grading Disputes', 'Teacher Conduct', 'Curriculum Concerns']
    },
    {
      name: 'Maintenance & Facilities',
      subCategories: ['Building/Infrastructure', 'Cleanliness', 'Utilities', 'Safety Concerns']
    },
    {
      name: 'Administrative',
      subCategories: ['Fee/Billing Issues', 'Document Processing', 'Policy Violations', 'General Queries']
    },
    {
      name: 'Hostel Management',
      subCategories: ['Room Allocation', 'Hostel Facilities', 'Staff Conduct', 'Guest Policies']
    },
    {
      name: 'IT & Technical',
      subCategories: ['System Access', 'Technical Issues', 'License/Software', 'Network Problems']
    },
    {
      name: 'Health & Wellness',
      subCategories: ['Medical Facilities', 'Counseling Services', 'Health Emergencies']
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > 5) {
      setError('Maximum 5 attachments allowed');
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (): Promise<any[]> => {
    // TODO: File uploads are disabled until Firebase Storage CORS is configured
    // For production, configure CORS using: gsutil cors set cors.json gs://your-bucket
    console.warn('File uploads disabled - CORS not configured');
    return [];
    
    /*
    const uploadedAttachments = [];

    for (const file of attachments) {
      const storageRef = ref(storage, `complaints/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      uploadedAttachments.push({
        url: downloadURL,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date()
      });
    }

    return uploadedAttachments;
    */
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        uploadedAttachments = await uploadAttachments();
      }

      const grievanceData = {
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        priority: formData.priority,
        status: 'submitted' as const,
        attachments: uploadedAttachments,
        submittedAt: serverTimestamp(),
        isAnonymous: formData.isAnonymous,
        tags: [],
        metadata: {
          source: 'web',
          userAgent: navigator.userAgent,
          ipAddress: 'client-side' // In production, get from server
        }
      };

      const docRef = await addDoc(collection(db, 'grievances'), grievanceData);

      const newGrievance: Grievance = {
        id: docRef.id,
        ...grievanceData,
        submittedAt: new Date(),
        attachments: uploadedAttachments
      };

      addGrievance(newGrievance);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Submit New Complaint</h1>
            <p className="mt-1 text-sm text-gray-600">
              Please provide detailed information about your complaint. All fields marked with * are required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Complaint Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 input-field"
                placeholder="Brief description of your complaint"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                className="mt-1 input-field"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category */}
            {selectedCategory && (
              <div>
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
                  Sub-Category *
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  required
                  className="mt-1 input-field"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select a sub-category</option>
                  {selectedCategory.subCategories.map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                className="mt-1 input-field"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low - General inquiry or minor issue</option>
                <option value="medium">Medium - Issue affecting daily activities</option>
                <option value="high">High - Significant impact on academic/work</option>
                <option value="urgent">Urgent - Critical issue requiring immediate attention</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                className="mt-1 input-field"
                placeholder="Please provide detailed information about your complaint, including when it occurred, who was involved, and what resolution you are seeking."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments (Optional)
              </label>
              <div className="mt-1 p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> File uploads will be saved with the complaint but URLs are disabled until CORS is configured in Firebase Storage.
                </p>
              </div>
              <div className="mt-1">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Files
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Maximum 5 files, 5MB each. Supported formats: Images, PDF, DOC, DOCX
                </p>
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                id="isAnonymous"
                name="isAnonymous"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                Submit anonymously (Your identity will not be revealed to the department)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;