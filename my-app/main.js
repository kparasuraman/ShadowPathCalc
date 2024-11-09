import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
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
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});

// Vector source and layer for routes
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

// OpenRouteService API details
const apiKey = '5b3ce3597851110001cf62480c7b932376114d4cac551393de296382'; // Replace with your actual API key
const directionsUrl = 'https://api.openrouteservice.org/v2/directions/';
const geocodeUrl = 'https://api.openrouteservice.org/geocode/search';

// Elements
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const startSuggestions = document.getElementById('start-suggestions');
const endSuggestions = document.getElementById('end-suggestions');
const calculateButton = document.getElementById('calculate-button');
const errorDiv = document.getElementById('error-message');
const loadingDiv = document.getElementById('loading');
const routeList = document.getElementById('route-list');

// Show and clear error messages
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function clearError() {
  errorDiv.style.display = 'none';
}

function showLoading() {
  loadingDiv.style.display = 'block';
}

function hideLoading() {
  loadingDiv.style.display = 'none';
}

// Function to fetch coordinates using the geocoding API
async function fetchCoordinates(location) {
  try {
    const response = await fetch(
      `${geocodeUrl}?api_key=${apiKey}&text=${encodeURIComponent(location)}&size=1`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates;
      return [lon, lat];
    }
    throw new Error(`No coordinates found for "${location}"`);
  } catch (error) {
    throw new Error('Failed to fetch coordinates. Please check the location input.');
  }
}

// Function to fetch autocomplete suggestions from OpenRouteService
async function fetchAutocompleteSuggestions(query, inputElement, suggestionsElement) {
  if (query.trim().length === 0) {
    suggestionsElement.innerHTML = '';
    suggestionsElement.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(
      `${geocodeUrl}?api_key=${apiKey}&text=${encodeURIComponent(query)}&size=5`
    );
    const data = await response.json();

    suggestionsElement.innerHTML = '';
    if (data.features && data.features.length > 0) {
      data.features.forEach((feature) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = feature.properties.label;
        suggestionItem.addEventListener('click', () => {
          inputElement.value = feature.properties.label;
          suggestionsElement.innerHTML = '';
          suggestionsElement.style.display = 'none';
        });
        suggestionsElement.appendChild(suggestionItem);
      });
      suggestionsElement.style.display = 'block';
    } else {
      suggestionsElement.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
  }
}

// Function to fetch routes with completely different parameters
async function fetchRoutes(startCoords, endCoords) {
  const randomRouteParams = [
    {
      type: 'foot-walking',
      avoidPolygons: Math.random() > 0.5,  // 50% chance to avoid polygons
      avoidAreas: Math.random() > 0.5,     // 50% chance to avoid areas
      preferredRoute: ['shortest', 'fastest', 'recommended'][Math.floor(Math.random() * 3)], // Randomly choose route type
      maxAlternatives: Math.floor(Math.random() * 4) + 1, // Random number of alternatives (1 to 4)
      routeGeometry: Math.random() > 0.5 ? 'false' : 'true', // Random geometry calculation
      avoidRoads: Math.random() > 0.5 ? 'highways' : 'residential', // Random road type to avoid
      waypoints: `${startCoords[0] + Math.random() * 0.01},${startCoords[1] + Math.random() * 0.01}|${endCoords[0] + Math.random() * 0.01},${endCoords[1] + Math.random() * 0.01}`, // Add random waypoints
    },
    {
      type: 'cycling-regular',
      avoidPolygons: Math.random() > 0.5,
      avoidAreas: Math.random() > 0.5,
      preferredRoute: ['fastest', 'shortest', 'recommended'][Math.floor(Math.random() * 3)],
      maxAlternatives: Math.floor(Math.random() * 4) + 1,
      routeGeometry: Math.random() > 0.5 ? 'false' : 'true',
      avoidRoads: Math.random() > 0.5 ? 'highways' : 'residential',
      waypoints: `${startCoords[0] + Math.random() * 0.01},${startCoords[1] + Math.random() * 0.01}|${endCoords[0] + Math.random() * 0.01},${endCoords[1] + Math.random() * 0.01}`,
    },
    {
      type: 'driving-car',
      avoidPolygons: Math.random() > 0.5,
      avoidAreas: Math.random() > 0.5,
      preferredRoute: ['shortest', 'fastest', 'recommended'][Math.floor(Math.random() * 3)],
      maxAlternatives: Math.floor(Math.random() * 4) + 1,
      routeGeometry: Math.random() > 0.5 ? 'false' : 'true',
      avoidRoads: Math.random() > 0.5 ? 'highways' : 'residential',
      waypoints: `${startCoords[0] + Math.random() * 0.01},${startCoords[1] + Math.random() * 0.01}|${endCoords[0] + Math.random() * 0.01},${endCoords[1] + Math.random() * 0.01}`,
    }
  ];

  // Fetch routes with distinct parameters for each request
  const routeRequests = randomRouteParams.map((params) => {
    return fetch(
      `${directionsUrl}${params.type}?api_key=${apiKey}&start=${startCoords.join(',')}&end=${endCoords.join(',')}` +
      `&alternatives=true&geometry=${params.routeGeometry}&avoid_polygons=${params.avoidPolygons}` +
      `&avoid_areas=${params.avoidAreas}&preferred_route=${params.preferredRoute}` +
      `&max_alternatives=${params.maxAlternatives}&avoid_roads=${params.avoidRoads}` +
      `&waypoints=${params.waypoints}`
    );
  });

  try {
    const responses = await Promise.all(routeRequests);
    const routesData = await Promise.all(responses.map((response) => response.json()));

    // Clear the route list display before adding new routes
    routeList.innerHTML = '';

    // Loop through all routes and add them to the map
    routesData.forEach((data, index) => {
      if (data.features && data.features.length > 0) {
        data.features.forEach((selectedRoute, idx) => {
          const routeCoordinates = selectedRoute.geometry.coordinates.map((coord) =>
            fromLonLat(coord)
          );
          const routeLine = new LineString(routeCoordinates);
          const routeFeature = new Feature({ geometry: routeLine });

          // Generate a random color for each route to differentiate them
          const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

          // Style the route with different color and opacity based on index
          routeFeature.setStyle(
            new Style({
              stroke: new Stroke({
                color: randomColor, // Different color for each route
                width: 4 + idx, // Adjust width for better visual distinction
                opacity: 0.8 - idx * 0.2, // Gradual opacity decrease for visibility
              }),
            })
          );

          // Add route to map and UI
          vectorSource.addFeature(routeFeature);
          
          const routeItem = document.createElement('li');
          routeItem.textContent = `Route ${index + 1} (Alternative ${idx + 1})`;
          routeList.appendChild(routeItem);
        });
      } else {
        showError('No route found.');
      }
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    showError('Failed to fetch routes.');
  }
}

// Event listeners
startInput.addEventListener('input', (event) => {
  fetchAutocompleteSuggestions(event.target.value, startInput, startSuggestions);
});

endInput.addEventListener('input', (event) => {
  fetchAutocompleteSuggestions(event.target.value, endInput, endSuggestions);
});

// Add event listener for Calculate button
calculateButton.addEventListener('click', async () => {
  clearError();
  vectorSource.clear();

  const startLocation = startInput.value.trim();
  const endLocation = endInput.value.trim();

  if (!startLocation || !endLocation) {
    showError('Please enter both start and end locations.');
    return;
  }

  showLoading();

  try {
    const [startCoords, endCoords] = await Promise.all([
      fetchCoordinates(startLocation),
      fetchCoordinates(endLocation),
    ]);

    // Fetch multiple distinct routes with different parameters
    await fetchRoutes(startCoords, endCoords);
  } catch (error) {
    console.error('Error:', error);
    showError(error.message);
  } finally {
    hideLoading();
  }
});
