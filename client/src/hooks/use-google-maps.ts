import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface GoogleMapsConfig {
  apiKey: string;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: config } = useQuery<GoogleMapsConfig>({
    queryKey: ["/api/google-maps-config"],
  });

  useEffect(() => {
    if (config?.apiKey && !window.google && !isLoading) {
      setIsLoading(true);
      loadGoogleMapsScript(config.apiKey);
    }
  }, [config, isLoading]);

  const loadGoogleMapsScript = (apiKey: string) => {
    // Set up the callback function
    window.initGoogleMaps = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    // Create and append the script
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.onerror = () => {
      setIsLoading(false);
      console.error("Failed to load Google Maps script");
    };

    document.head.appendChild(script);
  };

  return {
    isLoaded: isLoaded && !!window.google,
    isLoading,
    google: window.google,
  };
}

export function useGeocoding() {
  const { google, isLoaded } = useGoogleMaps();

  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    if (!isLoaded || !google) {
      throw new Error("Google Maps not loaded");
    }

    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  const getCurrentLocation = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        }
      );
    });
  };

  return {
    geocodeAddress,
    getCurrentLocation,
    isLoaded,
  };
}