//fetching tabs
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchweather]");

//fetching weather container
const userContainer = document.querySelector(".weather-container");

//fetching all 4 screens UIs
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially variables needed
let currentTab = userTab; //by default currentTab is userTab(Your Weather) when the app loads
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab"); //adds the css of current-tab to currentTab. Go to styles.css
getfromSessionStorage();

function switchTab(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab"); //removes background color of the currentTab.
    currentTab = clickedTab;
    currentTab.classList.add("current-tab"); //adds background color to the new currentTab.

    //if searchForm class is not active, it means we have clicked on searchTab
    if (!searchForm.classList.contains("active")) {
      //if search form container is invisible, make it visible
      //removes 2, adds 1
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      //want to move to Your weather tab.
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      //now we are on the weather tab, so we have to display weather, so lets check local storage first.
      getfromSessionStorage();
    }
  }
}

//Upon clicking your weather tab:
//1. weather is already shown if coordinates are available.
//2. grant access UI is made visible, then coordinates are fetched via API call and then rendered on UI.

//checks if coordinates are already present in session storage.
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    //agar local coordinates nahi mile.
    grantAccessContainer.classList.add("active");
  } else {
    //agar mil gaye to
    const coordinates = JSON.parse(localCoordinates); //convert to JSON format
    fetchUserWeatherInfo(coordinates); //call this function.
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  //make grantAccessContainer invisible.
  grantAccessContainer.classList.remove("active");
  //make loadingScreen visible
  loadingScreen.classList.add("active");

  //API call
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data); //to display data values on UI
  } catch (err) {
    loadingScreen.classList.remove("active");
  }
}

function renderWeatherInfo(weatherInfo) {
  //firstly we have to fetch the elements.
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloud]");

  //optional chaining operator --> ?.
  //user?.address?.zip --> go to user then to address then to zip to fetch zip code from json object.

  //fetch values from weather info object and put in UI elements.
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0].icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity} %`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}
userTab.addEventListener("click", () => {
  //pass clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  //pass clicked tab as input parameter
  switchTab(searchTab);
});

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    //show an alert for no geolocation support available.
  }
}

function showPosition(position) {
  const usercoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(usercoordinates));
  fetchUserWeatherInfo(usercoordinates);
}

let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (searchInput.value === "") return;
  else fetchSearchWeatherInfo(searchInput.value);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {}
}
