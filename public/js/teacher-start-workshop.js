'use strict';
var socket = io();

var vm = new Vue ({
  el: '#page',
  name: 'StartWorkshop',
  data () {
    return {
      name: 'StartWorkshop',
      btnState: true,
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
      getRandomnteger(1111,9999)
    }.bind(this));

  },
  methods: {
     getRandomnteger(min, max) {
          return Math.floor(Math.random() * (max - min) ) + min;
    }
  }
  
});

