tsx
import React, { useState, useRef } from 'react';
import MapCompare from '@/components/MapCompare';
import CatalogWidget from '@/components/CatalogWidget';
import PerformanceMetrics from '@/components/PerformanceMetrics';

const MapComparePage = () => {
  const mapRef1 = useRef<any>(null);
  const mapRef2 = useRef<any>(null);
  const [addLayer1, setAddLayer1] = useState<(url: string) => void>(() => (url) => mapRef1.current?.addLayer(url));
  const [addLayer2, setAddLayer2] = useState<(url: string) => void>(() => (url) => mapRef2.current?.addLayer(url));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <h1>Map Compare</h1>
      <div id='catalog' style={{ flex: 0.1 }}><CatalogWidget onAddUrl={addLayer1} /></div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div id='mapDiv1' style={{ flex: 1, height: '100%' }}><MapCompare ref={mapRef1} addLayer={addLayer1} /></div>
        <div id='perfDiv1' style={{ flex: 0.5 }}><PerformanceMetrics mapId="1" /></div>
        <div id='mapDiv2' style={{ flex: 1, height: '100%' }}><MapCompare ref={mapRef2} addLayer={addLayer2} /></div>
        <div id='perfDiv2' style={{ flex: 0.5 }}><PerformanceMetrics mapId="2" /></div>
      </div>
    </div>
  );
};

export default MapComparePage;