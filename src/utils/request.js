import axios from 'axios'
var service = axios.create({
    baseURL: 'http://192.168.0.112:6008/v2',
    timeout: 5000,
    headers: {
        'access_token': 'O+uu+/tjpcGtF0pOlL+61Q=='
    }
})
export default service