/**
 * Location Utilities
 * Provides functions for geospatial calculations and location processing
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of first point
 * @param {Number} lng1 - Longitude of first point
 * @param {Number} lat2 - Latitude of second point
 * @param {Number} lng2 - Longitude of second point
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Format distance for display
 * @param {Number} distance - Distance in kilometers
 * @returns {String} Formatted distance string
 */
const formatDistance = (distance) => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }
    if (distance < 10) {
        return `${distance.toFixed(1)} km`;
    }
    return `${Math.round(distance)} km`;
};

/**
 * Validate coordinates
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @returns {Boolean} True if coordinates are valid
 */
const validateCoordinates = (lat, lng) => {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

/**
 * Convert lat/lng to GeoJSON Point format
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @returns {Object} GeoJSON Point object
 */
const toGeoJSON = (lat, lng) => {
    return {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
    };
};

/**
 * Calculate bounding box for a given point and radius
 * @param {Number} lat - Center latitude
 * @param {Number} lng - Center longitude
 * @param {Number} radiusKm - Radius in kilometers
 * @returns {Object} Bounding box with min/max lat/lng
 */
const getBoundingBox = (lat, lng, radiusKm) => {
    const latDelta = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
    const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    
    return {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta
    };
};

/**
 * Sort array of items by distance from a point
 * @param {Array} items - Array of items with lat/lng properties
 * @param {Number} userLat - User's latitude
 * @param {Number} userLng - User's longitude
 * @returns {Array} Sorted array with distance property added
 */
const sortByDistance = (items, userLat, userLng) => {
    return items
        .map(item => {
            const itemLat = item.location?.lat || item.lat;
            const itemLng = item.location?.lng || item.lng;
            
            const distance = calculateDistance(userLat, userLng, itemLat, itemLng);
            
            return {
                ...item.toObject ? item.toObject() : item,
                distance,
                distanceFormatted: formatDistance(distance)
            };
        })
        .sort((a, b) => a.distance - b.distance);
};

module.exports = {
    calculateDistance,
    formatDistance,
    validateCoordinates,
    toGeoJSON,
    getBoundingBox,
    sortByDistance
};
