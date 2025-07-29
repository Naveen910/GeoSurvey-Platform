import React from "react";
import ReactDOM from "react-dom";
import "../../styles/MapViewer/streetviewpopup.css";

const StreetViewPopup = ({ lat, lng, onClose }) => {
  if (!lat || !lng) return null;

  const url = `https://www.google.com/maps/embed?pb=!1m0!3m2!1sen!2sin!4v1710518898287!6m8!1m7!1sCAoSLEFGMVFpcE5Yc3R6RFl1enVZV2s5RnFKVzRVdnNCRW5jZ1dzSnRsaXFFQ2tw!2m2!1d${lat}!2d${lng}!3f0!4f0!5f0.7820865974627469`;

  return ReactDOM.createPortal(
    <div className="streetview-overlay">
      <div className="streetview-backdrop" onClick={onClose}></div>
      <div className="streetview-modal">
        <div className="streetview-header">
          <h4>Street View</h4>
          <button onClick={onClose}>&times;</button>
        </div>
        <iframe
          title="Google Street View"
          src={url}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default StreetViewPopup;
