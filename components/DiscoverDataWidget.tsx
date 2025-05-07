import React, { useState, useEffect } from 'react';

// Interface for search result items
interface SearchResult {
    id: string;
    title: string;
    dataType: string;
    url: string;
}

// Interface for props passed to DiscoverDataWidget component
interface DiscoverDataWidgetProps {
    addLayer: (geojson: any) => void;
}

// DiscoverDataWidget component
const DiscoverDataWidget: React.FC<DiscoverDataWidgetProps> = ({ addLayer }) => {
    // State variable to manage the text entered in the search bar
    const [searchText, setSearchText] = useState<string>('');
    // State variable to manage the selected data type filter
    const [dataType, setDataType] = useState<string>('');
    // State variable to store the results of the search
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    // State variable to manage the current catalog
    const [currentCatalog, setCurrentCatalog] = useState<string>('');
    // State variable to manage the BBOX filter
    const [bbox, setBbox] = useState<string>('');
    // State variable to manage the tags filter
    const [tags, setTags] = useState<string>('');
    // State variable to manage if a search has been executed or not
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    // State variable to store the OGC API Records endpoint
    const [ogcApiRecordsEndpoint, setOgcApiRecordsEndpoint] = useState<string>('https://demo.pygeoapi.io/master/collections');

    /**
     * handleAddLayerToMap
     * This function is called when the user clicks the "Add Layer" button for a search result.
     * @param {SearchResult} result - The search result to add to the map.
     * @param {(geojson: any) => void} addLayerFunction - The function to call to add the layer to the map.
     */
    const handleAddLayerToMap = (result: SearchResult, addLayerFunction: (geojson: any) => void) => {
        console.log('Adding layer to map:', result.title);
        // Simulated GeoJSON data for demonstration purposes
        const geojson = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    // Properties of the feature
                    properties: {
                        id: result.id,
                        title: result.title,
                        dataType: result.dataType,
                    },
                    // Geometry of the feature (example: a point)
                    geometry: { type: "Point", coordinates: [-122.4194, 37.7749] }
                },
            ],
        };
        // Call the addLayerFunction to add the GeoJSON data to the map
        addLayerFunction(geojson);
    };

    /**
     * handleSearch
     * This function is called when the user clicks the "Search" button.
     * It simulates searching across various data sources (OGC API Records, STAC, Living Atlas, Hub Sites)
     * using the current search parameters (searchText, dataType, bbox, tags).
     *
     * @async
     */
    const handleSearch = async () => {
        console.log('Search Parameters:', { searchText, dataType, bbox, tags });

        // OGC API Records search
        console.log('Searching OGC API Records with:', { searchText, dataType, bbox, tags });
        // Add actual API call logic here...

        // STAC search
        console.log('Searching STAC with:', { searchText, dataType, bbox, tags });
        // Add actual API call logic here...

        // ESRI ArcGIS Living Atlas search
        console.log('Searching ESRI ArcGIS Living Atlas with:', { searchText, dataType, bbox, tags });
        // Add actual API call logic here...

        // ArcGIS Hub Sites search
        console.log('Searching ArcGIS Hub Sites with:', { searchText, dataType, bbox, tags });
        // Add actual API call logic here...

        // Set hasSearched to true, to show results section
        setHasSearched(true);

        // Simulated search results for demonstration purposes
        setSearchResults([
            { id: '1', title: 'Result 1', dataType: 'vector', url: 'url1' },
            // Example: Add other results
            { id: '2', title: 'Result 2', dataType: 'raster', url: 'url2' },
            { id: '3', title: 'Result 3', dataType: 'table', url: 'url3' },
        ]);
    };

    return (
        <div id="discover-data-widget">
            {/* Title */}
            <h2>Discover Data</h2>
            {/* Search bar section */}
            <div className="search-bar">
                {/* Search input */}
                <input type="text" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                {/* Search button */}
                <button onClick={handleSearch}>Search</button>
            </div>
            {/* Filters section */}
            <div className="filters">
                <div>
                    <label htmlFor="dataType">Data Type:</label>
                    <input
                        type="text"
                        id="dataType" value={dataType} onChange={(e) => setDataType(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="bbox">BBOX:</label>
                    <input type="text" id="bbox" value={bbox} onChange={(e) => setBbox(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="tags">Tags:</label>
                    <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
            </div>
            {/* Search results section */}
            <div id="search-results">
                {/* Map through search results and display each result */}
                {searchResults.map((result) => (
                    <div key={result.id} className="search-result">
                        {/* Result Title */}
                        <h3>{result.title}</h3>
                        <p>Data Type: {result.dataType}</p>
                        <p>url: {result.url}</p>
                        <button onClick={() => handleAddLayerToMap(result, addLayer)}>Add Layer</button>
                    </div>
                ))}                
            </div>
        </div>
    );
};

export default DiscoverDataWidget;