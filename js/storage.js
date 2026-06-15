const STORAGE_KEY = 'weather_recent_searches';
const DEFAULT_CITIES = ['Abuja', 'Lagos', 'London', 'New York'];

/**
 * Retrieve the list of recent searches from localStorage.
 * Returns default list if empty or errors.
 */
export function getRecentSearches() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with defaults if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CITIES));
      return DEFAULT_CITIES;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.warn('LocalStorage access failed, returning defaults:', e);
    return DEFAULT_CITIES;
  }
}

/**
 * Add a city to the top of the recent searches list,
 * keeping it unique (case-insensitive) and capped at 5 cities.
 */
export function saveRecentSearch(city) {
  if (!city) return;
  
  const trimmed = city.trim();
  if (!trimmed) return;

  // Capitalize city name (e.g. "new york" -> "New York")
  const capitalized = trimmed
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  try {
    let list = getRecentSearches();
    
    // Filter out duplicate (case-insensitive)
    list = list.filter(item => item.toLowerCase() !== capitalized.toLowerCase());
    
    // Add to front
    list.unshift(capitalized);
    
    // Cap at 5 items
    if (list.length > 5) {
      list = list.slice(0, 5);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}
