import * as Location from 'expo-location';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export async function getCurrentCoordinates(): Promise<GeoCoordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}
