class ShadowCoverageCalculator {
  constructor(buildingData, sidewalkWidth, sidewalkSide) {
    this.buildingData = buildingData; // Array of objects with { height, distanceFromStart, buildingAzimuth }
    this.sidewalkWidth = 2; // Width of the sidewalk
    this.sidewalkSide = sidewalkSide; // Side of the sidewalk relative to the walking path, 'left' or 'right'
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

 // Method to calculate the percentage of distance covered by shadow along the path
 calculateShadowCoverage(sunAngle, sunAzimuth) {
  let shadowCoveredDistance = 0;
  let totalDistance = 0;

  // Loop through each building along the path
  for (let i = 0; i < this.buildingData.length - 1; i++) {
    const building = this.buildingData[i];
    const nextBuilding = this.buildingData[i + 1];
    
    // Distance between the current building and the next building
    const segmentDistance = nextBuilding.distanceFromStart - building.distanceFromStart;
    totalDistance += segmentDistance;

    // Calculate shadow length for the current building using an external shadowCalculator method
    const shadowLength = ShadowCalculator(building.height, sunAngle);

    // Check if the shadow length covers the sidewalk width and if it's on the sidewalk side
    const shadowCoversSidewalk = shadowLength >= this.sidewalkWidth;
    const shadowOnSidewalk = this.isShadowOnSidewalk(sunAzimuth, building.buildingAzimuth);

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
const buildingData = [
  { height: 20, distanceFromStart: 0 },
  { height: 15, distanceFromStart: 50 },
  { height: 10, distanceFromStart: 100 },
  { height: 25, distanceFromStart: 150 }
];
const sidewalkWidth = 3; // Assume an average sidewalk width of 3 meters
const sunAngle = 45; // Sun angle in degrees

// Initialize the calculator
const calculator = new ShadowCoverageCalculator(buildingData, sidewalkWidth);

// Calculate shadow coverage
const shadowCoverage = calculator.calculateShadowCoverage(sunAngle);

console.log(`Shadow coverage percentage: ${shadowCoverage}%`);
