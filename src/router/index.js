import Vue from 'vue'
import Router from 'vue-router'
import addProject from '@/components/addProject'
Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'addProject',
        component: addProject
    }]
})