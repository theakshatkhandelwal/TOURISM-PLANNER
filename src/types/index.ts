export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResult {
  success: boolean;
  coordinates?: Coordinates;
  displayName?: string;
  error?: string;
}

export interface WeatherData {
  success: boolean;
  temperature?: number;
  precipitationProbability?: number;
  forecast?: string;
  error?: string;
}

export interface Place {
  name: string;
}

export interface PlacesData {
  success: boolean;
  places?: Place[];
  error?: string;
}

export type QueryType = 'weather' | 'places' | 'all';

export interface PlanRequest {
  place: string;
  what: QueryType;
}

export interface PlanResponse {
  success: boolean;
  place: string;
  message: string;
  data?: {
    weather?: WeatherData;
    places?: PlacesData;
  };
  error?: string;
}

