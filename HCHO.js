// 1. Define the Area of Interest (Brazil)
var gadm = ee.FeatureCollection("FAO/GAUL/2015/level0");
var AOI = gadm.filter(ee.Filter.eq('ADM0_NAME', 'Brazil'));

// 2. Load Sentinel-5P Formaldehyde (HCHO)
var hcho = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_HCHO")
          .filterDate('2024-01-01', '2024-12-30')
          .select('tropospheric_HCHO_column_number_density')
          .mean()
          .clip(AOI);

// 3. Visualization parameters for HCHO
// Typical values range from 0 to 0.0003 mol/m²
var band_viz = {
  min: 0.0,
  max: 0.0003, 
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};

// 4. Display on Map
Map.addLayer(hcho, band_viz, 'Brazil Mean HCHO 2024');
Map.centerObject(AOI, 4); 

// 5. Export HCHO data to Drive
Export.image.toDrive({
  image: hcho,
  description: 'HCHO_Brazil_Mean_2024',
  folder: 'GEE',
  fileNamePrefix: 'Brazil_HCHO_2024',
  region: AOI.geometry(),
  scale: 1113,           // Native resolution for Sentinel-5P
  maxPixels: 1e13
});

// --- LEGEND CODE ---
var legend = ui.Panel({
  style: {position: 'bottom-left', padding: '8px 15px'}
});

var legendTitle = ui.Label({
  value: 'HCHO Density (mol/m²)',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0'}
});
legend.add(legendTitle);

var lon = ee.Image.pixelLonLat().select('longitude');
var gradient = lon.multiply((band_viz.max - band_viz.min) / 100.0).add(band_viz.min);
var legendImage = gradient.visualize(band_viz);

var thumbnail = ui.Thumbnail({
  image: legendImage,
  params: {bbox: '0,0,100,10', dimensions: '200x20'},
  style: {padding: '1px', position: 'bottom-center'}
});
legend.add(thumbnail);

var panelLabels = ui.Panel({
  widgets: [
    ui.Label(band_viz.min.toFixed(4), {margin: '4px 8px'}),
    ui.Label(
      ((band_viz.max + band_viz.min) / 2).toFixed(4),
      {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(band_viz.max.toFixed(4), {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});
legend.add(panelLabels);

Map.add(legend);
