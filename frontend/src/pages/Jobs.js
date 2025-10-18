import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Jobs.css';

const API_URL = process.env.REACT_APP_API_URL;

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [replacingIndex, setReplacingIndex] = useState(null);
  const [replacingFile, setReplacingFile] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchJobs();
    fetchUser();
  }, []);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/applications`, { job_id: jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to apply:', error);
      if (error.response && error.response.status === 409) {
        alert('You have already applied for this job.');
      } else {
        alert('Failed to apply for the job. Please try again.');
      }
    } finally {
      setApplying(null);
    }
  };

  const handleAddResume = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('action', 'add');

      const response = await axios.put(`${API_URL}/user/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      setSelectedFile(null);
      alert('Resume added successfully!');
      // Redirect to Account page after successful upload
      window.location.href = '/account';
    } catch (error) {
      console.error('Failed to add resume:', error);
      alert('Failed to add resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };



  const handleReplaceResume = async (index) => {
    if (!replacingFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('action', 'replace');
      formData.append('index', index);
      formData.append('resume', replacingFile);

      const response = await axios.put(`${API_URL}/user/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      setReplacingIndex(null);
      setReplacingFile(null);
      alert('Resume replaced successfully!');
    } catch (error) {
      console.error('Failed to replace resume:', error);
      alert('Failed to replace resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (index) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('index', index);

      const response = await axios.put(`${API_URL}/user/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      alert('Resume deleted successfully!');
    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };



  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="jobs-container">
      <section className="jobs-hero">
        <h1>Find Your Perfect Job</h1>
        <p>Explore personalized job recommendations powered by AI technology.</p>
      </section>

      <section className="jobs-content">
        <div className="jobs-section">
          <h2>Featured Jobs</h2>
          <p>Our AI analyzes your profile and matches you with the most relevant opportunities in your field.</p>
          <div className="job-cards">
            {jobs.length > 0 ? jobs.map(job => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p>{job.company} - {job.location} - {job.type}</p>
                {job.salary && <p>Salary: ${job.salary}</p>}
                <span className="match-score">AI Match</span>
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={applying === job.id}
                  className="apply-btn"
                >
                  {applying === job.id ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )) : (
              <p>No jobs available.</p>
            )}
          </div>
        </div>

        {user && user.user_type === 'jobseeker' && (
          <div className="jobs-section">
            <h2>Manage Your Resumes</h2>
            <p>Upload and manage multiple resumes to improve job matches and apply to jobs.</p>

            {/* Add New Resume */}
            <div className="resume-upload">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <button
                onClick={handleAddResume}
                disabled={!selectedFile || uploading}
                className="upload-btn"
              >
                {uploading ? 'Adding...' : 'Add Resume'}
              </button>

              {/* List of Resumes */}
              {user.profile && user.profile.resumes && user.profile.resumes.length > 0 && (
                <div className="resume-list">
                  <h3>Your Resumes</h3>
                  {user.profile.resumes.map((resume, index) => (
                    <div key={index} className="resume-item">
                      <span>{resume.name}</span>
                      <div className="resume-actions">
                        <a href={`${API_URL}/storage/${resume.url}`} target="_blank" rel="noopener noreferrer">View</a>
                        {replacingIndex === index ? (
                          <div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setReplacingFile(e.target.files[0])}
                            />
                            <button onClick={() => handleReplaceResume(index)} disabled={!replacingFile || uploading}>
                              {uploading ? 'Changing...' : 'Change Resume'}
                            </button>
                            <button onClick={() => setReplacingIndex(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setReplacingIndex(index)}>Change Resume</button>
                        )}
                        <button onClick={() => handleDeleteResume(index)} className="delete-btn">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legacy Single Resume Support */}
            {user.profile && user.profile.resume_url && (!user.profile.resumes || user.profile.resumes.length === 0) && (
              <div className="resume-list">
                <p>Current Resume: <a href={`${API_URL}/storage/${user.profile.resume_url}`} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                <button onClick={() => handleDeleteResume()} className="delete-btn">Delete Resume</button>
              </div>
            )}
          </div>
        )}

        <div className="jobs-section">
          <h2>How We Match Jobs</h2>
          <p>We use advanced algorithms to consider your skills, experience, location preferences, and career goals to find the best fits.</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation</p>
        <p>Helping you connect with the right opportunities</p>
      </footer>
    </div>
  );
}

export default Jobs;
