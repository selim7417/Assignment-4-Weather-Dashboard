// Weather Dashboard - Assignment 4
// Gets the current weather for a city from the OpenWeatherMap API

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// get the elements from the page
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const weatherCard = document.getElementById("weather-card");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from reloading

  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  searchWeather(city);
});

// main function that runs when the user searches
async function searchWeather(city) {
  // make sure config.js exists and has a key in it (see README)
  if (typeof CONFIG === "undefined" || !CONFIG.API_KEY || CONFIG.API_KEY === "YOUR_API_KEY_HERE") {
    showError("No API key found. Copy config.example.js to config.js and add your OpenWeatherMap key (see README).");
    return;
  }

  showLoading();

  try {
    const data = await fetchWeather(city);
    displayWeather(data);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// does the actual API request, returns the JSON data or throws an error
async function fetchWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=metric`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    // fetch only fails like this if there's no internet or the request gets blocked
    throw new Error("Network error. Check your internet connection and try again.");
  }

  // fetch doesn't throw on 404 etc. so we have to check the status ourselves
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Couldn't find a city called "${city}". Check the spelling and try again.`);
    } else if (response.status === 401) {
      throw new Error("Invalid API key. (New keys can take up to a couple of hours to start working.)");
    } else if (response.status === 429) {
      throw new Error("Too many requests. Please wait a minute and try again.");
    } else {
      throw new Error(`Something went wrong (error ${response.status}). Please try again later.`);
    }
  }

  const data = await response.json();
  return data;
}

function displayWeather(data) {
  const weather = data.weather[0];

  document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("date").textContent = new Date().toDateString();
  document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("description").textContent = weather.description;

  const icon = document.getElementById("weather-icon");
  icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  icon.alt = weather.description;

  document.getElementById("feels-like").textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  // API gives wind in m/s, convert to km/h
  document.getElementById("wind").textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;

  errorDiv.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

function showLoading() {
  loadingDiv.classList.remove("hidden");
  errorDiv.classList.add("hidden");
  weatherCard.classList.add("hidden");
  // disable the button so people can't spam search
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
}

function hideLoading() {
  loadingDiv.classList.add("hidden");
  searchBtn.disabled = false;
  searchBtn.textContent = "Search";
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}
