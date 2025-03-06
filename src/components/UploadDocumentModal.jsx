import React from 'react';
import '../styles/UploadDocumentModal.css';

const UploadDocumentModal = ({
  isOpen,
  onClose,
  onFileSelect,
  onUpload
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="upload-doc-modal">
        <div className="modal-header">
          <h2>Upload a document</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="upload-dropzone">
            <p>
              Drag &amp; drop or <strong>Choose file</strong> to upload
            </p>
            <p>PDF or DOC or JPG or JPEG or PNG</p>
            <input
              type="file"
              accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
              onChange={onFileSelect}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onUpload}>Upload</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
