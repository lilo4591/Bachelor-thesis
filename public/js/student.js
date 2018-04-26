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
      sessionToken: null,
      tokenInput: null
    }
  },
  methods: {
    validateToken() {
      return this.tokenInput === this.sessionToken;
    }
  },

  //TODO validate sessiontoken and route, otherwise show error message
  template: `
   <div>
   <nav>
    <router-link to="/help">Help</router-link>
    </nav>
    <h2>Enter Sessiontoken to join workshop</h2>
    <form @submit.prevent="validateToken">
      <input type="number" v-model="tokenInput">
    </form> 
    <router-link to="/start">
    Log in
   </router-link>
  </div>
  `,

  created: function() {
    
    socket.on("session", function(session) {
      this.sessionToken = session;
      console.log(this.sessionToken);
    }.bind(this));
  }

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
    //TODO sessiontoken here is null, only updated in login component atm
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


