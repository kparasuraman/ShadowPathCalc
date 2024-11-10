const fetch = require('node-fetch'); // Import node-fetch

// Helper function to calculate distance between two coordinates in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * 
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Returns the distance in meters
}

class BuildingDataProcessor {
  constructor(routes) {
    this.routes = routes;
    this.walkingBuildings = [];
    this.cyclingBuildings = [];
    this.drivingBuildings = [];
    this.processRoutes();
  }

  // Main function to process routes and create building data
  async processRoutes() {
    for (const route of this.routes) {
      const routeType = this.getRouteType(route.index);
      const buildingDataArray = [];

      // Loop through each point in the route to create building objects
      for (let i = 0; i < route.routeCoordinates.length - 1; i++) {
        const start = route.routeCoordinates[i];
        const end = route.routeCoordinates[i + 1];

        // Fetch building data
        const leftBuilding = await this.createBuildingObject(start, end, 'left');
        const rightBuilding = await this.createBuildingObject(start, end, 'right');

        // Add both buildings to the array for the current route
        buildingDataArray.push(leftBuilding, rightBuilding);
      }

      // Store the processed building data based on the route type
      if (routeType === 'walking') {
        this.walkingBuildings = buildingDataArray;
      } else if (routeType === 'cycling') {
        this.cyclingBuildings = buildingDataArray;
      } else if (routeType === 'driving') {
        this.drivingBuildings = buildingDataArray;
      }
    }
  }

  // Method to determine the route type based on its index
  getRouteType(index) {
    switch (index) {
      case 0:
        return 'walking';
      case 1:
        return 'cycling';
      case 2:
        return 'driving';
      default:
        return 'unknown';
    }
  }

  // Fetch building height from OpenStreetMap using Overpass API
  async fetchBuildingHeight(lat, lon) {
    const query = `
      [out:json];
      (
        node(around:10, ${lat}, ${lon});
        way(around:10, ${lat}, ${lon});
        relation(around:10, ${lat}, ${lon});
      );
      out body;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const building = data.elements.find(element => element.tags && element.tags.height);
      if (building && building.tags.height) {
        return parseFloat(building.tags.height); // Return the height if available
      }
      return 50; // Default height if no height is found
    } catch (error) {
      console.error("Error fetching building height:", error);
      return 50; // Default height on error
    }
  }

  // Create a building object on the left or right side of the given segment
  async createBuildingObject(start, end, side) {
    // Fetch building height from OpenStreetMap
    const height = await this.fetchBuildingHeight(start[1], start[0]); // OSM uses [lat, lon], so swap

    // Calculate building position relative to the route segment using perpendicular offset
    const offsetDistance = 0.0001; // Small distance for visualization, can be adjusted
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];

    // Determine perpendicular offset direction
    const offsetX = (side === 'left' ? -dy : dy) * offsetDistance;
    const offsetY = (side === 'left' ? dx : -dx) * offsetDistance;

    // Calculate new latitude and longitude for the building
    const latitude = start[1] + offsetY;
    const longitude = start[0] + offsetX;

    // Calculate the distance from the start point to the building
    const distanceFromStart = calculateDistance(start[1], start[0], latitude, longitude);

    // Create the building object
    return {
      latitude: latitude,
      longitude: longitude,
      height: height,
      side: side,
      distanceFromStart: distanceFromStart, // Add distance from start to the building
    };
  }

  // Method to get all processed buildings data
  getAllBuildingsData() {
    return {
      walking: this.walkingBuildings,
      cycling: this.cyclingBuildings,
      driving: this.drivingBuildings,
    };
  }
}

// Example usage
const allRoutes = [
  // Your route data goes here
];
const buildingDataProcessor = new BuildingDataProcessor(allRoutes);
buildingDataProcessor.processRoutes().then(() => {
  const allBuildingsData = buildingDataProcessor.getAllBuildingsData();
  console.log('Walking Buildings:', allBuildingsData.walking);
  console.log('Cycling Buildings:', allBuildingsData.cycling);
  console.log('Driving Buildings:', allBuildingsData.driving);
});
