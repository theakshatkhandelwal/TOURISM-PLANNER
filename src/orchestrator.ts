import { GeocodeService } from './services/geocode';
import { WeatherService } from './services/weather';
import { PlacesService } from './services/places';
import {
  PlanRequest,
  PlanResponse,
  QueryType,
  WeatherData,
  PlacesData,
} from './types';

export class TourismOrchestrator {
  private geocodeService: GeocodeService;
  private weatherService: WeatherService;
  private placesService: PlacesService;

  constructor() {
    this.geocodeService = new GeocodeService();
    this.weatherService = new WeatherService();
    this.placesService = new PlacesService();
  }

  /**
   * Main orchestration method - coordinates geocoding and child agents
   */
  async plan(request: PlanRequest): Promise<PlanResponse> {
    const { place, what } = request;

    // Step 1: Geocode the place
    const geocodeResult = await this.geocodeService.geocode(place);

    if (!geocodeResult.success) {
      return {
        success: false,
        place,
        message: "I don't know this place exists",
        error: geocodeResult.error || 'unknown_place',
      };
    }

    const coordinates = geocodeResult.coordinates!;
    const displayName = geocodeResult.displayName || place;

    // Step 2: Call child agents based on query type
    const promises: Promise<any>[] = [];
    const needsWeather = what === 'weather' || what === 'all';
    const needsPlaces = what === 'places' || what === 'all';

    if (needsWeather) {
      promises.push(this.weatherService.getWeather(coordinates));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (needsPlaces) {
      promises.push(this.placesService.getPlaces(coordinates));
    } else {
      promises.push(Promise.resolve(null));
    }

    const [weatherResult, placesResult] = await Promise.all(promises);

    // Step 3: Build response
    const weatherData: WeatherData | undefined = needsWeather
      ? (weatherResult as WeatherData)
      : undefined;
    const placesData: PlacesData | undefined = needsPlaces
      ? (placesResult as PlacesData)
      : undefined;

    const message = this.buildMessage(
      displayName,
      weatherData,
      placesData,
      what
    );

    return {
      success: true,
      place: displayName,
      message,
      data: {
        weather: weatherData,
        places: placesData,
      },
    };
  }

  private buildMessage(
    placeName: string,
    weather: WeatherData | undefined,
    places: PlacesData | undefined,
    what: QueryType
  ): string {
    const parts: string[] = [];
    
    // Extract just the city name (first part before comma)
    const cityName = placeName.split(',')[0].trim();

    if (weather && weather.success) {
      const temp = weather.temperature!;
      const rain = weather.precipitationProbability!;
      parts.push(
        `In ${cityName} it's currently ${temp}°C with a chance of ${rain}% to rain.`
      );
    }

    if (places && places.success && places.places) {
      const placeNames = places.places.map((p) => p.name).join('\n');
      if (what === 'all' && weather && weather.success) {
        parts.push(`And these are the places you can go:\n${placeNames}`);
      } else {
        parts.push(`In ${cityName} these are the places you can go, \n${placeNames}`);
      }
    }

    // Handle errors
    if (weather && !weather.success) {
      parts.push(`(Weather data unavailable)`);
    }

    if (places && !places.success) {
      parts.push(`(Places data unavailable)`);
    }

    return parts.join(' ');
  }
}

