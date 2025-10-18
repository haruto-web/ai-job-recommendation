import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Account.css';

const API_URL = process.env.REACT_APP_API_URL;

function Account({ isLoggedIn }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('jobseeker');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/user?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          setUserType(response.data.user_type);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleSaveUserType = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/user`, { user_type: userType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User type updated successfully!');
    } catch (error) {
      console.error('Failed to update user type:', error);
      alert('Failed to update user type.');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profile_image', selectedFile);

      const response = await axios.post(`${API_URL}/user/profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      setSelectedFile(null);
      // Auto-refresh the page to show the updated profile image
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload profile image. Please try again.');
    }
  };



  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="account-container">
        <section className="account-hero">
          <h1>Please Log In</h1>
          <p>You need to be logged in to view your profile.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="account-container">
      <section className="account-hero">
        <h1>Your Profile</h1>
        <p>Manage your account and preferences</p>
      </section>

      <section className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.profile_image ? (
                <img 
                  src={`http://localhost:8000/storage/${user.profile_image}`} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                />
              ) : (
                <span>{user && user.name ? user.name.charAt(0).toUpperCase() : '?'}</span>
              )}
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <div className="profile-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                id="profile-image-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-image-input" className="upload-btn">
                Choose File
              </label>
              <button onClick={handleImageUpload} disabled={!selectedFile} className="upload-btn">
                {selectedFile ? 'Upload Profile Image' : 'Select Image First'}
              </button>
              {selectedFile && (
                <p className="selected-file-text">Selected file: {selectedFile.name}</p>
              )}
            </div>
          </div>

          <div className="user-type-section">
            <h3>User Type</h3>
            <div className="user-type-toggle">
              <button
                className={`type-btn ${userType === 'jobseeker' ? 'active' : ''}`}
                onClick={() => setUserType('jobseeker')}
                type="button"
              >
                Job Seeker
              </button>
              <button
                className={`type-btn ${userType === 'employer' ? 'active' : ''}`}
                onClick={() => setUserType('employer')}
                type="button"
              >
                Employer
              </button>
            </div>
            <p className="user-type-desc">
              {userType === 'jobseeker'
                ? 'You are currently set as a job seeker. You can browse and apply for jobs.'
                : 'You are currently set as an employer. You can post jobs and find candidates.'
              }
            </p>
            <button onClick={handleSaveUserType} className="save-btn" type="button">
              Save Changes
            </button>
          </div>

          <div className="profile-details">
            <h3>Profile Details</h3>
            <div className="detail-item">
              <strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}
            </div>
            <div className="detail-item">
              <strong>Email Verified:</strong> {user.email_verified_at ? 'Yes' : 'No'}
            </div>
            <div className="detail-item">
              <strong>User Type:</strong> {userType === 'jobseeker' ? 'Job Seeker' : 'Employer'}
            </div>
          </div>

          {userType === 'jobseeker' && (
            <div className="jobseeker-info">
              <h3>Job Seeker Information</h3>
              <p>View your applications and earnings in the <a href="/dashboard">Dashboard</a>.</p>
              <div className="user-background">
                <h4>Your Background</h4>
                {user.profile ? (
                  <div>
                    {user.profile.bio && <p><strong>Bio:</strong> {user.profile.bio}</p>}
                    {user.profile.skills && user.profile.skills.length > 0 && (
                      <p><strong>Skills:</strong> {user.profile.skills.join(', ')}</p>
                    )}
                    {user.profile.experience_level && <p><strong>Experience Level:</strong> {user.profile.experience_level}</p>}
                    {user.profile.portfolio_url && <p><strong>Portfolio:</strong> <a href={user.profile.portfolio_url} target="_blank" rel="noopener noreferrer">{user.profile.portfolio_url}</a></p>}
                    <div>
                      <strong>Resumes:</strong>
                      {user.profile.resumes && user.profile.resumes.length > 0 ? (
                        <div style={{ marginTop: '15px' }}>
                          {user.profile.resumes.map((resume, index) => (
                            <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                              <span>{resume.name}</span>
                              <div style={{ marginTop: '5px' }}>
                                <a href={`${API_URL}/storage/${resume.url}`} target="_blank" rel="noopener noreferrer">View</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No resumes uploaded yet. Go to the <a href="/jobs">Jobs</a> page to manage your resumes.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>No profile information available. Update your profile to improve job matches.</p>
                )}
              </div>
            </div>
          )}

          {userType === 'employer' && (
            <div className="employer-info">
              <h3>Employer Information</h3>
              <p>Manage your jobs and applications in the <a href="/dashboard">Dashboard</a>.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation</p>
        <p>Helping you connect with the right opportunities</p>
      </footer>
    </div>
  );
}

export default Account;
