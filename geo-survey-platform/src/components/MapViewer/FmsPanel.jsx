import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/MapViewer/FmsPanel.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const API_BASE = 'http://65.1.101.129:3000/api/fms';

const FmsPanel = ({ featureID, onClose }) => {
  const [formData, setFormData] = useState({
    status: '',
    inspector: '',
    date: '', 
    remarks: ''
  });

  useEffect(() => {
    if (!featureID) return;

    axios.get(`${API_BASE}/${featureID}`)
      .then(res => setFormData(res.data.formData || {}))
      .catch(() => setFormData({}));
  }, [featureID]);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    axios.put(`${API_BASE}/${featureID}`, { formData: updated })
      .catch(() => {
        axios.post(`${API_BASE}`, { featureID, formData: updated });
      });
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
      onClose(); // Close panel on delete
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
          <option value="">Select</option>
          <option value="Pending">Pending</option>
          <option value="Inspected">Inspected</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="form-group">
        <label>Inspector</label>
        <input
          type="text"
          value={formData.inspector || ''}
          onChange={(e) => handleChange('inspector', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={formData.inspectionDate || new Date().toISOString().split('T')[0]}
          onChange={(e) => handleChange('inspectionDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Remarks</label>
        <textarea
          rows="3"
          value={formData.remarks || ''}
          onChange={(e) => handleChange('remarks', e.target.value)}
        />
      </div>

      <div className="fms-panel-actions">
          <button className="save-button" onClick={handleSave}>💾 Save</button>
          <button className="delete-button" onClick={handleDelete}>🗑️ Delete</button>
      </div>
    </div>
  );
};

export default FmsPanel;
