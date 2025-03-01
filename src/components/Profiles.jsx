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
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortOption, setSortOption] = useState('');
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  // Default layout = "grid"
  const [layout, setLayout] = useState('grid');
  
  // State to track clicked cards for visual effects
  const [clickedCards, setClickedCards] = useState({});

  // Helper function to map frontend sort options to backend sort values
  const mapSortOption = (sortOption) => {
    switch (sortOption) {
      case "name_asc":
        return "ProfileNameASC";
      case "name_desc":
        return "ProfileNameDSC";
      case "run_newest":
        return "createdTimeDSC";
      case "run_oldest":
        return "createdTimeASC";
      case "doc_count_high":
        return "noOfDocumentsDSC";
      case "doc_count_low":
        return "noOfDocumentsASC";
      default:
        return "createdTimeDSC"; // default sort option
    }
  };

  // Fetch profiles from backend with filter + sort
  const fetchProfiles = async (condition, sort) => {
    try {
      const mappedSort = mapSortOption(sort);
      const response = await fetch(
        `http://127.0.0.1:8000/get/sotred/data/based/on/conditions?sort=${mappedSort}&filter=${condition}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProfiles(data);
      setTotal(data.length);
      const activeProfiles = data.filter((p) => p.status.toLowerCase() === 'active');
      setActiveCount(activeProfiles.length);
      const inactiveProfiles = data.filter((p) => p.status.toLowerCase() !== 'active');
      setInactiveCount(inactiveProfiles.length);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  // Re-fetch when filterCondition or sortOption changes
  useEffect(() => {
    fetchProfiles(filterCondition, sortOption);
  }, [filterCondition, sortOption]);

  // Filter locally by search query
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
  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleOpenModal = () => setShowModal(true);
  const handleLayoutToggle = () => {
    setLayout((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  // Toggle clicked state for a card to apply a visual effect
  const handleCardClick = (profileId) => {
    setClickedCards((prev) => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  return (
    <div className="profiles-container container-fluid p-3">
      {/* HEADER */}
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

      {/* FILTER & SORT */}
      <div className="profiles-filter-row d-flex flex-wrap gap-3 mb-3">
        <input
          type="text"
          placeholder="Search by profile name"
          value={searchQuery}
          onChange={handleSearch}
          className="form-control flex-grow-1"
        />

        <div className="filter-controls d-flex gap-2 align-items-center">
          {/* Filter Dropdown */}
          <select
            className="select-filter form-select"
            value={filterCondition}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort Dropdown (Native Select) */}
          <select
            className="sort-select form-select"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="">Sort by</option>
            <optgroup label="Profile Name">
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </optgroup>
            <optgroup label="Created Date">
              <option value="run_newest">Newest to oldest</option>
              <option value="run_oldest">Oldest to newest</option>
            </optgroup>
            <optgroup label="Number of Documents">
              <option value="doc_count_high">High to low</option>
              <option value="doc_count_low">Low to high</option>
            </optgroup>
          </select>

          {/* Layout toggle (Grid or List) */}
          <button className="view-btn btn btn-secondary" onClick={handleLayoutToggle}>
            {layout === 'grid' ? 'Grid' : 'List'}
          </button>
        </div>
      </div>

      {/* PROFILE CARDS: grid or list layout */}
      <div className={layout === 'grid' ? 'profiles-grid' : 'profiles-list'}>
        {filteredProfiles.map((profile) => (
          <div 
            className={`profile-card ${clickedCards[profile.profileId] ? 'clicked' : ''}`} 
            key={profile.profileId} 
            onClick={() => handleCardClick(profile.profileId)}
          >
            <div className="card h-100">
              <div className="card-header">
                <span
                  className={
                    profile.status.toLowerCase() === 'active'
                      ? 'status-badge active'
                      : 'status-badge inactive'
                  }
                >
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </span>
                <h3>{highlightText(profile.profileTitle, searchQuery)}</h3>
              </div>
              <div className="card-body">
                <p className="description">
                  {highlightText(profile.profileDescription, searchQuery)}
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
                {profile.status.toLowerCase() === 'active' ? (
                  <p className="run-info">
                    <strong>Created Date:</strong>{' '}
                    {profile.scheduler && profile.scheduler.date_str}
                    <br />
                    <strong>Created by:</strong> {profile.userId}
                  </p>
                ) : (
                  <p className="run-info">
                    <strong>Created by:</strong> {profile.userId}
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

      {/* Create Profile Modal */}
      {showModal && <CreateProfile onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Profiles;
