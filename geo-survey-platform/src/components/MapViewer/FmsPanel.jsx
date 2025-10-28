import React, { useEffect, useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import '../../styles/MapViewer/FmsPanel.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveData, getData, deleteData, getAllData } from '../../utils/indexedDB';

const API_BASE = '/api/fms';
const ADMIN_PASSWORD = 'admin123';

// 🧩 Helper to compress Base64 image
async function compressBase64Image(base64) {
  try {
    const response = await fetch(base64);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });

    const options = { maxSizeMB: 0.8, useWebWorker: true, fileType: 'image/jpeg' };
    const compressedFile = await imageCompression(file, options);

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (err) {
    console.error('Compression failed:', err);
    return base64;
  }
}

const FmsPanel = ({ featureID, onClose }) => {
  const [formData, setFormData] = useState({
    status: '',
    agent: '',
    newLatitude: '',
    newLongitude: '',
    newAltitude: '',
    secondaryPoint: '',
    cornerPoint: '',
    remarks: '',
    images: [],
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // "edit" | "delete"

  // Load data
  useEffect(() => {
    if (!featureID) return;

    const loadData = async () => {
      let localData = await getData(featureID);

      if (localData?.formData) {
        if (localData.formData.images?.length) {
          const compressedImages = await Promise.all(
            localData.formData.images.map((img) => compressBase64Image(img))
          );
          localData.formData.images = compressedImages;
          await saveData(featureID, localData.formData);
        }
        setFormData(localData.formData);
      } else {
        try {
          const res = await axios.get(`${API_BASE}/${featureID}`);
          setFormData(res.data.formData || {});
        } catch {
          setFormData({});
        }
      }
    };

    loadData();
  }, [featureID]);

  // Auto-sync
  const autoSync = async () => {
    const allLocalData = await getAllData();
    for (let item of allLocalData) {
      try {
        if (item.formData?.images?.length) {
          const compressedImages = await Promise.all(
            item.formData.images.map((img) => compressBase64Image(img))
          );
          item.formData.images = compressedImages;
          await saveData(item.featureID, item.formData);
        }

        await axios.put(`${API_BASE}/${item.featureID}`, { formData: item.formData });
        await deleteData(item.featureID);
        toast.success(`Feature ${item.featureID} synced`);
      } catch {
        try {
          await axios.post(`${API_BASE}`, { featureID: item.featureID, formData: item.formData });
          await deleteData(item.featureID);
          toast.success(`Feature ${item.featureID} created on server`);
        } catch {
          toast.info(`Feature ${item.featureID} remains saved locally`);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('online', autoSync);
    return () => window.removeEventListener('online', autoSync);
  }, []);

  // Handle change
  const handleChange = async (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setIsSaved(false);
    await saveData(featureID, updated);

    axios.put(`${API_BASE}/${featureID}`, { formData: updated }).catch(() => {
      axios.post(`${API_BASE}`, { featureID, formData: updated }).catch(() => {
        toast.info('Data saved locally. Will sync when online.');
      });
    });
  };

  const handleImageUpload = async (e) => {
    if (!isEditing) return toast.warn('Unlock edit mode to upload images.');
    const files = Array.from(e.target.files);
    if (files.length + (formData.images?.length || 0) > 5) {
      toast.error('You can upload a maximum of 5 images.');
      return;
    }

    const newImages = await Promise.all(
      files.map(async (file) => {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          useWebWorker: true,
          fileType: 'image/jpeg',
        });
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      })
    );
    handleChange('images', [...(formData.images || []), ...newImages]);
  };

  const handleDeleteImage = (index) => {
    if (!isEditing) return toast.warn('Unlock edit mode to delete images.');
    const updatedImages = formData.images.filter((_, i) => i !== index);
    handleChange('images', updatedImages);
    toast.info('Image deleted');
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveData(featureID, formData);
    try {
      await axios.put(`${API_BASE}/${featureID}`, { formData });
      await deleteData(featureID);
      toast.success('Saved successfully!');
      setIsSaved(true);
      setIsEditing(false);
    } catch {
      try {
        await axios.post(`${API_BASE}`, { featureID, formData });
        await deleteData(featureID);
        toast.success('Created new entry!');
        setIsSaved(true);
        setIsEditing(false);
      } catch {
        toast.info('Data saved locally. Will sync when online.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${featureID}`);
      await deleteData(featureID);
      toast.success('Feature deleted successfully');
      onClose();
    } catch {
      await deleteData(featureID);
      toast.info('Deleted locally (sync later)');
      onClose();
    }
  };

  // 🔐 Password gate for Edit/Delete
  const requestPassword = (action) => {
    setPendingAction(action);
    setShowPasswordPrompt(true);
  };

  const verifyPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setShowPasswordPrompt(false);
      setPasswordInput('');
      if (pendingAction === 'edit') {
        setIsEditing(true);
      } else if (pendingAction === 'delete') {
        handleDelete();
      }
    } else {
      toast.error('Incorrect password');
    }
  };

  if (!featureID) return null;

  const disabled = !isEditing;

  return (
    <div className="fms-panel">
      <div className="fms-header">
        <h2>Feature: {featureID}</h2>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>

      {/* Password Prompt */}
      {showPasswordPrompt && (
        <div className="password-modal">
          <div className="password-box">
            <h3>Enter Password</h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="password"
            />
            <div className="pw-actions">
              <button onClick={verifyPassword}>Confirm</button>
              <button onClick={() => setShowPasswordPrompt(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="form-group">
        <label>Status</label>
        <select
          value={formData.status || ''}
          disabled={disabled}
          onChange={(e) => {
            const newStatus = e.target.value;
            const allFilled =
              formData.agent &&
              formData.newLatitude &&
              formData.newLongitude &&
              formData.newAltitude &&
              formData.secondaryPoint &&
              formData.cornerPoint &&
              formData.images?.length > 0;

            if (newStatus === 'Completed' && !allFilled) {
              toast.error('Fill all fields before marking Completed.');
              return;
            }
            handleChange('status', newStatus);
          }}
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {[
        ['Agent Name*', 'agent'],
        ['New Latitude*', 'newLatitude', 'number'],
        ['New Longitude*', 'newLongitude', 'number'],
        ['New Altitude*', 'newAltitude', 'number'],
        ['Secondary Point*', 'secondaryPoint'],
      ].map(([label, key, type]) => (
        <div className="form-group" key={key}>
          <label>{label}</label>
          <input
            type={type || 'text'}
            value={formData[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            disabled={disabled}
          />
        </div>
      ))}

      <div className="form-group">
        <label>Corner Point*</label>
        <select
          value={formData.cornerPoint || ''}
          disabled={disabled}
          onChange={(e) => handleChange('cornerPoint', e.target.value)}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>

      <div className="form-group">
        <label>Remarks (max 50 chars)</label>
        <input
          type="text"
          maxLength="50"
          disabled={disabled}
          value={formData.remarks || ''}
          onChange={(e) => handleChange('remarks', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Upload Images* (max 5)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={disabled}
        />
        <div className="image-preview-container">
          {formData.images?.map((img, idx) => (
            <div key={idx} className="image-preview">
              <img src={img} alt={`upload-${idx}`} />
              {isEditing && <button onClick={() => handleDeleteImage(idx)}>×</button>}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="fms-panel-actions">
        {!isEditing ? (
          <>
            <button onClick={() => requestPassword('edit')} className="edit-btn">Edit</button>
            <button onClick={() => requestPassword('delete')} className="delete-btn">
              Delete
            </button>
          </>
        ) : (
          <>
            <button onClick={handleSave} disabled={isSaving} className="save-btn">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FmsPanel;
