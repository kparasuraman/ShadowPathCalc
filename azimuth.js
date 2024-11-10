class Azimuth {
    constructor(latitude, longitude, date, timeOfDay) {
      this.latitude = latitude;
      this.longitude = longitude;
      this.date = date; // Date object for the current date and season
      this.timeOfDay = timeOfDay; // Time in hours (decimal format, e.g., 13.5 for 1:30 PM)
    }
  
    // Method to calculate the solar azimuth angle
    calculateSolarAzimuth() {
      // Convert latitude and longitude to radians
      const latRad = this.latitude * (Math.PI / 180);
      
      // Calculate day of the year (Julian day)
      const start = new Date(this.date.getFullYear(), 0, 0);
      const diff = this.date - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      // Approximate solar declination angle (in radians)
      const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
      const declinationRad = declination * (Math.PI / 180);
      
      // Calculate the hour angle (in radians)
      const solarTime = this.timeOfDay + (4 * (this.longitude - 15 * (this.date.getTimezoneOffset() / 60)) / 60); // approx. solar time
      const hourAngle = (solarTime - 12) * 15 * (Math.PI / 180); // convert to radians
  
      // Solar azimuth formula
      const solarAzimuthRad = Math.atan2(
        Math.sin(hourAngle),
        Math.cos(hourAngle) * Math.sin(latRad) - Math.tan(declinationRad) * Math.cos(latRad)
      );
  
      // Convert solar azimuth from radians to degrees
      const sunAzimuthDeg = (solarAzimuthRad * (180 / Math.PI) + 360) % 360;
      
      return sunAzimuthDeg;
    }
  
    // Method to calculate the building azimuth angle based on OpenLayers data
    calculateBuildingAzimuth(start, end) {
        const deltaLon = end.lon - start.lon;
        const deltaLat = end.lat - start.lat;
    
        const angleRad = Math.atan2(deltaLon, deltaLat);
        const buildingAzimuth = (angleRad * (180 / Math.PI) + 360) % 360;
    
        return buildingAzimuth;
      }
  }
  
  // Example usage:
const latitude = 40.7128;  // Example latitude
const longitude = -74.0060; // Example longitude
const date = new Date(); // Current date
const timeOfDay = 14.5; // Example time in hours (2:30 PM)

// Instantiate Azimuth calculator
const azimuthCalculator = new Azimuth(startLat, startLon, endLat, endLon, date, timeOfDay);

// Calculate solar azimuth
const sunAzimuth = azimuthCalculator.calculateSolarAzimuth(date, timeOfDay);
console.log(`Solar Azimuth Angle: ${solarAzimuth}°`);

// Example coordinates for building and sidewalk from OpenLayers

// Calculate building azimuth
const buildingAzimuth = azimuthCalculator.calculateBuildingAzimuth(startLat, startLon, endLat, endLon);
console.log(`Building Azimuth Angle: ${buildingAzimuth}°`);
  