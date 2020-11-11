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
            <input type="radio" name="unitFormat" id="metric" class="form-check-input" value="metric" checked/>
            <label for="metric" class="form-check-labe">Metric</label>
          </div>
          <div class="form-check form-check-inline">
            <input type="radio" name="unitFormat" id="imperial" class="form-check-input" value="imperial"/>
            <label for="imperial" class="form-check-labe">Imperial</label>
          </div>
          <div class="form-check form-check-inline">
            <input type="radio" name="unitFormat" id="standard" class="form-check-input" value="standard"/>
            <label for="standard" class="form-check-labe">Standard</label>
          </div>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Create</button>
          <button type="button" class="btn currentLocation">Location <i class="fas fa-location-arrow"></i></button>
        </div>
    </form>
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
				submitting: false,
        cityError: false,
        unitFormatError: false,
				search: {
          city: "",
          unitFormat: "metric"
        }
			}
    },
    methods: {
      getWeather() {
        this.submitting = true;
        this.clearCityStatus();
        this.clearUnitFormatStatus();
        var allowSubmit = true;
        if(this.invalidCity) {
          this.cityError = true;
          allowSubmit = false;
        }
        if(this.invalidUnitFormat) {
            this.unitFormatError = true;
            allowSubmit = false;
        }
        if(!allowSubmit) {
            return;
        }
        var body = {city: this.search.city, unitFormat: this.search.unitFormat, language: this.language};
        axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getWeather", body).then(response => {
            if(response.data.valid) {
                console.log(response.data);
                this.$refs.first.focus();
                this.search = {city: "", unitFormat: "metric"};
                this.cityError = false, this.unitFormatError = false, this.submitting = false;
            } else {
                var errorFields = response.data.errorFields;
                if(errorFields.includes("city")) this.cityError = true;
                if(errorFields.includes("unitFormat")) this.unitFormatError = true;
            }
        }).catch(error => console.log(error));
      },
      clearCityStatus() { 
          this.cityError = false;
      },
      clearUnitFormatStatus() { 
          this.unitFormatError = false;
      },
    },
    computed: {
      invalidCity() { return this.search.city === ""; },
			invalidUnitFormat() { return this.search.unitFormat === "" && this.search.unitFormat != "metric" && this.search.unitFormat != "imperial" && this.search.unitFormat != "standard"; },
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
  #weather {
    margin: 0 auto;
    max-width: 500px;
  }
  h1 {
    text-align: center;
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
  }
</style>