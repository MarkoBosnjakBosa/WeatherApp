<template>
	<div id="weather" class="container-fluid">
		<form autocomplete="off" @submit.prevent="getWeather()">
			<h1>Weather</h1>
			<div class="form-group">
				<input type="text" id="city" class="form-control" :class="{'errorField' : cityError}" placeholder="City" v-model="search.city" ref="first" @focus="clearCityStatus()" @keypress="clearCityStatus()"/>
				<small v-if="cityError" class="form-text errorInput">Please provide a valid city!</small>
			</div>
			<div class="form-group">
				<div class="form-check form-check-inline">
					<input type="radio" name="unitFormat" id="metric" class="form-check-input" value="metric" v-model="search.unitFormat" checked/>
					<label for="metric" class="form-check-labe">Metric</label>
				</div>
				<div class="form-check form-check-inline">
					<input type="radio" name="unitFormat" id="imperial" class="form-check-input" value="imperial" v-model="search.unitFormat"/>
					<label for="imperial" class="form-check-labe">Imperial</label>
				</div>
				<div class="form-check form-check-inline">
					<input type="radio" name="unitFormat" id="standard" class="form-check-input" value="standard" v-model="search.unitFormat"/>
					<label for="standard" class="form-check-labe">Standard</label>
				</div>
			</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">Create</button>
				<button type="button" class="btn currentLocation" @click="getWeatherByGeolocation()">Location <i class="fas fa-location-arrow"></i></button>
				<button type="button" class="btn btn-danger" @click="resetWeather()">Reset</button>
			</div>
		</form>
		<div v-if="Object.entries(weather.current).length && Object.entries(weather.forecast).length" class="weatherTabs">
			<ul class="nav nav-tabs justify-content-center" role="tablist">
				<li class="nav-item"><a id="weatherTab" class="nav-link active" data-toggle="tab" href="#weatherContent" role="tab" aria-controls="weather" aria-selected="true">{{languageConstants[0]}}</a></li>
				<li class="nav-item"><a id="forecastTab" class="nav-link" data-toggle="tab" href="#forecastContent" role="tab" aria-controls="forecast" aria-selected="false">{{languageConstants[1]}}</a></li>
			</ul>
			<div class="tab-content">
				<div id="weatherContent" class="tab-pane fade show active" role="tabpanel" aria-labelledby="weatherTab">
					<div style="text-align: center"><img :src="'http://openweathermap.org/img/wn/' + weather.current.weather[0].icon + '@2x.png'" alt="Weather Icon"><b>{{weather.current.main.temp + " " + getUnitFormatIcon() + " - " + weather.current.weather[0].description}}</b>
						<table class="table table-striped">
							<tbody>
								<tr><td>{{languageConstants[2]}}</td><td>{{weather.current.name}}</td></tr>
								<tr><td>{{languageConstants[3]}}</td><td>{{weather.current.main.feels_like + " " + getUnitFormatIcon()}}</td></tr>
								<tr><td>{{languageConstants[4]}}</td><td>{{weather.current.main.temp_min + " " + getUnitFormatIcon()}}</td></tr>
								<tr><td>{{languageConstants[5]}}</td><td>{{weather.current.main.temp_max + " " + getUnitFormatIcon()}}</td></tr>
								<tr><td>{{languageConstants[6]}}</td><td>{{convertWindSpeed(weather.current.wind.speed) + " " + getWindDirection(weather.current.wind.deg)}}</td></tr>
								<tr><td>{{languageConstants[7]}}</td><td>{{weather.current.main.humidity}} %</td></tr>
								<tr><td>{{languageConstants[8]}}</td><td>{{weather.current.main.pressure}} hPa</td></tr>
								<tr><td>{{languageConstants[9]}}</td><td>{{convertTime(weather.current.sys.sunrise)}}</td></tr>
								<tr><td>{{languageConstants[10]}}</td><td>{{convertTime(weather.current.sys.sunset)}}</td></tr>
								<tr><td>{{languageConstants[11]}}</td><td><span>{{languageConstants[12] + " " + weather.current.coord.lon}}</span><br/><span>{{languageConstants[13] + " " + weather.current.coord.lat}}</span></td></tr>
							</tbody>
						</table>
					</div>
				</div>
				<div id="forecastContent" class="tab-pane fade" role="tabpanel" aria-labelledby="forecastTab">
					<table class="table forecastTable">
						<thead>
							<tr>
								<th>{{languageConstants[14]}}</th>
								<th colspan="2" style="text-align: center">{{languageConstants[15]}}</th>
								<th>{{languageConstants[16]}}</th>
								<th>{{languageConstants[4]}}</th>
								<th>{{languageConstants[5]}}</th>
								<th>{{languageConstants[6]}}</th>
								<th>{{languageConstants[7]}}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, index) in weather.forecast.list" :key="index">
								<td>{{convertDate(item.dt_txt)}}</td>
								<td><img :src="'http://openweathermap.org/img/wn/' + item.weather[0].icon + '@2x.png'" alt="Weather Icon"></td>
								<td>{{item.weather[0].description}}</td>
								<td>{{item.main.temp + " " + getUnitFormatIcon()}}</td>
								<td>{{item.main.temp_min + " " + getUnitFormatIcon()}}</td>
								<td>{{item.main.temp_max + " " + getUnitFormatIcon()}}</td>
								<td>{{convertWindSpeed(item.wind.speed) + " " + getWindDirection(item.wind.deg)}}</td>
								<td>{{item.main.humidity + "%"}}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	var axios = require("axios");

	export default {
	name: "weather",
	data() {
		return {
			language: "",
			languageConstants: [],
			weather: {
				current: {},
				forecast: {},
				unitFormat: ""
			},
			search: {
				city: "",
				unitFormat: "metric"
			},
			cityError: false
		}
	},
	methods: {
		getWeather() {
			this.clearCityStatus();
			if(this.invalidCity) {
				this.cityError = true;
				return;
			}
			var body = {city: this.search.city, language: this.language, unitFormat: this.search.unitFormat};
			axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getWeather", body).then(response => {
				if(response.data.valid) {
					this.weather.current = response.data.weather;
					this.weather.forecast = response.data.forecast;
					this.weather.unitFormat = response.data.unitFormat;
					this.$refs.first.focus();
					this.search = {city: "", unitFormat: "metric"};
					this.cityError = false;
				} else {
					this.cityError = true;
				}
			}).catch(error => console.log(error));
		},
		getWeatherByGeolocation() {
			var temp = this;
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					var latitude = position.coords.latitude;
					var longitude = position.coords.longitude;
					var body = {latitude: latitude, longitude: longitude, language: temp.language, unitFormat: temp.search.unitFormat};
					axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getWeather", body).then(response => {
						if(response.data.valid) {
							temp.weather.current = response.data.weather;
							temp.weather.forecast = response.data.forecast;
							temp.weather.unitFormat = response.data.unitFormat;
							temp.$refs.first.focus();
							temp.search = {city: "", unitFormat: "metric"};
							temp.cityError = false;
						} else {
							this.cityError = true;
						}
					}).catch(error => console.log(error));
				});
			}
		},
		resetWeather() {
			this.search = {city: "", unitFormat: "metric"};
			this.weather = {current: {}, forecast: {}, unitFormat: ""};
			this.cityError = false;
		},
		getUnitFormatIcon() {
			var unitFormat = this.weather.unitFormat;
			switch(unitFormat) {
				case "metric":
					return "°C";
				case "imperial":
					return "°F";
				default:
					return "K";        }
		},
		convertWindSpeed(speed) {
			var convertedSpeed;
			if(speed > 0) {
				if(this.weather.unitFormat == "imperial") {
					convertedSpeed = parseFloat(speed).toFixed(2) + " m/h";
				}
				else{
					convertedSpeed = parseFloat(speed * 3.6).toFixed(2) + " km/h";
				}
			}
			return convertedSpeed;
		},
		getWindDirection(angle) {
			var direction;
			if(angle){
				var directions;
				if(this.language == "hr") {
					directions = ["sjever", "sjeverozapad", "zapad", "jugozapad", "jug", "jugoistok", "istok", "sjeveroistok"];
				}
				else if(this.language == "de") {
					directions = ["Nord", "Nord-West", "West", "Süd-West", "Süd", "Süd-Ost", "Ost", "Nord-Ost"];
				}
				else {
					directions = ["North", "North-West", "West", "South-West", "South", "South-East", "East", "North-East"];
				}
				direction = directions[Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8];
			}
			return direction;
		},
		convertTime(unixTime) {
			var date = new Date(unixTime * 1000);
			var hours = date.getHours();
			if(hours < 10) {
				hours = "0" + hours;
			}
			var minutes = "0" + date.getMinutes();
			var time = hours + ":" + minutes.substr(-2);
			return time;
		},
		convertDate(date) {
			var completeArray = date.split(" ");
			var dateArray = completeArray[0].split("-");
			var newDate;
			if(this.language == "hr"){
				newDate = dateArray[2] + "." + dateArray[1] + "." + dateArray[0] + " " + completeArray[1];
			}
			else if(this.language == "de"){
				newDate = dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0] + " " + completeArray[1];
			}
			else{
				newDate = date;
			}
			return newDate;
		},
		clearCityStatus() { this.cityError = false; },
	},
	computed: {
		invalidCity() { return this.search.city === ""; },
	},
	created() {
		var language = this.$route.params.language;
		this.language = language;
		switch(language) {
			case "hr":
				this.languageConstants = ["Trenutno", "Prognoza", "Grad", "Osjećaj", "Minimalna", "Maksimalna", "Vjetar", "Vlaga", "Tlak", "Izlazak Sunca", "Zalazak Sunca", "Koordinate", "Dužina", "Širina", "Datum", "Vrijeme", "Temperatura"];
				break;
			case "de":
				this.languageConstants = ["Aktuell", "Vorschau", "Stadt", "Fühlt sich an wie", "Minimum", "Maximum", "Wind", "Feuchtigkeit", "Druck", "Sonnenaufgang", "Sonnenuntergang", "Koordinaten", "Länge", "Breite", "Datum", "Wetter", "Temperatur"];
				break;
			default:
				this.languageConstants = ["Current", "Forecast", "City", "Feels like", "Minimum", "Maximum", "Wind", "Humidity", "Pressure", "Sunrise", "Sunset", "Coordinates", "Longitude", "Latitude", "Date", "Weather", "Temperature"];
		}
	}
}
</script>

<style scoped>
	form {
		margin: 0 auto;
		max-width: 500px;
		text-align: center;
	}
	h1 {
		margin-top: 20px;
		margin-bottom: 20px;
	}
	label {
		margin-bottom: 0px;
	}
	.currentLocation{
		color: #fff;
		background-color: #ffa500;
		margin-left: 10px;
		margin-right: 10px;
	}
	.weatherTabs {
		margin: 0 auto;
		max-width: 1200px;
	}
	.errorField {
		border: 1px solid #ff0000;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorInput {
		color: #ff0000;
	}
</style>