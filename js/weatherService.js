const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEOCODE_BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// Convert a city name into latitude and longitude coordinates.
export async function getCityCoordinates(city) {
  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to search for this city. Please try again.');
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('City not found. Please check the spelling and try again.');
  }

  const location = data.results[0];

  return {
    name: location.name,
    country: location.country || location.country_code || '',
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone || 'auto',
  };
}

// Reverse geocode latitude/longitude to a readable city name and country name.
export async function getCityByCoordinates(latitude, longitude) {
  try {
    const url = `${REVERSE_GEOCODE_BASE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to resolve coordinates to a city name.');
    }
    
    const data = await response.json();
    const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
    const country = data.countryName || '';
    
    return {
      name,
      country,
      latitude,
      longitude,
      timezone: 'auto'
    };
  } catch (error) {
    console.warn('Reverse geocoding failed, falling back to coordinates name:', error);
    return {
      name: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      country: '',
      latitude,
      longitude,
      timezone: 'auto'
    };
  }
}

// Fetch current weather and forecast using latitude and longitude.
export async function getWeatherData(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
    hourly: 'temperature_2m,weather_code,visibility,uv_index',
    timezone: 'auto',
  });

  const response = await fetch(`${WEATHER_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Unable to fetch weather data. Please try again.');
  }

  return response.json();
}

// Get weather data by city name
export async function getWeatherByCity(city) {
  const location = await getCityCoordinates(city);
  const weather = await getWeatherData(location.latitude, location.longitude);

  return {
    location,
    weather,
  };
}

// Get weather data by latitude and longitude coordinates directly
export async function getWeatherByCoordinates(latitude, longitude) {
  const location = await getCityByCoordinates(latitude, longitude);
  const weather = await getWeatherData(latitude, longitude);

  return {
    location,
    weather,
  };
}