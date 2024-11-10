class ShadowCoverageCalculator {
  constructor(buildingData, sidewalkSide, latitudestart, dayOfYear, solarTime) {
    this.buildingData = buildingData; // Array of objects with { height, distanceFromStart, lat&long}
    this.buildingData.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
    this.sidewalkSide = sidewalkSide; // Side of the sidewalk relative to the walking path, 'left' or 'right'
    this.latitude = latitudestart; // Latitude for shadow calculation
    this.dayOfYear = dayOfYear; // Day of the year (1 to 365)
    this.solarTime = solarTime; // Local solar time (decimal hours)
  }

  isShadowOnSidewalk(sunAzimuth, buildingAzimuth) {
    // Check if the sun's position (azimuth) aligns with sidewalk side
    const angleDifference = Math.abs(sunAzimuth - buildingAzimuth);
    if (this.sidewalkSide === 'left') {
      return angleDifference > 90 && angleDifference < 270;
    } else {
      return angleDifference <= 90 || angleDifference >= 270;
    }
  }

  calculateShadowCoverage() {
    let shadowCoveredDistance = 0;
    let totalDistance = 0;

    // Loop through each building along the path
    for (let i = 0; i < this.buildingData.length - 1; i++) {
      

      const building = this.buildingData[i];
      const nextBuilding = this.buildingData[i + 1];
      
      // Distance between the current building and the next building
      const segmentDistance = nextBuilding.distanceFromStart - building.distanceFromStart;
      totalDistance += segmentDistance;

      // Instantiate ShadowCalculator
      const shadowCalculatorInstance = new ShadowCalculator(this.latitude, this.dayOfYear, this.solarTime, building.height);
      const shadowLength = shadowCalculatorInstance.calculateShadowLength();

      // Check if the shadow length covers the sidewalk width and if it's on the sidewalk side
      const shadowCoversSidewalk = shadowLength >= 2;
      const shadowOnSidewalk = this.isShadowOnSidewalk(this.solarTime, building.buildingAzimuth);

      if (shadowCoversSidewalk && shadowOnSidewalk) {
        shadowCoveredDistance += segmentDistance;
      }
    }

    // Calculate percentage of total distance covered by shadow
    const shadowCoveragePercentage = (shadowCoveredDistance / totalDistance) * 100;
    return shadowCoveragePercentage.toFixed(2);
  }
}

// Example usage:





