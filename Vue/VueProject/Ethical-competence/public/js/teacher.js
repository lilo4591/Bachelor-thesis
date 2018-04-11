/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
/*
const routes = [
  {path: '/admin', component: }
];
*/
'use strict';
var socket = io();


var Home = { template: "<div><h1>Home</h1><p>This is home</p></div>" };
var About = { template: "<div><h1>About</h1><p>This is some information about our awesome company.</p></div>" };
var SelectAdmin = { template: '/admin'};

var routes = [
    { path: '/', component: Home },
    { path: '/about', component: About},
    { path: '/admin', redirect: '/admin'}
              ];

var router = new VueRouter({
          mode: 'history',
          routes: routes,
              });

var vm = new Vue({
  el: '#page',
  router: router,
  data: {
    map: null,
    students: {},
    groups: {},
    sessiontoken: null
  },
/*  created: function () {
    socket.on('initialize', function (data) {
      // add taxi markers in the map for all taxis
      for (var taxiId in data.taxis) {
        this.taxiMarkers[taxiId] = this.putTaxiMarker(data.taxis[taxiId]);
      }
    }.bind(this));
  }*/
  methods: {
    setSessiontoken: function(event) {
      this.data.sessiontoken = getRandomInt(1000, 9000);
      socket.emit("sessiontoken", { sessiontoken: this.data.sessiontoken });
    }

  }
});
