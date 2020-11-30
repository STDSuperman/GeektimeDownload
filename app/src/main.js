import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { Menu } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

const app = createApp(App);

app.use(Menu);

app.mount('#app');