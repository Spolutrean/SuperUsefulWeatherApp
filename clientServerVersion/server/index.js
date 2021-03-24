const express = require('express');
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

function HandleApiRequest(requestURL, res) {
    const APIkey = 'a4e381df896abd612a5a698a20c835d3';

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
    HandleApiRequest(`https://api.openweathermap.org/data/2.5/weather?q=${req.query.name}&units=metric`, res)
});

app.get("/weather/coordinates", (req, res) => {
    HandleApiRequest(`https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&units=metric`, res)
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});