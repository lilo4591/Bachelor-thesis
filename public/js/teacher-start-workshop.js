'use strict';
var socket = io();

var vm = new Vue ({
  el: '#page',
  name: 'StartWorkshop',
  data () {
    return {
      name: 'StartWorkshop',
      btnState: true,
      token: null,
      options: [
        {"option": "Start Workshop"},
        {"option": "Edit Workshop"}
      ],
      student: '',
      students: {"student": "23"}
    }
  },
  created: function () {
      socket.emit('initToken', function (data) {
      t = getRandomnteger(1111,9999);
      this.token = t;
    }.bind(this));
  },
  methods: {
    goTo: function(url) {
      window.location.href = url;
      console.log("Hello")
    },
    getRandomnteger: function(min, max) {
          return Math.floor(Math.random() * (max - min) ) + min;
    }
  }
  
});

