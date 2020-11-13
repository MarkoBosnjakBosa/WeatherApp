module.exports = function(app, apiRequest, async, openWeatherMapKey) {
	app.post("/getWeather", (request, response) => {
		var language = request.body.language;
		var unitFormat = request.body.unitFormat;
		var city = request.body.city;
		var latitude = request.body.latitude;
		var longitude = request.body.longitude;
		var openWeatherMapUrl;
		var openWeatherMapForecastUrl;
		if(city) {
			openWeatherMapUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
			openWeatherMapForecastUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
		}
		else if(latitude && longitude) {
			openWeatherMapUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
			openWeatherMapForecastUrl = "http://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
		}
		var queries = [];
		queries.push(function(callback) {
			apiRequest(openWeatherMapUrl, function(error, response, weather) {
				callback(null, weather);
			});
		});
		queries.push(function(callback) {
			apiRequest(openWeatherMapForecastUrl, function(error, response, forecast) {
				callback(null, forecast);
			});
		});
		async.parallel(queries).then(results => {
			var weather = JSON.parse(results[0]);
			var forecast = JSON.parse(results[1]);
			if(weather.cod == "200" && forecast.cod == "200") {
				response.status(200).json({valid: true, weather: weather, forecast: forecast, unitFormat: unitFormat});
				response.end();
			} else {
				response.status(200).json({valid: false});
				response.end();
			}
		}).catch(error => console.log(error));
	});
}
