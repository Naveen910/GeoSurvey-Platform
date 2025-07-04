import React from 'react';
import '../styles/quickactions.css';

import createWeb from '../assets/quickactions/createWeb.png';
import addData from '../assets/quickactions/addData.png';
import createDash from '../assets/quickactions/createDash.png';
import storymap from '../assets/quickactions/storymap.png';

const actions = [
  { icon: createWeb, title: 'Create Web Map', description: 'Build interactive maps' },
  { icon: addData, title: 'Add Data', description: 'Import layers and datasets' },
  { icon: createDash, title: 'Create Dashboard', description: 'Visualize data insights' },
  { icon: storymap, title: 'Story Map', description: 'Narrate with spatial data' },
];

const QuickActions = () => {
  return (
    <section className="quick-actions">
      <h2 className="quick-actions-title">Quick Actions</h2>

      <div className="quick-actions-grid">
        {actions.map((action, index) => (
          <div className="action-card" key={index}>
            <img src={action.icon} alt={action.title} className="action-icon" />
            <div className="action-text">
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
