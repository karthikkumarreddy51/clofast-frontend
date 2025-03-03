// components/DeleteProfileModal.jsx
import React from 'react';
import '../styles/DeleteProfileModal.css'; // Make sure this path matches your structure

const DeleteProfileModal = ({ profile, onClose }) => {
  // Handler for deleting the profile
  const handleDelete = async () => {
   // const url = `http://127.0.0.1:8000/delete/Docprofile/${profile.profileId}`;
    const url='http://127.0.0.1:8000/delete/Docprofile?profileId=${profile.profileId}';
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile');
      }
      const result = await response.json();
      console.log('Profile deleted:', result);
      alert('Profile deleted successfully!');
      onClose();
      // Optionally refresh the profiles list or navigate away here
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('An error occurred while deleting the profile.');
    }
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-container">
        {/* Close button (X) in top-right corner */}
        <div className="delete-modal-header">
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Main content with icon and message */}
        <div className="delete-modal-content">
          <div className="delete-icon">
            {/* If using Font Awesome, for example: */}
            <i className="fas fa-trash-alt"></i>
            {/* Or replace with your own <img src="..." alt="trash" /> */}
          </div>
          <div className="delete-text">
            <h3>
              Are you sure you want to delete profile{' '}
              <span className="profile-name">({profile.profileTitle})</span>?
            </h3>
            <p>This action will not delete the documents associated with this profile.</p>
          </div>
        </div>

        {/* Footer with Cancel and Delete buttons */}
        <div className="delete-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfileModal;
