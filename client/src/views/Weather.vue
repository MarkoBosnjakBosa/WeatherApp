<template>
	<div id="weather" class="container-fluid">
		<form autocomplete="off" @submit.prevent="getWeather()">
			<h1>{{languageConstants[0]}}</h1>
			<div class="form-group">
				<input type="text" id="city" class="form-control" :class="{'errorField' : cityError}" :placeholder="languageConstants[1]" v-model="search.city" ref="first" @focus="clearCityStatus()" @keypress="clearCityStatus()"/>
				<small v-if="cityError" class="form-text errorInput">{{languageConstants[24]}}</small>
			</div>
			<div class="form-group">
				<div class="form-check form-check-inline">
					<input type="radio" name="unitFormat" id="metric" class="form-check-input" value="metric" v-model="search.unitFormat" checked/>
					<label for="metric" class="form-check-labe">{{languageConstants[2]}}</label>
				</div>
				<div class="form-check form-check-inline">
					<input type="radio" name="unitFormat" id="imperial" class="form-check-input" value="imperial" v-model="search.unitFormat"/>
					<label for="imperial" class="form-check-labe">{{languageConstants[3]}}</label>
				</div>
				<div class="form-check form-check-inline">
					<input type="radio" name="unitFormat" id="standard" class="form-check-input" value="standard" v-model="search.unitFormat"/>
					<label for="standard" class="form-check-labe">{{languageConstants[4]}}</label>
				</div>
			</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">{{languageConstants[5]}}</button>
				<button type="button" class="btn currentLocation" @click="getWeatherByGeolocation()">{{languageConstants[6]}} <i class="fas fa-location-arrow"></i></button>
				<button type="button" class="btn btn-danger" @click="resetWeather()">{{languageConstants[7]}}</button>
			</div>
		</form>
		<div v-if="Object.entries(weather.current).length && Object.entries(weather.forecast).length" class="weatherTabs">
			<ul class="nav nav-tabs justify-content-center" role="tablist">
				<li class="nav-item"><a id="weatherTab" class="nav-link active" data-toggle="tab" href="#weatherContent" role="tab" aria-controls="weather" aria-selected="true">{{languageConstants[8]}}</a></li>
				<li class="nav-item"><a id="forecastTab" class="nav-link" data-toggle="tab" href="#forecastContent" role="tab" aria-controls="forecast" aria-selected="false">{{languageConstants[9]}}</a></li>
			</ul>
			<div class="tab-content">
				<div id="weatherContent" class="tab-pane fade show active" role="tabpanel" aria-labelledby="weatherTab">
					<div class="aligned"><img :src="'http://openweathermap.org/img/wn/' + weather.current.weather[0].icon + '@2x.png'" alt="Weather Icon"><b>{{weather.current.main.temp + " " + getUnitFormatIcon() + " - " + weather.current.weather[0].description}}</b>
						<table class="table table-striped">
							<tbody>
								<tr><td>{{languageConstants[10]}}</td><td>{{weather.current.name}}</td></tr>
								<tr><td>{{languageConstants[11]}}</td><td>{{weather.current.main.feels_like + " " + getUnitFormatIcon()}}</td></tr>
								<tr><td>{{languageConstants[12]}}</td><td>{{weather.current.main.temp_min + " " + getUnitFormatIcon()}}</td></tr>
								<tr><td>{{languageConstants[13]}}</td><td>{{weather.current.main.temp_max + " " + getUnitFormatIcon()}}</td></tr>
								<tr><td>{{languageConstants[14]}}</td><td>{{convertWindSpeed(weather.current.wind.speed) + " " + getWindDirection(weather.current.wind.deg)}}</td></tr>
								<tr><td>{{languageConstants[15]}}</td><td>{{weather.current.main.humidity + "%"}}</td></tr>
								<tr><td>{{languageConstants[16]}}</td><td>{{weather.current.main.pressure + " hPa"}}</td></tr>
								<tr><td>{{languageConstants[17]}}</td><td>{{convertTime(weather.current.sys.sunrise)}}</td></tr>
								<tr><td>{{languageConstants[18]}}</td><td>{{convertTime(weather.current.sys.sunset)}}</td></tr>
								<tr><td>{{languageConstants[19]}}</td><td><span>{{languageConstants[20] + " " + weather.current.coord.lon}}</span><br/><span>{{languageConstants[21] + " " + weather.current.coord.lat}}</span></td></tr>
							</tbody>
						</table>
					</div>
				</div>
				<div id="forecastContent" class="tab-pane fade" role="tabpanel" aria-labelledby="forecastTab">
					<table class="table forecastTable">
						<thead>
							<tr>
								<th>{{languageConstants[22]}}</th>
								<th colspan="2" class="aligned">{{languageConstants[0]}}</th>
								<th>{{languageConstants[23]}}</th>
								<th>{{languageConstants[12]}}</th>
								<th>{{languageConstants[13]}}</th>
								<th>{{languageConstants[14]}}</th>
								<th>{{languageConstants[15]}}</th>
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
							temp.cityError = true;
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
			switch(this.weather.unitFormat) {
				case "metric":
					return "°C";
				case "imperial":
					return "°F";
				default:
					return "K";        
			}
		},
		convertWindSpeed(speed) {
			var convertedSpeed = 0;
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
			var direction = "";
			if(angle) {
				var directions;
				switch(this.language) {
					case "hr":
						directions = ["sjever", "sjeverozapad", "zapad", "jugozapad", "jug", "jugoistok", "istok", "sjeveroistok"];
						break;
					case "de":
						directions = ["Nord", "Nord-West", "West", "Süd-West", "Süd", "Süd-Ost", "Ost", "Nord-Ost"];
						break;
					default:
						directions = ["North", "North-West", "West", "South-West", "South", "South-East", "East", "North-East"];
						break;
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
			switch(this.language) {
				case "hr":
					return dateArray[2] + "." + dateArray[1] + "." + dateArray[0] + " " + completeArray[1]; 
				case "de":
					return dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0] + " " + completeArray[1];
				default:
					return date;
			}
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
				this.languageConstants = ["Vrijeme", "Grad", "Metrički", "Imperijalni", "Standardni", "Spremi", "Lokacija", "Resetiraj", "Trenutno", "Prognoza", "Grad", "Osjećaj", "Minimalna", "Maksimalna", "Vjetar", "Vlaga", "Tlak", "Izlazak Sunca", "Zalazak Sunca", "Koordinate", "Dužina", "Širina", "Datum", "Temperatura", "Upišite ispravan grad!"];
				break;
			case "de":
				this.languageConstants = ["Wetter", "Grad", "Metrisch", "Imperial", "Standard", "Speichern", "Standort", "Zurücksetzen", "Aktuell", "Vorschau", "Stadt", "Gefühlte", "Minimum", "Maximum", "Wind", "Feuchtigkeit", "Druck", "Sonnenaufgang", "Sonnenuntergang", "Koordinaten", "Länge", "Breite", "Datum", "Temperatur", "Fügen Sie eine Stadt ein!"];
				break;
			default:
				this.languageConstants = ["Weather", "City", "Metric", "Imperial", "Standard", "Submit", "Location", "Reset", "Current", "Forecast", "City", "Feels like", "Minimum", "Maximum", "Wind", "Humidity", "Pressure", "Sunrise", "Sunset", "Coordinates", "Longitude", "Latitude", "Date", "Temperature", "Provide a valid city!"];
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
	.aligned {
		text-align: center;
	}
	.forecastTable td{
		vertical-align: middle;
		padding-top: 0;
		padding-bottom: 0;
	}
	.errorField {
		border: 1px solid #ff0000;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorInput {
		color: #ff0000;
	}
</style>