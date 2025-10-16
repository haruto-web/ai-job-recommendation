import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL;

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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

            <div className="dashboard-section">
              <h2>Incoming Projects</h2>
              {dashboardData.incoming_projects.length > 0 ? (
                <div className="projects-list">
                  {dashboardData.incoming_projects.map(project => (
                    <div key={project.id} className="project-card">
                      <h3>{project.job.title}</h3>
                      <p>Status: {project.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No incoming projects.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Transactions</h2>
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
              <h2>Your Jobs</h2>
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
              <h2>Applications</h2>
              <p>Total Applications: {dashboardData.total_applications}</p>
              {dashboardData.applications.length > 0 ? (
                <div className="applications-list">
                  {dashboardData.applications.map(app => (
                    <div key={app.id} className="application-card">
                      <h3>{app.job.title}</h3>
                      <p>Applicant: {app.user.name}</p>
                      <p>Status: {app.status}</p>
                      <button className="action-btn" onClick={() => handleApplicationAction(app.id, 'accepted')}>Accept</button>
                      <button className="action-btn reject" onClick={() => handleApplicationAction(app.id, 'rejected')}>Reject</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No applications yet.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Transactions</h2>
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
