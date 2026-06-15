import {
  getWeatherCondition,
  getMiniWeatherIcon,
  formatDateTime,
  formatTimeString,
  DETAIL_ICONS,
} from './utils.js';

/* ─────────────────────────────────────────────
   Current Weather Card
───────────────────────────────────────────── */
export function renderCurrentWeather(data, container) {
  const { location } = data;
  const current = data.weather.current;
  const daily   = data.weather.daily;

  const condition  = getWeatherCondition(current.weather_code);
  const dateTime   = formatDateTime(current.time);
  const currentTemp = Math.round(current.temperature_2m);
  const highTemp   = Math.round(daily.temperature_2m_max[0]);
  const lowTemp    = Math.round(daily.temperature_2m_min[0]);

  // Apply CSS condition gradient class on the card
  container.className = `glass-card p-6 md:p-8 relative overflow-hidden current-weather-card ${condition.gradientClass} fade-in`;

  container.innerHTML = `
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">

      <!-- Left: info -->
      <div class="space-y-4 flex-1">

        <!-- City & country -->
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <h2 class="text-2xl font-bold text-white tracking-tight">
            ${location.name}${location.country ? ', ' + location.country : ''}
          </h2>
        </div>

        <!-- Date / time -->
        <div>
          <p class="text-sm font-semibold text-slate-300">${dateTime.date}</p>
          <p class="text-xs text-slate-500 mt-0.5">${dateTime.time}</p>
        </div>

        <!-- Temperature -->
        <div class="flex items-baseline gap-1 select-none">
          <span class="text-8xl font-extrabold tracking-tighter text-white leading-none">${currentTemp}</span>
          <span class="text-3xl font-light text-slate-300">°C</span>
        </div>

        <!-- Condition -->
        <div class="flex items-center gap-2 text-slate-200">
          <span class="text-2xl leading-none select-none">${getMiniWeatherIcon(current.weather_code)}</span>
          <span class="text-lg font-semibold">${condition.label}</span>
        </div>

        <!-- High / Low badges -->
        <div class="flex flex-wrap gap-2 pt-1">
          <span class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold"
            style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.2);color:#f87171;">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            High ${highTemp}°C
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold"
            style="background:rgba(59,130,246,0.12);border-color:rgba(59,130,246,0.2);color:#93c5fd;">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
            Low ${lowTemp}°C
          </span>
        </div>
      </div>

      <!-- Right: big weather icon -->
      <div class="flex-shrink-0 flex items-center justify-center self-center select-none p-4">
        ${condition.icon}
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────
   Weather Details Row (Humidity, Wind, Pressure, Feels Like)
───────────────────────────────────────────── */
export function renderWeatherDetails(data, container) {
  const { current } = data.weather;

  const details = [
    {
      icon:      DETAIL_ICONS.humidity,
      iconBg:    'icon-bg-blue',
      label:     'Humidity',
      value:     `${current.relative_humidity_2m}%`,
    },
    {
      icon:      DETAIL_ICONS.wind,
      iconBg:    'icon-bg-purple',
      label:     'Wind Speed',
      value:     `${Math.round(current.wind_speed_10m)} km/h`,
    },
    {
      icon:      DETAIL_ICONS.pressure,
      iconBg:    'icon-bg-amber',
      label:     'Pressure',
      value:     `${Math.round(current.pressure_msl)} hPa`,
    },
    {
      icon:      DETAIL_ICONS.feels_like,
      iconBg:    'icon-bg-emerald',
      label:     'Feels Like',
      value:     `${Math.round(current.apparent_temperature)}°C`,
    },
  ];

  container.innerHTML = details.map(d => `
    <div class="glass-card p-5 detail-card flex flex-col justify-between weather-card fade-in">
      <div class="p-2.5 rounded-xl border self-start ${d.iconBg}">
        ${d.icon}
      </div>
      <div class="mt-3 space-y-0.5">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">${d.label}</p>
        <p class="text-2xl font-bold text-white">${d.value}</p>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   5-Day Forecast
───────────────────────────────────────────── */
export function renderForecast(data, container) {
  const { daily } = data.weather;

  // Days 1–5 (index 0 is today)
  const maxDays = Math.min(6, daily.time.length);
  let html = '';

  for (let i = 1; i < maxDays; i++) {
    const dateStr  = daily.time[i];
    const code     = daily.weather_code[i];
    const maxTemp  = Math.round(daily.temperature_2m_max[i]);
    const minTemp  = Math.round(daily.temperature_2m_min[i]);
    const dayName  = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(dateStr + 'T00:00:00'));
    const miniIcon = getMiniWeatherIcon(code);
    const condLabel = getWeatherCondition(code).label;

    html += `
      <div class="weather-card flex flex-col items-center justify-between text-center p-4 min-w-[80px] flex-1 fade-in">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">${dayName}</span>
        <span class="text-3xl my-3 select-none" title="${condLabel}">${miniIcon}</span>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-bold text-white">${maxTemp}°</span>
          <span class="text-slate-500">${minTemp}°</span>
        </div>
      </div>`;
  }

  container.innerHTML = html;
}

/* ─────────────────────────────────────────────
   Hourly Forecast
───────────────────────────────────────────── */
export function renderHourlyForecast(data, container) {
  const { hourly, current } = data.weather;
  const currentTime = current.time;

  // Find the index closest to current time
  let startIndex = hourly.time.findIndex(t => t >= currentTime);
  if (startIndex === -1) startIndex = 0;

  const hoursToShow = Math.min(12, hourly.time.length - startIndex);
  let html = '';

  for (let i = 0; i < hoursToShow; i++) {
    const idx      = startIndex + i;
    const timeStr  = hourly.time[idx];
    const temp     = Math.round(hourly.temperature_2m[idx]);
    const code     = hourly.weather_code[idx];
    const miniIcon = getMiniWeatherIcon(code);

    let label = '';
    if (i === 0) {
      label = 'Now';
    } else {
      const [, tp]   = timeStr.split('T');
      const hourVal  = parseInt(tp.split(':')[0], 10);
      const ampm     = hourVal >= 12 ? 'PM' : 'AM';
      label = `${hourVal % 12 || 12} ${ampm}`;
    }

    html += `
      <div class="weather-card flex-shrink-0 flex flex-col items-center justify-between text-center p-4 min-w-[76px] h-28 fade-in">
        <span class="text-xs font-semibold text-slate-500">${label}</span>
        <span class="text-2xl select-none">${miniIcon}</span>
        <span class="text-sm font-bold text-white">${temp}°</span>
      </div>`;
  }

  container.innerHTML = html;
}

/* ─────────────────────────────────────────────
   Weather Highlights (Sidebar)
───────────────────────────────────────────── */
export function renderWeatherHighlights(data, container) {
  const { daily, hourly, current } = data.weather;

  // Find current hourly index
  let startIndex = hourly.time.findIndex(t => t >= current.time);
  if (startIndex === -1) startIndex = 0;

  // Visibility
  const visM   = hourly.visibility ? (hourly.visibility[startIndex] ?? 10000) : 10000;
  const visKm  = Math.round(visM / 1000);
  const visDesc = visKm < 3 ? 'Fog' : visKm < 8 ? 'Haze' : 'Clear';

  // UV Index
  const uv     = typeof daily.uv_index_max[0] === 'number' ? daily.uv_index_max[0] : 0;
  const uvStr  = uv.toFixed(1);
  const uvDesc = uv >= 11 ? 'Extreme' : uv >= 8 ? 'Very High' : uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low';

  // Sun times
  const sunriseStr = formatTimeString(daily.sunrise[0]);
  const sunsetStr  = formatTimeString(daily.sunset[0]);

  const items = [
    { icon: DETAIL_ICONS.uv,         title: 'UV Index',    value: uvStr,              desc: uvDesc   },
    { icon: DETAIL_ICONS.visibility, title: 'Visibility',  value: `${visKm} km`,      desc: visDesc  },
    { icon: DETAIL_ICONS.sunrise,    title: 'Sunrise',     value: sunriseStr,         desc: 'Today'  },
    { icon: DETAIL_ICONS.sunset,     title: 'Sunset',      value: sunsetStr,          desc: 'Today'  },
  ];

  container.innerHTML = items.map(it => `
    <div class="weather-card flex items-center justify-between p-4 fade-in">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl border" style="background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.06);">
          ${it.icon}
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">${it.title}</p>
          <p class="text-lg font-bold text-white mt-0.5">${it.value}</p>
        </div>
      </div>
      <span style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.15);color:#22d3ee;border-radius:9999px;padding:0.2rem 0.65rem;font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">
        ${it.desc}
      </span>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   Recent Search Chips
───────────────────────────────────────────── */
export function renderRecentSearches(list, container, onClickCallback) {
  if (!list || list.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-xs font-medium py-1">No recent searches yet</p>`;
    return;
  }

  container.innerHTML = list.map(city => `
    <button
      data-city="${city}"
      class="px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer"
      style="background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.08);color:#cbd5e1;"
      onmouseover="this.style.background='rgba(6,182,212,0.12)';this.style.borderColor='rgba(6,182,212,0.4)';this.style.color='#fff';"
      onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='#cbd5e1';"
    >${city}</button>
  `).join('');

  container.querySelectorAll('button[data-city]').forEach(btn => {
    btn.addEventListener('click', () => onClickCallback(btn.getAttribute('data-city')));
  });
}

/* ─────────────────────────────────────────────
   Loading State
───────────────────────────────────────────── */
export function showLoading(city, container) {
  container.className = 'glass-card p-6 md:p-8 relative overflow-hidden current-weather-card flex items-center justify-center';
  container.innerHTML = `
    <div class="flex flex-col items-center gap-4 text-center">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      <div>
        <p class="text-base font-bold text-white">Fetching Weather</p>
        <p class="text-xs text-slate-400 mt-1">Loading data for <span class="text-cyan-400 font-semibold">${city}</span>…</p>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────
   Error State
───────────────────────────────────────────── */
export function showError(message, container) {
  container.className = 'glass-card p-6 md:p-8 relative overflow-hidden current-weather-card flex items-center justify-center';
  container.innerHTML = `
    <div class="flex flex-col items-center gap-4 text-center px-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl" style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#f87171" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3
               L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <div>
        <p class="text-lg font-bold" style="color:#f87171;">Something went wrong</p>
        <p class="text-sm text-slate-300 mt-1.5 max-w-xs">${message}</p>
      </div>
    </div>`;
}
