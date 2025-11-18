import React, { useState, useEffect } from 'react';
import './UserProfileManager.css';

/**
 * User Profile Manager - Allows owner to create and switch between multiple user profiles
 * Only accessible by polotuspossumus@gmail.com
 */
export const UserProfileManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    email: '',
    style: 'casual',
    avatar: '👤'
  });

  const avatarOptions = ['👤', '🎨', '🎮', '🎭', '🎪', '🎯', '🎸', '🎬', '📸', '✨', '🌟', '💫', '🎵', '🎹', '🎺', '🎻'];
  const styleOptions = ['casual', 'professional', 'creative', 'minimal', 'vibrant'];

  // Load profiles from localStorage
  useEffect(() => {
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '[]');
    setProfiles(storedProfiles);
    
    const activeProfile = localStorage.getItem('activeProfile');
    if (activeProfile) {
      setCurrentProfile(JSON.parse(activeProfile));
    }
  }, []);

  // Save profiles to localStorage
  const saveProfiles = (updatedProfiles) => {
    localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
  };

  // Create new profile
  const handleCreateProfile = () => {
    if (!newProfile.name || !newProfile.email) {
      alert('Please enter a name and email');
      return;
    }

    if (profiles.length >= 3) {
      alert('Maximum 3 profiles allowed');
      return;
    }

    const profile = {
      id: `profile_${Date.now()}`,
      name: newProfile.name,
      email: newProfile.email,
      style: newProfile.style,
      avatar: newProfile.avatar,
      createdAt: new Date().toISOString(),
      preferences: {
        theme: newProfile.style === 'minimal' ? 'light' : 'dark',
        notifications: true,
        autoSave: true
      }
    };

    const updatedProfiles = [...profiles, profile];
    saveProfiles(updatedProfiles);
    setShowCreateForm(false);
    setNewProfile({ name: '', email: '', style: 'casual', avatar: '👤' });
  };

  // Switch to a profile
  const handleSwitchProfile = (profile) => {
    // Save current profile as active
    localStorage.setItem('activeProfile', JSON.stringify(profile));
    setCurrentProfile(profile);

    // Apply profile preferences
    if (profile.preferences.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    // Update user context
    localStorage.setItem('currentUserEmail', profile.email);
    localStorage.setItem('currentUserName', profile.name);
    localStorage.setItem('userStyle', profile.style);

    alert(`Switched to ${profile.name}'s profile! Refreshing...`);
    setTimeout(() => window.location.reload(), 500);
  };

  // Delete a profile
  const handleDeleteProfile = (profileId) => {
    if (!confirm('Delete this profile? This cannot be undone.')) return;

    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    saveProfiles(updatedProfiles);

    if (currentProfile?.id === profileId) {
      localStorage.removeItem('activeProfile');
      setCurrentProfile(null);
    }
  };

  // Return to owner admin
  const returnToAdmin = () => {
    localStorage.removeItem('activeProfile');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('userStyle');
    setCurrentProfile(null);
    alert('Returned to admin mode! Refreshing...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="user-profile-manager">
      <div className="profile-manager-header">
        <h2>👥 User Profile Manager</h2>
        <p className="subtitle">Create up to 3 test profiles with different styles</p>
      </div>

      {/* Current Profile Display */}
      {currentProfile && (
        <div className="current-profile-banner">
          <div className="profile-info">
            <span className="avatar">{currentProfile.avatar}</span>
            <div>
              <strong>{currentProfile.name}</strong>
              <span className="email">{currentProfile.email}</span>
              <span className="style-badge">{currentProfile.style}</span>
            </div>
          </div>
          <button onClick={returnToAdmin} className="return-btn">
            Return to Admin 👑
          </button>
        </div>
      )}

      {/* Profile List */}
      <div className="profiles-grid">
        {profiles.map(profile => (
          <div key={profile.id} className={`profile-card ${currentProfile?.id === profile.id ? 'active' : ''}`}>
            <div className="profile-card-header">
              <span className="avatar-large">{profile.avatar}</span>
              <button 
                onClick={() => handleDeleteProfile(profile.id)}
                className="delete-btn"
                title="Delete profile"
              >
                ×
              </button>
            </div>
            <h3>{profile.name}</h3>
            <p className="email">{profile.email}</p>
            <div className="style-info">
              <span className="style-badge">{profile.style}</span>
              <span className="theme-badge">{profile.preferences.theme}</span>
            </div>
            <button 
              onClick={() => handleSwitchProfile(profile)}
              className="switch-btn"
              disabled={currentProfile?.id === profile.id}
            >
              {currentProfile?.id === profile.id ? 'Current' : 'Switch to Profile'}
            </button>
          </div>
        ))}

        {/* Add Profile Card */}
        {profiles.length < 3 && !showCreateForm && (
          <div className="profile-card add-card" onClick={() => setShowCreateForm(true)}>
            <div className="add-icon">+</div>
            <p>Add New Profile</p>
            <span className="slots-remaining">{3 - profiles.length} slot{3 - profiles.length !== 1 ? 's' : ''} remaining</span>
          </div>
        )}
      </div>

      {/* Create Profile Form */}
      {showCreateForm && (
        <div className="create-profile-form">
          <h3>Create New Profile</h3>
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={newProfile.name}
              onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
              placeholder="e.g., Creative Persona"
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={newProfile.email}
              onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
              placeholder="e.g., creative@example.com"
            />
          </div>

          <div className="form-group">
            <label>Style</label>
            <select
              value={newProfile.style}
              onChange={(e) => setNewProfile({...newProfile, style: e.target.value})}
            >
              {styleOptions.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Avatar</label>
            <div className="avatar-selector">
              {avatarOptions.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  className={`avatar-option ${newProfile.avatar === avatar ? 'selected' : ''}`}
                  onClick={() => setNewProfile({...newProfile, avatar})}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleCreateProfile} className="create-btn">
              Create Profile
            </button>
            <button onClick={() => setShowCreateForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="info-panel">
        <h4>ℹ️ About User Profiles</h4>
        <ul>
          <li>Create up to 3 test profiles for different use cases</li>
          <li>Each profile has its own preferences and style</li>
          <li>Switch between profiles without logging out</li>
          <li>Admin access (👑) is always preserved for you</li>
          <li>Profiles are local to this browser</li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfileManager;
