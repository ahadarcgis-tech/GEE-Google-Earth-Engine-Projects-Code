// 1. Define the Area of Interest (Karachi, Pakistan)
var gadm = ee.FeatureCollection("FAO/GAUL/2015/level2");

// Filter for Pakistan -> Sindh -> Karachi (includes all Karachi districts)
var AOI = gadm.filter(ee.Filter.eq('ADM0_NAME', 'India'))
              .filter(ee.Filter.stringContains('ADM1_NAME', 'Delhi'))
              // .filter(ee.Filter.stringContains('ADM2_NAME', 'Delhi'));

// 2. Load Sentinel-5P Sulfur Dioxide (SO2)
var so2 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_SO2")
          .filterDate('2024-01-01', '2024-12-30')
          .select('SO2_column_number_density')
          .mean()
          .clip(AOI);

// 3. Visualization parameters for SO2
// SO2 values are typically very small decimals.
var band_viz = {
  min: 0.00006938821596339396,
  max: 0.00036269019622695616, 
  palette: [  'purple',  'green', 'yellow', 'red']
};

// 4. Display on Map
Map.addLayer(so2, band_viz, 'Delhi Mean SO2 2024');
Map.centerObject(AOI, 11); 

// 5. Export SO2 data to Drive
Export.image.toDrive({
  image: so2,
  description: 'SO2_Delhi_Mean_2024',
  folder: 'GEE',
  fileNamePrefix: 'SO2_Delhi_Mean_2024',
  region: AOI.geometry(),
  scale: 1113,           
  maxPixels: 1e13
});

// --- LEGEND CODE ---
var legend = ui.Panel({
  style: {position: 'bottom-left', padding: '8px 15px'}
});

var legendTitle = ui.Label({
  value: 'SO2 Density (mol/m²)',
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
