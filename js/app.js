import { getWeatherByCity } from './weatherService.js';

// Select important elements from the page
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-btn');
const currentWeatherSection = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast');
const detailsGrid = document.getElementById('details-grid');
const highlightsGrid = document.getElementById('highlights-grid');

// This function runs whenever the user searches for a city
async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    showError('Please enter a city name.');
    return;
  }

  console.log('Searching weather for:', city);
  showLoading(city);

  try {
    const data = await getWeatherByCity(city);

    console.log('Weather data:', data);

    currentWeatherSection.innerHTML = `
      <h2 class="mb-4 text-2xl font-semibold">Current Weather</h2>
      <p class="text-slate-400">
        ${data.location.name}, ${data.location.country}
      </p>
      <p class="mt-3 text-4xl font-bold">
        ${data.weather.current.temperature_2m}°C
      </p>
    `;
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

// Placeholder function for fetching weather using current location
function fetchWeatherByLocation(latitude, longitude) {
  console.log('Weather API function will use coordinates:', latitude, longitude);
}

// Show a simple loading message while weather data is being prepared
function showLoading(city) {
  currentWeatherSection.innerHTML = `
    <h2 class="mb-4 text-2xl font-semibold">Loading Weather...</h2>
    <p class="text-slate-400">Fetching weather information for ${city}.</p>
  `;
}

// Show a simple error message when something goes wrong
function showError(message) {
  currentWeatherSection.innerHTML = `
    <h2 class="mb-4 text-2xl font-semibold text-red-400">Error</h2>
    <p class="text-slate-300">${message}</p>
  `;
}

// Run search when the search button is clicked
searchButton.addEventListener('click', handleSearch);

// Run search when the Enter key is pressed inside the input
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

// Initial log to confirm the JavaScript file is connected properly
console.log('Weather Dashboard app.js connected successfully.');