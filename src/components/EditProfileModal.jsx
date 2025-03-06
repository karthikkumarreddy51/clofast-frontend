// src/components/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import cronParser from 'cron-parser';
import '../styles/EditProfileModal.css';
import UploadDocumentModal from './UploadDocumentModal';

const EditProfileModal = ({ profile, onClose }) => {
  // Local state for form fields (populated via GET call on mount)
  const [profileTitle, setProfileTitle] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [definedTerms, setDefinedTerms] = useState([{ specificTerm: '', termDescription: '' }]);
  const [status, setStatus] = useState('active'); // "active" or "inactive"

  // Scheduling states
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [frequency, setFrequency] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [intradayHours, setIntradayHours] = useState('1');
  const [intradayMinutes, setIntradayMinutes] = useState('0');
  const [weeklyDay, setWeeklyDay] = useState('Monday');
  const [monthlyDay, setMonthlyDay] = useState('1');
  const [cronExpression, setCronExpression] = useState('');

  // NEW state for Document Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  // Terms returned from the backend after uploading a document
  const [docDefinedTerms, setDocDefinedTerms] = useState([]);

  // Fetch profile data on mount via GET request
  useEffect(() => {
    async function fetchProfile() {
      const url = `http://127.0.0.1:8000/get/particular/profile?profileId=${profile.profileId}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile data');
        }
        const data = await response.json();
        // Populate state with fetched data
        setProfileTitle(data.profileTitle || '');
        setProfileDescription(data.profileDescription || '');
        setDefinedTerms(data.definedTerms || [{ specificTerm: '', termDescription: '' }]);
        setStatus(data.status || 'active');
        if (data.scheduler) {
          setFrequency(data.scheduler.frequency || null);
          if (data.scheduler.date_str) {
            const parts = data.scheduler.date_str.split('T');
            setScheduleDate(parts[0]);
            setScheduleTime(parts[1]?.substring(0, 5) || '');
            setScheduleOpen(true);
          }
        }
        setCronExpression(data.cronExpression || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error fetching profile data.');
      }
    }
    fetchProfile();
  }, [profile.profileId]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Handlers for defined terms
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

  // Handlers for schedule toggle and frequency selection
  const handleToggleSchedule = () => {
    setScheduleOpen(!scheduleOpen);
  };

  const handleFrequencyChange = (freq) => {
    setFrequency(freq);
  };

  // Next Occurrences Calculator (same logic as in CreateProfile)
  const getNextOccurrences = () => {
    const formatDate = (date) =>
      date.toLocaleString('en-GB', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    const now = new Date();
    let occurrences = [];

    if (frequency === 'once') {
      if (scheduleDate && scheduleTime) {
        const dt = new Date(`${scheduleDate}T${scheduleTime}`);
        occurrences.push(dt > now ? formatDate(dt) : 'Scheduled time passed');
      } else {
        occurrences.push('Date/Time not set');
      }
    } else if (frequency === 'intraday') {
      let nextTime = new Date(now);
      const incrementMinutes = parseInt(intradayHours, 10) * 60 + parseInt(intradayMinutes, 10);
      if (isNaN(incrementMinutes) || incrementMinutes <= 0) {
        occurrences.push('Invalid interval');
      } else {
        for (let i = 0; i < 5; i++) {
          nextTime = new Date(nextTime.getTime() + incrementMinutes * 60000);
          occurrences.push(formatDate(nextTime));
        }
      }
    } else if (frequency === 'daily') {
      if (scheduleTime) {
        const [hour, minute] = scheduleTime.split(':').map(Number);
        let nextDate = new Date(now);
        nextDate.setHours(hour, minute, 0, 0);
        if (nextDate < now) nextDate.setDate(nextDate.getDate() + 1);
        for (let i = 0; i < 5; i++) {
          let occ = new Date(nextDate);
          occ.setDate(nextDate.getDate() + i);
          occurrences.push(formatDate(occ));
        }
      } else {
        occurrences.push('Time not set');
      }
    } else if (frequency === 'weekly') {
      if (scheduleTime) {
        const [hour, minute] = scheduleTime.split(':').map(Number);
        const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
        const selectedDay = dayMap[weeklyDay];
        let count = 0;
        let d = new Date(now);
        while (count < 5) {
          if (d.getDay() === selectedDay) {
            let occ = new Date(d);
            occ.setHours(hour, minute, 0, 0);
            if (occ >= now) {
              occurrences.push(formatDate(occ));
              count++;
            }
          }
          d.setDate(d.getDate() + 1);
        }
      } else {
        occurrences.push('Time not set');
      }
    } else if (frequency === 'monthly') {
      if (scheduleTime) {
        const [hour, minute] = scheduleTime.split(':').map(Number);
        let d = new Date(now);
        d.setDate(monthlyDay);
        d.setHours(hour, minute, 0, 0);
        if (d < now) {
          d.setMonth(d.getMonth() + 1);
          d.setDate(monthlyDay);
          d.setHours(hour, minute, 0, 0);
        }
        for (let i = 0; i < 5; i++) {
          let occ = new Date(d);
          occ.setMonth(d.getMonth() + i);
          occurrences.push(formatDate(occ));
        }
      } else {
        occurrences.push('Time not set');
      }
    } else if (frequency === 'custom') {
      if (cronExpression.trim() !== '') {
        try {
          const interval = cronParser.parseExpression(cronExpression);
          for (let i = 0; i < 5; i++) {
            occurrences.push(formatDate(interval.next().toDate()));
          }
        } catch (err) {
          occurrences.push('Invalid cron expression');
        }
      } else {
        occurrences.push('Cron expression not set');
      }
    } else {
      occurrences.push('Frequency not set');
    }
    return occurrences;
  };

  // Handlers for document upload
  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    // Optionally clear file if needed:
    // setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // POST file to backend, get extracted terms, and set them into state
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload-doc', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      // Suppose backend returns: { terms: [ { specificTerm, termDescription }, ... ] }
      const data = await response.json();
      if (data.terms && Array.isArray(data.terms)) {
        setDocDefinedTerms(data.terms);
      }

      // Close the modal after a successful upload
      setShowUploadModal(false);
    } catch (err) {
      console.error(err);
      alert('Error uploading document');
    }
  };

  // Handler for updating the profile via PUT call
  const handleUpdateProfile = async () => {
    let isoDateTime = '';

    if (frequency === 'intraday') {
      const now = new Date();
      const incrementMinutes = parseInt(intradayHours, 10) * 60 + parseInt(intradayMinutes, 10);
      if (!isNaN(incrementMinutes) && incrementMinutes > 0) {
        const firstOccurrence = new Date(now.getTime() + incrementMinutes * 60000);
        isoDateTime = firstOccurrence.toISOString();
      }
    } else if (frequency === 'custom') {
      isoDateTime = '';
    } else {
      if (scheduleTime) {
        if (scheduleDate) {
          isoDateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
        } else {
          const todayStr = new Date().toISOString().split('T')[0];
          isoDateTime = new Date(`${todayStr}T${scheduleTime}`).toISOString();
        }
      }
    }

    let schedulePayload = {};
    if (frequency === 'custom') {
      schedulePayload = { frequency, cron_expression: cronExpression };
    } else {
      schedulePayload = { frequency, date_str: isoDateTime };
    }

    // Merge the user-defined terms with the terms extracted from the uploaded document
    const allTerms = [...definedTerms, ...docDefinedTerms];

    // Build query parameters for the PUT URL (using the new endpoint)
    const queryParams = new URLSearchParams({
      profileId: profile.profileId,
      profile_title: profileTitle,
      profile_description: profileDescription,
      status: status
    }).toString();

    const url = `http://127.0.0.1:8000/update/Docprofile?${queryParams}`;

    const bodyPayload = {
      defined_terms: allTerms,
      schedule_config: schedulePayload,
    };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      const result = await response.json();
      console.log('Updated profile:', result);
      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="create-profile-modal">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {/* Profile Title */}
          <div className="form-group">
            <label>Profile Title</label>
            <input
              type="text"
              placeholder="Enter Profile Title"
              value={profileTitle}
              onChange={(e) => setProfileTitle(e.target.value)}
            />
          </div>
          {/* Profile Description */}
          <div className="form-group">
            <label>Profile Description</label>
            <input
              type="text"
              placeholder="Enter Profile Description"
              value={profileDescription}
              onChange={(e) => setProfileDescription(e.target.value)}
            />
          </div>
          {/* Status */}
          <div className="form-group">
            <label>Status</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Active
              </label>
              <label style={{ marginLeft: '10px' }}>
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Inactive
              </label>
            </div>
          </div>
          {/* Defined Terms */}
          <div className="form-group">
            <label>Define Terms</label>
            <div className="terms-container">
              {definedTerms.map((term, index) => (
                <div key={index} className="defined-term-row">
                  <input
                    type="text"
                    placeholder="Term"
                    value={term.specificTerm}
                    onChange={(e) => handleDefinedTermChange(index, 'specificTerm', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={term.termDescription}
                    onChange={(e) => handleDefinedTermChange(index, 'termDescription', e.target.value)}
                  />
                  {definedTerms.length > 1 && (
                    <button
                      type="button"
                      className="minus-btn"
                      onClick={() => handleRemoveDefinedTerm(index)}
                    >
                      –
                    </button>
                  )}
                  {index === definedTerms.length - 1 && (
                    <button
                      type="button"
                      className="plus-btn"
                      onClick={handleAddDefinedTerm}
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Upload Document Button */}
            <div className="upload-doc-section">
              <button
                type="button"
                className="upload-doc-btn"
                onClick={openUploadModal}
              >
                Upload document
              </button>
              {selectedFile && (
                <span className="uploaded-file-name" style={{ marginLeft: '10px' }}>
                  {selectedFile.name}
                </span>
              )}
            </div>
            {/* Terms from the Document */}
            {docDefinedTerms && docDefinedTerms.length > 0 && (
              <div className="terms-container doc-terms-container">
                <h4>Terms from Uploaded Document</h4>
                {docDefinedTerms.map((term, index) => (
                  <div key={index} className="defined-term-row">
                    <input type="text" value={term.specificTerm} readOnly />
                    <input type="text" value={term.termDescription} readOnly />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Schedule Section */}
          <div className="action-buttons">
            <button
              type="button"
              className={`set-schedule-btn ${scheduleOpen ? 'active' : ''}`}
              onClick={handleToggleSchedule}
            >
              Set a schedule
            </button>
          </div>
          {scheduleOpen && (
            <div className="schedule-section">
              <h3>Set a schedule</h3>
              <p>Choose a frequency</p>
              <div className="frequency-buttons">
                <button type="button" className={frequency === 'once' ? 'active' : ''} onClick={() => handleFrequencyChange('once')}>
                  Once
                </button>
                <button type="button" className={frequency === 'intraday' ? 'active' : ''} onClick={() => handleFrequencyChange('intraday')}>
                  Intraday
                </button>
                <button type="button" className={frequency === 'daily' ? 'active' : ''} onClick={() => handleFrequencyChange('daily')}>
                  Daily
                </button>
                <button type="button" className={frequency === 'weekly' ? 'active' : ''} onClick={() => handleFrequencyChange('weekly')}>
                  Weekly
                </button>
                <button type="button" className={frequency === 'monthly' ? 'active' : ''} onClick={() => handleFrequencyChange('monthly')}>
                  Monthly
                </button>
                <button type="button" className={frequency === 'custom' ? 'active' : ''} onClick={() => handleFrequencyChange('custom')}>
                  Custom
                </button>
              </div>

              {frequency === 'once' && (
                <div className="once-schedule">
                  <label>Run at:</label>
                  <div className="datetime-row">
                    <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                    <input type="time" lang="en-GB" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </div>
                </div>
              )}

              {frequency === 'intraday' && (
                <div className="intraday-schedule">
                  <label>Run every:</label>
                  <div className="intraday-row">
                    <input type="number" min="0" value={intradayHours} onChange={(e) => setIntradayHours(e.target.value)} />
                    <span>Hours</span>
                    <input type="number" min="0" value={intradayMinutes} onChange={(e) => setIntradayMinutes(e.target.value)} />
                    <span>Minutes</span>
                  </div>
                </div>
              )}

              {frequency === 'daily' && (
                <div className="daily-schedule">
                  <label>Run at:</label>
                  <input type="time" lang="en-GB" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                </div>
              )}

              {frequency === 'weekly' && (
                <div className="weekly-schedule">
                  <label>Choose a day:</label>
                  <div className="days-row">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <label key={day}>
                        <input type="radio" name="weeklyDay" value={day} checked={weeklyDay === day} onChange={() => setWeeklyDay(day)} />
                        {day}
                      </label>
                    ))}
                  </div>
                  <div className="time-row">
                    <label>Time:</label>
                    <input type="time" lang="en-GB" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </div>
                </div>
              )}

              {frequency === 'monthly' && (
                <div className="monthly-schedule">
                  <label>Day of the month:</label>
                  <input type="number" min="1" max="31" value={monthlyDay} onChange={(e) => setMonthlyDay(e.target.value)} />
                  <div className="time-row">
                    <label>Time:</label>
                    <input type="time" lang="en-GB" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </div>
                </div>
              )}

              {frequency === 'custom' && (
                <div className="custom-schedule">
                  <label>Enter Cron Expression</label>
                  <input type="text" placeholder="0 0 * * *" value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} />
                </div>
              )}

              {frequency && frequency !== 'once' && frequency !== 'custom' && (
                <div className="next-occurrences">
                  <h4>Next 5 Occurrences</h4>
                  {getNextOccurrences().map((occ, i) => (
                    <div key={i}>{occ}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={handleUpdateProfile}>
            SAVE CHANGES
          </button>
        </div>
      </div>

      {/* Small Upload Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={closeUploadModal}
        onFileSelect={handleFileChange}
        onUpload={handleFileUpload}
      />
    </div>
  );
};

export default EditProfileModal;
