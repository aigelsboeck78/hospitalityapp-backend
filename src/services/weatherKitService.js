import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WeatherKitService {
    constructor() {
        // WeatherKit configuration
        this.teamId = '48PU9G8Y37'; // Your Apple Developer Team ID
        this.serviceId = 'com.alexanderigelsboeck.vacation-rental-hospitality'; // Your bundle identifier
        this.keyId = 'D26635V35Z'; // Key ID from certificate filename
        this.baseURL = 'https://weatherkit.apple.com/api/v1';
        
        // Schladming, Austria coordinates
        this.defaultLocation = {
            latitude: 47.3928,
            longitude: 13.6863
        };
        
        // Load the private key
        try {
            const keyPath = path.join(__dirname, '../../certificates/AuthKey_D26635V35Z.p8');
            this.privateKey = fs.readFileSync(keyPath, 'utf8');
        } catch (error) {
            console.error('Failed to load WeatherKit private key:', error);
            this.privateKey = null;
        }
    }

    /**
     * Generate JWT token for WeatherKit authentication
     */
    generateToken() {
        if (!this.privateKey) {
            throw new Error('WeatherKit private key not available');
        }

        const now = Math.floor(Date.now() / 1000);
        
        const payload = {
            iss: this.teamId,
            iat: now,
            exp: now + 3600, // 1 hour expiration
            sub: this.serviceId
        };

        const header = {
            alg: 'ES256',
            kid: this.keyId
        };

        return jwt.sign(payload, this.privateKey, { 
            algorithm: 'ES256',
            header 
        });
    }

    /**
     * Get current weather and forecast from WeatherKit
     */
    async getWeather(latitude = null, longitude = null) {
        try {
            // Use provided coordinates or default to Schladming
            const lat = latitude || this.defaultLocation.latitude;
            const lng = longitude || this.defaultLocation.longitude;

            const token = this.generateToken();
            
            const response = await axios.get(
                `${this.baseURL}/weather/en/${lat}/${lng}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Apple-Weather-Unit': 'metric'
                    },
                    params: {
                        dataSets: 'currentWeather,forecastDaily,forecastHourly',
                        timezone: 'Europe/Vienna'
                    },
                    timeout: 10000
                }
            );

            return this.formatWeatherData(response.data, lat, lng);
        } catch (error) {
            console.error('WeatherKit API error:', error.response?.data || error.message);
            
            // Return mock data as fallback
            return this.getMockWeatherData();
        }
    }

    /**
     * Format WeatherKit response data to match our app structure
     */
    formatWeatherData(data, latitude, longitude) {
        const current = data.currentWeather;
        const dailyForecast = data.forecastDaily?.days || [];
        const hourlyForecast = data.forecastHourly?.hours || [];

        return {
            location: `Schladming, Austria`,
            coordinates: { latitude, longitude },
            current: {
                temperature: Math.round(current.temperature),
                description: this.getConditionDescription(current.conditionCode),
                iconCode: current.conditionCode,
                humidity: Math.round(current.humidity * 100),
                windSpeed: Math.round(current.windSpeed * 3.6), // Convert m/s to km/h
                windDirection: current.windDirection,
                pressure: Math.round(current.pressureSeaLevel),
                visibility: Math.round(current.visibility / 1000), // Convert m to km
                visibilityDescription: this.getVisibilityDescription(current.visibility),
                uvIndex: current.uvIndex,
                rainProbability: this.getRainProbability(hourlyForecast.slice(0, 1)),
                feelsLike: Math.round(current.temperatureApparent)
            },
            forecast: dailyForecast.slice(1, 4).map(day => ({
                date: day.forecastStart,
                high: Math.round(day.temperatureMax),
                low: Math.round(day.temperatureMin),
                description: this.getConditionDescription(day.conditionCode),
                iconCode: day.conditionCode,
                precipitationChance: Math.round((day.precipitationChance || 0) * 100),
                windSpeed: Math.round((day.windSpeedMax || 0) * 3.6),
                humidity: Math.round((day.humidityMax || 0) * 100)
            })),
            hourlyForecast: hourlyForecast.slice(0, 24).map(hour => ({
                time: hour.forecastStart,
                temperature: Math.round(hour.temperature),
                description: this.getConditionDescription(hour.conditionCode),
                iconCode: hour.conditionCode,
                precipitationChance: Math.round((hour.precipitationChance || 0) * 100),
                windSpeed: Math.round(hour.windSpeed * 3.6)
            })),
            lastUpdated: new Date().toISOString(),
            source: 'Apple WeatherKit'
        };
    }

    /**
     * Get rain probability from hourly forecast
     */
    getRainProbability(hourlyData) {
        if (!hourlyData || hourlyData.length === 0) return 0;
        
        return Math.round((hourlyData[0].precipitationChance || 0) * 100);
    }

    /**
     * Get visibility description
     */
    getVisibilityDescription(visibilityMeters) {
        const visibilityKm = visibilityMeters / 1000;
        
        if (visibilityKm >= 10) return 'Excellent';
        if (visibilityKm >= 5) return 'Good';
        if (visibilityKm >= 2) return 'Moderate';
        if (visibilityKm >= 1) return 'Poor';
        return 'Very Poor';
    }

    /**
     * Convert WeatherKit condition codes to readable descriptions
     */
    getConditionDescription(conditionCode) {
        const conditions = {
            // Clear conditions
            'Clear': 'Clear',
            'MostlyClear': 'Mostly Clear',
            'PartlyCloudy': 'Partly Cloudy',
            'MostlyCloudy': 'Mostly Cloudy',
            'Cloudy': 'Cloudy',
            
            // Precipitation
            'ScatteredThunderstorms': 'Scattered Thunderstorms',
            'Thunderstorms': 'Thunderstorms',
            'SunShowers': 'Sun Showers',
            'HeavyRain': 'Heavy Rain',
            'Rain': 'Rain',
            'Showers': 'Showers',
            'MixedRainAndSleet': 'Mixed Rain and Sleet',
            'Sleet': 'Sleet',
            'MixedRainAndSnow': 'Mixed Rain and Snow',
            'MixedSleetAndSnow': 'Mixed Sleet and Snow',
            'Snow': 'Snow',
            'HeavySnow': 'Heavy Snow',
            'Flurries': 'Snow Flurries',
            
            // Visibility
            'Fog': 'Fog',
            'Haze': 'Haze',
            'Smoky': 'Smoky',
            'Dust': 'Dust',
            
            // Wind
            'Windy': 'Windy',
            'Breezy': 'Breezy'
        };

        return conditions[conditionCode] || conditionCode || 'Unknown';
    }

    /**
     * Mock weather data as fallback
     */
    getMockWeatherData() {
        console.log('Using mock weather data as fallback');
        
        return {
            location: "Schladming, Austria",
            coordinates: this.defaultLocation,
            current: {
                temperature: 24,
                description: "Sunny",
                iconCode: "Clear",
                humidity: 45,
                windSpeed: 8,
                windDirection: 180,
                pressure: 1018,
                visibility: 15,
                visibilityDescription: "Excellent",
                uvIndex: 7,
                rainProbability: 5,
                feelsLike: 26
            },
            forecast: [
                {
                    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                    high: 18,
                    low: 8,
                    description: "Sunny",
                    iconCode: "Clear",
                    precipitationChance: 10,
                    windSpeed: 12,
                    humidity: 55
                },
                {
                    date: new Date(Date.now() + 172800000).toISOString(), // Day after
                    high: 15,
                    low: 5,
                    description: "Light Rain",
                    iconCode: "Rain", 
                    precipitationChance: 80,
                    windSpeed: 20,
                    humidity: 85
                },
                {
                    date: new Date(Date.now() + 259200000).toISOString(), // 3 days
                    high: 20,
                    low: 10,
                    description: "Mostly Clear",
                    iconCode: "MostlyClear",
                    precipitationChance: 5,
                    windSpeed: 8,
                    humidity: 50
                }
            ],
            hourlyForecast: Array.from({ length: 24 }, (_, i) => ({
                time: new Date(Date.now() + (i * 3600000)).toISOString(),
                temperature: 12 + Math.sin(i * Math.PI / 12) * 6, // Simulate daily temperature curve
                description: i < 12 ? "Partly Cloudy" : "Clear",
                iconCode: i < 12 ? "PartlyCloudy" : "Clear",
                precipitationChance: Math.max(0, 30 - i * 2),
                windSpeed: 15 + Math.random() * 10
            })),
            lastUpdated: new Date().toISOString(),
            source: 'Mock Data (WeatherKit unavailable)'
        };
    }

    /**
     * Get weather for specific activity recommendations
     */
    async getWeatherForRecommendations(latitude, longitude) {
        const weather = await this.getWeather(latitude, longitude);
        
        return {
            condition: this.getSimpleCondition(weather.current.iconCode),
            temperature: weather.current.temperature,
            rainProbability: weather.current.rainProbability,
            description: weather.current.description,
            isGoodForOutdoor: weather.current.rainProbability < 30 && weather.current.temperature > 5
        };
    }

    /**
     * Simplify condition for activity recommendations
     */
    getSimpleCondition(iconCode) {
        if (!iconCode) return 'unknown';
        
        const code = iconCode.toLowerCase();
        
        if (code.includes('rain') || code.includes('shower') || code.includes('thunderstorm')) {
            return 'rain';
        }
        if (code.includes('snow') || code.includes('sleet') || code.includes('flurr')) {
            return 'snow';
        }
        if (code.includes('clear') || code.includes('sunny')) {
            return 'sunny';
        }
        if (code.includes('cloud')) {
            return 'cloudy';
        }
        if (code.includes('fog') || code.includes('mist')) {
            return 'foggy';
        }
        
        return 'partly_cloudy';
    }
}

// Create singleton instance
const weatherKitService = new WeatherKitService();

export default weatherKitService;