import axios, { AxiosInstance } from 'axios';
import { Coordinates, WeatherData } from '../types';

export class WeatherService {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly timeout = 10000; // 10 seconds
  private readonly maxRetries = 2;

  constructor() {
    this.client = axios.create({
      timeout: this.timeout,
    });
  }

  /**
   * Get current weather and forecast for given coordinates
   */
  async getWeather(
    coordinates: Coordinates,
    retryCount = 0
  ): Promise<WeatherData> {
    try {
      const params = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        current: 'temperature_2m,precipitation_probability',
        forecast_days: 1,
      };

      const response = await this.client.get(this.baseUrl, { params });

      if (!response.data || !response.data.current) {
        return {
          success: false,
          error: 'weather_data_unavailable',
        };
      }

      const current = response.data.current;
      const temperature = current.temperature_2m;
      const precipitationProbability = current.precipitation_probability || 0;

      return {
        success: true,
        temperature: Math.round(temperature),
        precipitationProbability: Math.round(precipitationProbability),
        forecast: this.generateForecastSummary(
          temperature,
          precipitationProbability
        ),
      };
    } catch (error: any) {
      // Retry on network errors
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        await this.delay(1000 * (retryCount + 1));
        return this.getWeather(coordinates, retryCount + 1);
      }

      return {
        success: false,
        error: 'weather_fetch_failed',
      };
    }
  }

  private generateForecastSummary(
    temperature: number,
    precipitationProbability: number
  ): string {
    const temp = Math.round(temperature);
    const rain = Math.round(precipitationProbability);
    return `Currently ${temp}°C with a ${rain}% chance of rain.`;
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

