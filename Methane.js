// 1. Define the Area of Interest (Argentina)
var gadm = ee.FeatureCollection("FAO/GAUL/2015/level0"); // Level 0 for Country boundaries
var AOI = gadm.filter(ee.Filter.eq('ADM0_NAME', 'Argentina'));

// 2. Load Sentinel-5P Methane (CH4)
var ch4 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_CH4")
          .filterDate('2024-01-01', '2024-12-30')
          .select('CH4_column_volume_mixing_ratio_dry_air')
          .mean()
          .clip(AOI);

// 3. Visualization parameters for Methane
// Units are in ppb (parts per billion)
var band_viz = {
  min: 1817,
  max: 1855, 
  palette: ['black','cyan', 'green', 'yellow', 'red']
};

// 4. Display on Map
Map.addLayer(ch4, band_viz, 'Argentina Mean Methane 2024');
Map.centerObject(AOI, 5); 

// 5. Export Methane data to Drive
Export.image.toDrive({
  image: ch4,
  description: 'CH4_Argentina_Mean_2024',
  folder: 'GEE',
  fileNamePrefix: 'Argentina_CH4_2024',
  region: AOI.geometry(),
  scale: 7000,           // Methane product has a coarser resolution (~7km)
  maxPixels: 1e13
});

// --- LEGEND CODE ---
var legend = ui.Panel({
  style: {position: 'bottom-left', padding: '8px 15px'}
});

var legendTitle = ui.Label({
  value: 'Methane Concentration (ppb)',
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
    ui.Label(band_viz.min, {margin: '4px 8px'}),
    ui.Label(
      ((band_viz.max + band_viz.min) / 2).toFixed(0),
      {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(band_viz.max, {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});
legend.add(panelLabels);

Map.add(legend);
