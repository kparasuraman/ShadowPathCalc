class ShadowCoverageCalculator {
  constructor(buildingDataProcessor, routeType, latitudestart, dayOfYear, solarTime, sunAzimuth, buildingAzimuth) {
    // Retrieve the list of buildings for the specified route type
    this.buildings = buildingDataProcessor.getBuildingsByType(routeType);
    this.latitude = latitudestart;
    this.dayOfYear = dayOfYear;
    this.solarTime = solarTime;
    this.sunAzimuth = sunAzimuth;
    this.buildingAzimuth = buildingAzimuth;
  }

  isShadowOnSidewalk(sunAzimuth, buildingAzimuth, buildingSidewalkSide) {
    const angleDifference = Math.abs(sunAzimuth - buildingAzimuth);
    if (buildingSidewalkSide === 'left') {
      return angleDifference > 90 && angleDifference < 270;
    } else {
      return angleDifference <= 90 || angleDifference >= 270;
    }
  }

  calculateShadowCoverage() {
    let shadowCoveredDistance = 0;
    let totalDistance = 0;

    for (let i = 0; i < this.buildings.length - 1; i++) {
      const building = this.buildings[i];
      const nextBuilding = this.buildings[i + 1];

      const segmentDistance = nextBuilding.distanceFromStart - building.distanceFromStart;
      totalDistance += segmentDistance;

      const shadowCalculatorInstance = new ShadowCalculator(this.latitude, this.dayOfYear, this.solarTime, building.height);
      const shadowLength = shadowCalculatorInstance.calculateShadowLength();

      const shadowCoversSidewalk = shadowLength >= 2;
      const shadowOnSidewalk = this.isShadowOnSidewalk(this.sunAzimuth, this.buildingAzimuth, building.side);

      if (shadowCoversSidewalk && shadowOnSidewalk) {
        shadowCoveredDistance += segmentDistance;
      }
    }

    const shadowCoveragePercentage = totalDistance > 0 ? (shadowCoveredDistance / totalDistance) * 100 : 0;
    return shadowCoveragePercentage.toFixed(2);
  }
}