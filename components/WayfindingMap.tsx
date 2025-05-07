import React, { useState, useEffect } from 'react';
const WayfindingMap: React.FC = () => {
  const [pointsOfInterest, setPointsOfInterest] = useState<any[]>([]);
  const [startPoint, setStartPoint] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('');
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [mapView, setMapView] = useState<any>(null);
  const [path, setPath] = useState<any>(null);

  const updateMapView = (latitude: number, longitude: number, zoom: number) => {
    if (mapView) {
      mapView.goTo({
        center: [longitude, latitude],
        zoom: zoom,
      });
    }
  };
  const calculatePathDistance = async (pathData: any): Promise<number> => {
    const { default: Polyline } = await import("@arcgis/core/geometry/Polyline");
    const { default: Point } = await import("@arcgis/core/geometry/Point");
    const geodesicUtils = await import("@arcgis/core/geometry/support/geodesicUtils");
    let totalDistance = 0;
    if (pathData && pathData.length > 0) {
        for (const route of pathData) {
            const polyline = new Polyline({
                paths: route.geom.paths,
                spatialReference: { wkid: 4326 },
            });
            const pathLength = polyline.paths[0].length;
            for (let i = 0; i < pathLength - 1; i++) {
                const startPoint = new Point({
                    longitude: polyline.paths[0][i][0],
                    latitude: polyline.paths[0][i][1],
                });
                const endPoint = new Point({
                    longitude: polyline.paths[0][i + 1][0],
                    latitude: polyline.paths[0][i + 1][1],
                });
                totalDistance += geodesicUtils.geodesicDistance(startPoint, endPoint, "meters")?.distance || 0;
            }
        }
    }
    return totalDistance;
  };
  
  const showRoute = async (routeData: any) => {    
    const { default: GraphicsLayer } = await import("@arcgis/core/layers/GraphicsLayer");
    const { default: Graphic } = await import("@arcgis/core/Graphic");
    const { default: Polyline } = await import("@arcgis/core/geometry/Polyline");
    const { default: SimpleLineSymbol } = await import("@arcgis/core/symbols/SimpleLineSymbol");
    if (mapView) {
      const graphicsLayer = new GraphicsLayer();
      const path = await calculatePathDistance(routeData);
      for (const route of routeData) {
        const polyline = new Polyline({ paths: route.geom.paths, spatialReference: { wkid: 4326 } });
        const lineSymbol = new SimpleLineSymbol({ color: [255, 0, 0], width: 4 });
        const routeGraphic = new Graphic({ geometry: polyline, symbol: lineSymbol });
        graphicsLayer.add(routeGraphic);
      }
      setPath(path)
      mapView.map.add(graphicsLayer);
    }
  }
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (async () => {
        const { default: MapView } = await import("@arcgis/core/views/MapView");
        const { default: Map } = await import("@arcgis/core/Map");
        const { default: Graphic } = await import("@arcgis/core/Graphic");
        const { default: Point } = await import("@arcgis/core/geometry/Point");

        const map = new Map({
          basemap: 'streets-vector',
        });

        const view = new MapView({
          map: map,
          container: 'wayfinding-map',
          center: [-118.2437, 34.0522],
          zoom: 10,
        });

        setMapView(view);
        const fetchPOIs = async () => {
          try {
            const response = await fetch('http://localhost:3000/pois');
            const data = await response.json();
            setPointsOfInterest(data);
            for (const poi of data) {
              const graphic = new Graphic({
                geometry: new Point({
                  longitude: poi.geom.coordinates[0],
                  latitude: poi.geom.coordinates[1],
                  spatialReference: { wkid: 4326 },
                }),
                symbol: {
                  type: "simple-marker",
                  color: "blue",
                  size: "10px",
                },
              });
              if (mapView) {
                mapView.graphics.add(graphic);
              }
            }
          } catch (error) {
            console.error('Error fetching POIs:', error);
          }
        };
        fetchPOIs();


        return () => {
          if (view) {
            view.destroy();
          }
        };
      })()
    } else {
      return
    }
  }, []);
  const handleCalculateRoute = async () => {
    try {
      setRouteError(null)
      if (startPoint && endPoint) {
        const response = await fetch(`http://localhost:3000/rpc/get_route?start_id=${startPoint}&end_id=${endPoint}`);
        const data = await response.json();
        setCurrentRoute(data);
        showRoute(data);
      }
    } catch (error) {
      if (startPoint === endPoint) {
        setRouteError('Start and end points cannot be the same.');
      } else if (!currentRoute || currentRoute.length === 0) {
        setRouteError('No route found between the selected points.');
      }

      console.error('Error calculating route:', error);
    }

  };

  const calculateEstimatedTime = (distance: number, speed: number): string => {
    const timeInHours = distance / (speed * 1000);
    const timeInMinutes = Math.round(timeInHours * 60);

    return `${timeInMinutes} min`;
  };

  return (
    <div id="wayfinding-map" style={{ height: '500px', width: '100%' }}>
      <div>
        <label htmlFor="start-point">Start Point:</label>
        <select
          disabled={pointsOfInterest.length === 0}
          id="start-point"
          className={`
            ${startPoint === endPoint ? 'border-red-500' : ''}
            ${pointsOfInterest.length === 0 ? 'opacity-50' : ''}
          `}
          value={startPoint}
          onChange={(e) => setStartPoint(e.target.value)}
        >
          <option value="">Select Start Point</option>
          {pointsOfInterest.map((poi) => (
            <option key={poi.id} value={poi.id}>
              {poi.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="end-point">End Point:</label>
        <select
          disabled={pointsOfInterest.length === 0}
          className={`
          ${startPoint === endPoint ? 'border-red-500' : ''}
          ${pointsOfInterest.length === 0 ? 'opacity-50' : ''}
        `}
          id="end-point"
          value={endPoint}
          onChange={(e) => setEndPoint(e.target.value)}
        >
          <option value="">Select End Point</option>
          {pointsOfInterest.map((poi) => (
            <option key={poi.id} value={poi.id}>
              {poi.name}
            </option>
          ))}
        </select>
      </div>
      {routeError && (
        <div className="text-red-500 mt-2">{routeError}</div>
      )}

      <button onClick={handleCalculateRoute}>Calculate Route</button>

      {path !== null && (
        <div>
          <h3>Route Information</h3>
          <p>Distance: {Math.round(path)} meters</p>
          <p>
            Estimated Walking Time: {calculateEstimatedTime(path, 3)} - {calculateEstimatedTime(path, 5)}
          </p>
        </div>
      )}

    </div>
  );
};

export default WayfindingMap;