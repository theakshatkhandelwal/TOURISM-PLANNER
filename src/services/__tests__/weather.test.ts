import { WeatherService } from '../weather';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    service = new WeatherService();
    jest.clearAllMocks();
  });

  it('should successfully fetch weather data', async () => {
    const mockResponse = {
      data: {
        current: {
          temperature_2m: 24.5,
          precipitation_probability: 35,
        },
      },
    };

    mockedAxios.create = jest.fn(() => ({
      get: jest.fn().mockResolvedValue(mockResponse),
    })) as any;

    const result = await service.getWeather({
      latitude: 12.9716,
      longitude: 77.5946,
    });

    expect(result.success).toBe(true);
    expect(result.temperature).toBe(25); // rounded
    expect(result.precipitationProbability).toBe(35);
  });

  it('should handle missing weather data', async () => {
    const mockResponse = { data: {} };

    mockedAxios.create = jest.fn(() => ({
      get: jest.fn().mockResolvedValue(mockResponse),
    })) as any;

    const result = await service.getWeather({
      latitude: 12.9716,
      longitude: 77.5946,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('weather_data_unavailable');
  });
});

