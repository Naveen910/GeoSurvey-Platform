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
        // 1️⃣ Fetch status API
        const statusRes = await fetch('/api/fms/status');
        const statusData = await statusRes.json();

        // 2️⃣ Create a set of completed IDs
        const completedIds = new Set(
          statusData
            .filter(s => s.status === 'Completed')
            .map(s => s.id)
        );

        // 3️⃣ Filter nearby features excluding completed ones
        const nearby = wfsFeatures
          .filter(f => !completedIds.has(f.properties.Name)) // exclude completed
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
          .filter(f => f.approxDist <= 30)
          .slice(0, 25);

        if (nearby.length === 0) {
          setNearestRoutes([]);
          setLoading(false);
          return;
        }

        // 4️⃣ Call Distance Matrix API
        const response = await fetch('/api/distance-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origins: [`${userLocation.lat},${userLocation.lng}`],
            destinations: nearby.map(f => `${f.lat},${f.lon}`)
          })
        });

        const data = await response.json();
        if (!data.rows) throw new Error('Invalid Distance Matrix response');

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
    <div className="nearest-routes-panel open">
      <div className="panel-header">
        <h3>Nearest Routes</h3>
      </div>

      <div className="panel-content">
        {loading ? (
          <p>Loading nearby routes...</p>
        ) : nearestRoutes.length === 0 ? (
          <p>No nearby routes found.</p>
        ) : (
          <ul>
            {nearestRoutes.slice(0, 3).map((r, idx) => (
              <li key={r.id || idx} className="route-item">
                <b>{r.properties?.Name || `Route ${idx + 1}`}</b>
                <br />
                Distance: {r.distanceKm ? r.distanceKm.toFixed(2) + ' km' : 'N/A'}
                <br />
                Duration: {r.durationText || 'N/A'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NearestRoutesPanel;
