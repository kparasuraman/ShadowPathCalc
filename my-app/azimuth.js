// azimuth.js
export class Azimuth {
  constructor(startLat, startLon, endLat, endLon, date, timeOfDay) {
    this.startLat = startLat;
    this.startLon = startLon;
    this.endLat = endLat;
    this.endLon = endLon;
    this.date = date;
    this.timeOfDay = timeOfDay;
  }

   // Method to calculate the solar azimuth angle
   calculateSolarAzimuth(startLat, startLon,date, timeOfDay ) {
    // Convert latitude and longitude to radians
    const latRad = startLat * (Math.PI / 180);
    const lonRad = startLon * (Math.PI / 180);
    
    // Calculate day of the year (Julian day)
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Approximate solar declination angle (in radians)
    const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
    const declinationRad = declination * (Math.PI / 180);
    
    // Calculate the hour angle (in radians)
    const solarTime = timeOfDay + (4 * (startLon - 15 * (this.date.getTimezoneOffset() / 60)) / 60); // approx. solar time
    const hourAngle = (solarTime - 12) * 15 * (Math.PI / 180); // convert to radians

    // Solar azimuth formula
    const solarAzimuthRad = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(latRad) - Math.tan(declinationRad) * Math.cos(latRad)
    );

    // Convert solar azimuth from radians to degrees
    const sunAzimuth = (solarAzimuthRad * (180 / Math.PI) + 360) % 360;
    
    return sunAzimuth;
  }

  // Method to calculate the building azimuth angle based on OpenLayers data
  calculateBuildingAzimuth(startLat, startLon, endLat, endLon,date,timeOfDay) {
      const deltaLon = endLon - startLon;
      const deltaLat = endLat - startLat;
  
      const angleRad = Math.atan2(deltaLon, deltaLat);
      const buildingAzimuth = (angleRad * (180 / Math.PI) + 360) % 360;
  
      return buildingAzimuth;
    }
}

