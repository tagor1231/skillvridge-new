import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, Filter } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [selectedType, selectedCategory]);

  const fetchJobs = async () => {
    try {
      const params = {};
      if (selectedType) params.job_type = selectedType;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await jobAPI.getJobs(params);
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="jobs-page">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-blue-100">Thousands of opportunities waiting for you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs by title, description, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="job-search-input"
              />
            </div>

            {/* Job Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="job-type-filter"
              >
                <option value="">All Types</option>
                <option value="part-time">Part-Time</option>
                <option value="full-time">Full-Time</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="data-science">Data Science</option>
                <option value="sales">Sales</option>
                <option value="customer-service">Customer Service</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-700">
            Showing <span className="font-bold">{filteredJobs.length}</span> jobs
          </p>
        </div>

        {/* Job Listings */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border border-transparent hover:border-blue-500"
                data-testid="job-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-lg text-gray-700 mb-3">{job.provider_name}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-1" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center text-sm text-gray-600">
                        <Briefcase size={16} className="mr-1" />
                        {job.job_type}
                      </span>
                      <span className="inline-flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-1" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills_required.length > 5 && (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          +{job.skills_required.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    {job.salary_range && (
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {job.salary_range}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {job.applications_count} applicants
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
