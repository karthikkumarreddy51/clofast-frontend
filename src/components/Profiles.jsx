// components/Profiles.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProfile from './CreateProfiles';
import '../styles/Profiles.css';

// Helper function to highlight matching text
function highlightText(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="highlight">{part}</span>
    ) : (
      part
    )
  );
}

const Profiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Simulate backend data fetch
    setTimeout(() => {
      const backendData = {
        counts: {
          total: 22,
          active: 17,
          inactive: 5,
        },
        leaseAgreements: Array.from({ length: 22 }, (_, index) => ({
          id: index + 1,
          status: index === 4 ? 'Inactive' : 'Active',
          title: `Lease Agreement ${index + 1}`,
          description: `Dynamic details for Lease Agreement ${index + 1}`,
          definedTerms: [`Term ${index + 1}`, 'Extra Term'],
          lastRun: '04/12/25',
          owner: index === 4 ? 'Jane Doe' : 'John Doe',
          processed: 80 + index,
          total: 150,
        })),
      };

      setProfiles(backendData.leaseAgreements);
      setTotal(backendData.counts.total);
      setActiveCount(backendData.counts.active);
      setInactiveCount(backendData.counts.inactive);
    }, 1000);
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = profiles.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
    setFilteredProfiles(filtered);
  }, [profiles, searchQuery]);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleOpenModal = () => setShowModal(true);

  return (
    <div className="profiles-container container-fluid p-3">
      <div className="profiles-header d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h1 className="mb-2 mb-md-0">Profiles</h1>
        <div className="profile-stats d-flex gap-3">
          <span className="total">Total {total}</span>
          <span className="active">Active {activeCount}</span>
          <span className="inactive">Inactive {inactiveCount}</span>
        </div>
        <button className="create-profile-btn btn btn-primary" onClick={handleOpenModal}>
          + Create profile
        </button>
      </div>

      <div className="profiles-filter-row d-flex flex-wrap gap-3 mb-3">
        <input
          type="text"
          placeholder="Search by profile name"
          value={searchQuery}
          onChange={handleSearch}
          className="form-control flex-grow-1"
        />
        <div className="filter-controls d-flex gap-2">
          <select className="select-filter form-select">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="sort-btn btn btn-secondary">Sort</button>
          <button className="view-btn btn btn-secondary">Grid</button>
        </div>
      </div>

      <div className="profiles-grid">
        {filteredProfiles.map((profile) => (
          <div className="profile-card" key={profile.id}>
            <div className="card h-100">
              <div className="card-header">
                <span
                  className={profile.status === 'Active' ? 'status-badge active' : 'status-badge inactive'}
                >
                  {profile.status}
                </span>
                <h3>{highlightText(profile.title, searchQuery)}</h3>
              </div>
              <div className="card-body">
                <p className="description">{highlightText(profile.description, searchQuery)}</p>
                <p className="terms">
                  <strong>Defined terms:</strong> {profile.definedTerms.join(', ')}
                </p>
                {profile.status === 'Active' ? (
                  <p className="run-info">
                    <strong>Last run:</strong> {profile.lastRun}<br />
                    <strong>Created by:</strong> {profile.owner}
                  </p>
                ) : (
                  <p className="run-info">
                    <strong>Created by:</strong> {profile.owner}
                  </p>
                )}
                <p className="processed-info">
                  Processed: {profile.processed}/{profile.total}
                </p>
              </div>
              <div className="card-footer d-flex justify-content-between">
                <button className="run-btn btn btn-success">Run</button>
                <button className="edit-btn btn btn-warning">Edit</button>
                <button className="delete-btn btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showModal && <CreateProfile onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Profiles;
