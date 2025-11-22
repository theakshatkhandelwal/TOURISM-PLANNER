import axios, { AxiosInstance } from 'axios';
import { Coordinates, PlacesData, Place } from '../types';

export class PlacesService {
  private client: AxiosInstance;
  private readonly overpassUrl = 'https://overpass-api.de/api/interpreter';
  private readonly timeout = 30000; // 30 seconds for Overpass
  private readonly maxRetries = 2;
  private readonly maxPlaces = 5;

  constructor() {
    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Get tourist attractions using Overpass API
   */
  async getPlaces(
    coordinates: Coordinates,
    retryCount = 0
  ): Promise<PlacesData> {
    try {
      const query = this.buildOverpassQuery(coordinates);
      const response = await this.client.post(
        this.overpassUrl,
        `data=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.data || !response.data.elements) {
        return {
          success: false,
          error: 'places_data_unavailable',
        };
      }

      const places = this.extractPlaces(response.data.elements);

      if (places.length === 0) {
        return {
          success: false,
          error: 'no_places_found',
        };
      }

      return {
        success: true,
        places: places.slice(0, this.maxPlaces),
      };
    } catch (error: any) {
      // Retry on network errors
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        await this.delay(2000 * (retryCount + 1));
        return this.getPlaces(coordinates, retryCount + 1);
      }

      return {
        success: false,
        error: 'places_fetch_failed',
      };
    }
  }

  private buildOverpassQuery(coordinates: Coordinates): string {
    const { latitude, longitude } = coordinates;
    const radius = 10000; // 10km radius

    return `[out:json][timeout:25];
(
  node["tourism"](around:${radius},${latitude},${longitude});
  node["historic"](around:${radius},${latitude},${longitude});
  node["amenity"="museum"](around:${radius},${latitude},${longitude});
  node["leisure"="park"](around:${radius},${latitude},${longitude});
);
out body;`;
  }

  private extractPlaces(elements: any[]): Place[] {
    const placesMap = new Map<string, Place>();

    for (const element of elements) {
      if (element.type !== 'node' || !element.tags) {
        continue;
      }

      const name = element.tags.name || element.tags['name:en'];
      if (!name || name.trim() === '') {
        continue;
      }

      // Deduplicate by name
      if (!placesMap.has(name)) {
        placesMap.set(name, { name: name.trim() });
      }

      if (placesMap.size >= this.maxPlaces) {
        break;
      }
    }

    return Array.from(placesMap.values());
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

