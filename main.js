const APIkey = 'a4e381df896abd612a5a698a20c835d3';

function HandleWeatherRequest(url, handler) {
    fetch(url)
        .then(res => {
            return res.json();
        })
        .then(data => {
            //console.log(data);
            handler(data);
        });
}
function HandleWeatherRequestByCity(cityName, handler) {
    HandleWeatherRequest(`https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityName}&appid=${APIkey}`, handler);
}

function HandleWeatherRequestByCoordinates(latitude, longitude, handler) {
    HandleWeatherRequest(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${APIkey}`, handler);
}

function UpdateCity(container, weather) {
    container.querySelector(".cityName").innerHTML = weather.name;
    container.querySelector(".cityDegrees").innerHTML = `${Math.ceil(weather.main.temp)} &#176;C`;
    container.querySelector(".cityImage").src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;

    let weatherDescription = container.querySelector(".weatherDescription");
    weatherDescription.children[0].children[1].innerHTML = `${weather.wind.speed} m/s`;
    weatherDescription.children[1].children[1].innerHTML = weather.weather[0].description;
    weatherDescription.children[2].children[1].innerHTML = `${weather.main.pressure} hpa`;
    weatherDescription.children[3].children[1].innerHTML = `${weather.main.humidity}%`;
    weatherDescription.children[4].children[1].innerHTML = `[${weather.coord.lon}, ${weather.coord.lat}]`;

    container.classList.remove("loading");
}

function UpdateMainCity(weather) {
    UpdateCity(document.querySelector(".mainCitySection"), weather);
}

function UpdateGeolocation() {
    navigator.geolocation.getCurrentPosition(
        position => HandleWeatherRequestByCoordinates(position.coords.latitude, position.coords.longitude, UpdateMainCity),
        err => HandleWeatherRequestByCity("saint petersburg", UpdateMainCity));
}

UpdateGeolocation();


document.querySelector(".updateGeolocationButton").addEventListener("click", UpdateGeolocation);
document.querySelector(".updateGeolocationButtonSmall").addEventListener("click", UpdateGeolocation);

const inputField = document.querySelector(".addNewCityField");
const addNewCityButton = document.querySelector(".addNewCityButton");
const form = document.querySelector(".addNewCitySection");
const cities = document.querySelector(".cities");

function AddCity(cityName) {
    if(cityName.length === 0) return;

    let newCityContainer = document.querySelector("#templates").content.querySelector(".cityCard").cloneNode(true);
    newCityContainer.querySelector(".closeCitySectionButton").addEventListener("click",
        () => { cities.removeChild(newCityContainer); });
    newCityContainer.classList.add("loading");
    cities.appendChild(newCityContainer);
    HandleWeatherRequestByCity(cityName, weather => { UpdateCity(newCityContainer, weather) });
}

addNewCityButton.addEventListener("click", () => {
    AddCity(inputField.value);
    inputField.value = "";
});
form.addEventListener("submit", e => {
    e.preventDefault();
    AddCity(inputField.value);
    inputField.value = "";
});
