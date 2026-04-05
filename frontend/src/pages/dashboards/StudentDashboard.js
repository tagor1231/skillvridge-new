import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI, courseAPI, certificateAPI, analyticsAPI, aiAPI } from '../../services/api';
import { Briefcase, BookOpen, Award, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes, coursesRes, certsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        jobAPI.getJobs({ job_type: 'part-time', limit: 5 }),
        courseAPI.getMyCourses(),
        certificateAPI.getMyCertificates()
      ]);

      setStats(statsRes.data);
      setRecentJobs(jobsRes.data);
      setMyCourses(coursesRes.data);
      setCertificates(certsRes.data);

      // Get AI recommendations if user has skills
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="student-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.full_name}! 👋</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your career journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_applications || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enrolled_courses || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.certificates_earned || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Profile Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{user.profile_completed ? '100%' : '60%'}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-pink-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles size={24} />
                  <h2 className="text-2xl font-bold">AI Recommended Jobs</h2>
                </div>
                <p className="text-blue-100 mb-4">Based on your skills and preferences</p>
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
                <Link
                  to="/jobs"
                  className="inline-flex items-center space-x-2 mt-4 text-white font-semibold hover:underline"
                >
                  <span>View All Jobs</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {/* Recent Part-Time Jobs */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Part-Time Opportunities</h2>
                <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentJobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No jobs available yet</p>
                ) : (
                  recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{job.provider_name}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{job.job_type}</span>
                        <span>{job.location}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* My Courses */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Learning</h2>
                <Link to="/courses" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  Browse Courses
                </Link>
              </div>
              <div className="space-y-4">
                {myCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">You haven't enrolled in any courses yet</p>
                    <Link
                      to="/courses"
                      className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Explore Courses
                    </Link>
                  </div>
                ) : (
                  myCourses.map((enrollment) => (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{enrollment.course_id}</h3>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/jobs"
                  className="block bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg transition text-center"
                  data-testid="browse-jobs-button"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/applications"
                  className="block bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-3 px-4 rounded-lg transition text-center"
                >
                  My Applications
                </Link>
                <Link
                  to="/courses"
                  className="block bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-lg transition text-center"
                >
                  Enroll in Course
                </Link>
                <Link
                  to="/profile"
                  className="block bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold py-3 px-4 rounded-lg transition text-center"
                >
                  Complete Profile
                </Link>
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Certificates</h3>
              {certificates.length === 0 ? (
                <p className="text-gray-500 text-sm">Complete courses to earn certificates</p>
              ) : (
                <div className="space-y-3">
                  {certificates.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-900">{cert.course_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Career PathFinder */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-2">🎯 Career PathFinder</h3>
              <p className="text-sm text-yellow-100 mb-4">Get AI-powered career roadmap</p>
              <Link
                to="/career-path"
                className="block bg-white text-orange-600 font-semibold py-2 px-4 rounded-lg text-center hover:shadow-lg transition"
              >
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
