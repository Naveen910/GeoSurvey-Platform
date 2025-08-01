import React from "react";
import "../../styles/MapViewer/streetviewpanel.css";

const StreetViewPanel = ({ lat, lng, onClose }) => {
  if (!lat || !lng) return null;

  const url = `https://www.google.com/maps/embed?pb=!1m0!3m2!1sen!2sin!4v1710518898287!6m8!1m7!1sCAoSLEFGMVFpcE5Yc3R6RFl1enVZV2s5RnFKVzRVdnNCRW5jZ1dzSnRsaXFFQ2tw!2m2!1d${lat}!2d${lng}!3f0!4f0!5f0.7820865974627469`;

  return (
    <div className="streetview-panel">
      <button onClick={onClose} className="streetview-close-button">
        ✕
      </button>
      <iframe
        title="Google Street View"
        src={url}
        className="streetview-iframe"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default StreetViewPanel;
