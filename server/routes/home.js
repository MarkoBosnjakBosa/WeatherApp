module.exports = function(app, axios, async, openWeatherMapKey) {
  app.get("/:language", (request, response) => {
    var language = request.params.language;
    if(language == "hr"){
      response.render("home_HR", {language: language});
    }
    else if(language == "de"){
      response.render("home_DE", {language: language});
    }
    else{
      response.render("home", {language: language});
    }
  });
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
      apiRequest(openWeatherMapUrl, function(first, secondResponse, data){
        callback(null, data);
      });
    });
    queries.push(function(callback){
      apiRequest(openWeatherMapForecastUrl, function(error, thirdResponse, data){
        callback(null, data);
      });
    });
    async.parallel(queries, function(error, results){
      if(error){
        response.status(200).json({valid: "no", message: "Please enter a valid city!"});
      }
      else{
        var weather = JSON.parse(results[0]);
        var forecast = JSON.parse(results[1]);
        if(weather.cod == "200" && forecast.cod == "200"){
          var languageConstants;
          if(language == "hr"){
            languageConstants = ["Trenutno", "Prognoza", "Grad", "Osjećaj", "Minimalna", "Maksimalna", "Vjetar", "Vlaga", "Tlak", "Izlazak Sunca", "Zalazak Sunca", "Koordinate", "Dužina", "Širina", "Datum", "Vrijeme", "Temperatura"];
          }
          else if(language == "de"){
            languageConstants = ["Aktuell", "Vorschau", "Stadt", "Fühlt sich an wie", "Minimum", "Maximum", "Wind", "Feuchtigkeit", "Druck", "Sonnenaufgang", "Sonnenuntergang", "Koordinaten", "Länge", "Breite", "Datum", "Wetter", "Temperatur"];
          }
          else{
            languageConstants = ["Current", "Forecast", "City", "Feels like", "Minimum", "Maximum", "Wind", "Humidity", "Pressure", "Sunrise", "Sunset", "Coordinates", "Longitude", "Latitude", "Date", "Weather", "Temperature"];
          }
          var unitFormatConstants;
          if(unitFormat == "metric"){
            unitFormatConstants = ["&#8451;"];
          }
          else if(unitFormat == "imperial"){
            unitFormatConstants = ["&#8457;"];
          }
          else{
            unitFormatConstants = ["&#8490;"];
          }
          var html = "<ul class='nav nav-tabs justify-content-center' role='tablist'>" +
            "<li class='nav-item'><a id='weatherTab' class='nav-link active' data-toggle='tab' href='#weather' role='tab' aria-controls='weather' aria-selected'true'>" + languageConstants[0] + "</a></li>" +
            "<li class='nav-item'><a id='forecastTab' class='nav-link' data-toggle='tab' href='#forecast' role='tab' aria-controls='forecast' aria-selected='false'>" + languageConstants[1] + "</a></li>" +
          "</ul>" +
          "<div class='tab-content'>";
          var weatherHtml = "<div id='weather' class='tab-pane fade show active' role='tabpanel' aria-labelledby='weatherTab'>" +
            "<div style='text-align: center'><img src='http://openweathermap.org/img/wn/" + weather.weather[0].icon + "@2x.png" + "' alt='Weather Icon'><b>" + weather.main.temp + " " + unitFormatConstants[0] + " - " + weather.weather[0].description + "</b></div>" +
            "<table class='table table-striped'>" +
              "<tbody>" +
                "<tr><td>" + languageConstants[2] + "</td><td>" + weather.name + "</td></tr>" +
                "<tr><td>" + languageConstants[3] + "</td><td>" + weather.main.feels_like + " " + unitFormatConstants[0] + "</td></tr>" +
                "<tr><td>" + languageConstants[4] + "</td><td>" + weather.main.temp_min + " " + unitFormatConstants[0] + "</td></tr>" +
                "<tr><td>" + languageConstants[5] + "</td><td>" + weather.main.temp_max + " " + unitFormatConstants[0] + "</td></tr>" +
                "<tr><td>" + languageConstants[6] + "</td><td>" + convertWindSpeed(weather.wind.speed, unitFormat) + " " + getWindDirection(weather.wind.deg, language) + "</td></tr>" +
                "<tr><td>" + languageConstants[7] + "</td><td>" + weather.main.humidity + " %</td></tr>" +
                "<tr><td>" + languageConstants[8] + "</td><td>" + weather.main.pressure + " hPa</td></tr>" +
                "<tr><td>" + languageConstants[9] + "</td><td>" + convertTime(weather.sys.sunrise) + "</td></tr>" +
                "<tr><td>" + languageConstants[10] + "</td><td>" + convertTime(weather.sys.sunset) + "</td></tr>" +
                "<tr><td>" + languageConstants[11] + "</td><td><span>" + languageConstants[12] + " " + weather.coord.lon + "</span><br/><span>" + languageConstants[13] + " " + weather.coord.lat + "</span></td></tr>" +
              "</tbody>" +
            "</table>" +
          "</div>";
          var forecastHtml = "<div id='forecast' class='tab-pane fade' role='tabpanel' aria-labelledby='forecastTab'>" +
            "<table class='table forecastTable'>" +
              "<thead>" +
                "<tr><th>" + languageConstants[14] + "</th><th colspan='2' style='text-align: center'>" + languageConstants[15] + "</th><th>" + languageConstants[16] + "</th><th>" + languageConstants[4] + "</th><th>" + languageConstants[5] + "</th><th>" + languageConstants[6] + "</th><th>" + languageConstants[7] + "</th></tr>" +
              "</thead>" +
              "<tbody>";
                forecast.list.forEach(function(item){
                  forecastHtml += "<tr><td>" + convertDate(item.dt_txt, language) + "</td><td><img src='http://openweathermap.org/img/wn/" + item.weather[0].icon + "@2x.png" + "' alt='Weather Icon'></td><td>" + item.weather[0].description + "</td><td>" + item.main.temp + " " + unitFormatConstants[0] + "</td><td>" + item.main.temp_min + " " + unitFormatConstants[0] + "</td><td>" + item.main.temp_max + " " + unitFormatConstants[0] + "</td><td>" + convertWindSpeed(item.wind.speed, unitFormat) + " " + getWindDirection(item.wind.deg, language) + "</td><td>" + item.main.humidity + " %</td></tr>";
                });
              "</tbody>" +
            "</table>" +
          "</div>";
          html += weatherHtml + forecastHtml + "</div>";
          response.status(200).json({valid: "yes", html: html, weather: weather});
        }
        else{
          var message;
          if(language == "hr"){
            message = "Upišite ispravan grad ili izaberite ispravnu mjernu jedinicu!";
          }
          else if(language == "de"){
            message = "Fügen Sie eine Stadt ein oder wählen Sie ein Einheitsformat aus!"
          }
          else{
            message = "Enter a valid city or check a unit format!";
          }
          response.status(200).json({valid: "no", message: message});
        }
      }
    });
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
