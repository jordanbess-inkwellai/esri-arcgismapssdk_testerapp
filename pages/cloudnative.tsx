tsx
import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Query from '@arcgis/core/tasks/support/Query';
import * as flatgeobuf from 'flatgeobuf/lib/cjs/flatgeobuf';
import { fromBlob } from 'flatgeobuf/lib/cjs/geojson';

const MapTestPage: React.FC = () => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [selectedLayer, setSelectedLayer] = useState<any>(null);
  const [layerProperties, setLayerProperties] = useState<any>(null);
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [queryText, setQueryText] = useState<string>('');
  const [vectorLayers, setVectorLayers] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);


  useEffect(() => {
    if (!mapDiv.current || mapLoaded) return;

    const map = new Map({
      basemap: 'arcgis-topographic',
    });

    const view = new MapView({
      map: map,
      container: mapDiv.current,
      center: [-118.2437, 34.0522], 
      zoom: 10,
    });

    const vectorTileLayer = new VectorTileLayer({
      url: 'https://www.example.com/path/to/pmtiles/vector/tiles.pmtiles', 
      title: "PMTiles Vector Layer"
    });
    map.add(vectorTileLayer);

    vectorTileLayer.when(() => {
      vectorTileLayer.loadAll().then(function(l){
        const vectorSublayers = vectorTileLayer.sublayers;
        setVectorLayers(vectorSublayers.map((layer) => {
          return {
            id: layer.id,
            title: layer.title,
            visible: layer.visible,
            popupTemplate: layer.popupTemplate,
          };
        }));

        const layerIds = vectorSublayers.map(sublayer => sublayer.id);
        console.log("Vector Sublayer Ids",layerIds);
      });
    });
  

    const rasterTileLayer = new TileLayer({
      url: 'https://www.example.com/path/to/pmtiles/raster/tiles.pmtiles',
      title: "PMTiles Raster Layer"
    });
    map.add(rasterTileLayer);


    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    view.on('click', (event) => {
      graphicsLayer.removeAll();

      view.hitTest(event).then((response) => {
        const graphic = response.results.find((result) => result.graphic);
        if (graphic) {
          const highlightGraphic = new Graphic({
            geometry: graphic.graphic.geometry,
            symbol: {
              type: 'simple-fill',
              color: [255, 0, 0, 0.5],
              outline: {
                color: [255, 0, 0],
                width: 2,
              },
            },
          });
          graphicsLayer.add(highlightGraphic);

          const attributes = graphic.graphic.attributes;
          setLayerProperties(attributes);
          setSelectedLayer(graphic.graphic);
        }
      });
    });

    setMapLoaded(true);

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [mapLoaded]);

  const handleLayerSelect = (layerId: number) => {
    const layer = vectorLayers.find((l) => l.id === layerId);
    setSelectedLayer(layer);
    setLayerProperties(null);
  };

  const handleQuery = async () => {
    setQueryResult([]);
    if (!queryText) return;
    const fgbUrl = 'https://www.example.com/path/to/data.fgb';
    try {
      const response = await fetch(fgbUrl);
      const blob = await response.blob();
      const features = await fromBlob(blob);
      const filteredFeatures = features.filter((feature: any) => {
          const attributes = feature.properties;
        return Object.values(attributes).some((value) => {
          return String(value).toLowerCase().includes(queryText.toLowerCase());
        });
      });
       setQueryResult(filteredFeatures);

    } catch (error) {
      console.error('Error querying FlatGeoBuf:', error);
    }
  };
  
  const handleLayerVisibility = (layer: any, visible: boolean) => {
    if (vectorLayers.length > 0) {
      const layerToUpdate = vectorLayers.find((l) => l.id === layer.id);
      if (layerToUpdate) {
        layerToUpdate.visible = visible;
        setVectorLayers([...vectorLayers]);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 3, height: '100%' }} ref={mapDiv}></div>
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
      <h2>Vector Layers</h2>
        <ul>
          {vectorLayers.map((layer) => (
            <li key={layer.id}>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={(e) => handleLayerVisibility(layer, e.target.checked)}
              />
              {layer.title}
            </li>
          ))}
        </ul>
        <h2>Layer Inspector</h2>
        <div>
          {selectedLayer && <p>Selected Layer: {selectedLayer.title}</p>}
          {layerProperties && (
            <div>
              <h3>Properties:</h3>
              <ul>
                {Object.entries(layerProperties).map(([key, value]) => (
                  <li key={key}>
                    {key}: {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <h2>FlatGeoBuf Query</h2>
        <div>
          <input
            type="text"
            placeholder="Enter query text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <button onClick={handleQuery}>Search</button>
          {queryResult.length > 0 && (
            <div>
              <h3>Query Results:</h3>
              <ul>
                {queryResult.map((feature: any, index: number) => (
                  <li key={index}>
                   <div>Feature:</div>
                     {Object.entries(feature.properties).map(([key, value]) => (
                        <div key={key}>{key}: {String(value)}</div>
                      ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapTestPage;