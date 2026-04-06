import axios from 'axios';

const api = axios.create({
  baseURL: 'https://skillvridge-new.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Job API
export const jobAPI = {
  createJob: (data) => api.post('/jobs', data),
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my/posted'),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

// Application API
export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my'),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (appId, status) => api.put(`/applications/${appId}/status`, null, { params: { status } }),
};

// Course API
export const courseAPI = {
  createCourse: (data) => api.post('/courses', data),
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/courses/my/enrolled'),
  updateProgress: (id, progress) => api.put(`/courses/${id}/progress`, null, { params: { progress } }),
};

// Certificate API
export const certificateAPI = {
  getMyCertificates: () => api.get('/certificates/my'),
};

// Portfolio API
export const portfolioAPI = {
  createProject: (data) => api.post('/portfolio', data),
  getPortfolio: (userId) => api.get(`/portfolio/${userId}`),
};

// Farm API
export const farmAPI = {
  createFarm: (data) => api.post('/farms', data),
  getFarms: (approvedOnly = true) => api.get('/farms', { params: { approved_only: approvedOnly } }),
  getMyFarms: () => api.get('/farms/my'),
  approveFarm: (id) => api.put(`/farms/${id}/approve`),
};

// Review API
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getReviews: (targetId, targetType) => api.get(`/reviews/${targetId}`, { params: { target_type: targetType } }),
};

// Notification API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// Success Story API
export const successStoryAPI = {
  createStory: (data) => api.post('/success-stories', data),
  getStories: () => api.get('/success-stories'),
};

// AI API
export const aiAPI = {
  analyzeResume: (resumeText) => api.post('/ai/resume-analysis', null, { params: { resume_text: resumeText } }),
  getJobRecommendations: () => api.post('/ai/job-match'),
  getCareerPath: (targetRole) => api.post('/ai/career-path', null, { params: { target_role: targetRole } }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default api;
