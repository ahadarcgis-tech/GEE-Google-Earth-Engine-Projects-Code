var no2 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2")

var image = no2
          .filterDate ('2024-01-01' , '2024-12-30')
          .select('NO2_column_number_density')
          .mean()
          .clip(AOI)
var band_viz = {
  min: 0.0000505257276654164,
  max: 0.00011371533672913263,
  palette: ['black', 'blue', 'cyan', 'green', 'yellow', 'red']
};

Map.addLayer (image, band_viz)
Map.centerObject (AOI, 5)

Export.image.toDrive({
  image: image,
  description: 'NO2_Jan_May_2022',   // Name of the export task
  folder: 'GEE',                      // Optional: folder in your Drive
  fileNamePrefix: 'NO2_mean_2022',    // Optional: filename prefix
  region: AOI,                        // Area to export
  scale: 1000,                        // Resolution in meters (adjust as needed)
  maxPixels: 1e13                      // To avoid max pixel error
});

// 1. Create the legend panel
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// 2. Create the legend title
var legendTitle = ui.Label({
  value: 'No2 Column Density',
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend.add(legendTitle);

// 3. Create the color bar image
var lon = ee.Image.pixelLonLat().select('longitude');
var gradient = lon.multiply((band_viz.max - band_viz.min) / 100.0).add(band_viz.min);
var legendImage = gradient.visualize(band_viz);

// 4. Create the color bar display
var thumbnail = ui.Thumbnail({
  image: legendImage,
  params: {bbox: '0,0,100,10', dimensions: '200x20'},
  style: {padding: '1px', position: 'bottom-center'}
});
legend.add(thumbnail);

// 5. Create labels for min and max
var panelLabels = ui.Panel({
  widgets: [
    ui.Label(band_viz.min.toPrecision(3), {margin: '4px 8px'}),
    ui.Label(
      ((band_viz.max + band_viz.min) / 2).toPrecision(3),
      {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(band_viz.max.toPrecision(3), {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});
legend.add(panelLabels);

// 6. Add the legend to the map
Map.add(legend);
