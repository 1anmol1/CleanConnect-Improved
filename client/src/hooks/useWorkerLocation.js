import { useState, useEffect } from 'react';

// A custom hook to get the user's current geolocation.
// For development, it defaults to a simulated location near Kothrud, Pune.
const useWorkerLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if the Geolocation API is available in the browser
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocation({ lat: 18.509, lng: 73.803 }); // Fallback to mock location
      setLoading(false);
      return;
    }

    // Request the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // On success, update the state with the real coordinates
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // If the user denies permission or an error occurs, use the mock location
        setError(`Geolocation error: ${err.message}. Using a simulated location.`);
        setLocation({ lat: 18.509, lng: 73.803 }); // Mock location near Karve Road, Kothrud
        setLoading(false);
      }
    );
  }, []); // Empty dependency array ensures this runs only once

  return { location, loading, error };
};

export default useWorkerLocation;