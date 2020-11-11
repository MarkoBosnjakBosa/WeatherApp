module.exports = function(app, apiRequest, async, openWeatherMapKey) {
  app.post("/getWeather", (request, response) => {
    var city = request.body.city;
    var unitFormat = request.body.unitFormat;
    var language = request.body.language;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    var openWeatherMapUrl;
    var openWeatherMapForecastUrl;
    if(city){
      openWeatherMapUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
      openWeatherMapForecastUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
    }
    else if(latitude && longitude){
      openWeatherMapUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
      openWeatherMapForecastUrl = "http://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&units=" + unitFormat + "&lang=" + language + "&appid=" + openWeatherMapKey;
    }
    var queries = [];
    queries.push(function(callback){
      apiRequest(openWeatherMapUrl, function(error, response, weather){
        callback(null, weather);
      });
    });
    queries.push(function(callback){
      apiRequest(openWeatherMapForecastUrl, function(error, response, forecast){
        callback(null, forecast);
      });
    });
    async.parallel(queries).then(results => {
      var weather = JSON.parse(results[0]);
      var forecast = JSON.parse(results[1]);
      if(weather.cod == "200" && forecast.cod == "200") {
        response.status(200).json({valid: true, weather: weather, forecast: forecast});
        response.end();
      } else {
          response.status(200).json({valid: false});
          response.end();
      }
    }).catch(error => console.log(error));
  });
  function convertTime(unixTime){
    var date = new Date(unixTime * 1000);
    var hours = date.getHours();
    if(hours < 10){
      hours = "0" + hours;
    }
    var minutes = "0" + date.getMinutes();
    var time = hours + ":" + minutes.substr(-2);
    return time;
  }
  function convertDate(date, language){
    var completeArray = date.split(" ");
    var dateArray = completeArray[0].split("-");
    var newDate;
    if(language == "hr"){
      newDate = dateArray[2] + "." + dateArray[1] + "." + dateArray[0] + " " + completeArray[1];
    }
    else if(language == "de"){
      newDate = dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0] + " " + completeArray[1];
    }
    else{
      newDate = date;
    }
    return newDate;
  }
  function convertWindSpeed(speed, unitFormat){
    var convertedSpeed;
    if(speed > 0){
      if(unitFormat == "imperial"){
        convertedSpeed = parseFloat(speed).toFixed(2) + " m/h";
      }
      else{
        convertedSpeed = parseFloat(speed * 3.6).toFixed(2) + " km/h";
      }
    }
    return convertedSpeed;
  }
  function getWindDirection(angle, language){
    var direction = "";
    if(angle){
      var directions;
      if(language == "hr"){
        directions = ["sjever", "sjeverozapad", "zapad", "jugozapad", "jug", "jugoistok", "istok", "sjeveroistok"];
      }
      else if(language == "de"){
        directions = ["Nord", "Nord-West", "West", "Süd-West", "Süd", "Süd-Ost", "Ost", "Nord-Ost"];
      }
      else{
        directions = ["North", "North-West", "West", "South-West", "South", "South-East", "East", "North-East"];
      }
      direction = directions[Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8];
    }
    return direction;
  }
}
