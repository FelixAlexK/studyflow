import { convexVue } from "convex-vue";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

const app = createApp(App);

app.use(convexVue, {
	url: import.meta.env.VITE_CONVEX_URL,
});

app.use(router)

app.mount("#app");
