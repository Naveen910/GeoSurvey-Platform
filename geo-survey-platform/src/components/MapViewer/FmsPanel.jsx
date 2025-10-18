import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/MapViewer/FmsPanel.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = '/api/fms';

const FmsPanel = ({ featureID, onClose }) => {
  const [formData, setFormData] = useState({
    status: '',
    agent: '',
    newLatitude: '',
    newLongitude: '',
    newAltitude: '',
    images: [],
  });

  useEffect(() => {
    if (!featureID) return;

    axios
      .get(`${API_BASE}/${featureID}`)
      .then((res) => setFormData(res.data.formData || {}))
      .catch(() => setFormData({}));
  }, [featureID]);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);

    axios
      .put(`${API_BASE}/${featureID}`, { formData: updated })
      .catch(() => {
        axios.post(`${API_BASE}`, { featureID, formData: updated });
      });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + (formData.images?.length || 0) > 5) {
      toast.error('You can upload a maximum of 5 images.');
      return;
    }

    const newImages = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    const updatedImages = [...(formData.images || []), ...newImages];
    handleChange('images', updatedImages);
  };

  const handleDeleteImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    handleChange('images', updatedImages);
    toast.info('Image deleted');
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE}/${featureID}`, { formData });
      toast.success('Saved successfully!');
    } catch (err) {
      try {
        await axios.post(`${API_BASE}`, { featureID, formData });
        toast.success('Created new entry!');
      } catch (postErr) {
        toast.error('Error saving data');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${featureID}`);
      toast.success('Deleted successfully!');
      onClose();
    } catch (err) {
      toast.error('Error deleting entry');
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
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="form-group">
        <label>Agent Name</label>
        <input
          type="text"
          value={formData.agent || ''}
          onChange={(e) => handleChange('agent', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Latitude</label>
        <input
          type="number"
          value={formData.newLatitude || ''}
          onChange={(e) => handleChange('newLatitude', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Longitude</label>
        <input
          type="number"
          value={formData.newLongitude || ''}
          onChange={(e) => handleChange('newLongitude', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Altitude</label>
        <input
          type="number"
          value={formData.newAltitude || ''}
          onChange={(e) => handleChange('newAltitude', e.target.value)}
        />
      </div>

      {/* Image Upload Section */}
      <div className="form-group">
        <label>Upload Images (max 5)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />

        {/* Show previews with delete buttons */}
        <div className="image-preview-container">
          {formData.images?.map((img, idx) => (
            <div key={idx} className="image-preview">
              <img src={img} alt={`upload-${idx}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="fms-panel-actions">
        <button className="save-button" onClick={handleSave}>💾 Save</button>
        <button className="delete-button" onClick={handleDelete}>🗑️ Delete</button>
      </div>
    </div>
  );
};

export default FmsPanel;
