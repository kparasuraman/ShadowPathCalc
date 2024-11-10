class BuildingHeightCollector {
  constructor(routes) {
    this.routes = routes; // Array of routes (each route is an array of coordinates)
    this.buildingsByRoute = []; // Array to store buildings for each route
  }

  async collectBuildingData() {
    // Loop through each route and collect building data
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const buildings = [];

      // Loop through each point in the route and collect building data for the right side
      for (let j = 0; j < route.length; j++) {
        const point = route[j];
        const rightSideCoord = this.getRightSideCoordinate(point); // Function to get right-side coordinates

        // Fetch building data at this coordinate (mock API or real API for height data)
        const building = await this.getBuildingHeight(rightSideCoord);
        if (building) {
          buildings.push(building);
        }
      }

      // After collecting for the route, store it in the buildingsByRoute array
      this.buildingsByRoute.push(buildings);
    }
  }

  async getBuildingHeight(coordinate) {
    // Mock function to fetch building data (you can replace this with a real API call)
    // Assuming we fetch building height, lat, and long from some API
    const height = Math.random() * 100;  // Example height
    const latitude = coordinate[0];
    const longitude = coordinate[1];
    return { height, latitude, longitude }; // Return building object
  }

  getRightSideCoordinate(point) {
    // Logic to calculate the right side coordinate of the person walking along the route
    // This function should be implemented to calculate the right-side coordinates
    // based on the route geometry (e.g., a walking path or line).
    const offset = 0.0001; // Small offset to simulate right side of the route
    return [point[0] + offset, point[1]];
  }
}

// Example usage
const routes = [
  [
    [51.5074, -0.1278],  // Start of Route 1
    [51.5075, -0.1277],  // Next point on Route 1
    // more points...
  ],
  [
    [51.5084, -0.1288],  // Start of Route 2
    [51.5085, -0.1287],  // Next point on Route 2
    // more points...
  ],
  [
    [51.5094, -0.1298],  // Start of Route 3
    [51.5095, -0.1297],  // Next point on Route 3
    // more points...
  ]
];

const collector = new BuildingHeightCollector(routes);
collector.collectBuildingData().then(() => {
  console.log(collector.buildingsByRoute); // Array of buildings for each route
});
