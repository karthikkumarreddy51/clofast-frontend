// components/DeleteProfileModal.jsx
import React, { useEffect } from 'react';
import '../styles/DeleteProfileModal.css';

const DeleteProfileModal = ({ profile, onClose, onDeleteSuccess }) => {
  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleDelete = async () => {
    const url = `http://127.0.0.1:8000/delete/Docprofile?profileId=${profile.profileId}`;
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile');
      }
      const result = await response.json();
      console.log('Profile deleted:', result);
      alert('Profile deleted successfully!');
      // Call parent's onDeleteSuccess callback to update state if needed
      if (onDeleteSuccess) {
        onDeleteSuccess(profile.profileId);
      }
      // Close the modal right after a successful delete response
      onClose();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('An error occurred while deleting the profile.');
    }
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-container">
        <div className="delete-modal-header">
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="delete-modal-content">
          <div className="delete-icon">
            <i className="fas fa-trash-alt"></i>
          </div>
          <div className="delete-text">
            <h3>
              Are you sure you want to delete profile{' '}
              <span className="profile-name">({profile.profileTitle})</span>?
            </h3>
            <p>This action will not delete the documents associated with this profile.</p>
          </div>
        </div>
        <div className="delete-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfileModal;
