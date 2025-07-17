// components/MapViewer/FmsPanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/fms';

const FmsPanel = ({ featureID }) => {
  const [formData, setFormData] = useState({});

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

  return (
    <div className="w-[30vw] h-full bg-white border-l border-gray-200 p-4 shadow-lg overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Feature: {featureID}</h2>

      <label className="block mb-2 text-sm font-medium">Status</label>
      <input
        className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        value={formData.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      />

      <label className="block mb-2 text-sm font-medium">Inspector</label>
      <input
        className="w-full border border-gray-300 rounded px-3 py-2"
        value={formData.inspector || ''}
        onChange={(e) => handleChange('inspector', e.target.value)}
      />
    </div>
  );
};

export default FmsPanel;
