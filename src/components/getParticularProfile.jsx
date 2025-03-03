// src/components/GetParticularProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/getParticularProfile.css';

function GetParticularProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // For searching defined terms
  const [searchQuery, setSearchQuery] = useState('');

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
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [id]);

  if (loading) {
    return <div className="gpp-loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="gpp-no-data">No profile found.</div>;
  }

  // Destructure the fields from the fetched profile
  const {
    createdTime,
    updatedTime,
    userId,
    profileId,
    profileTitle,
    profileDescription,
    definedTerms = [],
    scheduler = {},
    cronExpression,
    version,
    total_documents,
    active_documents,
    inactive_documents,
    status,
  } = profile;

  // Filter defined terms by search query (case-insensitive)
  const filteredTerms = definedTerms.filter((term) => {
    const termText = term.specificTerm.toLowerCase();
    const descText = term.termDescription.toLowerCase();
    const query = searchQuery.toLowerCase();
    return termText.includes(query) || descText.includes(query);
  });

  return (
    <div className="gpp-container">
      <h1>{profileTitle}</h1>
      <p className="gpp-description">{profileDescription}</p>

      <div className="gpp-info-grid">
        <div><strong>Profile ID:</strong> {profileId}</div>
        <div><strong>Status:</strong> {status}</div>
        <div><strong>Created Time:</strong> {createdTime}</div>
        <div><strong>Updated Time:</strong> {updatedTime || 'N/A'}</div>
        <div><strong>User ID:</strong> {userId}</div>
        <div><strong>Version:</strong> {version}</div>
        <div><strong>Cron Expression:</strong> {cronExpression}</div>
        <div><strong>Total Documents:</strong> {total_documents}</div>
        <div><strong>Active Documents:</strong> {active_documents}</div>
        <div><strong>Inactive Documents:</strong> {inactive_documents}</div>
      </div>

      <div className="gpp-scheduler">
        <h3>Scheduler Info</h3>
        <p><strong>Frequency:</strong> {scheduler.frequency || 'N/A'}</p>
        <p>
          <strong>Scheduled Date:</strong>{' '}
          {scheduler.date_str
            ? new Date(scheduler.date_str).toLocaleString()
            : 'N/A'}
        </p>
      </div>

      <div className="gpp-defined-terms">
        <h3>Defined Terms</h3>
        <input
          type="text"
          placeholder="Search defined terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {filteredTerms.length > 0 ? (
          <ul>
            {filteredTerms.map((term, index) => (
              <li key={index}>
                <strong>Term:</strong> {term.specificTerm} &mdash;{' '}
                <strong>Description:</strong> {term.termDescription}
              </li>
            ))}
          </ul>
        ) : (
          <p>No defined terms match your search.</p>
        )}
      </div>
    </div>
  );
}

export default GetParticularProfile;
