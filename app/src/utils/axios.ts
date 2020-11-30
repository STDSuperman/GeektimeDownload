import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:7001',
    withCredentials: true,
    timeout: 10000
});

instance.interceptors.response.use((res) => {
    const data = res.data;
    return data;
}, (err) => {
    console.log(err);
});

export default instance;