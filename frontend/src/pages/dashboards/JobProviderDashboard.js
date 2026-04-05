import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI, analyticsAPI } from '../../services/api';
import { Briefcase, Users, CheckCircle, XCircle, Plus, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [myJobs, setMyJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        jobAPI.getMyJobs()
      ]);

      setStats(statsRes.data);
      setMyJobs(jobsRes.data);

      // Fetch applications for first job
      if (jobsRes.data.length > 0) {
        const appsRes = await applicationAPI.getJobApplications(jobsRes.data[0].id);
        setRecentApplications(appsRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobAPI.deleteJob(jobId);
        setMyJobs(myJobs.filter(j => j.id !== jobId));
      } catch (error) {
        console.error('Failed to delete job:', error);
        alert('Failed to delete job');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="provider-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.full_name}! 💼</h1>
            <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
          </div>
          <Link
            to="/jobs/create"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg transition"
            data-testid="create-job-button"
          >
            <Plus size={20} />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Jobs Posted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_jobs_posted || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_applications || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{myJobs.filter(j => j.is_active).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - My Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Job Postings</h2>
              {myJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
                  <Link
                    to="/jobs/create"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-500 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{job.location} • {job.job_type}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-sm text-gray-500">
                              <Users className="inline mr-1" size={16} />
                              {job.applications_count} applicants
                            </span>
                            <span className={`text-sm px-3 py-1 rounded-full ${
                              job.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {job.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/jobs/${job.id}/applications`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Applications"
                          >
                            <Eye size={20} />
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Job"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Recent Applications */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Applications</h3>
              {recentApplications.length === 0 ? (
                <p className="text-gray-500 text-sm">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-900">{app.applicant_name}</p>
                      <p className="text-xs text-gray-600 mt-1">{app.applicant_email}</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>• Post detailed job descriptions</li>
                <li>• Respond to applications quickly</li>
                <li>• Use clear skill requirements</li>
                <li>• Offer competitive compensation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobProviderDashboard;
