import Image from 'next/image';
import { Geist, Geist_Mono } from "next/font/google";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Polygon from "@arcgis/core/geometry/Polygon";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Graphic from "@arcgis/core/Graphic";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import DataWidget from "@/components/DataWidget";
import DiscoverDataWidget from "@/components/DiscoverDataWidget";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import TileLayer from "@arcgis/core/layers/TileLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { useEffect, useRef, useState } from "react";
import * as watchUtils from "esri/core/watchUtils";
import LabelLayer from "@arcgis/core/layers/LabelLayer";
import QueryWidget from "@/components/QueryWidget";
import VectorTileInspector from "@/components/VectorTileInspector";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
interface HomeProps {
    geojsonResults: any;
}
export default function Home({ geojsonResults }: HomeProps) {
    const viewDiv = useRef<HTMLDivElement | null>(null);
    const [layers, setLayers] = useState<GeoJSONLayer[]>([]);
    const [handleShowOnMap, setHandleShowOnMap] = useState<(() => void) | null>(null);
    const [handleUploadLocal, setHandleUploadLocal] = useState<((file: File) => void) | null>(null);
    const [viewRef, setViewRef] = useState<MapView | null>(null);
    const [showCoordinateWidget, setShowCoordinateWidget] = useState<boolean>(false);
    const [showDebugTiles, setShowDebugTiles] = useState<boolean>(false);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [drawnPolygon, setDrawnPolygon] = useState<Polygon | null>(null);
    const [drawnPolygons, setDrawnPolygons] = useState<Polygon[]>([]);
    const [tempPoints, setTempPoints] = useState<Graphic[]>([]);
    const [wallHeight, setWallHeight] = useState<number>(10);
    const [graphicColor, setGraphicColor] = useState<number[]>([255, 0, 0, 0.5]);
    const [tempGraphic, setTempGraphic] = useState<Graphic | null>(null);
    const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
    const [catalogUrl, setCatalogUrl] = useState<string>("");
    const handleSelectFeatures = (polygon: Polygon, view: MapView | null) => {
        if(view){
            const graphic = new Graphic({ geometry: polygon, });
            view.map.layers.forEach(async (layer) => {
                if (layer instanceof FeatureLayer) {
                    const features = await layer.queryFeatures({ geometry: polygon, outFields: ["*"] });
                    const selectedFeats = features.features;
                    setSelectedFeatures(selectedFeats);
                    if (handleUpdateQuery) {
                        handleUpdateQuery(selectedFeats);
                    }
                }
            });
        }
    };

    const startDrawing = async () => {
        if (!viewRef.current) return;
        setIsDrawing(true);
        const view = viewRef.current;
        const pointSymbol = new SimpleMarkerSymbol({
          color: [0, 255, 255],
          size: "8px",
        });
        const tempRings: number[][][] = [[]];
        const handleClick = (event: any) => {
            if (isDrawing) {
                const point = view.toMap(event);
                tempRings[0].push([point.x, point.y]);
                const graphic = new Graphic({
                  geometry: new Point({
                    x: point.x,
                    y: point.y,
                    spatialReference: view.spatialReference,
                  }),
                  symbol: pointSymbol,
                });
                setTempPoints((prev) => {
                  return [...prev, graphic]
                });
                graphicsLayer?.add(graphic);
                const polyline = new Polyline({
                    paths: tempRings,
                    spatialReference: view.spatialReference,
                });
                const lineGraphic = new Graphic({
                    geometry: polyline,
                    symbol: {
                        type: "simple-line",
                        color: "blue",
                        width: 2,
                    }
                });
                if (tempGraphic) {
                    graphicsLayer?.remove(tempGraphic);
                }
                setTempGraphic(lineGraphic);
                graphicsLayer?.add(lineGraphic);
            }
        };
        view.on("click", handleClick);
        const handleDoubleClick = () => {
            const polygonRings = tempRings[0].slice();
            polygonRings.push(tempRings[0][0])
            const newPolygon = new Polygon({ rings: [polygonRings] });
            drawPolygon(newPolygon);
            setTempPoints([]);
            tempPoints.forEach(point => {
                graphicsLayer?.remove(point)
            });
            if (tempGraphic) {
                graphicsLayer?.remove(tempGraphic)
            }
            setTempGraphic(null);
            
        };
        view.on("double-click", handleDoubleClick);
        return () => {
            if (view) {
                view.off("click", handleClick);
                view.off("double-click", handleDoubleClick);
            }
        };

        watchUtils.whenTrueOnce(view, "stationary").then(() => {
          view.on("click", (event: any) => {
            if (!event.button) {
              // Only disable drawing when user clicks outside of drawing tool, not when placing points
              if(isDrawing){
                setIsDrawing(false);
              setTempPoints([]);
              tempPoints.forEach(point => {
                  graphicsLayer?.remove(point)
              });
              if (tempGraphic) {
                  graphicsLayer?.remove(tempGraphic)
              }
              setTempGraphic(null);
              }
            }
          });
        });        
    };

    const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWallHeight(parseFloat(event.target.value));
    };

    const drawPolygon = (polygon: Polygon) => {
        if (tempGraphic) {
            graphicsLayer?.remove(tempGraphic);
        }
        setDrawnPolygons(prev => [...prev, polygon]);
        setIsDrawing(false);
        setDrawnPolygon(polygon);
    };

    const generate25DGraphic = (polygon: Polygon, height: number, color: number[]) => {
        const symbol = {
            type: "polygon-3d",
            symbolLayers: [
                {
                    type: "extrude",
                    size: height,
                    material: { 
                        color: color,
                        
                    
                    },
                },
            ],
        };
        return new Graphic({ geometry: polygon, symbol: symbol });
    };

     const add25DGraphic = (graphic: Graphic) => {
        if (!graphicsLayer) return;
        graphicsLayer.add(graphic);
    };

    const remove25DGraphics = () => {
        if (!graphicsLayer) return;
        graphicsLayer.removeAll();
        setTempPoints([]);
        tempPoints.forEach(point => {
            graphicsLayer?.remove(point)
        });
        setDrawnPolygon(null);
        setDrawnPolygons([]);
        if (tempGraphic) {
          graphicsLayer?.remove(tempGraphic);
          setTempGraphic(null);
        }
      };
        
        if (tempGraphic) {
            setTempGraphic(null);
        }
    };

    useEffect(() => {
      if (viewRef.current) {
        const newGraphicsLayer = new GraphicsLayer();
        const startDraw = startDrawing();
        viewRef.current.map.add(newGraphicsLayer);
        setGraphicsLayer(newGraphicsLayer);

          return () => {
            if(newGraphicsLayer){
              viewRef.current?.map.remove(newGraphicsLayer)
            }
            return startDraw?.();
          }
      }
  },[viewRef]);

  useEffect(() => {
    if (drawnPolygon && graphicsLayer && wallHeight) {
      remove25DGraphics();
      const graphic = generate25DGraphic(drawnPolygon, wallHeight, graphicColor);
      add25DGraphic(graphic);     
    }
  },[viewRef])

    const toggleLayerVisibility = (layerId: string) => {           
        console.log("toggleLayerVisibility called", layerId)
        if(viewRef.current) {
            const layer = viewRef.current?.map?.findLayerById(layerId);
            if(layer){
                layer.visible = !layer.visible;


                setLayers((prevLayers) =>
                prevLayers.map((l) => (l.id === layerId ? {...l, visible: !l.visible} : l))
                );
            }
        } else {
            return;
        }
    }; 
    const removeLayer = (layerId: string) => {
        if(viewRef.current) {
          const layer = viewRef.current?.map?.findLayerById(layerId);
        if (layer) {
    const addLayer = (geojson: any, view: MapView | null) => {
        if (view) {
            const layer = new GeoJSONLayer({
                url: URL.createObjectURL(new Blob([JSON.stringify(geojson)])),
                title: "Query Results",
                id: "discover-query-results-" + Date.now()
            });
            view.map.add(layer);
            setLayers((prevLayers) => [...prevLayers, layer]);
            view.goTo(layer.fullExtent);
        }
    };
    const loadGeoJSONLayer = (geojson: any, view: MapView | null) => {
        if (view) {
            const layer = new GeoJSONLayer({
                url: URL.createObjectURL(new Blob([JSON.stringify(geojson)])),
                title: "Query Results",
                id: "query-results-" + Date.now()
            });
            view.map.add(layer);
            setLayers((prevLayers) => [...prevLayers, layer]);
            view.goTo(layer.fullExtent);
            return layer;
           
                viewRef.current.map.remove(layer);                
                setLayers((prevLayers) =>
                  prevLayers.filter((l) => l.id !== layerId)
                );
              }
        }
    };

    const addCatalogLayer = (layerUrl: string) => {
        if(!viewRef.current) return;
        const layer = new FeatureLayer({
            url: layerUrl
        });
        viewRef.current.map.add(layer);
        setLayers((prevLayers) => [...prevLayers, layer]);
    };

    const createDebugTileLayer = (view: MapView | null) => {
        if(!view) return;
        const tileInfo = new TileInfo({
            rows: 256,cols: 256,dpi: 96,
            format: "png",
            compressionQuality: 0,
            origin: { x: -20037508.342787, y: 20037508.342787, },
            spatialReference: { wkid: 3857, },
            levels: []

        });
        const tileLyr = new TileLayer({ url: `https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{level}/{row}/{col}`, tileInfo: tileInfo, spatialReference: { wkid: 3857 }, id: "debug-tiles",});
        return tileLyr as unknown as GeoJSONLayer;
    };
      useEffect(() => {
        if(viewRef.current?.map) {
            const layerIds = viewRef.current.map.layers.map(l => l.id).toArray();
            if (showDebugTiles && layerIds.indexOf("debug-tiles") === -1) {

                const map = viewRef.current.map;
                const debugLayer = createDebugTileLayer(viewRef.current);
                map.add(debugLayer);
            }
        } else {
            if (viewRef.current) {
                const map = viewRef.current.map;
                const debugLayer = map.findLayerById("debug-tiles");
                if (debugLayer) { map.remove(debugLayer); } } } }, [showDebugTiles, viewRef]);
    useEffect(() => {
        }
    }, [viewRef]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import("@arcgis/core/Map").then(({ default: Map }) => {
                import("@arcgis/core/views/MapView").then(({ default: MapView }) => {
                    import("@arcgis/core/geometry/Polygon").then(({ default: Polygon }) => {
                        import("@arcgis/core/Graphic").then(({ default: Graphic }) => {
                            import("@arcgis/core/layers/GraphicsLayer").then(({ default: GraphicsLayer }) => {
                                const map = new Map({ basemap: "topo-vector" });
                                const view = new MapView({
                                    map: map,
                                    center: [-118.805, 34.027],
                                    zoom: 13,
                                    container: viewDiv.current!
                                });
                                view.on("drag", ["Control"], (event: any) => {
                                  if (isDrawing) return;
                                  view.on("pointer-move", (event) => {
                                    const screenPoint = { x: event.x, y: event.y, };
                                    view.hitTest(screenPoint).then((response: any) => {
                                      if (response.results.length > 0) {
                                        console.log("response", response);
                                      }
                                    });
                                  });
                                  const origin = view.toMap(event);
                                  view.on("pointer-up", (event) => {
                                    const destination = view.toMap(event);
                                    const polygon = new Polygon({
                                      rings: [
                                        [[origin.x, origin.y]],
                                        [[destination.x, origin.y]],
                                        [[destination.x, destination.y]],
                                        [[origin.x, destination.y]],
                                        [[origin.x, origin.y]],
                                            ],
                                        });
                                        handleSelectFeatures(polygon, view);
                                    });
                                });
                                setViewRef(view);
                                return () => {
                                    view.destroy();
                                };
                            });
                        });
                    });

                });
            });
        }
    }, []);
    useEffect(() => {
        if (geojsonResults) {
            const layer = loadGeoJSONLayer(geojsonResults, viewRef.current ?? null);
            return () => {
                if (viewRef.current) viewRef.current.map.remove(layer);
            };
        }
        return () => { };
    }, [geojsonResults, loadGeoJSONLayer]);
    return (
      <div className="h-screen w-screen overflow-hidden">
        {drawnPolygons.length > 0 && <div className="absolute top-20 left-5 z-50 max-h-20 overflow-auto bg-white">
          <p>Drawn Polygon Rings:</p>
          {drawnPolygons.map((polygon, index) => (
            <div key={index}>
              <ul>
                {polygon.rings[0].map((ring, ringIndex) => (
                  <li key={ringIndex}> {ring[0]}, {ring[1]} </li>
                ))}
              </ul>
              <button onClick={() => {
                const newPolygons = drawnPolygons.filter((_, i) => i !== index);
                setDrawnPolygons(newPolygons);
              }}>Delete</button>
            </ul>
          </div>
          ))}
      </div>}
       {isDrawing && viewRef.current && <button className="absolute top-5 left-5 z-50" onClick={() => { setIsDrawing(false); graphicsLayer?.remove(tempGraphic); setTempPoints([]);tempPoints.forEach(point => {graphicsLayer?.remove(point)}); setTempGraphic(null); }}>Cancel Drawing</button>}
     <div className="absolute top-10 left-5 z-50">
        {viewRef.current && <button className="mr-2" onClick={startDrawing}>Start Drawing</button>}
        {viewRef.current && <input className="mr-2"
        type="number"
        value={wallHeight}
        onChange={handleHeightChange}
        placeholder="Wall Height" />
        <input className="mr-2" type="color" value={`#${graphicColor.slice(0, 3).map((c) => c.toString(16).padStart(2, '0')).join('')}`} onChange={(e) => {
          const color = [parseInt(e.target.value.slice(1, 3), 16), parseInt(e.target.value.slice(3, 5), 16), parseInt(e.target.value.slice(5, 7), 16), 0.5]
          setGraphicColor(color)}}/>
        {drawnPolygon && viewRef.current && <button className="mr-2" onClick={() => {
            const graphic = generate25DGraphic(drawnPolygon, wallHeight, graphicColor);
            add25DGraphic(graphic);
        }}>Add Graphic</button>}
        {graphicsLayer && viewRef.current && <button onClick={remove25DGraphics}>Remove Graphics</button>}
      </>}
    ,


        
        
            
        
        
        <div className={`${geistSans.className} ${geistMono.className} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`} >
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <DiscoverDataWidget addLayer={(geojson) => addLayer(geojson, viewRef.current ?? null)}/>
                <DataWidget/>
                <QueryWidget />
                <VectorTileInspector viewRef={viewRef}/>
                <div className="flex flex-col">
                    <input type="file" onChange={(e) => { if (e.target.files && e.target.files.length > 0) { handleUploadLocal?.(e.target.files[0]); } }} />
                </div>
                <div className="flex flex-col">
                <input type="text" value={catalogUrl} onChange={(e) => setCatalogUrl(e.target.value)} />
                    <div className="flex flex-col">
                    {viewRef.current?.map?.layers.map((layer,index) => (<div key={index}>
                    <button onClick={() => toggleLayerVisibility(layer.id as string)}>
                         Toggle {layer.title}
                    </button>
                    <button onClick={()=>removeLayer(layer.id)}>
                         Remove {layer.title}
                    </button>
                    </div>))}
                </div>

                </div>
                <button onClick={() => {
                        import("@arcgis/core/widgets/Swipe").then(({ default: Swipe }) => {
                           
                        });
                    }}> Enable Swipe</button>
                <button onClick={() => handleShowOnMap?.()}>Show on Map</button>
                <button onClick={() => {
                    const bookmarks = new Bookmarks({ });
                     if (viewRef.current) {
                        bookmarks.view = viewRef.current;
                        viewRef.current.ui.add(bookmarks, "top-right");
                    }

                }}>Enable Bookmarks</button>
                <button onClick={() => setShowDebugTiles(!showDebugTiles)}>{showDebugTiles ? "Hide Debug Tiles" : "Show Debug Tiles"}</button>
                <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={150} height={38} priority />
                <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                    <li className="mb-2 tracking-[-.01em]"> Get started by editing{" "} <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold"> pages/index.tsx </code> . </li>
                    <li className="tracking-[-.01em]"> Save and see your changes instantly. </li>
                </ol>
                <div className="flex gap-4 items-center flex-col sm:flex-row">
                    <a className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto" href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
                        <Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={15} height={20} /> Deploy now </a>
                    <a className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]" href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer"> Read our docs </a>
                </div>
            </main>
           
            <div id="viewDiv" ref={viewDiv}></div>
            <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                <a className="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
                    <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} /> Learn </a>
                <a className="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
                    <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} /> Examples </a>
                <a className="flex items-center gap-2 hover:underline hover:underline-offset-4" href="https://nextjs.org?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
                    <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} /> Go to nextjs.org → </a>
            </footer>
        </div>
    );
    }

}