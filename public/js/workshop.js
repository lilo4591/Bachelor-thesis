'use strict';
var socket = io();

var vm = new Vue({
  el: '#page',
  name: 'Workshop',
  data () {
    return {
      name: 'Workshop Page',
      options: [
        {"option": "Exercise 1"},
        {"option": "Exercise 2"},
        {"option": "Exercise 3"},
        {"option": "Exercise 3"}
      ],
    }
  },

  methods: {
    goTo: function(url) {
      window.location.href = url;
      console.log("redirecting to next page..")
    }
  }
});

