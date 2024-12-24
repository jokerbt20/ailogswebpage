import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from './views/Default_old.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'Home', component: Home },
];

const router = new VueRouter({
  mode: 'history', // History mode for clean URLs
  routes,
});

export default router;