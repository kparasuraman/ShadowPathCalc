import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import * as olExtent from 'ol/extent';
import { Azimuth } from './azimuth';


import { BuildingDataProcessor } from './BuildingData.js';
console.log(BuildingDataProcessor);
import { ShadowCoverage } from './ShadowCoverage.js';
console.log(ShadowCoverage);
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
const apiKey = '5b3ce3597851110001cf62480c7b932376114d4cac551393de296382';
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

// Initialize route storage arrays - each will be a 2D array where each element is [longitude, latitude]
let walkingRoutes = [];    // Store all walking routes
let cyclingRoutes = [];    // Store all cycling routes
let drivingRoutes = [];    // Store all driving routes
let routeMetadata = {      // Store metadata for each route
  walking: [],
  cycling: [],
  driving: []
};

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

// Function to store route data in appropriate arrays
function storeRouteData(routeType, coordinates, metadata) {
  switch (routeType) {
    case 'foot-walking':
      walkingRoutes.push(coordinates);
      routeMetadata.walking.push(metadata);
      break;
    case 'cycling-regular':
      cyclingRoutes.push(coordinates);
      routeMetadata.cycling.push(metadata);
      break;
    case 'driving-car':
      drivingRoutes.push(coordinates);
      routeMetadata.driving.push(metadata);
      break;
  }
}
// Using async/await with the module import
async function initialize() {
  const { BuildingDataProcessor } = await import('./BuildingData.js');
  
  // Now use BuildingDataProcessor here
  let processor = new BuildingDataProcessor(walkingRoutes, cyclingRoutes, drivingRoutes, routeMetadata);
  let buildingsWalking = processor.getBuildingsByType('walking');
  
  let buildingscycling = processor.getBuildingsByType('cycling');
  let buildingsdriving = processor.getBuildingsByType('driving');
}

initialize();  // Call initialize function to load and use BuildingDataProcessor
// Function to clear previous routes
function clearRoutes() {
  walkingRoutes = [];
  cyclingRoutes = [];
  drivingRoutes = [];
  routeMetadata = {
    walking: [],
    cycling: [],
    driving: []
  };
  vectorSource.clear();
  routeList.innerHTML = '';
}

// Function to fetch routes with completely different parameters
async function fetchRoutes(startCoords, endCoords) {
  clearRoutes();
  
  const randomRouteParams = [
    {
      type: 'foot-walking',
      avoidPolygons: Math.random() > 0.5,
      avoidAreas: Math.random() > 0.5,
      preferredRoute: ['shortest', 'fastest', 'recommended'][Math.floor(Math.random() * 3)],
      maxAlternatives: Math.floor(Math.random() * 4) + 1,
      routeGeometry: Math.random() > 0.5 ? 'false' : 'true',
      avoidRoads: Math.random() > 0.5 ? 'highways' : 'residential',
      waypoints: `${startCoords[0] + Math.random() * 0.01},${startCoords[1] + Math.random() * 0.01}|${endCoords[0] + Math.random() * 0.01},${endCoords[1] + Math.random() * 0.01}`,
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

  let allCoordinates = [];
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

    routesData.forEach((data, index) => {
      if (data.features && data.features.length > 0) {
        data.features.forEach((selectedRoute, idx) => {
          // Extract the route coordinates
          const routeCoordinates = selectedRoute.geometry.coordinates.map((coord) => [coord[0], coord[1]]);
          
          // Store route data
          storeRouteData(
            randomRouteParams[index].type,
            routeCoordinates,
            {
              summary: selectedRoute.properties.summary,
              distance: selectedRoute.properties.distance,
              duration: selectedRoute.properties.duration
            }
          );

          // Add coordinates to allCoordinates for map fitting
          allCoordinates = allCoordinates.concat(routeCoordinates);

          // Create and style route feature for map
          const mapCoordinates = routeCoordinates.map((coord) => fromLonLat(coord));
          const routeLine = new LineString(mapCoordinates);
          const routeFeature = new Feature({ geometry: routeLine });

          const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
          routeFeature.setStyle(
            new Style({
              stroke: new Stroke({
                color: randomColor,
                width: 4 + idx,
                opacity: 0.8 - idx * 0.2,
              }),
            })
          );

          vectorSource.addFeature(routeFeature);

          // Add route to list
          const routeItem = document.createElement('div');
          routeItem.textContent = `${randomRouteParams[index].type} Route ${idx + 1}: ${selectedRoute.properties.summary}`;
          routeList.appendChild(routeItem);
        });
      }
    });

    calculateAzimuth(startCoords, endCoords);
    const extent = olExtent.boundingExtent(allCoordinates);
    map.getView().fit(extent, { padding: [20, 20, 20, 20], duration: 1000 });

  } catch (error) {
    showError('Error fetching routes. Please try again.');
    console.error(error);
  } finally {
    hideLoading();
  }
}

// Event listener for calculating route on button click
calculateButton.addEventListener('click', async () => {
  clearError();
  showLoading();

  let startLocation = startInput.value;
  let endLocation = endInput.value;

  if (!startLocation || !endLocation) {
    showError('Please enter both start and end locations');
    hideLoading();
    return;
  }

  try {
    const startCoords = await fetchCoordinates(startLocation);
    const endCoords = await fetchCoordinates(endLocation);
    await fetchRoutes(startCoords, endCoords);
  } catch (error) {
    showError(error.message);
    hideLoading();
  }
});

// Event listeners for autocomplete suggestions
startInput.addEventListener('input', () => {
  fetchAutocompleteSuggestions(startInput.value, startInput, startSuggestions);
});

endInput.addEventListener('input', () => {
  fetchAutocompleteSuggestions(endInput.value, endInput, endSuggestions);
});
// Initialize and process the building data

async function calculateAzimuth(startCoords, endCoords) {
  let date = new Date();
  let hour = date.getHours();

  let azimuthCalculator = new Azimuth(startCoords[0], startCoords[1], endCoords[0], endCoords[1], date, hour);
  let sunAzimuth = azimuthCalculator.calculateSolarAzimuth(startCoords[0], startCoords[1], date, hour);
  let buildingAzimuth = azimuthCalculator.calculateBuildingAzimuth(startCoords[0], startCoords[1], endCoords[0], endCoords[1]);
  let solarTime = hour + (4 * (startCoords[1] - 15 * (date.getTimezoneOffset() / 60)) / 60); // approx. solar time

  console.log("Sun Azimuth:", sunAzimuth);
  console.log("Building Azimuth:", buildingAzimuth);
  console.log("Walking Routes:", walkingRoutes);
  console.log("Cycling Routes:", cyclingRoutes);
  console.log("Driving Routes:", drivingRoutes);
  console.log("Route Metadata:", routeMetadata);
  
  

  // Function to calculate and display shadow coverage for each route type
  async function calculateShadowCoverageForAllRoutes() {
    
    let shadowCalculator = new ShadowCoverage(
      walking,
      routeType,
      latitudestart,
      dayOfYear,
      solarTime,
      sunAzimuth,
      buildingAzimuth
    );
       
        const shadowCoverage = shadowCalculator.calculateShadowCoverage();
        console.log(`${routeType.charAt(0).toUpperCase() + routeType.slice(1)} route shadow coverage: ${shadowCoverage}%`);
      }
    
  
  console.log(calculateShadowCoverage());
}

function calculateShadowCoverage() {
  let shadowCoveredDistance = 0;
  let totalDistance = 0;
  
  
  // Now use BuildingDataProcessor here
  let processor = new BuildingDataProcessor(walkingRoutes, cyclingRoutes, drivingRoutes, routeMetadata);
  let buildingsWalking = processor.getBuildingsByType('walking');
  for (let i = 0; i < processor.getBuildingsByType('walking').length - 1; i++) {
    const building = buildingsWalking[i];
    const nextBuilding = buildingsWalking[i + 1];

    const segmentDistance = nextBuilding.distanceFromStart - building.distanceFromStart;
    totalDistance += segmentDistance;

    const shadowCalculatorInstance = new ShadowCalculator(start[0], date, solarTime, processor.getBuildingsByType('walking').height);
    const shadowLength = shadowCalculatorInstance.calculateShadowLength() + 2;

    const shadowCoversSidewalk = shadowLength >= 2;
    const shadowOnSidewalk = isShadowOnSidewalk(sunAzimuth, buildingAzimuth, processor.getBuildingsByType('walking').side);

    if (shadowCoversSidewalk && shadowOnSidewalk) {
      shadowCoveredDistance += segmentDistance;
    }
  }

  let shadowCoveragePercentage = totalDistance > 0 ? (shadowCoveredDistance / totalDistance) * 100 : 0;
  console.log(shadowCoveragePercentage.toFixed(2))
}
function isShadowOnSidewalk(sunAzimuth, buildingAzimuth, buildingSidewalkSide) {
    const angleDifference = Math.abs(sunAzimuth - buildingAzimuth);
    if (buildingSidewalkSide === 'left') {
      return angleDifference > 90 && angleDifference < 270;
    } else {
      return angleDifference <= 90 || angleDifference >= 270;
    }
  }