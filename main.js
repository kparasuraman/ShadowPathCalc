import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';

// Initialize the map
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([0, 0]), // Initial center of the map
    zoom: 2,
  }),
});

// Create a vector source to hold the route data
const vectorSource = new VectorSource();

// Create a vector layer to display the route on the map
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

// OpenRouteService API URL
const apiUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking';

// Add your OpenRouteService API key here
const apiKey = '5b3ce3597851110001cf62480c7b932376114d4cac551393de296382'; // Use your actual API key

// Function to show an error message
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Function to clear the error message
function clearError() {
  const errorDiv = document.getElementById('error-message');
  errorDiv.style.display = 'none';
}

// Function to handle the calculation of multiple walking routes
function calculateRoutes() {
  const startLocation = document.getElementById('start').value.trim();
  const endLocation = document.getElementById('end').value.trim();

  if (!startLocation || !endLocation) {
    showError('Please enter both start and end locations.');
    return;
  }

  clearError();

  // Convert locations to geocode coordinates (Example: using OpenRouteService's geocode endpoint)
  // For simplicity, let's assume we have hardcoded coordinates for testing:
  
  // Example coordinates for New York (start) and Los Angeles (end)
  const startCoordinates = [-74.006, 40.7128]; // New York
  const endCoordinates = [-118.2437, 34.0522]; // Los Angeles

  // Example additional start and end points (for multiple routes)
  const additionalRoutes = [
    { start: [-73.935242, 40.73061], end: [-74.170053, 44.052235] }, // Route 2
    { start: [-73.9675, 40.748], end: [-74.255, 44.055] }, // Route 3
  ];

  // Combine the initial route with additional routes
  const allRoutes = [
    { start: startCoordinates, end: endCoordinates },
    ...additionalRoutes,
  ];

  // Clear any existing routes
  vectorSource.clear();

  // Request multiple routes
  Promise.all(
    allRoutes.map((route) => {
      return fetch(
        ${apiUrl}?api_key=${apiKey}&start=${route.start.join(',')}&end=${route.end.join(',')}
      ).then((response) => response.json());
    })
  )
    .then((responses) => {
      responses.forEach((data, index) => {
        if (data.features && data.features.length > 0) {
          // Loop through the returned routes
          data.features.forEach((routeFeature) => {
            const routeGeometry = routeFeature.geometry;

            // Ensure coordinates are valid and correctly transformed
            const routeCoordinates = routeGeometry.coordinates.map((coord) => fromLonLat(coord));

            // Create a LineString geometry for the route
            const route = new LineString(routeCoordinates);

            // Create a route feature to represent the route
            const routeFeatureInstance = new Feature({
              geometry: route,
            });

            // Style each route (with a different color for each route)
            routeFeatureInstance.setStyle(
              new Style({
                stroke: new Stroke({
                  color: hsl(${(index * 120) % 360}, 100%, 50%), // Cycle through colors
                  width: 4,
                }),
              })
            );

            // Add the route feature to the vector source
            vectorSource.addFeature(routeFeatureInstance);
          });
        } else {
          showError(No routes found for route ${index + 1}.);
        }
      });

      // Optionally, zoom the map to fit all the routes
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
    })
    .catch((error) => {
      console.error('Error calculating routes:', error);
      showError('An error occurred while calculating the routes.');
    });
}

// Event listener for the "Calculate Routes" button
document.getElementById('calculate-button').addEventListener('click', calculateRoutes); 