import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
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
  const [payoutForm, setPayoutForm] = useState({ applicationId: null, amount: '', description: '' });
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [processingPayout, setProcessingPayout] = useState(false);
  const [moneyForm, setMoneyForm] = useState({ amount: '', description: '' });
  const [showMoneyForm, setShowMoneyForm] = useState(false);
  const [processingMoney, setProcessingMoney] = useState(false);
  const [moneyAction, setMoneyAction] = useState(''); // 'add' or 'reduce'
  // Resume management / AI analysis for jobseekers
  const [selectedFile, setSelectedFile] = useState(null);
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [replacingFile, setReplacingFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // {role:'user'|'bot', text}
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [applying, setApplying] = useState(null);

  const handleToggleUrgent = async (jobId, currentUrgent) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/jobs/${jobId}`, { urgent: !currentUrgent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Job ${!currentUrgent ? 'marked as' : 'removed from'} urgent successfully!`);
      fetchDashboard(); // Refresh dashboard data
    } catch (error) {
      console.error('Failed to toggle urgent:', error);
      alert('Failed to update job. Please try again.');
    }
  };

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

  const handlePayout = async (applicationId) => {
    if (!payoutForm.amount || !payoutForm.description) return;

    setProcessingPayout(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/payments`, {
        application_id: applicationId,
        amount: parseFloat(payoutForm.amount),
        description: payoutForm.description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Payout processed successfully!');
      setPayoutForm({ applicationId: null, amount: '', description: '' });
      setShowPayoutForm(false);
      fetchDashboard(); // Refresh dashboard data
    } catch (error) {
      console.error('Failed to process payout:', error);
      alert('Failed to process payout. Please try again.');
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleMoneyAction = async () => {
    if (!moneyForm.amount || !moneyForm.description) return;

    setProcessingMoney(true);
    try {
      const token = localStorage.getItem('token');
      const amount = moneyAction === 'add' ? parseFloat(moneyForm.amount) : -parseFloat(moneyForm.amount);
      await axios.post(`${API_URL}/manage-money`, {
        amount: amount,
        description: moneyForm.description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`${moneyAction === 'add' ? 'Money added' : 'Money reduced'} successfully!`);
      setMoneyForm({ amount: '', description: '' });
      setShowMoneyForm(false);
      setMoneyAction('');
      fetchDashboard(); // Refresh dashboard data
    } catch (error) {
      console.error('Failed to manage money:', error);
      alert('Failed to manage money. Please try again.');
    } finally {
      setProcessingMoney(false);
    }
  };

  // Resume / AI handlers
  const handleAddResume = async () => {
    if (!selectedFile) return;
    setUploadingResume(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('action', 'add');

      const response = await axios.post(`${API_URL}/user/resume`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(prev => ({ ...prev, profile: response.data.profile }));
      setSelectedFile(null);
      alert('Resume added successfully!');
    } catch (error) {
      console.error('Failed to add resume:', error);
      alert('Failed to add resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleReplaceResume = async (index) => {
    if (!replacingFile) return;
    setUploadingResume(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('action', 'replace');
      formData.append('index', index);
      formData.append('resume', replacingFile);

      const response = await axios.post(`${API_URL}/user/resume`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(prev => ({ ...prev, profile: response.data.profile }));
      setReplacingIndex(null);
      setReplacingFile(null);
      alert('Resume replaced successfully!');
    } catch (error) {
      console.error('Failed to replace resume:', error);
      alert('Failed to replace resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (index = null) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('action', 'delete');
      if (index !== null) formData.append('index', index);

      const response = await axios.post(`${API_URL}/user/resume`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(prev => ({ ...prev, profile: response.data.profile }));
      alert('Resume deleted successfully!');
    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };

  const fetchAiAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/resume-analysis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiAnalysis(response.data);
    } catch (error) {
      console.error('Failed to fetch AI analysis:', error);
      setAiAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const triggerAiAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/user/trigger-ai-analysis`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => fetchAiAnalysis(), 2000);
    } catch (error) {
      console.error('Failed to trigger AI analysis:', error);
      alert('Failed to trigger AI analysis. Please try again.');
    } finally {
      setLoadingAnalysis(false);
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
        <SearchBar />
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
                <div className="form-group">
                  <label htmlFor="urgent">Mark as Urgent</label>
                  <input
                    type="checkbox"
                    id="urgent"
                    name="urgent"
                    checked={jobForm.urgent}
                    onChange={(e) => setJobForm(prev => ({ ...prev, urgent: e.target.checked }))}
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
                      <p>Status: {job.urgent ? '🔥 Urgent' : 'Normal'}</p>
                      <button
                        onClick={() => handleToggleUrgent(job.id, job.urgent)}
                        className="urgent-toggle-btn"
                      >
                        {job.urgent ? 'Remove Urgent' : 'Mark as Urgent'}
                      </button>
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
                        {app.status === 'accepted' && (
                          <button
                            className="action-btn payout"
                            onClick={() => {
                              setPayoutForm({ applicationId: app.id, amount: '', description: '' });
                              setShowPayoutForm(true);
                            }}
                          >
                            💰 Pay Worker
                          </button>
                        )}
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
              <p>Employer's Money: ${dashboardData.total_spent}</p>
              <div className="money-actions">
                <button
                  className="action-btn add-money"
                  onClick={() => {
                    setMoneyAction('add');
                    setShowMoneyForm(true);
                  }}
                >
                  ➕ Add Money
                </button>
                <button
                  className="action-btn reduce-money"
                  onClick={() => {
                    setMoneyAction('reduce');
                    setShowMoneyForm(true);
                  }}
                >
                  ➖ Reduce Money
                </button>
              </div>
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

      {/* Resume management & AI analysis for jobseekers - outside grid */}
      {dashboardData.user_type === 'jobseeker' && (
        <div className="dashboard-section-resumes-section">
          <h2>Manage Your Resumes</h2>
          <p>Upload and manage multiple resumes to improve job matches and get AI insights.</p>

          <div style={{ marginTop: '10px' }}>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <button onClick={handleAddResume} disabled={!selectedFile || uploadingResume} className="upload-btn" style={{ marginLeft: '8px' }}>
              {uploadingResume ? 'Adding...' : 'Add Resume'}
            </button>
          </div>

          {dashboardData.profile && dashboardData.profile.resumes && dashboardData.profile.resumes.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h3>Your Resumes</h3>
              {dashboardData.profile.resumes.map((resume, index) => (
                <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <span>{resume.name}</span>
                  <div style={{ marginTop: '5px' }}>
                    <a href={`${API_URL}/storage/${resume.url}`} target="_blank" rel="noopener noreferrer">View</a>
                    {replacingIndex === index ? (
                      <div>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setReplacingFile(e.target.files[0])} />
                        <button onClick={() => handleReplaceResume(index)} disabled={!replacingFile || uploadingResume}>{uploadingResume ? 'Changing...' : 'Change Resume'}</button>
                        <button onClick={() => setReplacingIndex(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setReplacingIndex(index)} style={{ marginLeft: '8px' }}>Change Resume</button>
                    )}
                    <button onClick={() => handleDeleteResume(index)} className="delete-btn" style={{ marginLeft: '8px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dashboardData.profile && dashboardData.profile.resume_url && (!dashboardData.profile.resumes || dashboardData.profile.resumes.length === 0) && (
            <div style={{ marginTop: '10px' }}>
              <p>Current Resume: <a href={`${API_URL}/storage/${dashboardData.profile.resume_url}`} target="_blank" rel="noopener noreferrer">View Resume</a></p>
              <button onClick={() => handleDeleteResume()} className="delete-btn">Delete Resume</button>
            </div>
          )}

          {/* AI Analysis */}
          <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <p style={{ marginTop: '8px' }}>Open the chat in the bottom-right to talk to the AI career advisor.</p>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutForm && (
        <div className="modal-overlay" onClick={() => setShowPayoutForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Process Payout</h3>
            <div className="form-group">
              <label htmlFor="payout-amount">Amount ($)</label>
              <input
                type="number"
                id="payout-amount"
                placeholder="Enter amount"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="payout-description">Description</label>
              <input
                type="text"
                id="payout-description"
                placeholder="Payment description"
                value={payoutForm.description}
                onChange={(e) => setPayoutForm({...payoutForm, description: e.target.value})}
                required
              />
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowPayoutForm(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={() => handlePayout(payoutForm.applicationId)}
                disabled={processingPayout || !payoutForm.amount || !payoutForm.description}
              >
                {processingPayout ? 'Processing...' : 'Process Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Money Management Modal */}
      {showMoneyForm && (
        <div className="modal-overlay" onClick={() => setShowMoneyForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{moneyAction === 'add' ? 'Add Money' : 'Reduce Money'}</h3>
            <div className="form-group">
              <label htmlFor="money-amount">Amount ($)</label>
              <input
                type="number"
                id="money-amount"
                placeholder="Enter amount"
                value={moneyForm.amount}
                onChange={(e) => setMoneyForm({...moneyForm, amount: e.target.value})}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="money-description">Description</label>
              <input
                type="text"
                id="money-description"
                placeholder="Transaction description"
                value={moneyForm.description}
                onChange={(e) => setMoneyForm({...moneyForm, description: e.target.value})}
                required
              />
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowMoneyForm(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={() => handleMoneyAction()}
                disabled={processingMoney || !moneyForm.amount || !moneyForm.description}
              >
                {processingMoney ? 'Processing...' : (moneyAction === 'add' ? 'Add Money' : 'Reduce Money')}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation</p>
        <p>Helping you connect with the right opportunities</p>
      </footer>
        {/* Floating Chat FAB & Panel */}
        <div>
          <div className="ai-chat-fab" onClick={() => setChatOpen(open => !open)} title="Open AI Chat">
            💬
          </div>

          {chatOpen && (
            <div className="ai-chat-panel" role="dialog" aria-label="AI Career Chat">
              <div className="ai-chat-header">AI Career Advisor</div>
              <div className="ai-chat-messages" id="ai-chat-messages">
                {chatMessages.length === 0 && (
                  <div className="ai-msg bot">Hi! Tell me your skills (comma-separated) and I will suggest jobs that fit you.</div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`ai-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="ai-chat-input">
                <input className="ai-input-field" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="e.g. PHP, Laravel, React | optionally: experience=mid" />
                <button className="ai-send-btn" onClick={async () => {
                  if (!chatInput.trim()) return;
                  const text = chatInput.trim();
                  setChatMessages(prev => [...prev, { role: 'user', text }]);
                  setChatInput('');
                  setChatLoading(true);
                  try {
                    // Parse skills and optional experience
                    let skills = [];
                    let experience = '';
                    const parts = text.split('|').map(p => p.trim());
                    if (parts.length > 0) {
                      skills = parts[0].split(',').map(s => s.trim()).filter(Boolean);
                    }
                    if (parts.length > 1) {
                      const expPart = parts[1];
                      const match = expPart.match(/experience\s*=\s*(\w+)/i);
                      if (match) experience = match[1];
                    }
                    if (skills.length === 0) {
                      setChatMessages(prev => [...prev, { role: 'bot', text: 'Please include at least one skill (comma-separated).' }]);
                      setChatLoading(false);
                      return;
                    }
                    const token = localStorage.getItem('token');
                    const resp = await axios.post(`${API_URL}/ai/skill-chat`, { skills, experience, limit: 5 }, { headers: { Authorization: `Bearer ${token}` } });
                    const raw = resp.data.suggestions || [];
                    // keep only high-confidence suggestions (80%+)
                    const suggestions = raw.filter(s => (s.confidence ?? 0) >= 80);
                    setSuggestions(suggestions);
                    try {
                      // persist only high-confidence suggestions so Jobs page can display them
                      localStorage.setItem('ai_suggestions', JSON.stringify(suggestions));
                    } catch (e) {
                      console.warn('Failed to persist AI suggestions', e);
                    }
                    if (suggestions.length === 0) {
                      setChatMessages(prev => [...prev, { role: 'bot', text: 'No suggestions found.' }]);
                    } else {
                      const sb = suggestions.map((s, idx) => `${idx+1}. ${s.title} (${s.recommended_level || 'N/A'}) — ${s.confidence ?? 'N/A'}%`).join('\n');
                      setChatMessages(prev => [...prev, { role: 'bot', text: sb }]);
                    }
                  } catch (err) {
                    console.error('Chat send failed', err);
                    setChatMessages(prev => [...prev, { role: 'bot', text: 'AI request failed. Try again later.' }]);
                  } finally {
                    setChatLoading(false);
                    // scroll to bottom
                    setTimeout(() => {
                      const el = document.getElementById('ai-chat-messages');
                      if (el) el.scrollTop = el.scrollHeight;
                    }, 50);
                  }
                }}>{chatLoading ? '...' : 'Send'}</button>
              </div>
            </div>
          )}
              {suggestions.length > 0 && (
                <div className="ai-suggestions">
                  <h4>Suggested Jobs</h4>
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="suggestion-card">
                      <strong>{s.title}</strong>
                      <p className="suggestion-desc">{s.description}</p>
                      <div className="suggestion-meta">{s.recommended_level} • {s.confidence}%</div>
                      <div className="suggestion-actions">
                        <button onClick={async () => {
                          // If job_id present, try to apply directly
                          const jobId = s.job_id;
                          if (!jobId) {
                            // Navigate to job search/detail fallback
                            alert('Job detail not available. Redirecting to jobs list.');
                            navigate('/jobs');
                            return;
                          }
                          // Check if user has a resume before applying
                          const hasResume = dashboardData.profile && (dashboardData.profile.resumes?.length > 0 || dashboardData.profile.resume_url);
                          if (!hasResume) {
                            alert('Please upload a resume before applying for jobs.');
                            return;
                          }
                          setApplying(jobId);
                          try {
                            const token = localStorage.getItem('token');
                            await axios.post(`${API_URL}/applications`, { job_id: jobId }, { headers: { Authorization: `Bearer ${token}` } });
                            alert('Application submitted successfully!');
                            // update dashboard data and clear suggestions
                            fetchDashboard();
                            setSuggestions([]);
                          } catch (error) {
                            console.error('Failed to apply from suggestion:', error);
                            if (error.response && error.response.status === 409) {
                              alert('You have already applied for this job.');
                            } else {
                              alert('Failed to apply for the job. Please try again.');
                            }
                          } finally {
                            setApplying(null);
                          }
                        }} disabled={applying === s.job_id} className="apply-btn">
                          {applying === s.job_id ? 'Applying...' : 'Apply with Resume'}
                        </button>
                        <button onClick={() => {
                          // Open job detail page if available
                          if (s.job_id) {
                            navigate(`/jobs/${s.job_id}`);
                          } else {
                            navigate('/jobs');
                          }
                          setChatOpen(false);
                        }} className="view-btn">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </div>
  );
}

export default Dashboard;

    // Floating Chat UI: render at bottom-right
    /* We'll mount chat markup via a small component-like block inserted into DOM by React return. */