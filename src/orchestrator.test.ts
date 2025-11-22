import { TourismOrchestrator } from './orchestrator';
import { GeocodeService } from './services/geocode';
import { WeatherService } from './services/weather';
import { PlacesService } from './services/places';

jest.mock('./services/geocode');
jest.mock('./services/weather');
jest.mock('./services/places');

describe('TourismOrchestrator', () => {
  let orchestrator: TourismOrchestrator;
  let mockGeocodeService: jest.Mocked<GeocodeService>;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockPlacesService: jest.Mocked<PlacesService>;

  beforeEach(() => {
    orchestrator = new TourismOrchestrator();
    mockGeocodeService = orchestrator['geocodeService'] as jest.Mocked<GeocodeService>;
    mockWeatherService = orchestrator['weatherService'] as jest.Mocked<WeatherService>;
    mockPlacesService = orchestrator['placesService'] as jest.Mocked<PlacesService>;
  });

  it('should return error for unknown place', async () => {
    mockGeocodeService.geocode.mockResolvedValue({
      success: false,
      error: 'unknown_place',
    });

    const result = await orchestrator.plan({
      place: 'NonExistentPlace',
      what: 'all',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("I don't know this place exists");
    expect(result.error).toBe('unknown_place');
  });

  it('should return weather only', async () => {
    mockGeocodeService.geocode.mockResolvedValue({
      success: true,
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      displayName: 'Bangalore',
    });

    mockWeatherService.getWeather.mockResolvedValue({
      success: true,
      temperature: 24,
      precipitationProbability: 35,
      forecast: 'Currently 24°C with a 35% chance of rain.',
    });

    const result = await orchestrator.plan({
      place: 'Bangalore',
      what: 'weather',
    });

    expect(result.success).toBe(true);
    expect(result.data?.weather?.success).toBe(true);
    expect(result.message).toContain('24°C');
    expect(result.message).toContain('35%');
  });

  it('should return places only', async () => {
    mockGeocodeService.geocode.mockResolvedValue({
      success: true,
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      displayName: 'Bangalore',
    });

    mockPlacesService.getPlaces.mockResolvedValue({
      success: true,
      places: [
        { name: 'Lalbagh' },
        { name: 'Bangalore Palace' },
      ],
    });

    const result = await orchestrator.plan({
      place: 'Bangalore',
      what: 'places',
    });

    expect(result.success).toBe(true);
    expect(result.data?.places?.success).toBe(true);
    expect(result.message).toContain('Lalbagh');
  });

  it('should return both weather and places', async () => {
    mockGeocodeService.geocode.mockResolvedValue({
      success: true,
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      displayName: 'Bangalore',
    });

    mockWeatherService.getWeather.mockResolvedValue({
      success: true,
      temperature: 24,
      precipitationProbability: 35,
      forecast: 'Currently 24°C with a 35% chance of rain.',
    });

    mockPlacesService.getPlaces.mockResolvedValue({
      success: true,
      places: [
        { name: 'Lalbagh' },
        { name: 'Bangalore Palace' },
      ],
    });

    const result = await orchestrator.plan({
      place: 'Bangalore',
      what: 'all',
    });

    expect(result.success).toBe(true);
    expect(result.data?.weather?.success).toBe(true);
    expect(result.data?.places?.success).toBe(true);
    expect(result.message).toContain('24°C');
    expect(result.message).toContain('Lalbagh');
  });
});

