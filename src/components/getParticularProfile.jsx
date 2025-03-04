import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DeleteProfileModal from './DeleteProfileModal';
import UseProfileModal from './EditProfileModal';
import '../styles/getParticularProfile.css';

function GetParticularProfile() {
  const { id } = useParams();

  // State for profile info
  const [profile, setProfile] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);

  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);

  // For searching documents
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data to use if backend data is unavailable
  const dummyProfile = {
    profileName: 'Lorem Ipsum',
    profileDescription:
      'Lorem ipsum dolor sit amet consectetur. Non si eget suspendisse arcu feugiat arcu egestas.',
    lastRun: '04/02/25',
    termVersion: 'Term 2, v10',
    crmConnection: 'Connected',
    connectionName: 'ABC',
    scheduledFrequency: 'Daily',
    createdBy: 'John Doe',
    total: 1234,
    processed: 985,
    unprocessed: 189,
    failed: 60,
    documents: [
      {
        id: 1,
        name: 'Lease Agreement',
        size: '240 KB',
        uploadedOn: '04/02/25',
        status: 'Processed',
      },
      {
        id: 2,
        name: 'NDA Document',
        size: '120 KB',
        uploadedOn: '04/01/25',
        status: 'Failed',
      },
      {
        id: 3,
        name: 'Contract Proposal',
        size: '500 KB',
        uploadedOn: '03/30/25',
        status: 'Processed',
      },
    ],
  };

  // Fetch profile data from backend
  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/get/particular/profile?profileId=${id}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();

        // Transform `data` if needed to match the shape used in the UI
        const transformedProfile = {
          profileName: data.profileTitle || dummyProfile.profileName,
          profileDescription: data.profileDescription || dummyProfile.profileDescription,
          lastRun: data.updatedTime || dummyProfile.lastRun,
          termVersion: `Term ${data.version || 2}, v${data.version || 10}`,
          crmConnection: data.crmConnection || dummyProfile.crmConnection,
          connectionName: data.connectionName || dummyProfile.connectionName,
          scheduledFrequency: data.scheduler?.frequency || dummyProfile.scheduledFrequency,
          createdBy: data.userId || dummyProfile.createdBy,
          total: data.total_documents || dummyProfile.total,
          processed: data.active_documents || dummyProfile.processed,
          unprocessed: (data.total_documents || 0) - (data.active_documents || 0),
          failed: 60, // If your backend returns this, replace it with actual data
          documents: data.documents || dummyProfile.documents,
        };

        setProfile(transformedProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to dummy data if fetch fails
        setProfile(dummyProfile);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProfileData();
    } else {
      // If no ID, directly use dummy data
      setProfile(dummyProfile);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="gpp-loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="gpp-no-data">No profile found.</div>;
  }

  const {
    profileName,
    profileDescription,
    lastRun,
    termVersion,
    crmConnection,
    connectionName,
    scheduledFrequency,
    createdBy,
    total,
    processed,
    unprocessed,
    failed,
    documents,
  } = profile;

  // Filter documents by search query
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return doc.name.toLowerCase().includes(query);
  });

  // Handler for upload button (placeholder)
  const handleUploadDocument = () => {
    alert('Upload Document clicked (placeholder)!');
  };

  return (
    <div className="gpp-profile-container">
      {/* Profile Header Section */}
      <div className="gpp-header">
        <div className="gpp-header-left">
          <h2 className="gpp-profile-name">{profileName}</h2>
          <p className="gpp-profile-description">{profileDescription}</p>
          <div className="gpp-term-version">{termVersion}</div>
        </div>

        <div className="gpp-header-right">
          <button
            className="gpp-run-button"
            onClick={() => {
              // No action needed per requirements
            }}
          >
            Run
          </button>
        </div>
      </div>

      {/* Sub-info (Last run, CRM, etc.) */}
      <div className="gpp-sub-info">
        <p>
          <strong>Last run:</strong> {lastRun}
        </p>
        <p>
          <strong>CRM Connection:</strong> {crmConnection}
        </p>
        <p>
          <strong>Connection name:</strong> {connectionName}
        </p>
        <p>
          <strong>Scheduled frequency:</strong> {scheduledFrequency}
        </p>
        <p>
          <strong>Created by:</strong> {createdBy}
        </p>
      </div>

      {/* Stats cards */}
      <div className="gpp-stats-container">
        <div className="gpp-stat-box">
          <div className="gpp-stat-number">{total}</div>
          <div className="gpp-stat-label">Total</div>
        </div>
        <div className="gpp-stat-box">
          <div className="gpp-stat-number">{processed}</div>
          <div className="gpp-stat-label">Processed</div>
        </div>
        <div className="gpp-stat-box">
          <div className="gpp-stat-number">{unprocessed}</div>
          <div className="gpp-stat-label">Unprocessed</div>
        </div>
        <div className="gpp-stat-box">
          <div className="gpp-stat-number">{failed}</div>
          <div className="gpp-stat-label">Failed</div>
        </div>
      </div>

      {/* Associated Documents */}
      <div className="gpp-documents-section">
        <div className="gpp-documents-header">
          <h3>Associated documents</h3>
          <div className="gpp-search-and-upload">
            <input
              type="text"
              placeholder="Search by document name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="gpp-upload-btn" onClick={handleUploadDocument}>
              Upload document
            </button>
          </div>
        </div>

        <table className="gpp-documents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Uploaded on</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.size}</td>
                <td>{doc.uploadedOn}</td>
                <td>{doc.status}</td>
                <td style={{ textAlign: 'center' }}>
                  {/* Icons or text buttons for Use & Delete */}
                  <button
                    className="gpp-use-btn"
                    onClick={() => setShowUseModal(true)}
                  >
                    Use
                  </button>
                  <button
                    className="gpp-delete-btn"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {/* If no documents found after filtering */}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals (conditionally rendered) */}
      {showDeleteModal && (
        <DeleteProfileModal
          onClose={() => setShowDeleteModal(false)}
          // Pass any additional props you need
        />
      )}

      {showUseModal && (
        <UseProfileModal
          onClose={() => setShowUseModal(false)}
          // Pass any additional props you need
        />
      )}
    </div>
  );
}

export default GetParticularProfile;
