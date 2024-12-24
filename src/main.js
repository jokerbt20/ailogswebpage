import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import axios from "axios";

Vue.prototype.$http = axios;

Vue.config.productionTip = false
Vue.prototype.$http.defaults.baseURL = "http://localhost:8080"

Vue.use(router); // Use the router

Vue.filter('formatDateTime', function (timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString(); // Formats the date-time based on the user's locale
});

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
