import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    requirements: []
  });
  const [creatingJob, setCreatingJob] = useState(false);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [navigate]);

  const handleApplicationAction = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/applications/${applicationId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Application ${status} successfully!`);
      fetchDashboard(); // Refresh dashboard data
    } catch (error) {
      console.error('Failed to update application:', error);
      alert('Failed to update application. Please try again.');
    }
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreatingJob(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/jobs`, jobForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Job created successfully!');
      setJobForm({
        title: '',
        description: '',
        company: '',
        location: '',
        type: 'full-time',
        salary: '',
        requirements: []
      });
      fetchDashboard(); // Refresh dashboard data
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setCreatingJob(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div>Failed to load dashboard.</div>;
  }

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your overview.</p>
      </section>

      <section className="dashboard-content">
        {dashboardData.user_type === 'jobseeker' ? (
          <div className="jobseeker-dashboard">
            <div className="dashboard-section">
              <h2>Job Seeker Dashboard</h2>
              <p>Manage your job applications and track your progress</p>
            </div>

            <div className="dashboard-section">
              <h2>Your Applications</h2>
              {dashboardData.applications.length > 0 ? (
                <div className="applications-list">
                  {dashboardData.applications.map(app => (
                    <div key={app.id} className="application-card">
                      <h3>{app.job.title}</h3>
                      <p>Company: {app.job.company}</p>
                      <p>Location: {app.job.location}</p>
                      <p>Status: <span className={`status-${app.status}`}>{app.status}</span></p>
                      <p>Applied on: {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't applied to any jobs yet.</p>
              )}
            </div>

            {dashboardData.profile && (
              <div className="dashboard-section">
                <h2>Your Profile</h2>
                {dashboardData.profile.bio && <p><strong>Bio:</strong> {dashboardData.profile.bio}</p>}
                {dashboardData.profile.skills && dashboardData.profile.skills.length > 0 && (
                  <p><strong>Skills:</strong> {dashboardData.profile.skills.join(', ')}</p>
                )}
                {dashboardData.profile.experience_level && <p><strong>Experience Level:</strong> {dashboardData.profile.experience_level}</p>}
              </div>
            )}

            <div className="dashboard-section">
              <h2>Accepted Jobs (Working On)</h2>
              {dashboardData.incoming_projects && dashboardData.incoming_projects.length > 0 ? (
                <div className="projects-list">
                  {dashboardData.incoming_projects.map(project => (
                    <div key={project.id} className="project-card">
                      <h3>{project.job.title}</h3>
                      <p>Company: {project.job.company}</p>
                      <p>Location: {project.job.location}</p>
                      <p>Status: {project.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No accepted jobs yet.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Earnings & Transactions</h2>
              <p>Total Earnings: ${dashboardData.total_earnings}</p>
              {dashboardData.transactions.length > 0 ? (
                <div className="transactions-list">
                  {dashboardData.transactions.map(tx => (
                    <div key={tx.id} className="transaction-card">
                      <p>{tx.description}</p>
                      <p>Amount: ${tx.amount} ({tx.type})</p>
                      <p>Date: {tx.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No transactions yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="employer-dashboard">
            <div className="dashboard-section">
              <h2>Employer Dashboard</h2>
              <p>Manage your job postings and review applications</p>
            </div>

            <div className="dashboard-section">
              <h2>Create New Job</h2>
              <form onSubmit={handleCreateJob} className="job-form">
                <div className="form-group">
                  <label htmlFor="title">Job Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Job Title"
                    value={jobForm.title}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Job Description"
                    value={jobForm.description}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Company"
                    value={jobForm.company}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Location"
                    value={jobForm.location}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Job Type</label>
                  <select id="type" name="type" value={jobForm.type} onChange={handleJobFormChange}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="salary">Salary (optional)</label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    placeholder="Salary (optional)"
                    value={jobForm.salary}
                    onChange={handleJobFormChange}
                  />
                </div>
                <button type="submit" disabled={creatingJob} className="create-job-btn">
                  {creatingJob ? 'Creating...' : 'Create Job'}
                </button>
              </form>
            </div>

            <div className="dashboard-section">
              <h2>Your Job Postings</h2>
              <p>Active Jobs: {dashboardData.active_jobs}</p>
              {dashboardData.jobs.length > 0 ? (
                <div className="jobs-list">
                  {dashboardData.jobs.map(job => (
                    <div key={job.id} className="job-card">
                      <h3>{job.title}</h3>
                      <p>Applications: {job.applications ? job.applications.length : 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't posted any jobs yet.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Hired Workers</h2>
              {dashboardData.working_on_jobs && dashboardData.working_on_jobs.length > 0 ? (
                <div className="working-jobs-list">
                  {dashboardData.working_on_jobs.map(app => (
                    <div key={app.id} className="working-job-card">
                      <h3>{app.job.title}</h3>
                      <p>Worker: {app.user.name}</p>
                      <p>Status: {app.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hired workers yet.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Job Applications</h2>
              <p>Total Applications: {dashboardData.total_applications}</p>
              {dashboardData.applications.length > 0 ? (
                <div className="applications-list">
                  {dashboardData.applications.map(app => (
                    <div key={app.id} className="application-card enhanced">
                      <div className="application-header">
                        <h3>{app.job.title}</h3>
                        <span className={`status-badge ${app.status}`}>{app.status}</span>
                      </div>
                      
                      <div className="applicant-info">
                        <h4>👤 Applicant: {app.user.name}</h4>
                        <p>📧 Email: {app.user.email}</p>
                        
                        {/* Resume Information */}
                        {app.user.profile && (
                          <div className="resume-section">
                            <h5>📄 Resume & Profile</h5>
                            {app.user.profile.resumes && app.user.profile.resumes.length > 0 ? (
                              <div className="resume-links">
                                {app.user.profile.resumes.map((resume, index) => (
                                  <a 
                                    key={index} 
                                    href={`${API_URL}/storage/${resume.url}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="resume-link"
                                  >
                                    📎 {resume.name}
                                  </a>
                                ))}
                              </div>
                            ) : app.user.profile.resume_url ? (
                              <a 
                                href={`${API_URL}/storage/${app.user.profile.resume_url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="resume-link"
                              >
                                📎 View Resume
                              </a>
                            ) : (
                              <p className="no-resume">No resume uploaded</p>
                            )}
                          </div>
                        )}

                        {/* AI Analysis Information */}
                        {app.user.profile && app.user.profile.ai_analysis && (
                          <div className="ai-analysis-section">
                            <h5>🤖 AI Analysis</h5>
                            <div className="ai-details">
                              {app.user.profile.resume_summary && (
                                <div className="ai-item">
                                  <strong>Summary:</strong>
                                  <p>{app.user.profile.resume_summary}</p>
                                </div>
                              )}
                              {app.user.profile.extracted_experience && (
                                <div className="ai-item">
                                  <strong>Experience:</strong>
                                  <span>{app.user.profile.extracted_experience}</span>
                                </div>
                              )}
                              {app.user.profile.skills && app.user.profile.skills.length > 0 && (
                                <div className="ai-item">
                                  <strong>Skills:</strong>
                                  <div className="skills-tags">
                                    {app.user.profile.skills.map((skill, index) => (
                                      <span key={index} className="skill-tag">{skill}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Cover Letter */}
                        {app.cover_letter && (
                          <div className="cover-letter-section">
                            <h5>💌 Cover Letter</h5>
                            <div className="cover-letter-content">
                              {app.cover_letter}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="application-actions">
                        <button 
                          className="action-btn accept" 
                          onClick={() => handleApplicationAction(app.id, 'accepted')}
                        >
                          ✅ Accept
                        </button>
                        <button 
                          className="action-btn reject" 
                          onClick={() => handleApplicationAction(app.id, 'rejected')}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No applications yet.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Payments & Transactions</h2>
              <p>Total Spent: ${dashboardData.total_spent}</p>
              {dashboardData.transactions.length > 0 ? (
                <div className="transactions-list">
                  {dashboardData.transactions.map(tx => (
                    <div key={tx.id} className="transaction-card">
                      <p>{tx.description}</p>
                      <p>Amount: ${tx.amount} ({tx.type})</p>
                      <p>Date: {tx.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No transactions yet.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation</p>
        <p>Helping you connect with the right opportunities</p>
      </footer>
    </div>
  );
}

export default Dashboard;
