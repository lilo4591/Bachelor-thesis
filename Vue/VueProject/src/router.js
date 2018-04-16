import Vue from 'vue'
import Router from 'vue-router'
import Teacher from './components/teacherpage/Teacher.vue'
import About from './components/teacherpage/About.vue'
import Workshop from './components/teacherpage/Workshop.vue'
import HeteronomyAutonomy1 from './components/teacherpage/HeteronomyAutonomy1.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Teacher',
      component: Teacher
    },
    {
      path: '/teacher/about',
      name: 'about',
      component: About
    },
    {
      path: '/teacher/workshop',
      name: 'Workshop',
      component: Workshop
    },
    {
      path: '/teacher/heteronmyautonomy1',
      name: 'HeteronomyAutonomy1',
      component: HeteronomyAutonomy1
    }
   ],
  /*
  methods: {
    navigateTo(nav) {
        this.$route.push({
          path: './workshop'
        })
        this.$route.push({
          path: './workshop'
        }) 
    }
  }*/
})

