import React from 'react';
import '../styles/systemoverview.css';
import arrowIcon from '../assets/SystemOverview.png';

const stats = [
  { title: 'Total Maps', value: 24 },
  { title: 'Data Layers', value: 156 },
  { title: 'Storage Used', value: '2.4 GB' },
  { title: 'Active Users', value: 8 },
];

const SystemOverview = () => {
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
