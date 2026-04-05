import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, farmAPI, successStoryAPI, courseAPI } from '../../services/api';
import { Users, Briefcase, BookOpen, Sprout, Award, TrendingUp, CheckCircle, XCircle, Eye, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingFarms, setPendingFarms] = useState([]);
  const [pendingStories, setPendingStories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'web-development',
    duration: '',
    level: 'beginner',
    content: [],
    skills_covered: ['']
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, farmsRes, storiesRes, coursesRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        farmAPI.getFarms(false),
        successStoryAPI.getStories(false),
        courseAPI.getCourses({})
      ]);

      setStats(statsRes.data);
      setPendingFarms(
        (Array.isArray(farmsRes.data) ? farmsRes.data : []).filter(f => !f.is_approved)
        );

      setPendingStories(
       (Array.isArray(storiesRes.data) ? storiesRes.data : []).filter(s => !s.is_approved)
       );
      setCourses(coursesRes.data);

      // Fetch all users
      const usersRes = await axios.get(`${API_BASE_URL}/admin/users`, config);
      console.log("usersRes.data =", usersRes.data);
      setUsers(
       Array.isArray(usersRes.data)
         ? usersRes.data
         : Array.isArray(usersRes.data?.users)
         ? usersRes.data.users
         : Array.isArray(usersRes.data?.data)
         ? usersRes.data.data
         : []
      );

      // Fetch all jobs
      const jobsRes = await axios.get(`${API_BASE_URL}/jobs?limit=100`, config);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFarm = async (farmId) => {
    try {
      await farmAPI.approveFarm(farmId);
      alert('Farm approved successfully!');
      fetchAdminData();
    } catch (error) {
      console.error('Failed to approve farm:', error);
      alert('Failed to approve farm');
    }
  };

  const handleApproveStory = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/success-stories/${storyId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Success story approved!');
      fetchAdminData();
    } catch (error) {
      console.error('Failed to approve story:', error);
      alert('Failed to approve story');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/admin/verify-user/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User verified successfully!');
      fetchAdminData();
    } catch (error) {
      console.error('Failed to verify user:', error);
      alert('Failed to verify user');
    }
  };

  const handleCreateCourse = async () => {
    try {
      const cleanedCourse = {
        ...newCourse,
        skills_covered: newCourse.skills_covered.filter(s => s.trim()),
        content: [{ type: 'text', data: 'Course content will be added here' }]
      };
      
      await courseAPI.createCourse(cleanedCourse);
      alert('Course created successfully!');
      setShowCreateCourseModal(false);
      setNewCourse({
        title: '',
        description: '',
        category: 'web-development',
        duration: '',
        level: 'beginner',
        content: [],
        skills_covered: ['']
      });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course');
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/admin/create-admin`,
        newAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('New admin created successfully!');
      setShowCreateAdminModal(false);
      setNewAdmin({
        full_name: '',
        email: '',
        password: '',
        phone: ''
      });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to create admin:', error);
      alert(error.response?.data?.detail || 'Failed to create admin');
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
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Shield className="text-indigo-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Control Panel</h1>
              <p className="text-indigo-100 mt-1">Manage and monitor the entire platform</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_jobs || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_applications || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_courses || 0}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-pink-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'farms', label: 'Farms', icon: Sprout },
              { id: 'stories', label: 'Success Stories', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Farms Pending</span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
                        {pendingFarms.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Stories Pending</span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
                        {pendingStories.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Students</span>
      <span className="font-semibold">
        {(Array.isArray(users) ? users : []).filter((u) => u.role === "student").length}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-gray-600">Job Seekers</span>
      <span className="font-semibold">
        {(Array.isArray(users) ? users : []).filter((u) => u.role === "job_seeker").length}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-gray-600">Farmers</span>
      <span className="font-semibold">
        {(Array.isArray(users) ? users : []).filter((u) => u.role === "farmer").length}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-gray-600">Job Providers</span>
      <span className="font-semibold">
        {(Array.isArray(users) ? users : []).filter((u) => u.role === "job_provider").length}
      </span>
    </div>
  </div>
</div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <p className="text-gray-600">Platform activity monitoring coming soon...</p>
              </div>
            </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Total: {users.length} users</span>
                  <button
                    onClick={() => setShowCreateAdminModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center space-x-2"
                    data-testid="create-admin-button"
                  >
                    <Shield size={18} />
                    <span>Create Admin</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Joined</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.slice(0, 20).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{user.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            user.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {!user.is_verified && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 transition"
                              data-testid="verify-user-button"
                            >
                              ✓ Verify
                            </button>
                          )}
                          {user.is_verified && (
                            <span className="text-green-600 text-xs">✓ Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
                <span className="text-sm text-gray-600">Total: {jobs.length} jobs</span>
              </div>
              
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{job.provider_name} • {job.location}</p>
                        <div className="flex items-center space-x-3 mt-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            {job.job_type}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                            {job.category}
                          </span>
                          <span className="text-xs text-gray-500">{job.applications_count} applicants</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        job.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                  data-testid="create-course-button"
                >
                  + Create Course
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center space-x-3 mt-4">
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                      <span className="text-xs text-gray-500">{course.duration}</span>
                      <span className="text-xs text-gray-500">{course.enrolled_count} enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farms Tab */}
          {activeTab === 'farms' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm Approvals</h2>
              
              {pendingFarms.length === 0 ? (
                <div className="text-center py-12">
                  <Sprout className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No pending farm approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingFarms.map((farm) => (
                    <div key={farm.id} className="border border-yellow-300 bg-yellow-50 rounded-lg p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{farm.farm_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {farm.farm_type} • {farm.location}
                          </p>
                          <p className="text-sm text-gray-700 mt-2">{farm.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            By: {farm.farmer_name} • Registered: {new Date(farm.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApproveFarm(farm.id)}
                          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                          data-testid="approve-farm-button"
                        >
                          <CheckCircle size={18} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Success Stories Tab */}
          {activeTab === 'stories' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Success Story Approvals</h2>
              
              {pendingStories.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No pending story approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingStories.map((story) => (
                    <div key={story.id} className="border border-yellow-300 bg-yellow-50 rounded-lg p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{story.title}</h3>
                          <p className="text-sm text-gray-700 mt-2">{story.story}</p>
                          <p className="text-xs text-gray-500 mt-3">
                            By: {story.user_name} ({story.user_role}) • {new Date(story.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApproveStory(story.id)}
                          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                        >
                          <CheckCircle size={18} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Course</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Course Title *"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <textarea
                placeholder="Course Description *"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="design">Design & UI/UX</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="farming">Agriculture & Farming</option>
                </select>

                <select
                  value={newCourse.level}
                  onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Duration (e.g., 4 weeks, 20 hours) *"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="text"
                placeholder="Skills Covered (comma separated) *"
                value={newCourse.skills_covered.join(', ')}
                onChange={(e) => setNewCourse({ ...newCourse, skills_covered: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowCreateCourseModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Shield className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Admin Account</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Admin Name"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Strong password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ This will create a new administrator with full platform access.
              </p>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg"
                data-testid="submit-create-admin-button"
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
