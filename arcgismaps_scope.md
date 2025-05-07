We have a back-end that's GeoNode/GeoServer and offering OGC WFS-T, OGC API Features, OGC WMS, OGC API Maps, OGC API Tiles, TMS, WMTS

We want to build a sample ArcGIS Maps SDK for JavaScript that has new tools and widgets that enable utilizing this back-end.

New Get Data for a Feature or BBOX for editing
Special Select Tool to define
This application get's geojson and loads it on the map (if it's easier to have esri work with ESRIJSON then we can do that too)
Then we have special editing tools that resemble the existing 2D Editor Widget that enable users to edit the geometry or attributes and create new geometry

after the user is finished editing that GeoJSON or ESRIJSON is send back to the GeoNode via the OGC WFS-T or Geonode REST API.

For this sample implementation we can enable a new widget for users to login with their geonode account

New Search Widget that uses OGC API Features and is paired with a companion OGC API Tiles/XYZ Vector Tiles that is used for the display of data on the map.  Both services support CQL Common Query Language Filter. The Filter and search the user performs is mirrored in the Tile REquest so that only vector tiles on the map meet their criteria.

New Attribute Table Grid that supports connect  to the OGC API Features and GeoNode REST API and enable attribute editing.
Also toggle a spatial filter
By Either BBOX (what's the map extent ST_INTERSECT) or what is the closest to the map center Lat long or a user clicked location and buffer distance and then ordered by the distance and limited to 25 records.

The attribute grid should also have ability to sort and filter data.  Export data to Excel/CSV or GeoJSON or KML.
--------------------
Build me a new add local and remote files GIS Data Widget that uses Duckdb wasm with httpfs, http_client, spatial, excel, sqlite, avro, arrow, zipfs, autocomplete, fulltextsearch, h3, pivot_table, flockmtl, and ui extensions. It enables users to connect to cloud native/optimized files hosted anywhere that the httpfs extension can access. Connect the new attribute grid to this to enable users to see the data and perform searches. The FullText Search should be enabled in the search bar. Users can upload non persistent local files (GeoJSON, Shapefile, Filegdb, PersonalGDB, MapInfo, KML, GPKG vector features) we can have a button that says show on the map and then that query result is returned as GeoJSON to be loaded on the map as a new layer. This would enable access to geospatial data lakes, data lake houses, remote hosted static files, and other local and remote GIS content. Create the necessary screens and wizard to enable Pivot_table capabilities and flockmtl