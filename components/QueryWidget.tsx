import React, { useState } from 'react';
import { load, FlatGeobufLoader } from 'loaders.gl';

interface Feature {
  properties: { [key: string]: any };
  geometry: any;
}

interface QueryWidgetProps {
  flatgeobufUrl: string;
}

const QueryWidget: React.FC<QueryWidgetProps> = ({ flatgeobufUrl }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const features = await load(flatgeobufUrl, FlatGeobufLoader, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });

      const filteredFeatures = features.filter((feature: any) => {
        return Object.values(feature.properties).some((value) =>
          String(value).toLowerCase().includes(query.toLowerCase())
        );
      });
      setResults(filteredFeatures);
    } catch (err) {
      setError('Error searching FlatGeobuf file.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Enter query"
        />
        <button onClick={handleSearch} disabled={isLoading}>
          Search
        </button>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {results.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <ul>
            {results.map((feature, index) => (
              <li key={index}>
               
                {JSON.stringify(feature.properties)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {results.length === 0 && !isLoading && !error && (
        <div>No results found.</div>
      )}
    </div>
  );
};

export default QueryWidget;