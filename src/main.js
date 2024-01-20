import { createApp } from 'vue'
import App from './App.vue'
import 'bulma/css/bulma.css';
// import router from './router';
import axios from 'axios';
// Mengatur instance Axios ke dalam objek window
window.axios = axios; 
// Define the feature flag
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

createApp(App)
  // .use(router)
  .mount('#app');
