// IMAGE UPLOADER - Drag & drop, preview, Firebase Storage upload

import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import './ImageUploader.css';

export function ImageUploader({ userId, onUploadComplete, maxFiles = 10, maxSizeMB = 10 }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE_BYTES = maxSizeMB * 1024 * 1024;

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.name}. Only JPG, PNG, GIF, WEBP allowed.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large: ${file.name}. Max ${maxSizeMB}MB.`;
    }
    return null;
  };

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate files
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation) {
        setError(validation);
        return;
      }
    }

    setError('');

    // Generate previews
    const newPreviews = [];
    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          id: `${Date.now()}-${index}`,
          file,
          url: e.target.result,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) // MB
        });

        if (newPreviews.length === fileArray.length) {
          setPreviews([...previews, ...newPreviews]);
          setFiles([...files, ...fileArray]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = (previewId) => {
    const index = previews.findIndex(p => p.id === previewId);
    if (index !== -1) {
      setPreviews(previews.filter(p => p.id !== previewId));
      setFiles(files.filter((_, i) => i !== index));
    }
  };

  const uploadToFirebase = async () => {
    if (!storage) {
      setError('⚠️ Firebase Storage not configured. Add Firebase config to .env file.');
      return;
    }

    if (files.length === 0) {
      setError('No files selected');
      return;
    }

    setUploading(true);
    setError('');
    const uploadResults = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const preview = previews[i];

        // Create unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const filename = `${userId || 'guest'}/${timestamp}-${randomId}-${file.name}`;

        // Create storage reference
        const storageRef = ref(storage, `artwork/${filename}`);

        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({
                ...prev,
                [preview.id]: Math.round(progress)
              }));
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadResults.push({
                filename: file.name,
                url: downloadURL,
                path: filename,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
              });
              resolve();
            }
          );
        });
      }

      // Success!
      console.log('✅ All files uploaded:', uploadResults);
      
      if (onUploadComplete) {
        onUploadComplete(uploadResults);
      }

      // Reset state
      setFiles([]);
      setPreviews([]);
      setUploadProgress({});
      alert(`🎉 Successfully uploaded ${uploadResults.length} file(s)!`);

    } catch (err) {
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <div
        className={`drop-zone ${files.length > 0 ? 'has-files' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />

        {files.length === 0 ? (
          <div className="drop-zone-prompt">
            <div className="upload-icon">📁</div>
            <h3>Drag & Drop Images Here</h3>
            <p>or click to browse</p>
            <div className="upload-specs">
              <span>Max {maxFiles} files</span>
              <span>•</span>
              <span>Max {maxSizeMB}MB each</span>
              <span>•</span>
              <span>JPG, PNG, GIF, WEBP</span>
            </div>
          </div>
        ) : (
          <div className="file-list">
            <div className="file-list-header">
              <h3>📋 Selected Files ({files.length}/{maxFiles})</h3>
              {!uploading && (
                <button className="clear-btn" onClick={(e) => {
                  e.stopPropagation();
                  setFiles([]);
                  setPreviews([]);
                }}>
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((preview) => (
            <div key={preview.id} className="preview-card">
              <div className="preview-image-wrapper">
                <img src={preview.url} alt={preview.name} className="preview-image" />
                {!uploading && (
                  <button
                    className="remove-btn"
                    onClick={() => removeFile(preview.id)}
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="preview-info">
                <div className="preview-name" title={preview.name}>
                  {preview.name.length > 20 ? preview.name.substring(0, 20) + '...' : preview.name}
                </div>
                <div className="preview-size">{preview.size} MB</div>
              </div>
              {uploading && uploadProgress[preview.id] !== undefined && (
                <div className="upload-progress">
                  <div
                    className="upload-progress-bar"
                    style={{ width: `${uploadProgress[preview.id]}%` }}
                  />
                  <span className="upload-progress-text">{uploadProgress[preview.id]}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="upload-actions">
          <button
            className="btn-primary upload-btn"
            onClick={uploadToFirebase}
            disabled={uploading}
          >
            {uploading ? '⏳ Uploading...' : `📤 Upload ${files.length} File(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
