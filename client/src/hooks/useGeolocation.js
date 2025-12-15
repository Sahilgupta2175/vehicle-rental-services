import { useState, useCallback } from 'react';

/**
 * Custom hook to get user's geolocation
 * @param {Object} options - Geolocation options
 * @returns {Object} - { location, error, loading, getLocation, clearError }
 */
const useGeolocation = (options = {}) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
    };

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError({
                code: 0,
                message: 'Geolocation is not supported by your browser'
            });
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
                setLoading(false);
            },
            (err) => {
                let errorMessage = 'Unable to retrieve your location';
                
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. Please check your device settings.';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                    default:
                        errorMessage = 'An unknown error occurred while getting your location.';
                }

                setError({
                    code: err.code,
                    message: errorMessage
                });
                setLoading(false);
            },
            defaultOptions
        );
    }, [defaultOptions.enableHighAccuracy, defaultOptions.timeout, defaultOptions.maximumAge]);

    return {
        location,
        error,
        loading,
        getLocation,
        clearError
    };
};

export default useGeolocation;
