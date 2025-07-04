import React, { useState } from 'react';
import '../styles/contentsection.css';

import gridIcon from '../assets/content/GridButton.png';
import listIcon from '../assets/content/ListButton.png';
import searchIcon from '../assets/search.png';

import Construction from '../assets/content/Construction.png';
import Downtown from '../assets/content/Downtown.png';
import Property from '../assets/content/Property.png';
import SiteInvestigation from '../assets/content/SiteInvestigation.png';

const allTabs = ['All Content', 'Web Maps', 'Feature Layers', 'Web Apps'];

const contentItems = [
  { title: 'Downtown Survey Project', type: 'Web Maps', image: Downtown },
  { title: 'Property Boundaries', type: 'Feature Layers', image: Property },
  { title: 'Construction Analytics', type: 'Web Apps', image: Construction },
  { title: 'Site Investigation Report', type: 'Feature Layers', image: SiteInvestigation },
];

const ContentSection = () => {
  const [selectedTab, setSelectedTab] = useState('All Content');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');

  const handleToggleView = (mode) => setView(mode);

  const filteredItems = contentItems.filter((item) => {
    const matchesTab = selectedTab === 'All Content' || item.type === selectedTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="content-section">
      <h2 className="content-title">My Content</h2>

      

      <div className="content-controls">
        <div className="tabs">
          {allTabs.map((tab, i) => (
            <button
              key={i}
              className={`tab-button ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tools">
          <div className="search-box">
            <img src={searchIcon} alt="search" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => handleToggleView('grid')}
            >
              <img src={gridIcon} alt="Grid" />
            </button>
            <button
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => handleToggleView('list')}
            >
              <img src={listIcon} alt="List" />
            </button>
          </div>
        </div>
      </div>

      <div className={`content-grid ${view === 'list' ? 'list-view' : ''}`}>
        {filteredItems.map(({ title, type, image }, i) => (
  <div className={`project-card ${view === 'list' ? 'list' : ''}`} key={i}>
    <img src={image} alt={title} className="project-image" />
    <div className="project-text">
      <div className="project-title">{title}</div>
      <div className="project-type">{type}</div>
    </div>
  </div>
))}

      </div>
    </div>
  );
};

export default ContentSection;
