import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // <-- Import Link
import EditProfileModal from './EditProfileModal';
import DeleteProfileModal from './DeleteProfileModal';
// import Profiles from './Profiles.jsx';
import '../styles/getParticularProfile.css'; // Ensure correct path

function GetParticularProfile() {
  const { id } = useParams();

  // Profile state and loading indicator
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // For document search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state – storing profile id
  const [editModalProfileId, setEditModalProfileId] = useState(null);
  const [deleteModalProfileId, setDeleteModalProfileId] = useState(null);

  // Dummy fallback data
  const dummyProfile = {
    id: id,
    profileName: 'Profile Name',
    profileDescription:
      'Lorem ipsum dolor sit amet consectetur. Non si eget suspendisse arcu feugiat arcu egestas.',
    definedTerms: [
      { specificTerm: 'Term 1', termDescription: 'this is term 1 description' },
      { specificTerm: 'Term 2', termDescription: 'this is term 2 description' },
    ],
    lastRun: '04/02/25',
    crmConnection: 'Connection name',
    scheduledFrequency: 'Weekly',
    createdBy: 'some_user_id',
    total: 1234,
    processed: 985,
    unprocessed: 189,
    failed: 60,
    documents: [
      {
        id: 1,
        thumbnail: 'https://via.placeholder.com/40',
        name: 'Lease Agreement',
        pages: 20,
        size: '240 KB',
        uploadedOn: '04/02/25',
        processedOn: '04/02/25',
        status: 'Processed',
      },
      {
        id: 2,
        thumbnail: 'https://via.placeholder.com/40',
        name: 'Lease Agreement',
        pages: 20,
        size: '240 KB',
        uploadedOn: '04/02/25',
        processedOn: null,
        status: 'Unprocessed',
      },
      {
        id: 3,
        thumbnail: 'https://via.placeholder.com/40',
        name: 'Lease Agreement',
        pages: 20,
        size: '240 KB',
        uploadedOn: '04/02/25',
        processedOn: null,
        status: 'Failed',
      },
      {
        id: 4,
        thumbnail: 'https://via.placeholder.com/40',
        name: 'Lease Agreement',
        pages: 20,
        size: '240 KB',
        uploadedOn: '04/02/25',
        processedOn: '04/02/25',
        status: 'Processed',
      },
      {
        id: 5,
        thumbnail: 'https://via.placeholder.com/40',
        name: 'Lease Agreement',
        pages: 20,
        size: '240 KB',
        uploadedOn: '04/02/25',
        processedOn: null,
        status: 'Failed',
      },
    ],
  };

  // Fetch profile data from the backend
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

        // Transform backend data to match the structure
        const transformedProfile = {
          id: data.id || id,
          profileName: data.profileTitle || dummyProfile.profileName,
          profileDescription:
            data.profileDescription || dummyProfile.profileDescription,
          definedTerms: data.definedTerms || dummyProfile.definedTerms,
          lastRun: data.updatedTime || dummyProfile.lastRun,
          crmConnection: data.crmConnection || dummyProfile.crmConnection,
          scheduledFrequency:
            data.scheduler?.frequency || dummyProfile.scheduledFrequency,
          createdBy: data.userId || dummyProfile.createdBy,
          total: data.total_documents || dummyProfile.total,
          processed: data.active_documents || dummyProfile.processed,
          unprocessed:
            (data.total_documents || 0) - (data.active_documents || 0),
          failed: data.failed || dummyProfile.failed,
          documents: (data.documents || dummyProfile.documents).map(
            (doc, idx) => ({
              id: doc.id ?? idx,
              thumbnail: doc.thumbnail || 'https://via.placeholder.com/40',
              name: doc.name || 'Untitled Document',
              pages: doc.pages || 0,
              size: doc.size || 'N/A',
              uploadedOn: doc.uploadedOn || 'N/A',
              processedOn: doc.processedOn || null,
              status: doc.status || 'Unprocessed',
            })
          ),
        };

        setProfile(transformedProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to dummy data
        setProfile(dummyProfile);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProfileData();
    } else {
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
    definedTerms,
    lastRun,
    crmConnection,
    scheduledFrequency,
    createdBy,
    total,
    processed,
    unprocessed,
    failed,
    documents,
  } = profile;

  // Create a simple inline function to render defined terms
  const renderDefinedTermsInline = () => {
    if (!definedTerms) return 'None';
    if (Array.isArray(definedTerms)) {
      // e.g. "Term 1, this is term 1 description, Term 2, this is term 2 description"
      return definedTerms
        .map((term) => {
          const spec = term.specificTerm || '';
          const desc = term.termDescription || '';
          return `${spec}${desc ? `, ${desc}` : ''}`;
        })
        .join('; ');
    }
    // If definedTerms is a single object
    const spec = definedTerms.specificTerm || '';
    const desc = definedTerms.termDescription || '';
    return `${spec}${desc ? `, ${desc}` : ''}`;
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditProfile = (e) => {
    e.stopPropagation();
    setEditModalProfileId(profile.id);
  };

  const handleDeleteProfile = (e) => {
    e.stopPropagation();
    setDeleteModalProfileId(profile.id);
  };

  return (
    <div className="gpp-container">
      {/* Breadcrumb with clickable link to the Profiles page */}
      <div className="gpp-breadcrumb">
        <Link to="/profiles">Profiles</Link> &gt; <span>{profileName}</span>
      </div>

      {/* Header Section */}
      <div className="gpp-header-section">
        <div className="gpp-header-left">
          <h1 className="gpp-profile-title">{profileName}</h1>
          <p className="gpp-profile-desc">{profileDescription}</p>
        </div>
        <div className="gpp-header-right">
          <button
            className="gpp-button gpp-run-button"
            onClick={() => alert('Run clicked!')}
          >
            Run
          </button>
          <button
            className="gpp-button gpp-update-button"
            onClick={handleEditProfile}
          >
            Update
          </button>
          <button
            className="gpp-button gpp-delete-button"
            onClick={handleDeleteProfile}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Info Row */}
      <div className="gpp-info-row">
        {/* Left Column: Additional Info */}
        <div className="gpp-additional-info">
          <div className="gpp-info-item">
            <span className="gpp-info-label">CRM Connection</span>
            <div className="gpp-info-nested-item">
              <span className="gpp-info-label-nested">CRM Connection:</span>
              <span>{crmConnection}</span>
            </div>
          </div>

          <div className="gpp-info-item">
            <span className="gpp-info-label">Schedule frequency</span>
            <div className="gpp-info-nested-item">
              <span className="gpp-info-label-nested">Schedule frequency:</span>
              <span>{scheduledFrequency}</span>
            </div>
          </div>

          <div className="gpp-info-item">
            <span className="gpp-info-label">Created By</span>
            <div className="gpp-info-nested-item">
              <span className="gpp-info-label-nested">Created by:</span>
              <span>{createdBy}</span>
            </div>
          </div>

          <div className="gpp-info-item">
            <span className="gpp-info-label">Last run date</span>
            <div className="gpp-info-nested-item">
              <span className="gpp-info-label-nested">Last run date:</span>
              <span>{lastRun}</span>
            </div>
          </div>

          {/* Defined Terms */}
          <div className="gpp-info-item">
            <span className="gpp-info-label">Defined terms</span>
            <div className="gpp-info-nested-item">
              <span className="gpp-info-label-nested">Defined terms:</span>
              <span>{renderDefinedTermsInline()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Documents Stats */}
        <div className="gpp-documents-stats">
          <h3 className="gpp-documents-heading">Documents</h3>
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
        </div>
      </div>

      {/* Documents Section */}
      <div className="gpp-documents-section">
        <div className="gpp-documents-header">
          <h2>Associated documents</h2>
          <div className="gpp-search-upload">
            <div className="gpp-search-container">
              <input
                type="text"
                placeholder="Search by document name"
                value={searchQuery}
                className="gpp-search-input"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="gpp-search-button">
                <span className="gpp-search-icon">Q</span>
              </button>
              <span className="gpp-search-all">All</span>
            </div>

            <button
              className="gpp-button gpp-upload-button"
              onClick={() => alert('Upload clicked!')}
            >
              Upload document
            </button>
          </div>
        </div>
        <table className="gpp-documents-table">
          <thead>
            <tr>
              <th>Document name</th>
              <th>Size</th>
              <th>Uploaded on</th>
              <th>Processed on</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className="gpp-doc-info">
                    <img
                      src={doc.thumbnail}
                      alt="Doc Thumbnail"
                      className="gpp-doc-thumb"
                    />
                    <div>
                      <div className="gpp-doc-name">{doc.name}</div>
                      <div className="gpp-doc-pages">{doc.pages} pages</div>
                    </div>
                  </div>
                </td>
                <td>{doc.size}</td>
                <td>{doc.uploadedOn}</td>
                <td>{doc.processedOn || '-'}</td>
                <td>
                  <span
                    className={
                      doc.status === 'Processed'
                        ? 'gpp-status-badge processed'
                        : doc.status === 'Failed'
                        ? 'gpp-status-badge failed'
                        : 'gpp-status-badge unprocessed'
                    }
                  >
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))}
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

      {/* Modals */}
      {editModalProfileId && (
        <EditProfileModal
          profile={{ profileId: editModalProfileId }}
          onClose={() => setEditModalProfileId(null)}
        />
      )}
      {deleteModalProfileId && (
        <DeleteProfileModal
          profile={{ profileId: deleteModalProfileId }}
          onClose={() => setDeleteModalProfileId(null)}
        />
      )}
    </div>
  );
}

export default GetParticularProfile;
