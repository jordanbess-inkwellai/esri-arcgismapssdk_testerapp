import React, { useState, useEffect } from 'react';
import { PMTiles } from 'pmtiles';

interface Metadata {
  vector_layers?: any[];
  minzoom?: number;
  maxzoom?: number;
  center?: number[];
  bounds?: number[];
}

interface LayerProperties {
  [key: string]: any;
}

interface Layer {
  id: string;
  properties: LayerProperties[];
}

interface VectorTileInspectorProps {
  pmtilesUrl: string;
}

const VectorTileInspector: React.FC<VectorTileInspectorProps> = ({ pmtilesUrl }) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVectorTileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const protocol = new PMTiles(pmtilesUrl);
        const metadata = await protocol.getMetadata() as Metadata;

        if (!metadata || !metadata.vector_layers) {
          throw new Error('No vector layers found in metadata');
        }

        const fetchedLayers: Layer[] = metadata.vector_layers.map((layerMetadata: any) => ({
            id: layerMetadata.id,
            properties: [],
          }));

        setLayers(fetchedLayers);
        if (fetchedLayers.length > 0) {
          setSelectedLayer(fetchedLayers[0]);
        }

      } catch (err: any) {
        setError(err.message || 'Failed to load vector tile data');
      } finally {
        setLoading(false);
      }
    };

    fetchVectorTileData();
  }, [pmtilesUrl]);

  const handleLayerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLayerId = event.target.value;
    const foundLayer = layers.find((layer) => layer.id === selectedLayerId);
    setSelectedLayer(foundLayer || null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Vector Tile Inspector</h2>
      {layers.length > 0 && (
        <div>
          <label htmlFor="layer-select">Select Layer:</label>
          <select id="layer-select" onChange={handleLayerChange} value={selectedLayer?.id || ''}>
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedLayer && (
        <div>
          <h3>Layer: {selectedLayer.id}</h3>
            {selectedLayer.properties.length > 0 ? (
          <ul>
            {Object.keys(selectedLayer.properties[0]).map((key, index) => (
              <li key={index}>
                 {key} : {JSON.stringify(selectedLayer.properties[0][key])}
              </li>
            ))}
          </ul>
             ) : <p>No properties.</p>}
        </div>
      )}
    </div>
  );
};

export default VectorTileInspector;