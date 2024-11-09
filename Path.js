// Initialize the map with OSM base layer
const map = new ol.Map({
  target: 'map', // ID of the map container element
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-73.9857, 40.7484]), // Example center (NYC)
    zoom: 14
  })
});

// Function to add GeoJSON data with a custom style to the map
function addLayerFromApi(url, style) {
  console.log('Fetching GeoJSON data from:', url);
  const layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: url,
      format: new ol.format.GeoJSON()
    }),
    style: style
  });
  map.addLayer(layer);
}

// Style for sidewalks
const sidewalkStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'blue',
    width: 2
  })
});

// Style for intersections
const intersectionStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({ color: 'red' })
  })
});

// Fetch and display sidewalks and intersections
addLayerFromApi('http://localhost:3000/sidewalks', sidewalkStyle);
addLayerFromApi('http://localhost:3000/intersections', intersectionStyle);

// Shadow Path Style Function
function shadowPathStyle(feature) {
  const shadowLength = feature.get('shadowLength') || 10; // Default shadow length if not provided
  const shadowAngle = feature.get('shadowAngle') || 0; // Default shadow angle (in degrees) if not provided
  console.log('Shadow Length:', shadowLength, 'Shadow Angle:', shadowAngle);

  // Calculate end point for shadow based on length and angle
  const coords = feature.getGeometry().getCoordinates();
  const start = coords[0];
  const angleRadians = shadowAngle * Math.PI / 180;
  const shadowEnd = [
    start[0] + shadowLength * Math.cos(angleRadians),
    start[1] + shadowLength * Math.sin(angleRadians)
  ];

  // Create shadow line
  const shadowLine = new ol.geom.LineString([start, shadowEnd]);

  // Style for the shadow
  return new ol.style.Style({
    geometry: shadowLine,
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black shadow
      width: 3,
      lineDash: [4, 6] // Dotted line to represent shadow
    })
  });
}

// Layer for shadow paths
const shadowLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'http://localhost:3000/shadowPaths', // Replace with actual API URL for shadow paths
    format: new ol.format.GeoJSON()
  }),
  style: shadowPathStyle // Apply dynamic shadow style function
});
map.addLayer(shadowLayer);

// Handle map clicks to log coordinate
map.on('click', function (evt) {
  const coordinate = ol.proj.toLonLat(evt.coordinate);
  console.log('Clicked coordinates:', coordinate);
});
