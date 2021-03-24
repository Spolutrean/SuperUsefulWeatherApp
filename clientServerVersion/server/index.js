const express = require('express');
const fetch = require("node-fetch");
const cors = require("cors");
const pgp = require('pg-promise')();

const app = express();
const PORT = 3000;
const db = pgp("postgres://weatherUser:abacaba@localhost:5432/weatherDB");

app.use(express.json());
app.use(cors());

function HandleApiRequest(requestURL, res) {
    const APIkey = "a4e381df896abd612a5a698a20c835d3";

    fetch(`${requestURL}&appid=${APIkey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to found this city");
            }

            return response.json();
        })
        .then(data => {
            res.set("Content-Type", "application/json");
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(404).send("Invalid city name specified or API is unavailable");
        });
}


app.get("/weather/city", (req, res) => {
    console.log(req.query);
    HandleApiRequest(`https://api.openweathermap.org/data/2.5/weather?q=${req.query.cityName}&units=metric`, res)
});

app.get("/weather/coordinates", (req, res) => {
    HandleApiRequest(`https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&units=metric`, res)
});

app.get("/favorites", (req, res) => {
    let userId = req.query.userId;
    if (!userId) {
        userId = -1;
    }

    db.any("SELECT city FROM favorites WHERE id = $1", [userId])
        .then(data => {
            let cities = [];
            for (let i = 0; i < data.length; ++i) {
                let city = data[i].city;
                if (city) {
                    cities.push(city);
                }
            }
            res.status(200).send({
                userId: userId,
                cities: JSON.stringify(cities)
            });
        })
        .catch(error => {
            res.status(500).send("Internal error");
        });
});

app.post("/favorites", (req, res) => {
    let queryString = "";
    if (req.body.userId) {
        queryString = "INSERT INTO favorites(id, city) VALUES($1, $2) RETURNING id";
    } else {
        queryString = "INSERT INTO favorites(city) VALUES($2) RETURNING id";
    }

    db.one(queryString, [req.body.userId, req.body.cityName])
        .then(data => {
            res.status(200).send({
                userId: data.id
            });
        })
        .catch(error => {
            res.status(500).send("This city already in favorites");
        });
});

app.delete("/favorites", (req, res) => {
    db.none("DELETE FROM favorites WHERE id = $1 AND city = $2", [req.body.userId, req.body.cityName])
        .then(() => {
            res.status(200).send();
        })
        .catch(() => {
            res.status(500).send("Internal error");
        });
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});