import React from 'react';

interface PerformanceMetricsProps {
  mapId: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ mapId }) => {
  return (
    <div id={`perfDiv-${mapId}`}>
      {/* Performance metrics will be displayed here */}
    </div>
  );
};

export default PerformanceMetrics;