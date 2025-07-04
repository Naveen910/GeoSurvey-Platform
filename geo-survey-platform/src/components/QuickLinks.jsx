import React from 'react';
import '../styles/quicklinks.css';

import analysisIcon from '../assets/quickLinks/analysis.png';
import databaseIcon from '../assets/quickLinks/Database.png';
import layerIcon from '../assets/quickLinks/layer.png';
import mapIcon from '../assets/quickLinks/map.png';
import arrowIcon from '../assets/quickLinks/arrow.png';

const quickLinks = [
  { icon: mapIcon, title: 'Map Viewer' },
  { icon: analysisIcon, title: 'Analysis Tools' },
  { icon: databaseIcon, title: 'Data Management' },
  { icon: layerIcon, title: 'Layer Management' },
];

const QuickLinks = ({ onQuickLinkClick }) => {
  return (
    <div className="quick-links-list">
      <h2 className="quick-links-title">Quick Links</h2>
      <div className="quick-links-items">
        {quickLinks.map((link, index) => (
          <div
            className="quick-link-row"
            key={index}
            onClick={() => onQuickLinkClick(link.title)}
          >
            <img src={link.icon} alt={link.title} />
            <span>{link.title}</span>
            <img src={arrowIcon} alt="arrow" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
