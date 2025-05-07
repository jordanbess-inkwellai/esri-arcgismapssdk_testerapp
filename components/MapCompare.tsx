tsx
import React, { useEffect, useRef, useState } from 'react';
import TileLayer from "@arcgis/core/layers/TileLayer";

interface MapCompareProps {
  addLayer?: (url: string) => void;
}

const MapCompare = React.forwardRef<any, MapCompareProps>(({ addLayer }, ref) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const layer1 = new TileLayer({ url: "https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer" });
  const layer2 = new TileLayer({ url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer" });
  const addLayers = (map: any) => {
    map.add(layer1);
    map.add(layer2, 0);
  };
  
  const addLayerToMap = async (url: string) => {
    const { default: TileLayer } = await import("@arcgis/core/layers/TileLayer");
    const newLayer = new TileLayer({ url });
    if (view) {
      view.map.add(newLayer);
    }
  };

  let view:any;
  useEffect(() => {
    if (!mapDiv.current || mapLoaded) return;
    (async () => {
        const { default: Map } = await import('@arcgis/core/Map');
        const { default: MapView } = await import('@arcgis/core/views/MapView');
        const { default: Swipe } = await import("@arcgis/core/widgets/Swipe");
        
        const map = new Map({
            basemap: 'streets-vector',
        });

        view = new MapView({
            map: map,
            container: mapDiv.current,
            center: [-118.2437, 34.0522],
            zoom: 10,
        });
        if (addLayer) {
          addLayers(map);
          const swipe = new Swipe({ view: view, leadingLayers: [layer1], trailingLayers: [layer2] });
          view.ui.add(swipe, "manual");
        }
        
        setMapLoaded(true);
    })();
  }, [mapLoaded, addLayer]);
  return (
    <div id="mapDiv" ref={ref} style={{ height: '500px', width: '100%' }}>
    </div>
  );
});

export default MapCompare;