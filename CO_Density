// 1. Define the Area of Interest (Karachi, Pakistan)
var gadm = ee.FeatureCollection("FAO/GAUL/2015/level2");

// Filter for Pakistan -> Sindh -> Karachi
var AOI = gadm.filter(ee.Filter.eq('ADM0_NAME', 'Pakistan'))


// 2. Load Sentinel-5P Carbon Monoxide (CO)
var co = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_CO")
          .filterDate('2024-01-01', '2024-12-30')
          .select('CO_column_number_density')
          .mean()
          .clip(AOI);

// 3. Visualization parameters
// CO levels in Karachi can be higher due to urban density
var band_viz = {
  min: 0.02401066265370383,
  max: 0.04467055941589457, 
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};

// 4. Display on Map
Map.addLayer(co, band_viz, 'Karachi Mean CO 2024');
Map.centerObject(AOI, 6); 

// 5. Export CO data to Drive
Export.image.toDrive({
  image: co,
  description: 'CO_Karachi_Mean_2024',
  folder: 'GEE',
  fileNamePrefix: 'Karachi_CO_2024',
  region: AOI.geometry(),
  scale: 1113,           
  maxPixels: 1e13
});

// --- LEGEND CODE ---
var legend = ui.Panel({
  style: {position: 'bottom-left', padding: '8px 15px'}
});

var legendTitle = ui.Label({
  value: 'CO Density: Karachi (mol/m²)',
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
    ui.Label(band_viz.min.toFixed(3), {margin: '4px 8px'}),
    ui.Label(
      ((band_viz.max + band_viz.min) / 2).toFixed(3),
      {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(band_viz.max.toFixed(3), {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});
legend.add(panelLabels);

Map.add(legend);
