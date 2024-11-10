class BuildingDataProcessor {
    constructor(walkingRoutes, cyclingRoutes, drivingRoutes, routeMetadata) {
      this.walkingRoutes = walkingRoutes;
      this.cyclingRoutes = cyclingRoutes;
      this.drivingRoutes = drivingRoutes;
      this.routeMetadata = routeMetadata;
      this.walkingBuildings = [];
      this.cyclingBuildings = [];
      this.drivingBuildings = [];
    }
  
    async processAllRoutes() {
      await Promise.all([
        this.processRouteType('walking', this.walkingRoutes),
        this.processRouteType('cycling', this.cyclingRoutes),
        this.processRouteType('driving', this.drivingRoutes)
      ]);
    }
  
    async processRouteType(type, routes) {
      const buildings = [];
      
      for (const route of routes) {
        const routeBuildingData = await this.processRoute(route);
        buildings.push(...routeBuildingData.filter(building => building !== null));
      }
  
      switch (type) {
        case 'walking':
          this.walkingBuildings = buildings;
          break;
        case 'cycling':
          this.cyclingBuildings = buildings;
          break;
        case 'driving':
          this.drivingBuildings = buildings;
          break;
      }
    }
  
    async processRoute(routeCoordinates) {
      const buildingDataArray = [];
      let currentDistance = 0; // Initialize cumulative distance
  
      for (let i = 0; i < routeCoordinates.length - 1; i++) {
        const start = routeCoordinates[i];
        const end = routeCoordinates[i + 1];
  
        // Calculate the distance between start and end
        const segmentDistance = calculateDistance(start[1], start[0], end[1], end[0]);
        currentDistance += segmentDistance; // Update cumulative distance
  
        const [leftBuilding, rightBuilding] = await Promise.all([
          this.createBuildingObject(start, end, 'left', currentDistance),
          this.createBuildingObject(start, end, 'right', currentDistance)
        ]);
  
        if (leftBuilding) buildingDataArray.push(leftBuilding);
        if (rightBuilding) buildingDataArray.push(rightBuilding);
      }
  
      return buildingDataArray;
    }
  
    async checkForBuilding(lat, lon) {
      const query = `
        [out:json];
        (
          way["building"](around:15, ${lat}, ${lon});
        );
        out body geom;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.elements || data.elements.length === 0) {
          return null;
        }
  
        const building = data.elements[0];
        return {
          exists: true,
          height: building.tags?.height ? parseFloat(building.tags.height) : 
                 building.tags?.["building:levels"] ? parseFloat(building.tags["building:levels"]) * 3 : 
                 10,
          type: building.tags?.["building:type"] || building.tags?.building || "unknown"
        };
      } catch (error) {
        console.error("Error checking for building:", error);
        return null;
      }
    }
  
     async createBuildingObject(start, end, side, distanceAlongRoute) {
      // Calculate perpendicular offset (typical sidewalk width is ~2 meters)
      const bearing = Math.atan2(end[1] - start[1], end[0] - start[0]);
      const sidewalkWidth = 2; // meters
      const buildingSetback = 5; // meters from sidewalk to building
      const totalOffset = (sidewalkWidth + buildingSetback) / 111320; // convert to degrees (approximate)
  
      // Calculate offset direction based on side
      const offsetBearing = side === 'left' ? bearing - Math.PI / 2 : bearing + Math.PI / 2;
      
      // Calculate potential building location
      const latitude = start[1] + totalOffset * Math.sin(offsetBearing);
      const longitude = start[0] + totalOffset * Math.cos(offsetBearing);
  
      // Check if there's actually a building at this location
      const buildingData = await this.checkForBuilding(latitude, longitude);
      
      if (!buildingData) {
        return null;
      }
  
      return {
        latitude,
        longitude,
        height: buildingData.height,
        side,
        buildingType: buildingData.type,
        distanceFromStart: distanceAlongRoute, // Distance along the route
        distanceFromRoute: sidewalkWidth + buildingSetback,
        routeSegmentStart: start,
        routeSegmentEnd: end
      };
    }
  
    getAllBuildingsData() {
      return {
        walking: this.walkingBuildings,
        cycling: this.cyclingBuildings,
        driving: this.drivingBuildings
      };
    }
  
    getBuildingsByType(type) {
      switch (type) {
        case 'walking':
          return this.walkingBuildings;
        case 'cycling':
          return this.cyclingBuildings;
        case 'driving':
          return this.drivingBuildings;
        default:
          return [];
      }
    }
  }
  