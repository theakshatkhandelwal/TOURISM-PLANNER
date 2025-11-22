import { GeocodeService } from '../geocode';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeocodeService', () => {
  let service: GeocodeService;

  beforeEach(() => {
    service = new GeocodeService();
    jest.clearAllMocks();
  });

  it('should successfully geocode a valid place', async () => {
    const mockResponse = {
      data: [
        {
          lat: '12.9716',
          lon: '77.5946',
          display_name: 'Bangalore, Karnataka, India',
        },
      ],
    };

    mockedAxios.create = jest.fn(() => ({
      get: jest.fn().mockResolvedValue(mockResponse),
    })) as any;

    const result = await service.geocode('Bangalore');

    expect(result.success).toBe(true);
    expect(result.coordinates?.latitude).toBe(12.9716);
    expect(result.coordinates?.longitude).toBe(77.5946);
  });

  it('should return unknown_place for invalid place', async () => {
    const mockResponse = { data: [] };

    mockedAxios.create = jest.fn(() => ({
      get: jest.fn().mockResolvedValue(mockResponse),
    })) as any;

    const result = await service.geocode('NonExistentPlace12345');

    expect(result.success).toBe(false);
    expect(result.error).toBe('unknown_place');
  });
});

