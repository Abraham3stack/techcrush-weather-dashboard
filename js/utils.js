/**
 * Format the local ISO string from Open-Meteo (e.g. "2026-06-15T15:11")
 * into a readable date and time string.
 */
export function formatDateTime(isoString) {
  if (!isoString) return { date: '', time: '' };
  try {
    const [datePart, timePart] = isoString.split('T');
    if (!datePart || !timePart) return { date: isoString, time: '' };

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const date = new Date(year, month - 1, day, hour, minute);
    const weekday   = new Intl.DateTimeFormat('en-US', { weekday: 'long'  }).format(date);
    const monthName = new Intl.DateTimeFormat('en-US', { month:   'long'  }).format(date);

    const ampm        = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMin  = String(minute).padStart(2, '0');

    return {
      date: `${weekday}, ${monthName} ${day}, ${year}`,
      time: `${displayHour}:${displayMin} ${ampm}`,
    };
  } catch (e) {
    return { date: isoString, time: '' };
  }
}

/**
 * Format "2026-06-15T06:24" or "06:24" → "6:24 AM"
 */
export function formatTimeString(isoDateTimeStr) {
  if (!isoDateTimeStr) return '';
  try {
    const timePart   = isoDateTimeStr.includes('T') ? isoDateTimeStr.split('T')[1] : isoDateTimeStr;
    const [hStr, mStr] = timePart.split(':');
    const hour = parseInt(hStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${mStr} ${ampm}`;
  } catch (e) {
    return isoDateTimeStr;
  }
}

/**
 * Maps WMO Weather Code → { label, icon (SVG string), gradientClass (plain CSS class) }
 * gradientClass references classes defined in style.css, NOT dynamic Tailwind classes.
 */
export function getWeatherCondition(code) {
  // Default fallback
  let label = 'Unknown';
  let gradientClass = 'cond-default';
  let icon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3
           L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>`;

  switch (true) {
    // ── Clear ──
    case code === 0:
      label = 'Sunny';
      gradientClass = 'cond-sunny';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 icon-pulse" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707
               M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.07 7.07l-7.07-7.07z"/>
        </svg>`;
      break;

    // ── Mainly clear / Partly cloudy ──
    case code === 1 || code === 2:
      label = code === 1 ? 'Mainly Clear' : 'Partly Cloudy';
      gradientClass = 'cond-cloudy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" stroke-width="1.5">
          <circle cx="10" cy="9" r="3" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
        </svg>`;
      break;

    // ── Overcast ──
    case code === 3:
      label = 'Overcast';
      gradientClass = 'cond-cloudy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
        </svg>`;
      break;

    // ── Fog ──
    case code === 45 || code === 48:
      label = 'Foggy';
      gradientClass = 'cond-foggy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h12M4 18h10"/>
        </svg>`;
      break;

    // ── Drizzle ──
    case code >= 51 && code <= 55:
      label = 'Drizzle';
      gradientClass = 'cond-drizzle';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-1 2m4-2l-1 2m4-2l-1 2"/>
        </svg>`;
      break;

    // ── Freezing Drizzle / Freezing Rain ──
    case (code >= 56 && code <= 57) || (code >= 66 && code <= 67):
      label = 'Freezing Rain';
      gradientClass = 'cond-rainy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#7dd3fc" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 21h.01M12 21h.01M15 21h.01"/>
        </svg>`;
      break;

    // ── Rain ──
    case code >= 61 && code <= 65:
      label = code === 65 ? 'Heavy Rain' : 'Rainy';
      gradientClass = 'cond-rainy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 19l-2 3m6-3l-2 3m6-3l-2 3"/>
        </svg>`;
      break;

    // ── Snow ──
    case (code >= 71 && code <= 75) || code === 77:
      label = 'Snowy';
      gradientClass = 'cond-snowy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#bae6fd" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 11v6m0 0l-3-3m3 3l3-3"/>
        </svg>`;
      break;

    // ── Rain Showers ──
    case code >= 80 && code <= 82:
      label = 'Rain Showers';
      gradientClass = 'cond-rainy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v2m3-2v2m3-2v2"/>
        </svg>`;
      break;

    // ── Snow Showers ──
    case code === 85 || code === 86:
      label = 'Snow Showers';
      gradientClass = 'cond-snowy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#bae6fd" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 20h.01M12 20h.01M15 20h.01"/>
        </svg>`;
      break;

    // ── Thunderstorm ──
    case code === 95 || code === 96 || code === 99:
      label = 'Thunderstorm';
      gradientClass = 'cond-stormy';
      icon = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>`;
      break;
  }

  return { label, icon, gradientClass };
}

/**
 * Returns an emoji for compact display (forecast / hourly cards).
 */
export function getMiniWeatherIcon(code) {
  if (code === 0)                              return '☀️';
  if (code === 1 || code === 2)                return '⛅';
  if (code === 3)                              return '☁️';
  if (code === 45 || code === 48)              return '🌫️';
  if (code >= 51 && code <= 57)               return '🌦️';
  if (code >= 61 && code <= 67)               return '🌧️';
  if (code >= 71 && code <= 77)               return '❄️';
  if (code >= 80 && code <= 82)               return '🌦️';
  if (code === 85 || code === 86)             return '🌨️';
  if (code === 95 || code === 96 || code === 99) return '⛈️';
  return '🌡️';
}

/**
 * Inline SVG icons for the detail cards and highlights panel.
 * Using stroke colors directly on the SVG path so they render correctly
 * in both dark and light modes without Tailwind class dependency.
 */
export const DETAIL_ICONS = {
  humidity: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z"/>
    </svg>`,
  wind: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M5 8h8.5a2.5 2.5 0 010 5H5m3-5v0M3 12h10.5a2.5 2.5 0 010 5H3"/>
    </svg>`,
  pressure: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
  feels_like: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#34d399" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2
           M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>`,
  uv: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#fb923c" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707
           M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>`,
  visibility: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>`,
  sunrise: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 3v1m0 8V3m0 0L9 6m3-3l3 3M5 13h14M3 17h18M7 21h10"/>
    </svg>`,
  sunset: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#818cf8" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 9v8m0 0l-3-3m3 3l3-3M5 13h14M3 17h18M7 21h10"/>
    </svg>`,
};
