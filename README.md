# esri-arcgismapssdk_testerapp
provide working sample to evaluate features and capabilities for smartmap
this repo was migrated to https://github.com/aiinkwell/ecco-spatial-demo
Page 1 
1) Support OGC WFS-T Transactional with new Editor Widget  (Connection to GeoNode/GeoServer)
2) Add Data Widget with support for any OGR supported format local and internet via httpfs spatail and other extensions of duckdb and converts data as required.
3) Robust Attribute Table/Grid with Seaarch and spatial search - DUCKDB WASM for local and internet files and access to it's extensions
4) Browse Online Resources (ESRI ArcGIS LivingAtlas, ArcGIS Hub, STAC, OGC API Records and perform searches and load data
5) 3D/2.5D Data Creation and Editing to support Z/M Enabled WFS-T -with a new widget
6) debug issues - see debug tile layer, see layers and attributes of vector tiles

Page 2 - WAYFINDING
1) Evaluate Walking Path Routing using PG_Routing

Page 3 -CloudNative
Cloud Native/Optimized PMTILES and FlatGeoBuf with FlatGeoBuf Searching


Developed by Jordan Bess May 2025

# Geospatial Data Exploration Tool

## Project Overview
This project is a web application designed for exploring and interacting with geospatial data. It integrates multiple data sources, tools, and libraries to provide a comprehensive environment for developers and data analysts to work with geospatial information. Key features include connecting to various data sources, executing queries, creating geometries, discovering new data, and interacting with a dynamic map interface.

The application now supports the following new features and technologies:

-   **Cloud Native Map Page:** Testing with Cloud Native Optimized PMTILES Map Tiles Vector Tiles and Raster Tiles.
-   **Vector Tile Inspector:** Inspect vector tiles, view their layers, and explore layer properties.
-   **Query Widget:** Search within FlatGeobuf files.
-   **ArcGIS Maps SDK for JavaScript:** Integration for advanced map interactions.

## Key Features

-   **Data Connection**: Connect to and load data from multiple sources (Google Sheets, BigQuery, local/remote files).
-   **Geometry Creation**: Create geometry columns from latitude/longitude data.
-   **Querying**: Write and execute queries against connected data.
-   **Data Output**: Output query results to GeoJSON or send them to HTTP requests.
-   **Discover Data**: Search and discover data from OGC APIs, STAC, Living Atlas, and Hub Sites.
-   **Selection Tool**: Select features on the map and view/edit their attributes.
-   **Cloud Native Map Page**: Test and view Cloud Native Optimized PMTILES Map Tiles, Vector Tiles and Raster Tiles.
-   **Vector Tile Inspector**: Allows inspecting vector tile layers, viewing layers, and properties.
-   **Query Widget**:  Allows searching for FlatGeobuf.
-   **Attribute Grid**: View and edit the attributes of selected features.

## Usage

This application provides a comprehensive set of tools for exploring and working with geospatial data. You can connect to various data sources, perform queries, create geometries, output data, discover new data, and interact with features on a map.

## Getting Started

### Installation

To get started with the project, you need to install the dependencies. This project uses npm as the package manager. Run the following command to install all the required packages:




First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
