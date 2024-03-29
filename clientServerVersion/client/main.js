const mainCitySection = document.querySelector(".mainCitySection");
const updateGeolocationButton = document.querySelector(".updateGeolocationButton");
const updateGeolocationButtonSmall = document.querySelector(".updateGeolocationButtonSmall");
const inputField = document.querySelector(".addNewCityField");
const addNewCityButton = document.querySelector(".addNewCityButton");
const form = document.querySelector(".addNewCitySection");
const cities = document.querySelector(".cities");
const cityNotFoundMessage = "Failed to found this city";

const serverLink = "http://localhost:3000";

function HandleWeatherRequest(url, handler, errorHandler) {
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(cityNotFoundMessage);
            }
            return res.json();
        })
        .then(handler)
        .catch(errorHandler);
}

function HandleWeatherRequestByCity(cityName, handler, errorHandler) {
    HandleWeatherRequest(`${serverLink}/weather/city?cityName=${cityName}`, handler, errorHandler);
}

function HandleWeatherRequestByCoordinates(latitude, longitude, handler, errorHandler) {
    HandleWeatherRequest(`${serverLink}/weather/coordinates?&lat=${latitude}&lon=${longitude}`, handler, errorHandler);
}

function UpdateCityContainer(container, weather) {
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
    UpdateCityContainer(mainCitySection, weather);
    updateGeolocationButton.disabled = false;
    updateGeolocationButtonSmall.disabled = false;
}

function SetErrorForMainCity() {
    mainCitySection.classList.add("error");
    mainCitySection.classList.remove("loading");

    setTimeout(UpdateGeolocation, 5000);
}

function UpdateGeolocation() {
    mainCitySection.classList.add("loading");
    mainCitySection.classList.remove("error");

    updateGeolocationButton.disabled = true;
    updateGeolocationButtonSmall.disabled = true;


    navigator.geolocation.getCurrentPosition(
        position => HandleWeatherRequestByCoordinates(position.coords.latitude, position.coords.longitude, UpdateMainCity, SetErrorForMainCity),
        () => HandleWeatherRequestByCity("saint petersburg", UpdateMainCity, SetErrorForMainCity)
    );
}


updateGeolocationButton.addEventListener("click", UpdateGeolocation);
updateGeolocationButtonSmall.addEventListener("click", UpdateGeolocation);

function AddCity(cityName, haveToAddToDb = true) {
    if (cityName.length === 0) return;

    let newCityContainer = document.querySelector("template").content.querySelector(".cityCard").cloneNode(true);
    newCityContainer.querySelector(".closeCitySectionButton").addEventListener("click",
        () => {
            newCityContainer.classList.add("loading");
            fetch(`${serverLink}/favorites`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: window.localStorage["userId"],
                        cityName: newCityContainer.querySelector(".cityName").innerHTML
                    })
                })
                .then(res => {
                    cities.removeChild(newCityContainer);
                })
                .catch(() => {
                    newCityContainer.classList.remove("loading");
                    alert("Can't remove this city from favorites, try again later");
                })
        });

    newCityContainer.classList.add("loading");

    cities.appendChild(newCityContainer);
    HandleWeatherRequestByCity(cityName,
        weather => {
            if (haveToAddToDb) {
                fetch(`${serverLink}/favorites`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ userId: window.localStorage["userId"], cityName: weather.name })
                    })
                    .then(res => {
                        if(!res.ok) {
                            throw new Error();
                        }
                        return res.json();
                    })
                    .then(data => {
                        window.localStorage.setItem("userId", JSON.stringify(data.userId));
                    }).catch(() => {
                        alert("This city already in favourites");
                        cities.removeChild(newCityContainer);
                    });
            }
            UpdateCityContainer(newCityContainer, weather);
        },
        error => {
            if (error.message === cityNotFoundMessage) {
                setTimeout(() => {
                    cities.removeChild(newCityContainer);
                }, 5000);
            }

            newCityContainer.classList.add("error");
        });
}

addNewCityButton.addEventListener("click", () => {
    AddCity(inputField.value);
    inputField.value = "";
    inputField.focus();
});
form.addEventListener("submit", e => {
    e.preventDefault();
    AddCity(inputField.value);
    inputField.value = "";
    inputField.focus();
});

UpdateGeolocation();
if (window.localStorage["userId"] != null) {
    fetch(`${serverLink}/favorites?userId=${window.localStorage["userId"]}`)
        .then(res => {
            return res.json();
        })
        .then(data => {
            JSON.parse(data.cities).map(cityName => {
                AddCity(cityName, false);
            });
        });
}
