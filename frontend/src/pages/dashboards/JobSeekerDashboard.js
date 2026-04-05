import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI, analyticsAPI, aiAPI } from '../../services/api';
import { Briefcase, TrendingUp, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        applicationAPI.getMyApplications()
      ]);

      setStats(statsRes.data);
      setMyApplications(appsRes.data);

      // Get AI recommendations
      if (user.skills && user.skills.length > 0) {
        const recsRes = await aiAPI.getJobRecommendations();
        setRecommendations(recsRes.data.recommended_jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      case 'interview':
        return <Sparkles className="text-blue-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
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
    <div className="min-h-screen bg-gray-50" data-testid="job-seeker-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.full_name}! 💼</h1>
          <p className="text-gray-600 mt-2">Find your dream job today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_applications || 0}</p>
              </div>
              <Briefcase className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Interviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {myApplications.filter(a => a.status === 'interview').length}
                </p>
              </div>
              <Sparkles className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Accepted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {myApplications.filter(a => a.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles size={24} />
                  <h2 className="text-2xl font-bold">AI Recommended Jobs</h2>
                </div>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition"
                    >
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-sm text-blue-100 mt-1">{job.provider_name} • {job.location}</p>
                    </Link>
                  ))}
                </div>
                <Link to="/jobs" className="inline-block mt-4 text-white font-semibold hover:underline">
                  View All Jobs →
                </Link>
              </div>
            )}

            {/* My Applications */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h2>
              {myApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                  <Link to="/jobs" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Job Application</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(app.status)}
                          <span className="text-sm font-medium text-gray-900 capitalize">{app.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/jobs" className="block bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg text-center">
                  Browse Jobs
                </Link>
                <Link to="/profile" className="block bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-3 px-4 rounded-lg text-center">
                  Update Profile
                </Link>
                <Link to="/career-path" className="block bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-lg text-center">
                  Career PathFinder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
