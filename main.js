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


document.querySelector(".updateGeolocationButton").addEventListener("click", function () {
    UpdateGeolocation();
});
document.querySelector(".updateGeolocationButtonSmall").addEventListener("click", function () {
    UpdateGeolocation();
});

function AddCityCardByName(cityName) {
    let newCityContainer = document.querySelector(".skeleton .cityCard").cloneNode();
    newCityContainer.classList.add("loading");
}