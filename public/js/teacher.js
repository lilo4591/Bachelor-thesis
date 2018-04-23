/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
Vue.use(VueRouter)

//var socket = io();

const home = {template:  '<h1>homepage</h1>' }
const help = {template: '<h1>this is the help page </h1>' }



const routes = [
  {path: '/home', component: home},
  {path: '/help', component: help}
];

const router = new VueRouter({
  routes: routes
});
  

var vm = new Vue({
  el:'#page',
  name: 'Teacher',
  router,
  data () {
    return {
      name: 'Teacher Page',
      
      options: [
        {"option": "Start Workshop"},
        {"option": "Edit Workshop"}
      ]
    }
  },
  methods: {
    goTo: function(url) {
      window.location.href = url;
      console.log("Hello")
    }
  }
}).$mount('#page')

/*
var vm = new Vue({
  el: '#page',
  data: {
    map: null,
    taxiId: 0,
    taxiLocation: null,
    taxiLocationAddress: null,
    show: [],
    orders: {},
    orderQueue: [],
    customerMarkers: {},
    route: null
  },
  created: function () {
    socket.on('initialize', function (data) {
      this.orders = data.orders;
    }.bind(this));
    socket.on('currentQueue', function (data) {
      this.orders = data.orders;
    }.bind(this));
    // this icon is not reactive
    this.taxiIcon = L.icon({
      iconUrl: "img/taxi.png",
      iconSize: [36,36],
      iconAnchor: [18,36]
    });
    this.fromIcon = L.icon({
      iconUrl: "img/customer.png",
      iconSize: [36,50],
      iconAnchor: [19,50]
    });


    //Helper function, should probably not be here
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }
*/
