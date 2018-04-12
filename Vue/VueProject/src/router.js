import Vue from 'vue'
import Router from 'vue-router'
import Teacher from './components/Teacher.vue'
import About from './components/About.vue'
import Workshop from './components/Workshop.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Teacher',
      component: Teacher
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/workshop',
      name: 'Workshop',
      component: Workshop
    }
  ],
  methods: {
    navigateTo(nav) {
        this.$route.push({
          path: './workshop'
        })
        this.$route.push({
          path: './workshop'
        }) 
    }
  }
})

