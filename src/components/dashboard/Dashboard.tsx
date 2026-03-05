import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import type { Grievance, DashboardStats } from '../../types';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { grievances, setGrievances, loading, setLoading } = useGrievance();
  const [stats] = useState<DashboardStats>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    averageResolutionDays: 0,
    satisfactionScore: 0,
    slaCompliancePercentage: 0,
  });

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Query grievances based on user role
    let grievancesQuery;
    if (user.role === 'student') {
      grievancesQuery = query(
        collection(db, 'grievances'),
        where('userId', '==', user.uid),
        orderBy('submittedAt', 'desc'),
        limit(10)
      );
    } else if (user.role === 'staff' || user.role === 'dept_admin') {
      grievancesQuery = query(
        collection(db, 'grievances'),
        where('department', '==', user.department || ''),
        orderBy('submittedAt', 'desc'),
        limit(10)
      );
    } else {
      // Super admin can see all
      grievancesQuery = query(
        collection(db, 'grievances'),
        orderBy('submittedAt', 'desc'),
        limit(10)
      );
    }

    const unsubscribe = onSnapshot(grievancesQuery, (snapshot) => {
      const grievancesData: Grievance[] = [];
      snapshot.forEach((doc) => {
        grievancesData.push({ id: doc.id, ...doc.data() } as Grievance);
      });
      setGrievances(grievancesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, setGrievances, setLoading]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'status-submitted';
      case 'in_progress':
        return 'status-in_progress';
      case 'resolved':
        return 'status-resolved';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-submitted';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      case 'urgent':
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Smart Grievance Tracking System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.displayName}
              </span>
              <Link
                to="/profile"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-500 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <Link
                to="/complaints/new"
                className="btn-primary inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Submit New Complaint
              </Link>

              {(user?.role === 'super_admin' || user?.role === 'dept_admin') && (
                <Link
                  to={user.role === 'super_admin' ? '/admin' : '/department'}
                  className="btn-secondary inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Complaints
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalComplaints}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Resolved
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.resolvedComplaints}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingComplaints}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Satisfaction
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.satisfactionScore.toFixed(1)}/5
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Complaints</h3>
              <Link
                to="/complaints"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : grievances.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by submitting your first complaint.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {grievances.map((grievance) => (
                  <div key={grievance.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link
                          to={`/complaints/${grievance.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {grievance.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {grievance.description.length > 100
                            ? `${grievance.description.substring(0, 100)}...`
                            : grievance.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge ${getStatusBadgeClass(grievance.status)}`}>
                          {grievance.status.replace('_', ' ')}
                        </span>
                        <span className={`status-badge ${getPriorityBadgeClass(grievance.priority)}`}>
                          {grievance.priority}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>Category: {grievance.category}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(grievance.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;