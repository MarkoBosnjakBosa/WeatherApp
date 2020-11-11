const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const async = require("async");
const dontenv = require("dotenv").config();
const baseUrl = process.env.BASE_URL;
const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
const openWeatherMapKey = process.env.OPEN_WEATHER_MAP_KEY;
app.use(cors({origin: "*"}));
app.use(express.json());

const home = require("./routes/home.js")(app, axios, async, openWeatherMapKey);

app.listen(port, function() {
	console.log("WeatherApp listening on " + baseUrl + port + "!");
});
