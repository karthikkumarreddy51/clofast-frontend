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

  // Filter + Sorting states
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortOption, setSortOption] = useState('');

  // Header counts (always from "all")
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [showModal, setShowModal] = useState(false);

  // -----------------------------
  // Fetch header counts (ALL only)
  // -----------------------------
  useEffect(() => {
    const fetchHeaderCounts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/get/profiles?condition=all');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTotal(data.length);
        const activeProfiles = data.filter(p => p.status?.toLowerCase() === 'active');
        setActiveCount(activeProfiles.length);
        const inactiveProfiles = data.filter(p => p.status?.toLowerCase() !== 'active');
        setInactiveCount(inactiveProfiles.length);
      } catch (error) {
        console.error('Error fetching header counts:', error);
      }
    };
    fetchHeaderCounts();
  }, []);

  // -------------------------------------------
  // Fetch profiles based on filter + sortOption
  // -------------------------------------------
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Example of constructing a URL with both filter and sort
        // If your backend requires different param keys, adjust accordingly.
        let url = `http://127.0.0.1:8000/get/profiles?condition=${filterCondition}`;
        if (sortOption) {
          url += `&sort=${sortOption}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, [filterCondition, sortOption]);

  // -------------------------------------
  // Local filtering based on search query
  // -------------------------------------
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = profiles.filter(
      (p) =>
        (p.profileTitle && p.profileTitle.toLowerCase().includes(lowerQuery)) ||
        (p.profileDescription && p.profileDescription.toLowerCase().includes(lowerQuery))
    );
    setFilteredProfiles(filtered);
  }, [profiles, searchQuery]);

  // Handlers
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleFilterChange = (e) => setFilterCondition(e.target.value);

  const handleSort = (sortValue) => {
    setSortOption(sortValue);
  };

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
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by profile name"
          value={searchQuery}
          onChange={handleSearch}
          className="form-control flex-grow-1"
        />

        <div className="filter-controls d-flex gap-2">
          {/* Filter: All, Active, Inactive */}
          <select
            className="select-filter form-select"
            value={filterCondition}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Sort by
            </button>
            <ul className="dropdown-menu">
              {/* Profile name */}
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort('profileNameAsc')}
                >
                  Name A-Z
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort('profileNameDesc')}
                >
                  Name Z-A
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>

              {/* Last run date */}
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort('lastRunNewest')}
                >
                  Newest to oldest
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort('lastRunOldest')}
                >
                  Oldest to newest
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>

              {/* Number of documents */}
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort('docCountHigh')}
                >
                  High to low
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort('docCountLow')}
                >
                  Low to high
                </button>
              </li>
            </ul>
          </div>

          {/* Grid button - set to active */}
          <button className="view-btn btn btn-secondary active" disabled>
            Grid
          </button>
        </div>
      </div>

      <div className="profiles-grid">
        {filteredProfiles.map((profile) => (
          <div className="profile-card" key={profile.profileId}>
            <div className="card h-100">
              <div className="card-header">
                <span
                  className={
                    profile.status?.toLowerCase() === 'active'
                      ? 'status-badge active'
                      : 'status-badge inactive'
                  }
                >
                  {profile.status
                    ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1)
                    : 'Unknown'}
                </span>
                <h3>{highlightText(profile.profileTitle || '', searchQuery)}</h3>
              </div>
              <div className="card-body">
                <p className="description">
                  {highlightText(profile.profileDescription || '', searchQuery)}
                </p>
                <p className="terms">
                  <strong>Defined terms:</strong>{' '}
                  {profile.definedTerms &&
                    profile.definedTerms.map((term, i) => {
                      const termValue = term.specificTerm || term.hi || '';
                      return (
                        <span key={i}>
                          {termValue}
                          {i < profile.definedTerms.length - 1 ? ', ' : ''}
                        </span>
                      );
                    })}
                </p>
                {profile.status?.toLowerCase() === 'active' ? (
                  <p className="run-info">
                    <strong>Last run:</strong>{' '}
                    {profile.scheduler && profile.scheduler.date_str
                      ? profile.scheduler.date_str
                      : 'N/A'}
                    <br />
                    <strong>Created by:</strong> {profile.userId || 'Unknown'}
                  </p>
                ) : (
                  <p className="run-info">
                    <strong>Created by:</strong> {profile.userId || 'Unknown'}
                  </p>
                )}
                <p className="processed-info">
                  Processed: {profile.active_documents}/{profile.total_documents}
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
