import React, { useEffect, useState } from 'react';
import '../styles/systemoverview.css';
import arrowIcon from '../assets/SystemOverview.png';
import axios from 'axios';

const SystemOverview = () => {
  const [stats, setStats] = useState([
    { title: 'Free Physical Memory', value: '—' },
    { title: 'Data Layers', value: '—' },
    { title: 'Memory Usage', value: '—' },
    { title: 'Free Space', value: '—' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://65.1.101.129:3000/api/systemoverview/overview');
        const data = res.data;

        setStats([
          { title: 'Free Physical Memory', value: data.freePhysicalMemory || 'N/A' },
          { title: 'Data Layers', value: data.totalLayers || 'N/A' },
          { title: 'Memory Usage', value: data.memoryUsage || 'N/A' },
          { title: 'Free Space', value: data.freeSpace || 'N/A' },
        ]);
      } catch (error) {
        console.error('❌ Failed to load system overview:', error.message);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="system-overview-wrapper">
      <h2 className="system-overview-title">System Overview</h2>

      <div className="system-overview">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-info">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
            <img src={arrowIcon} alt="arrow" className="stat-arrow" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SystemOverview;
