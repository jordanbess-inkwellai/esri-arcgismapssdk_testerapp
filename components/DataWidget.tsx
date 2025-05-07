// This is a test comment to check if the file is being modified correctly.
import React, { useState, useEffect, useRef } from 'react';
import * as duckdb_ from '@duckdb/duckdb-wasm';

interface DataWidgetProps {
    selectedFeatures?: any[]; // Optional selected features prop
}

const DUCKDB_WASM_URL = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm';

// Main DataWidget component
const DataWidget = React.forwardRef<any, DataWidgetProps>(({ selectedFeatures }, ref) => {
    
    
    // References and State Variables
    const workerRef = useRef<duckdb_.AsyncDuckDB | null>(null);
    const connectionRef = useRef<duckdb_.AsyncDuckDBConnection | null>(null);
    const dbRef = useRef<duckdb_.AsyncDuckDB | null>(null);
    const [isBigQueryConnected, setIsBigQueryConnected] = useState<boolean>(false);
    const [bigQueryProjectId, setBigQueryProjectId] = useState<string>('');
    const [bigQueryDatasetId, setBigQueryDatasetId] = useState<string>('');
    const [gsheetsUrl, setGsheetsUrl] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [queryResults, setQueryResults] = useState<any[]>([]);
    const [geojsonResults, setGeojsonResults] = useState<any | null>(null);
    const [, setDuckdb] = useState<duckdb_.AsyncDuckDBConnection | null>(null);
    const [isGisFile, setIsGisFile] = useState<boolean>(false);
    const [bbox, setBbox] = useState<string | null>(null);
    // state variable for virtual network
    const [gisFileData, setGisFiledata] = useState<any | null>(null);

    const [xCoordinate, setXCoordinate] = useState<number>(0);
    const [yCoordinate, setYCoordinate] = useState<number>(0);
    const [knnNeighbors, setKnnNeighbors] = useState<number>(0);
    const [queryString, setQueryString] = useState<string>('');
    const [httpUrl, setHttpUrl] = useState<string>('');
    const [outputType, setOutputType] = useState<'GeoJSON' | 'http request'>('GeoJSON');
    const [latitudeColumn, setLatitudeColumn] = useState<string>('');
    const [longitudeColumn, setLongitudeColumn] = useState<string>('');


    // State variable for the schema
    const [currentSchema, setCurrentSchema] = useState<any>([]);
    // UI Extensions state
    const [extensions, setExtensions] = useState([
        { name: 'pivot_table', enabled: false },
        { name: 'flockmtl', enabled: false },
    ]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    React.useImperativeHandle(ref, () => ({ ...workerRef.current }));


    useEffect(() => {
        const init = async () => {
            const DUCKDB_WASM_CONFIG = {
                mainModule: `${DUCKDB_WASM_URL}/dist/duckdb-mvp.wasm`,
                pthreadWorker: `${DUCKDB_WASM_URL}/dist/duckdb-browser-mvp.worker.js`,
            };
            const logger = { log: console.log, debug: console.debug, warn: console.warn, error: console.error };
            const db = new duckdb_.AsyncDuckDB(logger);
            workerRef.current = db;
            await workerRef.current.instantiate(DUCKDB_WASM_CONFIG.mainModule);
            dbRef.current = db;
            const connection: duckdb_.AsyncDuckDBConnection = await db.connect();
            connectionRef.current = connection;
            setDuckdb(connection);
        };

        init();

    }, []);

    const convertToGeoJSON = async (data: any[]): Promise<any> => {

        try {
            const featureCollection = {
                type: 'FeatureCollection',
                features: [] as any[]
            };
            for (const item of data) {
                const properties: { [key: string]: any } = {};
                let geometry;
                for (const key in item) {
                    if (key.toLowerCase() === 'wkt') {
                        const wkt = item[key];
                        const connection = connectionRef.current;
                        if (!connection) {console.error('DuckDB connection not initialized'); return null}
                        const geometryResult = await connection.query(`SELECT ST_AsGeoJSON('${wkt}')`);
                        const geojsonString = geometryResult?.get(0)?.get(0);
                        geometry = JSON.parse(geojsonString);
                    }
                    else {
                        properties[key] = item[key];
                    }
                }
                if (geometry) {
                    featureCollection.features.push({
                        type: 'Feature',
                        geometry,
                        properties
                    });
                }
            }
            return featureCollection;
        } catch (error) {
            console.error('Error converting to GeoJSON:', error);
            return null;
        }
    };

    const handleAdvancedQueryBuilder = () => {
        // Implementation for advanced query builder
    }

    // Function to run a query
    const runQuery = async (query: string) => {
        if (!connectionRef.current) {
            console.error('DuckDB connection not initialized');
            return;
        }
        return await connectionRef.current.query(query);
    };


    // Function to handle local file uploads
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }
        const isGIS = file.name.endsWith('.geojson') || file.name.endsWith('.shp') || file.name.endsWith('.gpkg') || file.name.endsWith('.dxf');
        setIsGisFile(isGIS)
        
        const connection = connectionRef.current
        if (isGIS) {
            const reprojectQuery = `SELECT ST_AsText(ST_TRANSFORM(geometry, 4326)) as reprojected_wkt, * from '${file.name}'`;
            if (!connection) { console.error('DuckDB connection not initialized'); return; } const results = await connection.query(reprojectQuery);
            let readQuery;
            readQuery = `SELECT ST_AsGeoJSON(geometry) AS geojson, * FROM '${file.name}'`;
            if (!connection) { console.error('DuckDB connection not initialized'); return; } const results2 = await connection.query(readQuery);
        } else {
            const query = `SELECT * FROM '${file.name}'`;
            if (!connection) { console.error('DuckDB connection not initialized'); return; }
            const results = await connection.query(query);
        }

    };

    const handleExtensionChange = (name: string, checked: boolean) => {
        setExtensions((prevExtensions) => {
            return prevExtensions.map((ext) =>
                ext.name === name ? { ...ext, enabled: checked } : ext
            );
        });
    };

    const handleUpdateQuery = async () => {
       
    }

    const handleOutputData = async () => {
        
    };

    const handleQuery = async () => {
        try {
            const results = await runQuery(queryString);
            if (results && results.toArray) {
                const data = results.toArray().map(row => row.toJSON());
                setQueryResults(data);
                const geojson = await convertToGeoJSON(data);
                setGeojsonResults(geojson);
            }
        } catch (error) {
            console.error('Error executing query:', error);
        }
    };

    const handleShowOnMap = () => {
        
    };

    const handleExploreGISData = async () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (!fileInput || !fileInput.files) {
          console.error('No file selected');
          return;
      }
      const file = fileInput.files[0];
      if (!file) {
          console.error('No file selected');
          return;
      }
      const reader = new FileReader();
        reader.onload = (event) => {
        const url = `https://fgdb.youssefharby.com/?data=${encodeURIComponent(event.target?.result as string)}`;
        window.open(url, '_blank');
        };
      
      reader.readAsDataURL(file);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQueryString(event.target.value);
    };

    const handleGoogleAuth = async () => {
        
    };

    const handleConnectGSheets = async () => {
        
    };

    const handleBigQueryAuth = async () => {
       
    };

    const handleConnectBigQuery = async () => {
        
    };

    const handleCreateVirtualNetwork = async () => {
        
    };

    const handleImportDXF = async () => {
        
    };

    const handleExportDXF = async () => {
        
    };

    const handleCreateGeometry = async () => {
        
    };

    const handleKNNsearch = async () => {
        
    };

    return (
        <div id="data-widget-container">
          <h2>Data Connections</h2>
          <div>
            <h3>BigQuery Data Source</h3>
            <div>
              <input
                type="text"
                placeholder="BigQuery Project ID"
                value={bigQueryProjectId}
                onChange={(e) => setBigQueryProjectId(e.target.value)}
              />
              <input
                type="text"
                placeholder="BigQuery Dataset ID"
                value={bigQueryDatasetId}
                onChange={(e) => setBigQueryDatasetId(e.target.value)}
              />

              <h3>Google Sheets Data Source</h3>
              {isAuthenticated && currentSchema.length > 0 && (
                <div>
                  <label>Latitude Column</label>
                  <select
                    onChange={(e) => setLatitudeColumn(e.target.value)}
                    value={latitudeColumn}
                  >
                    {currentSchema.length > 0 &&
                      Object.keys(currentSchema[0]).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                  </select>

                  <label>Longitude Column</label>
                  <select
                    onChange={(e) => setLongitudeColumn(e.target.value)}
                    value={longitudeColumn}
                  >
                    {currentSchema.length > 0 &&
                      Object.keys(currentSchema[0]).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                  </select>
                  <button onClick={handleCreateGeometry}>
                    Create Geometry
                  </button>
                </div>
              )}
              {isAuthenticated === false && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter Google Sheets URL"
                    value={gsheetsUrl}
                    onChange={(e) => setGsheetsUrl(e.target.value)}
                  />
                </div>
              )}
              <div>
                <h3>Local Data Source</h3>
                <input type="file" onChange={handleFileChange} />
                {isGisFile && (
                    <button
                      onClick={handleExploreGISData}
                      style={{ marginTop: '10px' }}
                    >
                      Explore GIS Data
                    </button>
                  )}
              </div>
              {isAuthenticated === false && (
                <div>
                  <button onClick={handleConnectGSheets}>
                    Connect and Load
                  </button>
                  <button onClick={handleGoogleAuth}>Google Auth</button>
                </div>
              )}
              {isAuthenticated === false && (
                <div>
                  <button onClick={handleConnectBigQuery}>
                    Connect to BigQuery
                  </button>
                  <button onClick={handleBigQueryAuth}>
                    BigQuery Google Auth
                  </button>
                </div>
              )}
              {queryResults.length > 0 && (
                <div>
                  <select
                    onChange={(e) =>
                      setOutputType(e.target.value as "GeoJSON" | "http request")
                    }
                  >
                    <option value="GeoJSON">GeoJSON</option>
                    <option value="http request">http request</option>
                  </select>
                  {outputType === "http request" && (
                    <input
                      type="text"
                      placeholder="Enter HTTP URL"
                      value={httpUrl}
                      onChange={(e) => setHttpUrl(e.target.value)}
                    />
                  )}
                </div>
              )}
              <div>
                <button onClick={handleCreateVirtualNetwork}>
                  Create Virtual Network
                </button>
                <h3>Schema:</h3>
                <div>
                  <button onClick={handleImportDXF}>Import DXF</button>
                  <button onClick={handleExportDXF}>Export DXF</button>
                </div>
                <div>
                  <div>
                    <label>X Coordinate:</label>
                    <input
                      type="number"
                      value={xCoordinate}
                      onChange={(e) => setXCoordinate(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Y Coordinate:</label>
                    <input
                      type="number"
                      value={yCoordinate}
                      onChange={(e) => setYCoordinate(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Neighbors:</label>
                    <input
                      type="number"
                      value={knnNeighbors}
                      onChange={(e) => setKnnNeighbors(Number(e.target.value))}
                    />
                  </div>
                  <button onClick={handleKNNsearch}>KNN Search</button>
                </div>
                <h3>Neighbors:</h3>
                <table>
                  <thead>
                    <tr>
                      {Object.keys(currentSchema[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        style={{
                          backgroundColor: selectedRows.includes(row.OBJECTID)
                            ? "yellow"
                            : "transparent",
                        }}
                      >
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex}>{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3>Query Results:</h3>
              {queryResults.length > 0 && (
                <pre>{JSON.stringify(queryResults, null, 2)}</pre>
              )}
            </div>
            <div>
              <button onClick={handleUpdateQuery}>Update Query</button>
              <button onClick={handleAdvancedQueryBuilder}>
                Advanced Query Builder
              </button>
              <h2>Search</h2>
              <input
                type="text"
                placeholder="Enter query..."
                value={queryString}
                onChange={handleSearchChange}
              />
              <input
                type="text"
                /* TODO: In the future, this should be obtained from the map. For now it has to be entered manually */
                placeholder="Enter Bounding Box (minX,minY,maxX,maxY)"
                value={bbox || ''}
                onChange={(e) => setBbox(e.target.value)}
              />
              <button onClick={handleOutputData}>Output Data</button>
              <button onClick={handleQuery}>Run Query</button>
              <button onClick={handleShowOnMap}>Show on Map</button>
            </div>
            <div>
              <h2>UI Extensions</h2>
              {extensions.map((ext) => (
                <div key={ext.name}>
                  <input
                    type="checkbox"
                    id={ext.name}
                    checked={ext.enabled}
                    onChange={(e) => handleExtensionChange(ext.name, e.target.checked)}
                  />
                  <label htmlFor={ext.name}>{ext.name}</label>
                </div>
              ))}
            </div>
            {extensions.find((ext) => ext.name === "pivot_table")?.enabled && (
              <div>
                <h2>Pivot Table Options</h2>
              </div>
            )}
            {extensions.find((ext) => ext.name === "flockmtl")?.enabled && (
              <div>
                <h2>FlockMTL Options</h2>
              </div>
            )}
          </div>
        </div>
    );
});

export default DataWidget;