import React, { useEffect, useState } from 'react';
import '../../styles/MapViewer/nearestRoutesPanel.css'; // similar to FmsPanel styling

// Haversine formula to calculate straight-line distance (km)
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
        // 1️⃣ Filter features within 30 km radius
        const nearby = wfsFeatures
          .map(f => {
            const [lon, lat] = f.geometry.coordinates;
            return {
              ...f,
              lat,
              lon,
              approxDist: getDistanceKm(userLocation.lat, userLocation.lng, lat, lon),
            };
          })
          .filter(f => f.approxDist <= 1000) 
          .slice(0, 5); 

        if (nearby.length === 0) {
          setNearestRoutes([]);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/distance-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origins: [`${userLocation.lat},${userLocation.lng}`],
            destinations: nearby.map(f => `${f.lat},${f.lon}`),
          }),
        });

        const data = await response.json();
        if (!data.rows) throw new Error('Invalid Distance Matrix response');

        // 3️⃣ Combine distances and durations back into features
        const enriched = nearby.map((f, i) => ({
          ...f,
          distanceKm: data.rows[0].elements[i]?.distance?.value / 1000 || null,
          durationText: data.rows[0].elements[i]?.duration?.text || 'N/A',
        }));

        // 4️⃣ Sort by shortest travel distance
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
            <li key={idx} className="route-item">
              <b>{r.properties?.name || `Route ${idx + 1}`}</b>
              <br />
              Distance: {r.distanceKm?.toFixed(2)} km
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
