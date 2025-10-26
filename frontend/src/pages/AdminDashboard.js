import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'jobs') fetchJobs();
    if (activeTab === 'applications') fetchApplications();
    if (activeTab === 'payments') fetchPayments();
  }, [activeTab]);

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  if (!dashboardData) {
    return <div>Failed to load admin dashboard.</div>;
  }

  const userTypesData = {
    labels: ['Job Seekers', 'Employers', 'Admins'],
    datasets: [{
      data: [
        dashboardData.graphs.user_types.jobseeker,
        dashboardData.graphs.user_types.employer,
        dashboardData.graphs.user_types.admin
      ],
      backgroundColor: ['#007bff', '#28a745', '#dc3545'],
      borderColor: ['#007bff', '#28a745', '#dc3545'],
      borderWidth: 1,
    }],
  };

  const applicationStatusData = {
    labels: ['Pending', 'Accepted', 'Rejected'],
    datasets: [{
      label: 'Applications',
      data: [
        dashboardData.graphs.application_status.pending,
        dashboardData.graphs.application_status.accepted,
        dashboardData.graphs.application_status.rejected
      ],
      backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
    }],
  };

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <h1>Admin Dashboard</h1>
        <p>Manage users, jobs, applications, and payments</p>
      </section>

      <section className="dashboard-content">
        <div className="admin-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'jobs' ? 'active' : ''}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={activeTab === 'applications' ? 'active' : ''}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={activeTab === 'payments' ? 'active' : ''}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="admin-overview">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Users</h3>
                <p>{dashboardData.summary.total_users}</p>
              </div>
              <div className="summary-card">
                <h3>Total Jobs</h3>
                <p>{dashboardData.summary.total_jobs}</p>
              </div>
              <div className="summary-card">
                <h3>Total Applications</h3>
                <p>{dashboardData.summary.total_applications}</p>
              </div>
              <div className="summary-card">
                <h3>Total Payments</h3>
                <p>${dashboardData.summary.total_payment_amount}</p>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-card">
                <h3>User Types Distribution</h3>
                <Pie data={userTypesData} />
              </div>
              <div className="chart-card">
                <h3>Application Status</h3>
                <Bar data={applicationStatusData} />
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Users</h3>
              <div className="recent-list">
                {dashboardData.recent_users.map(user => (
                  <div key={user.id} className="recent-item">
                    <p><strong>{user.name}</strong> ({user.user_type}) - {user.email}</p>
                    <small>{user.created_at}</small>
                  </div>
                ))}
              </div>

              <h3>Recent Jobs</h3>
              <div className="recent-list">
                {dashboardData.recent_jobs.map(job => (
                  <div key={job.id} className="recent-item">
                    <p><strong>{job.title}</strong> at {job.company} by {job.user}</p>
                    <small>{job.created_at}</small>
                  </div>
                ))}
              </div>

              <h3>Recent Applications</h3>
              <div className="recent-list">
                {dashboardData.recent_applications.map(app => (
                  <div key={app.id} className="recent-item">
                    <p><strong>{app.user_name}</strong> applied for <strong>{app.job_title}</strong></p>
                    <small>Status: {app.status} - {app.created_at}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-table">
            <h3>Users Management</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.user_type}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button>Edit</button>
                      <button>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="admin-table">
            <h3>Jobs Management</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Posted by</th>
                  <th>Urgent</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.user?.name || 'Unknown'}</td>
                    <td>{job.urgent ? 'Yes' : 'No'}</td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td>
                      <button>Edit</button>
                      <button>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="admin-table">
            <h3>Applications Management</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Job</th>
                  <th>Applicant</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.job?.title || 'Unknown'}</td>
                    <td>{app.user?.name || 'Unknown'}</td>
                    <td>{app.status}</td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
                      <button>Edit</button>
                      <button>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="admin-table">
            <h3>Payments Management</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Application</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Processed At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.application?.job?.title || 'N/A'}</td>
                    <td>${payment.amount}</td>
                    <td>{payment.description}</td>
                    <td>{new Date(payment.processed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation - Admin Panel</p>
        <p>Manage your platform effectively</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;
