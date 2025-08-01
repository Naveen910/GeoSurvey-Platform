import React from 'react';
import '../../styles/MapViewer/leftpanel.css';

import layersIcon from '../../assets/MapViewer/layers.png';
import toolsIcon from '../../assets/settings.png';

import visibleIcon from '../../assets/MapViewer/openeye.png';
import hiddenIcon from '../../assets/MapViewer/closedeye.png';
import pencilIcon from '../../assets/MapViewer/pencil.png';
import gearIcon from '../../assets/settings.png';

import pointIcon from '../../assets/MapViewer/point.png';
import lineIcon from '../../assets/MapViewer/line.png';
import polygonIcon from '../../assets/MapViewer/polygon.png';
import circleIcon from '../../assets/MapViewer/circle.png';
import freehandIcon from '../../assets/MapViewer/freehand.png';
import measureIcon from '../../assets/MapViewer/measure.png';


import streetsIcon from '../../assets/MapViewer/streets.png';
import satelliteIcon from '../../assets/MapViewer/satellite.png';
import terrainIcon from '../../assets/MapViewer/terrain.png';
import topoIcon from '../../assets/MapViewer/topo.png';


const layers = [
  { name: "Survey Points", features: 245, visible: true },
  { name: "Property Boundaries", features: 89, visible: true },
  { name: "Roads", features: 156, visible: false },
  { name: "Utilities", features: 78, visible: true },
  { name: "Elevation Contours", features: 234, visible: false },
];

const basemaps = [
  { name: 'streets', icon: streetsIcon },
  { name: 'satellite', icon: satelliteIcon },
  { name: 'terrain', icon: terrainIcon },
  { name: 'topographic', icon: topoIcon },
];

const LeftPanel = ({ selectedBasemap, setBasemap  }) => {
  const [activeTab, setActiveTab] = React.useState('Layers');

  return (
    <div className="left-panel">

        <>
      
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'Layers' ? 'active' : ''}`}
          onClick={() => setActiveTab('Layers')}
        >
          <img src={layersIcon} alt="Layers" />
          Layers
        </button>
        <button
          className={`tab ${activeTab === 'Tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('Tools')}
        >
          <img src={toolsIcon} alt="Tools" />
          Tools
        </button>
      </div>



      {activeTab === 'Layers' && (
        <>
          {/* Layer List */}
          <div className="layer-list">
            {layers.map((layer, idx) => (
              <div key={idx} className="layer-card">
                <div>
                  <div className="layer-title">{layer.name}</div>
                  <div className="layer-features">{layer.features} features</div>
                </div>
                <div className="layer-actions">
                  <img src={layer.visible ? visibleIcon : hiddenIcon} alt="Visibility" />
                  <img src={pencilIcon} alt="Edit" />
                  <img src={gearIcon} alt="Settings" />
                </div>
              </div>
            ))}
          </div>


          {/* Basemaps */}
          <div className="basemap-section">
            <div className="basemap-title">Basemaps</div>
            <div className="basemap-grid">
              {basemaps.map((base, i) => (
  <button
    key={i}
    className={`basemap-tile ${selectedBasemap === base.name.toLowerCase() ? 'active' : ''}`}
    onClick={() => setBasemap(base.name.toLowerCase())}
  >
    <img src={base.icon} alt={`${base.name} basemap`} />
    {base.name}
  </button>
))}
            </div>
              </div>
            </>
          )}


          {activeTab === 'Tools' && (
            <div className="tools-tab">
              {/* Drawing Tools */}
              <div className="tool-section">
                <div className="tool-title">Drawing Tools</div>
                <div className="tool-grid">
                  <button className="tool-btn"><img src={pointIcon} alt="Point" />Point</button>
                  <button className="tool-btn"><img src={lineIcon} alt="Line" />Line</button>
                  <button className="tool-btn"><img src={polygonIcon} alt="Polygon" />Polygon</button>
                  <button className="tool-btn"><img src={circleIcon} alt="Circle" />Circle</button>
                  <button className="tool-btn"><img src={freehandIcon} alt="Freehand" />Freehand</button>
                </div>
              </div>
                    
              {/* Measurement Tools */}
              <div className="tool-section">
                <div className="tool-title">Measurement</div>
                <div className="measurement-grid">
                  <button className="tool-btn full-width"><img src={measureIcon} alt="Measure Distance" />Measure Distance</button>
                  <button className="tool-btn full-width"><img src={measureIcon} alt="Measure Area" />Measure Area</button>
                </div>
              </div>
            </div>
          )}
        </>
    
    </div>



            
  );
};


export default LeftPanel;
