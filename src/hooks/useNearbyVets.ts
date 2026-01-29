import { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VetLocation {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  mapUrl: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

function haversineDistance(a: Coordinates, b: Coordinates) {
  const R = 6371; // km
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const x = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

export function useNearbyVets() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [vets, setVets] = useState<VetLocation[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVets = useCallback(async (latitude: number, longitude: number) => {
    try {
      setIsLocating(true);
      const aroundMeters = 8000;
      const query = `[out:json][timeout:25];
        node(around:${aroundMeters},${latitude},${longitude})["amenity"="veterinary"];
        out body 12;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Unable to reach vet directory');
      }
      const payload = await response.json();
      const elements = payload?.elements ?? [];
      const formatted: VetLocation[] = elements.map((element: any) => {
        const distance = haversineDistance(
          { latitude, longitude },
          { latitude: element.lat, longitude: element.lon }
        );
        const name = element.tags?.name || 'Local vet';
        const street = element.tags?.['addr:street'] || '';
        const city = element.tags?.['addr:city'] || element.tags?.['addr:town'] || '';
        const address = [street, city].filter(Boolean).join(', ') || 'Address unavailable';
        return {
          id: String(element.id),
          name,
          address,
          distanceKm: Number(distance.toFixed(1)),
          latitude: element.lat,
          longitude: element.lon,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${element.lat},${element.lon}`,
        };
      });

      formatted.sort((a, b) => a.distanceKm - b.distanceKm);
      setVets(formatted.slice(0, 5));
      setError(formatted.length ? null : 'No vets found nearby yet.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to lookup vets right now.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Location is not supported on this device.');
      toast({
        title: 'Location unavailable',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchVets(latitude, longitude);
      },
      (geoError) => {
        setIsLocating(false);
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Unable to read your location.';
        setError(message);
        toast({
          title: 'Need location access',
          description: message,
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, [fetchVets]);

  return {
    coords,
    vets,
    isLocating,
    locationError: error,
    requestLocation,
    hasRequested: coords !== null || vets.length > 0 || !!error,
  };
}
