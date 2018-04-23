'use strict';
var socket = io.connect();

Vue.use(VueRouter)

const home = {template:  '<h1>homepage</h1>' }
const help = {template: '<h1>this is the help page </h1>' }



const routes = [
  {path: '/home', component: home},
  {path: '/help', component: help}
];

const router = new VueRouter({
  routes: routes
});
 
//export default{vm};

var vm = new Vue({
  el: '#page',
  name: 'Workshop',
  router,
  data () {
    return {
      name: 'Workshop',
      token: null,
      //for workshop.html
      exerciseOptions: [
        {"exerciseOption": "Exercise 1"},
        {"exerciseOption": "Exercise 2"},
        {"exerciseOption": "Exercise 3"},
        {"exerciseOption": "Exercise 4"}
      ],
      //for workshop.html
      workshopOptions: [
        {"workshopOption": "Start Workshop"},
        {"workshopOption": "Edit Workshop"}
      ],
      //teacher-start-workshop.hthml
      student: '',
      students: {"student": "23"},
      //autonomy-heteronomy.html
      thought: '',
      thoughts: [
        {"thought": "Example: I think this is wrong because of current laws.." }
      ]
    }
   },
  methods: {
    getRandomInteger: function(min, max) {
          return Math.floor(Math.random() * (max - min) ) + min;
    },
     goTo: function(url) {
      window.location.href = url;
      console.log("redirecting to next page..");
      console.log(vm.token);
    },

     startWorkshop: function(url) {
      console.log("init");
      var t = vm.getRandomInteger(1111,9999);
      vm.token = t;
      socket.emit('initToken', {
            token: vm.token
      });
      console.log(vm.token);
      vm.goTo(url);
    },

  //for autonomy-heteronomy exercise
    addThought() { 
      this.thoughts.push({thought: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    } 
  }
}).$mount('#page');

function startWorkshop2(url) {
      console.log("init");
      var t = vm.getRandomInteger(1111,9999);
      vm.token = t;
      socket.emit('initToken', {
            token: vm.token
      });
      console.log(vm.token);
      vm.goTo(url);
}

