// src/components/GetParticularProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/getParticularProfile.css';

// Mock data to simulate an API response
const mockProfileDetails = {
  id: 1,
  name: 'Profile Name',
  description: 'Lorem ipsum dolor sit amet consectetur. Nisi ac eget suspendisse arcu nunc faucibus imperdiet.',
  totalDocuments: 1234,
  unprocessed: 189,
  failed: 60,
  scheduleFrequency: 'Every Day',
  connectionDate: '04/02/2025',
  createdBy: 'John Doe',
  documents: [
    {
      name: 'Lease Agreement',
      size: '240 KB',
      uploadedOn: '04/02/25',
      status: 'Processed',
    },
    {
      name: 'Lease Agreement',
      size: '240 KB',
      uploadedOn: '04/02/25',
      status: 'Unprocessed',
    },
    {
      name: 'Lease Agreement',
      size: '240 KB',
      uploadedOn: '04/02/25',
      status: 'Failed',
    },
  ],
};

function GetParticularProfile() {
  const { id } = useParams();
  const [profileDetails, setProfileDetails] = useState(null);

  useEffect(() => {
    // In a real app, fetch the profile data by ID:
    // fetch(`/api/profiles/${id}`).then(...).then(data => setProfileDetails(data));
    // For now, just simulate:
    setProfileDetails({ ...mockProfileDetails, id: Number(id) });
  }, [id]);

  if (!profileDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="particular-profile-container">
      {/* Top Section: Profile Name & Description */}
      <div className="profile-header">
        <h1>{profileDetails.name}</h1>
        <p>{profileDetails.description}</p>
      </div>

      {/* Documents summary & Run button */}
      <div className="profile-details-row">
        <div className="documents-summary">
          <div className="doc-stat">
            <h2>{profileDetails.totalDocuments}</h2>
            <p>Total</p>
          </div>
          <div className="doc-stat">
            <h2>{profileDetails.unprocessed}</h2>
            <p>Unprocessed</p>
          </div>
          <div className="doc-stat">
            <h2>{profileDetails.failed}</h2>
            <p>Failed</p>
          </div>
        </div>
        <button className="run-btn">Run</button>
      </div>

      {/* Additional info (schedule frequency, etc.) */}
      <div className="additional-info">
        <p>Schedule frequency: {profileDetails.scheduleFrequency}</p>
        <p>Connection Date: {profileDetails.connectionDate}</p>
        <p>Created By: {profileDetails.createdBy}</p>
      </div>

      {/* Associated documents */}
      <div className="associated-documents-section">
        <h2>Associated documents</h2>
        <div className="upload-row">
          <input type="text" placeholder="Search by profile name..." />
          <button className="upload-btn">Upload document</button>
        </div>
        <table className="documents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Uploaded on</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {profileDetails.documents.map((doc, index) => (
              <tr key={index}>
                <td>{doc.name}</td>
                <td>{doc.size}</td>
                <td>{doc.uploadedOn}</td>
                <td>{doc.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GetParticularProfile;
