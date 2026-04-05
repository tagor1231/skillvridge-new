import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, Clock, DollarSign, Users, Star, ArrowLeft, Send } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const [jobRes, reviewsRes] = await Promise.all([
        jobAPI.getJob(id),
        reviewAPI.getReviews(id, 'job').catch(() => ({ data: { reviews: [], average_rating: 0 } }))
      ]);

      setJob(jobRes.data);
      setReviews(reviewsRes.data.reviews || []);

      // Check if user has already applied
      if (isAuthenticated) {
        const myApps = await applicationAPI.getMyApplications();
        const applied = myApps.data.some(app => app.job_id === id);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.apply({ job_id: id, cover_letter: coverLetter });
      setHasApplied(true);
      setShowApplyModal(false);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to apply:', error);
      alert(error.response?.data?.detail || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <button onClick={() => navigate('/jobs')} className="text-blue-600 hover:underline">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="job-details-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Jobs</span>
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{job.title}</h1>
              <p className="text-xl text-gray-700 mb-4">{job.provider_name}</p>
              
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center">
                  <MapPin size={18} className="mr-2" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Briefcase size={18} className="mr-2" />
                  {job.job_type}
                </span>
                <span className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
                {job.salary_range && (
                  <span className="flex items-center font-semibold text-green-600">
                    <DollarSign size={18} className="mr-2" />
                    {job.salary_range}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-2">
                <Users className="inline mr-1" size={16} />
                {job.applications_count} applicants
              </div>
              {hasApplied ? (
                <button
                  disabled
                  className="bg-gray-300 text-gray-600 px-8 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Already Applied
                </button>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                  data-testid="apply-button"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {job.skills_required.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{job.description}</p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>

          {job.deadline && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-yellow-800">
                <strong>Application Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{review.user_name}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Apply for {job.title}</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell the employer why you're a great fit for this role..."
                data-testid="cover-letter-input"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                disabled={applying}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
                data-testid="submit-application-button"
              >
                <Send size={20} />
                <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
