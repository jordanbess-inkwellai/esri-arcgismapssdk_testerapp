import React, { useState } from 'react';

interface CatalogWidgetProps {
  onAddUrl: (url: string) => void;
}

const CatalogWidget: React.FC<CatalogWidgetProps> = ({ onAddUrl }) => {
  console.log("CatalogWidget");
  const [url, setUrl] = useState<string>('');
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrl(event.target.value);
  };
  return (
    <div id="catalog" style={{ height: '100%', width: '100%' }}>
      <label htmlFor="service-url">Service URL</label>
      <textarea id="service-url" value={url} onChange={handleChange} />
      <button
        onClick={() => {
          onAddUrl(url);
          setUrl('');
        }}
      >
        Add to Map
      </button>
    </div>
  );
};

export default CatalogWidget;