//upload your ROI or shapefile 
//use FAO code for study area
//Use training data as the video shown



var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
.filterBounds(ROI)
.filterDate("2023-01-01", "2025-01-01")
.filterMetadata('CLOUD_COVER', 'less_than', 1)
.mean()
.clip(ROI)

// Map.addLayer(L8, {bands:["B5", "B4", "B3"]});

var training_points = Water.merge(Vegetation).merge(Agriculture).merge(Builtup_Area).merge(Barren_Land);
var training_data = L8.sampleRegions({collection:training_points, properties:['LC'], scale:30})
var classifier = ee.Classifier.smileCart()
var classifier = classifier.train({features:training_data, classProperty: 'LC', inputProperties:['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11']});
var classified_image = L8.classify(classifier)

var vegPalette = [
  'red',          // 1 Builtup
  'yellow',       // 2 BarrenLand
  '87ff2a',        // 3 Agriculture
  '006400',       // 4 (Dark Green hex code) Vegetation
  'blue'          // 5 Water
];

Map.addLayer(classified_image,{min: 1, max: 5, palette: vegPalette}, "Classified Image")

Export.image.toDrive({
  image: classified_image,
  description: 'LalMoni_LULC_01', // Filename in Drive
  folder: 'GEE',
  scale: 30,                                  // Landsat resolution
  region: ROI,                                // Your study area variable
  maxPixels: 1e13,                            // Standard limit for large exports
  fileFormat: 'GeoTIFF'
});
