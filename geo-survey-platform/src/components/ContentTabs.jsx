import React from 'react';
import '../styles/contenttabs.css';

import gridIcon from '../assets/content/GridButton.png';
import listIcon from '../assets/content/ListButton.png';
import searchIcon from '../assets/search.png';

const tabs = ['All Content', 'Web Maps', 'Layers'];

const ContentTabs = ({ selectedTab, onSelect, searchTerm, onSearch, view, onToggleView }) => {
  return (
    <div className="content-tabs-wrapper">
      <h2 className="content-tabs-title">My Content</h2>

      <div className="content-tabs-header">
        <div className="tab-buttons">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-button ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => onSelect(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="content-controls">
          {/* Search box */}
          <div className="search-box">
            <img src={searchIcon} alt="search" className="icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          {/* View toggle buttons */}
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => onToggleView('grid')}
            >
              <img src={gridIcon} alt="Grid View" />
            </button>
            <button
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => onToggleView('list')}
            >
              <img src={listIcon} alt="List View" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTabs;
