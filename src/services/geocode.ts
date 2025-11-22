import axios, { AxiosInstance } from 'axios';
import { Coordinates, GeocodeResult } from '../types';

export class GeocodeService {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly timeout = 10000; // 10 seconds
  private readonly maxRetries = 2;

  constructor() {
    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'User-Agent': 'Tourism-Agent/1.0',
      },
    });
  }

  /**
   * Convert place name to coordinates using Nominatim API
   */
  async geocode(placeName: string, retryCount = 0): Promise<GeocodeResult> {
    try {
      const params = {
        q: placeName,
        format: 'json',
        limit: 1,
      };

      const response = await this.client.get(this.baseUrl, { params });

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: 'unknown_place',
        };
      }

      const location = response.data[0];
      return {
        success: true,
        coordinates: {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
        },
        displayName: location.display_name || placeName,
      };
    } catch (error: any) {
      // Retry on network errors
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        await this.delay(1000 * (retryCount + 1));
        return this.geocode(placeName, retryCount + 1);
      }

      return {
        success: false,
        error: 'geocoding_failed',
      };
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      (error.response && error.response.status >= 500)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

