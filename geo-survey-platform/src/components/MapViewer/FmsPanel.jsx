import React, { useEffect, useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression'; // 🆕
import '../../styles/MapViewer/FmsPanel.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveData, getData, deleteData, getAllData } from '../../utils/indexedDB';

const API_BASE = '/api/fms';

// 🧩 Helper to compress Base64 image
async function compressBase64Image(base64) {
  try {
    const response = await fetch(base64);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });

    const options = {
      maxSizeMB: 0.8,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };

    const compressedFile = await imageCompression(file, options);

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (err) {
    console.error('Compression failed:', err);
    return base64; // fallback — keep original if failed
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

  // Load data from IndexedDB first, fallback to server
  useEffect(() => {
    if (!featureID) return;

    const loadData = async () => {
      let localData = await getData(featureID);

      if (localData?.formData) {
        // 🧩 compress any old uncompressed Base64 images (migration)
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

  // Auto-sync all local data when online
  const autoSync = async () => {
    const allLocalData = await getAllData();
    for (let item of allLocalData) {
      try {
        // 🧩 Compress existing Base64 images before upload
        if (item.formData?.images?.length) {
          const compressedImages = await Promise.all(
            item.formData.images.map((img) => compressBase64Image(img))
          );
          item.formData.images = compressedImages;
          await saveData(item.featureID, item.formData);
        }

        await axios.put(`${API_BASE}/${item.featureID}`, { formData: item.formData });
        await deleteData(item.featureID); // remove local copy after sync
        toast.success(`Feature ${item.featureID} synced to server`);
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

  // Listen for network coming back online
  useEffect(() => {
    window.addEventListener('online', autoSync);
    return () => window.removeEventListener('online', autoSync);
  }, []);

  // Handle field changes
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setIsSaved(false);
    await saveData(featureID, updated); // save locally

    // Try immediate sync
    axios.put(`${API_BASE}/${featureID}`, { formData: updated }).catch(() => {
      axios.post(`${API_BASE}`, { featureID, formData: updated }).catch(() => {
        toast.info('Data saved locally. Will sync when online.');
      });
    });
  };

  // Handle image upload (🧩 compress new uploads)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + (formData.images?.length || 0) > 5) {
      toast.error('You can upload a maximum of 5 images.');
      return;
    }

    const newImages = await Promise.all(
      files.map(async (file) => {
        // Compress before converting to Base64
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

  // Delete an image
  const handleDeleteImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    handleChange('images', updatedImages);
    toast.info('Image deleted');
  };

  // Save manually
  const handleSave = async () => {
    setIsSaving(true);
    await saveData(featureID, formData); // always save locally
    try {
      await axios.put(`${API_BASE}/${featureID}`, { formData });
      await deleteData(featureID);
      toast.success('Saved successfully!');
      setIsSaved(true);
    } catch {
      try {
        await axios.post(`${API_BASE}`, { featureID, formData });
        await deleteData(featureID);
        toast.success('Created new entry!');
        setIsSaved(true);
      } catch {
        toast.info('Data saved locally. Will sync when online.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!featureID) return null;

  return (
    <div className="fms-panel">
      <div className="fms-header">
        <h2>Feature: {featureID}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          value={formData.status || ''}
          onChange={(e) => {
            const newStatus = e.target.value;
            const allFilled =
              formData.agent &&
              formData.newLatitude &&
              formData.newLongitude &&
              formData.newAltitude &&
              formData.secondaryPoint &&
              formData.cornerPoint &&
              formData.images &&
              formData.images.length > 0;

            if (newStatus === 'Completed' && !allFilled) {
              toast.error('Please fill all fields and upload at least one image before marking as Completed.');
              return;
            }
            handleChange('status', newStatus);
          }}
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="form-group">
        <label>Agent Name*</label>
        <input
          type="text"
          value={formData.agent || ''}
          onChange={(e) => handleChange('agent', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Latitude*</label>
        <input
          type="number"
          value={formData.newLatitude || ''}
          onChange={(e) => handleChange('newLatitude', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Longitude*</label>
        <input
          type="number"
          value={formData.newLongitude || ''}
          onChange={(e) => handleChange('newLongitude', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Altitude*</label>
        <input
          type="number"
          value={formData.newAltitude || ''}
          onChange={(e) => handleChange('newAltitude', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Secondary Point*</label>
        <input
          type="text"
          value={formData.secondaryPoint || ''}
          onChange={(e) => handleChange('secondaryPoint', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Corner Point*</label>
        <select
          value={formData.cornerPoint || ''}
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
          value={formData.remarks || ''}
          onChange={(e) => handleChange('remarks', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Upload Images* (max 5)</label>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        <div className="image-preview-container">
          {formData.images?.map((img, idx) => (
            <div key={idx} className="image-preview">
              <img src={img} alt={`upload-${idx}`} />
              <button onClick={() => handleDeleteImage(idx)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="fms-panel-actions">
        <button
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner"></span> Saving...
            </>
          ) : isSaved ? (
            <>✓ Saved</>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
};

export default FmsPanel;
