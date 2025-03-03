// components/EditProfileModal.jsx
import React, { useState } from 'react';
import '../styles/EditProfileModal.css';

const EditProfileModal = ({ profile, onClose }) => {
  // Pre-populate fields using the profile data
  const [profileTitle, setProfileTitle] = useState(profile.profileTitle || '');
  const [profileDescription, setProfileDescription] = useState(profile.profileDescription || '');
  const [definedTerms, setDefinedTerms] = useState(profile.definedTerms || [{ specificTerm: '', termDescription: '' }]);

  // Handlers for Defined Terms
  const handleAddDefinedTerm = () => {
    setDefinedTerms([...definedTerms, { specificTerm: '', termDescription: '' }]);
  };

  const handleRemoveDefinedTerm = (index) => {
    if (definedTerms.length > 1) {
      const updated = [...definedTerms];
      updated.splice(index, 1);
      setDefinedTerms(updated);
    }
  };

  const handleDefinedTermChange = (index, field, value) => {
    const updated = [...definedTerms];
    updated[index][field] = value;
    setDefinedTerms(updated);
  };

  // Save profile using PUT
  const handleSaveProfile = async () => {
    // Build query parameters for simple fields
    const queryParams = new URLSearchParams({
      user_id: profile.userId || 'some_user_id',
      profile_title: profileTitle,
      profile_description: profileDescription,
    }).toString();
    
    const url = `http://127.0.0.1:8000/update/profile/${profile.profileId}?${queryParams}`;
    
    const bodyPayload = {
      defined_terms: definedTerms,
      // Add other fields (like schedule config) as needed
    };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      const result = await response.json();
      console.log("Profile updated:", result);
      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Profile Title</label>
            <input
              type="text"
              placeholder="Enter Profile Title"
              value={profileTitle}
              onChange={(e) => setProfileTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Profile Description</label>
            <input
              type="text"
              placeholder="Enter Profile Description"
              value={profileDescription}
              onChange={(e) => setProfileDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Defined Terms</label>
            <div className="terms-container">
              {definedTerms.map((term, index) => (
                <div key={index} className="defined-term-row">
                  <input
                    type="text"
                    placeholder="Enter Specific Term"
                    value={term.specificTerm}
                    onChange={(e) => handleDefinedTermChange(index, 'specificTerm', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Enter Description"
                    value={term.termDescription}
                    onChange={(e) => handleDefinedTermChange(index, 'termDescription', e.target.value)}
                  />
                  {definedTerms.length > 1 && (
                    <button
                      type="button"
                      className="remove-term-btn"
                      onClick={() => handleRemoveDefinedTerm(index)}
                    >
                      Remove term
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="add-term-btn" onClick={handleAddDefinedTerm}>
              Add term
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={handleSaveProfile}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
