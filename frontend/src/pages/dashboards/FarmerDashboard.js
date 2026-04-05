import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { farmAPI, courseAPI, certificateAPI, analyticsAPI } from '../../services/api';
import { Sprout, BookOpen, Award, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [myFarms, setMyFarms] = useState([]);
  const [nearbyFarms, setNearbyFarms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, myFarmsRes, farmsRes, coursesRes, certsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        farmAPI.getMyFarms(),
        farmAPI.getFarms(),
        courseAPI.getCourses({ category: 'farming' }),
        certificateAPI.getMyCertificates()
      ]);

      setStats(statsRes.data);
      setMyFarms(myFarmsRes.data);
      setNearbyFarms(farmsRes.data.slice(0, 5));
      setCourses(coursesRes.data.slice(0, 5));
      setCertificates(certsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="farmer-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.full_name}! 🌾</h1>
            <p className="text-gray-600 mt-2">Manage your farming journey</p>
          </div>
          <Link
            to="/farms/register"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg transition"
          >
            <Plus size={20} />
            <span>Register Farm</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">My Farms</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_farms || 0}</p>
              </div>
              <Sprout className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Training Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</p>
              </div>
              <BookOpen className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.certificates_earned || 0}</p>
              </div>
              <Award className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* My Farms */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Farms</h2>
              {myFarms.length === 0 ? (
                <div className="text-center py-12">
                  <Sprout className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 mb-4">You haven't registered any farms yet</p>
                  <Link to="/farms/register" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg">
                    Register Your Farm
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myFarms.map((farm) => (
                    <div key={farm.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{farm.farm_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{farm.farm_type} • {farm.location}</p>
                          <p className="text-sm text-gray-500 mt-2">{farm.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          farm.is_approved 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {farm.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Training Courses */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Farming Training</h2>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No farming courses available</p>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          {course.level}
                        </span>
                        <span className="text-xs text-gray-500">{course.duration}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/farms/register" className="block bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-lg text-center">
                  Register Farm
                </Link>
                <Link to="/courses" className="block bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg text-center">
                  Browse Courses
                </Link>
                <Link to="/farms" className="block bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-3 px-4 rounded-lg text-center">
                  Nearby Farms
                </Link>
              </div>
            </div>

            {/* Nearby Farms */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Farms</h3>
              {nearbyFarms.length === 0 ? (
                <p className="text-gray-500 text-sm">No farms nearby</p>
              ) : (
                <div className="space-y-3">
                  {nearbyFarms.map((farm) => (
                    <div key={farm.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-900">{farm.farm_name}</p>
                      <p className="text-xs text-gray-600 mt-1 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {farm.location}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loan Assistance */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-2">💰 Government Loan</h3>
              <p className="text-sm text-yellow-100 mb-4">Apply for agricultural loans with your certificates</p>
              <button className="w-full bg-white text-orange-600 font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
