
<template>
    <div id="overview" class="container-fluid">
        <div class="container pageNotFoundDiv">
            <div class="alert alert-danger" role="alert">Page not found!</div>
            <a href="#" class="btn btn-info" role="button" @click="openWeather()">Weather <i class="fas fa-cloud-sun"></i></a>
		</div>
    </div>
</template>

<script>
    import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";

    export default {
        name: "pageNotFound",
        methods: {
            openWeather() {
                this.$router.push("/weather/en");
            }
        }
    }
</script>

<style scoped>
    .pageNotFoundDiv {
        margin: 0 auto;
        max-width: 400px;
        text-align: center;
        margin-top: 20px;
    }
</style>