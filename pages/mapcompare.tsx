
import React, { useRef } from 'react';
import MapCompare from '@/components/MapCompare';
const MapComparePage = () => {
  const mapRef1 = useRef<any>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <h1>Map Compare</h1>
      <div style={{ flex: 1, display: 'flex' }}>
        <div id='mapDiv1' style={{ flex: 1, height: '100%' }}><MapCompare ref={mapRef1}  /></div>
      </div>
    </div>
  );
};
export default MapComparePage;