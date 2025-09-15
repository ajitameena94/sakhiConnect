// Node.js script to fetch current weather and 30-day forecast for a location using OpenWeatherMap
// Requires: npm install node-fetch

const fetch = require('node-fetch');
const fs = require('fs');

const API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_OPENWEATHER_API_KEY';
const LAT = process.env.WEATHER_LAT || '26.9124'; // Jaipur latitude as example
const LON = process.env.WEATHER_LON || '75.7873'; // Jaipur longitude as example

async function fetchWeather() {
  // OpenWeatherMap One Call 3.0 API (paid for 30-day forecast, free for 7-day)
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&units=metric&lang=hi&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather: ' + res.statusText);
  const data = await res.json();
  return data;
}

(async () => {
  try {
    const weather = await fetchWeather();
    // Save to file for now; you can update Firestore in your app as needed
    fs.writeFileSync('weather_forecast.json', JSON.stringify(weather, null, 2));
    console.log('Weather and forecast data saved to weather_forecast.json');
    // Optionally, analyze for major climate concerns (e.g., heatwave, heavy rain)
    const alerts = (weather.alerts || []).map(a => a.event + ': ' + a.description);
    if (alerts.length) {
      console.log('Climate alerts:', alerts);
    } else {
      console.log('No major climate alerts in forecast.');
    }
  } catch (err) {
    console.error(err);
  }
})();
