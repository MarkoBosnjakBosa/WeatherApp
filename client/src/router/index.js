import {createRouter, createWebHistory} from "vue-router";
import Weather from "../views/Weather.vue";
import PageNotFound from "../views/PageNotFound.vue";

const routes = [
	{
		path: "/weather/:language",
		name: "Weather",
		component: Weather
	},
	{
		path: "/:catchAll(.*)",
		name: "PageNotFound",
		component: PageNotFound
	}
]

const router = createRouter({history: createWebHistory(process.env.BASE_URL), routes});

export default router;
