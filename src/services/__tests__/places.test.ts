import { PlacesService } from '../places';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PlacesService', () => {
  let service: PlacesService;

  beforeEach(() => {
    service = new PlacesService();
    jest.clearAllMocks();
  });

  it('should successfully fetch places', async () => {
    const mockResponse = {
      data: {
        elements: [
          {
            type: 'node',
            tags: { name: 'Lalbagh', tourism: 'attraction' },
          },
          {
            type: 'node',
            tags: { name: 'Bangalore Palace', historic: 'palace' },
          },
        ],
      },
    };

    mockedAxios.create = jest.fn(() => ({
      post: jest.fn().mockResolvedValue(mockResponse),
    })) as any;

    const result = await service.getPlaces({
      latitude: 12.9716,
      longitude: 77.5946,
    });

    expect(result.success).toBe(true);
    expect(result.places?.length).toBeGreaterThan(0);
    expect(result.places?.[0].name).toBe('Lalbagh');
  });

  it('should deduplicate places by name', async () => {
    const mockResponse = {
      data: {
        elements: [
          {
            type: 'node',
            tags: { name: 'Lalbagh', tourism: 'attraction' },
          },
          {
            type: 'node',
            tags: { name: 'Lalbagh', leisure: 'park' },
          },
        ],
      },
    };

    mockedAxios.create = jest.fn(() => ({
      post: jest.fn().mockResolvedValue(mockResponse),
    })) as any;

    const result = await service.getPlaces({
      latitude: 12.9716,
      longitude: 77.5946,
    });

    expect(result.success).toBe(true);
    expect(result.places?.length).toBe(1);
  });

  it('should handle empty places result', async () => {
    const mockResponse = {
      data: {
        elements: [],
      },
    };

    mockedAxios.create = jest.fn(() => ({
      post: jest.fn().mockResolvedValue(mockResponse),
    })) as any;

    const result = await service.getPlaces({
      latitude: 12.9716,
      longitude: 77.5946,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('no_places_found');
  });
});

