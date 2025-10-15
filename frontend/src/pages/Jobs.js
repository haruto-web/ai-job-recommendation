import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Jobs.css';

const API_URL = process.env.REACT_APP_API_URL;

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchJobs();
  }, []);

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
              </div>
            )) : (
              <p>No jobs available.</p>
            )}
          </div>
        </div>

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
