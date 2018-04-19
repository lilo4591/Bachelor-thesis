'used strict';
var socket = io();


var vm1 = new Vue({
  el:'#headerpage',
  name: 'Teacherheaderpage',
  data () {
    return {
      name: 'Page',
   }
  },
  methods: {
    goTo: function (url) {
      console.log(url);
      console.log("click");
      window.location.href = url;
    }
  }
});

