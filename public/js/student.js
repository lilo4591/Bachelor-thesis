/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

const Help = Vue.component('Help', {
  template: `
  <div> <h1>this is the student help page </h1>
        <router-link to="/">Back</router-link>
  </div>`
  });


const Login = Vue.component('Login', {
  data: function(){
    return {
      sessionToken: null
    }
  },
  methods: {
    validateToken() {
      return this.tokenInput === this.sessionToken;
    }
  },


  template: `
   <div>
   <nav>
    <router-link to="/help">Help</router-link>
    </nav>
    <form @submit.prevent="validateToken">
      <input type="number" placeholder="Enter Sessiontoken to join workshop" v-model="sessionToken">
    </form> 
    <router-link to="/start">
    Log in
   </router-link>
  </div>
  `

});

const Start = Vue.component('Start', {
  data: function(){
    return {
      sessionToken: null,
      studentId: 0,
    }
  },

  template: `
   <div>
    you are logged in
    here should be your group number and studentID
  </div>
  `,
  created:function() {

    console.log("connected");
    socket.emit('loggedIn', {"sessiontoken": this.sessionToken,
                             "studentId": this.studentId     
    });
    socket.on('getStudentId', function(id) {
      this.studentId = id;
    }.bind(this));
    
  }

});

const router = new VueRouter({
  routes:[
    {
      path:'/help',
      component:Help
    },
    {
      path:'/',
      component:Login
    },
    {
      path:'/start',
      component:Start
    }
  ]
});

const app = new Vue({
  el: '#student',
  name: 'StudentWorkshop',
  router,
  socket,
  data () {
    return {
      name: 'StudentWorkshop',
    }
   },
  created: function() {
    socket.on('initToken', function(data){
      this.token = token;
    }.bind(this));
  }
});


