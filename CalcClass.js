class ShadowCalculator {
    // Constructor to initialize input variables
    constructor(latitude, dayOfYear, solarTime, objectHeight) {
        this.latitude = latitude;       // Latitude in degrees
        this.dayOfYear = dayOfYear;     // Day of the year (1 for Jan 1, 365 for Dec 31)
        this.solarTime = solarTime;     // Local solar time in hours (e.g., 15.0 for 3 PM)
        this.objectHeight = objectHeight; // Height of the object casting the shadow in meters
    }

    // Method to calculate shadow length
    calculateShadowLength() {
        const solarDeclination = this.getSolarDeclination(this.dayOfYear);
        const hourAngle = this.getHourAngle(this.solarTime);
        const solarElevationAngle = this.getSolarElevationAngle(this.latitude, solarDeclination, hourAngle);

        // Calculate shadow length using L = h / tan(alpha)
        return this.objectHeight / Math.tan(this.degreesToRadians(solarElevationAngle));
    }

    // Method to calculate solar declination angle (in degrees)
    getSolarDeclination(dayOfYear) {
        return 23.44 * Math.sin(this.degreesToRadians((360 / 365) * (dayOfYear - 81)));
    }

    // Method to calculate hour angle (in degrees)
    getHourAngle(solarTime) {
        return 15 * (solarTime - 12);
    }

    // Method to calculate solar elevation angle (in degrees)
    getSolarElevationAngle(latitude, solarDeclination, hourAngle) {
        const latRad = this.degreesToRadians(latitude);
        const declRad = this.degreesToRadians(solarDeclination);
        const hourRad = this.degreesToRadians(hourAngle);

        // Solar elevation angle formula
        const sinElevation = Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourRad);
        return this.radiansToDegrees(Math.asin(sinElevation));
    }

    // Helper method to convert degrees to radians
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Helper method to convert radians to degrees
    radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
}

// Example usage:
const calculator = new ShadowCalculator(40.0, 172, 15.0, 2.0); // 40° latitude, June 21, 3 PM, 2-meter object
const shadowLength = calculator.calculateShadowLength();
console.log("Shadow Length:", shadowLength, "meters");
