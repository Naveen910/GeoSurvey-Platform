import React, { useEffect, useState } from 'react';
import '../../styles/MapViewer/nearestRoutesPanel.css';

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NearestRoutesPanel = ({ wfsFeatures, userLocation }) => {
  const [nearestRoutes, setNearestRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLocation || !wfsFeatures || wfsFeatures.length === 0) return;

    const fetchNearest = async () => {
      setLoading(true);
      try {
        // 1️⃣ Filter features within 1000 km (for testing; adjust later)
        const nearby = wfsFeatures
          .map(f => {
            const [lon, lat] = f.geometry.coordinates;
            return {
              id: f.id,
              lat,
              lon,
              properties: f.properties,
              approxDist: getDistanceKm(userLocation.lat, userLocation.lng, lat, lon),
            };
          })
          .filter(f => f.approxDist <= 1000)
          .slice(0, 5); // limit to 5 for Google API

        if (nearby.length === 0) {
          setNearestRoutes([]);
          setLoading(false);
          return;
        }

        // 2️⃣ Call backend Distance Matrix proxy
        const response = await fetch('https://65.1.101.129/api/distance-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origins: [`${userLocation.lat},${userLocation.lng}`],
            destinations: nearby.map(f => `${f.lat},${f.lon}`)
          })
        });

        const data = await response.json();
        if (!data.rows) throw new Error('Invalid Distance Matrix response');

        // 3️⃣ Map distances safely
        const enriched = nearby.map((f, i) => {
          const element = data.rows?.[0]?.elements?.[i];
          if (!element || element.status !== 'OK') {
            return { ...f, distanceKm: null, durationText: 'N/A' };
          }
          return {
            ...f,
            distanceKm: element.distance.value / 1000,
            durationText: element.duration.text
          };
        });

        // 4️⃣ Sort by distance
        enriched.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));

        setNearestRoutes(enriched);
      } catch (err) {
        console.error('Distance Matrix error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearest();
  }, [userLocation, wfsFeatures]);

  return (
    <div className="nearest-routes-panel">
      <h3>Nearest Routes</h3>
      {loading ? (
        <p>Loading nearby routes...</p>
      ) : nearestRoutes.length === 0 ? (
        <p>No nearby routes found.</p>
      ) : (
        <ul>
          {nearestRoutes.map((r, idx) => (
            <li key={r.id || idx} className="route-item">
              <b>{r.properties?.Name || `Route ${idx + 1}`}</b>
              <br />
              Distance: {r.distanceKm ? r.distanceKm.toFixed(2) + ' km' : 'N/A'}
              <br />
              Duration: {r.durationText}
              <br />
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${r.lat},${r.lon}&travelmode=driving`,
                    '_blank'
                  )
                }
                className="popup-button"
              >
                Open in Google Maps
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NearestRoutesPanel;
