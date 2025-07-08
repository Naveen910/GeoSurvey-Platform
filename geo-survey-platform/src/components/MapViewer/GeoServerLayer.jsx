import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';


const GeoServerLayer = ({ geoserverUrl, workspace,visible, layer, name, layerName }) => {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const wmsLayer = L.tileLayer.wms(geoserverUrl, {
      layers: `${workspace}:${layerName}`,
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      attribution: 'GeoServer',
    });

    wmsLayer.addTo(map);

    return () => {
      map.removeLayer(wmsLayer);
    };
  }, [geoserverUrl, workspace, visible, layer, map, name, layerName]);

  return null;
};

export default GeoServerLayer;
