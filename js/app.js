import { getWeatherByCity, getWeatherByCoordinates } from './weatherService.js';
import { getRecentSearches, saveRecentSearch }       from './storage.js';
import {
  renderCurrentWeather,
  renderWeatherDetails,
  renderForecast,
  renderHourlyForecast,
  renderWeatherHighlights,
  renderRecentSearches,
  showLoading,
  showError,
} from './ui.js';

// ── DOM references ──────────────────────────────────────────────────────────
const cityInput               = document.getElementById('city-input');
const searchButton            = document.getElementById('search-btn');
const currentWeatherSection   = document.getElementById('current-weather');
const detailsGrid             = document.getElementById('details-grid');
const forecastContainer       = document.getElementById('forecast');
const hourlyForecastContainer = document.getElementById('hourly-forecast');
const recentSearchesContainer = document.getElementById('recent-searches');
const highlightsGrid          = document.getElementById('highlights-grid');
const locationButton          = document.getElementById('location-btn');
const themeToggle             = document.getElementById('theme-toggle');
const themeToggleDarkIcon     = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon    = document.getElementById('theme-toggle-light-icon');

// ── Render helpers ───────────────────────────────────────────────────────────
function renderAll(data) {
  renderCurrentWeather(data,    currentWeatherSection);
  renderWeatherDetails(data,    detailsGrid);
  renderForecast(data,          forecastContainer);
  renderHourlyForecast(data,    hourlyForecastContainer);
  renderWeatherHighlights(data, highlightsGrid);
}

function refreshRecentChips() {
  renderRecentSearches(getRecentSearches(), recentSearchesContainer, (city) => {
    searchCity(city);
  });
}

// ── City search ──────────────────────────────────────────────────────────────
async function searchCity(city) {
  if (!city || !city.trim()) return;

  const trimmedCity = city.trim();
  showLoading(trimmedCity, currentWeatherSection);

  try {
    const data = await getWeatherByCity(trimmedCity);

    // Persist to history using the authoritative name from the API
    saveRecentSearch(data.location.name);
    refreshRecentChips();

    renderAll(data);
    cityInput.value = '';
  } catch (error) {
    console.error('[search]', error);
    showError(error.message, currentWeatherSection);
  }
}

// ── Geolocation ──────────────────────────────────────────────────────────────
async function fetchWeatherByLocation(lat, lon) {
  showLoading('your location', currentWeatherSection);
  try {
    const data = await getWeatherByCoordinates(lat, lon);
    renderAll(data);
  } catch (error) {
    console.error('[geolocation]', error);
    showError(error.message, currentWeatherSection);
  }
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.', currentWeatherSection);
    return;
  }

  showLoading('your location', currentWeatherSection);

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => fetchWeatherByLocation(coords.latitude, coords.longitude),
    (err) => {
      const msgs = {
        [err.PERMISSION_DENIED]:    'Location permission denied. Please search for a city manually.',
        [err.POSITION_UNAVAILABLE]: 'Location information is unavailable right now.',
        [err.TIMEOUT]:              'Location request timed out. Please try again.',
      };
      showError(msgs[err.code] || 'Unable to retrieve your location.', currentWeatherSection);
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// ── Theme ────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'light') {
    html.classList.add('light');
    html.classList.remove('dark');
    themeToggleDarkIcon.classList.add('hidden');
    themeToggleLightIcon.classList.remove('hidden');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    themeToggleDarkIcon.classList.remove('hidden');
    themeToggleLightIcon.classList.add('hidden');
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.contains('light');
  const next    = isLight ? 'dark' : 'light';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

// ── Event listeners ──────────────────────────────────────────────────────────
searchButton.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError('Please enter a city name to search.', currentWeatherSection);
    return;
  }
  searchCity(city);
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (!city) {
      showError('Please enter a city name to search.', currentWeatherSection);
      return;
    }
    searchCity(city);
  }
});

locationButton.addEventListener('click', handleGeolocation);
themeToggle.addEventListener('click', toggleTheme);

// ── Init ─────────────────────────────────────────────────────────────────────
applyTheme(localStorage.getItem('theme') || 'dark');
refreshRecentChips();
searchCity('Abuja');