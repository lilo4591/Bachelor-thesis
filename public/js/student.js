/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var studentsocket = io('/students');
var groupsocket; 
var socket = io();

//TODO keep sessiontoken and studentID troughout the whole workshop

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
      tokenInput: null,
      groupId: null
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
   
    studentsocket.on('connectionmessage', message => {
      console.log(message);
    });

    socket.on('session', function(session) {
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
    <h2>You are logged in</h2>
    <p>Here should be your group number and studentID</p>
    <p>This should be the base for all starts of exercises</p>
  </div>
  `,
  created:function() {
    //TODO sessiontoken here is null, only updated in login component atm
    //notify namespace students that student logged in
    studentsocket.emit('loggedIn', {"sessiontoken": this.sessionToken,
                             "studentId": this.studentId     
    });

    studentsocket.on('generateGroupsStudent', function (message) {
      console.log(message);
      studentsocket.emit('startGenerateGroups', studentsocket.id);
    });
    studentsocket.on('namespace', function (group) {
      groupsocket = io.(String(group));
      console.log(group);
    });


    socket.on('redirect', function(exerciseNum) {
      //TODO route based on exerciseNum
      console.log("redirection student to exercise...");
      if (exerciseNum === 1) {
        router.push('/exercise1');
      }
      if (exerciseNum === 2) {
        router.push('/exercise2');
      }
    }.bind(this));
     
  }

});


const Exercise1 = Vue.component('Exercise1', {
  data: function() {
    return {
      name: "Provocative",
      studentId: null,
      sessiontoken: null,
      thought: '',
      thoughts: [
        {"thought": "Example: I think this is wrong because of current laws.." }
      ]
    }
  },
  methods: {
    addThought() { 
      this.thoughts.push({thought: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    }
  },
  template: `
  <div id= "page"><!-- TODO Show first dilemma here-->
      <!-- prevent: prevents from page reloading -->
      <div class="holder">
      <h2>This exercise is provocative</h2>
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here plx..." v-model="thought">
        </form> 
        <p>These are your thoughts</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
    </div>
  `
});

const Exercise2 = Vue.component('Exercise2', {
  data: function() {
    return {
      name: "Autonomy and Heteronomy",
      studentId: null,
      sessiontoken: null,
      thought: '',
      thoughts: [ 
        {"thought": "Example: I think this is wrong because of current laws.." }
      ]
    }
  },
  methods: {
    addThought() { 
      this.thoughts.push({thought: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    },
    collectThoughts() {
      console.log("emitting thoughts");
      socket.emit('thoughts', this.thoughts);
      this.thoughts = [];
    }
  },
  template: `
  <div id= "page"><!-- TODO Show first dilemma here-->
      <!-- prevent: prevents from page reloading -->
      <div class="holder">
      <h3>This exercise is about heteronomy and autonomy</h3>
        <p>Description of dilemma goes here</p>
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here plx..." v-model="thought">
        </form> 
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectThoughts()"> 
    <router-link to="/exercise2p1">
    Submit Thoughts
    </router-link>
    </div>
    </div>
  `
});

const Exercise2p1 = Vue.component('Exercise2p1', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.1",
      studentId: null,
      sessiontoken: null
    }
 },
 
 template: `
  <div> 
    <h1>Exercise 2 {{ name }}</h1>
    <p>Please have a look at the bigger screen and discuss your thougts.<br>
    When you the teacher tells you it is tome for the next step in this exercise press continue..<br>
    To add more thoughts press go back</p>
    <router-link to="/exercise2">
    Go back
    </router-link> 
    /
    <router-link to="/exercise2p2">
    Continue
    </router-link>
  </div>`
  });

const Exercise2p2 = Vue.component('Exercise2p2', {
  //TODO: Only one person in each groupshould be able to submit a dilemma,
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.2",
      dilemma: "",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null
    }
 },
  methods: {
    updateSubmit(bool) {
      this.notsubmitted = bool;
    } 
  }
  ,
   
  //<form class="largeInput" v-if="this.notsubmitted" @submit=updateSubmit() >
  //TODO: Textara output {{dilemma}} should inlude linebreaks 
   template: `
  <div>
    <p>Discuss in your group and formulate your own dilemma relevant to your occupation.</p>
        <div v-if="notsubmitted">
          <textarea placeholder="Enter your dilemma here please" cols="40" rows="5" v-model="dilemma">
          </textarea>
          <button id="smallbutton" v-on:click="updateSubmit(false)">Submit dilemma</button>
        </div>
        <div v-if="notsubmitted===false"> {{ dilemma }} 
          <button id="smallbutton" v-on:click="updateSubmit(true)">Edit dilemma</button>
        </div>
        <router-link to="/exercise2p3">
        Continue
        </router-link>
  </div>
  `
});

const Exercise2p3 = Vue.component('Exercise2p3', {
  //TODO: This is individual
  //TODO: Update relevant example thought
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.3: Reflex thoughts",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null,
      reflex: "",
      reflexthoughts: [ 
        {"reflex": "Example thought: I think that this is not a problem...." }
      ]
  }
 },
  methods: {
    addReflexThought() { 
      this.reflexthoughts.push({reflex: this.reflex});
      this.reflex = '';
    },
    removeReflexThought(id) {
      this.reflexthoughts.splice(id,1);
    },
  }
  ,
   
  //<form class="largeInput" v-if="this.notsubmitted" @submit=updateSubmit() >
  //TODO: send dilemma from previous route exercisep2.3 and write it out
   template: `
  <div>
    {{name}}
    <p>Individually write down instinctive thougts that occur about the dilemma
    <br>What is the first thing you think about about this dilemma?? </p>
      dilemma goex here
      <div class="holder">
        <form @submit.prevent="addReflexThought">
          <input type="text" placeholder="Enter your reflex thoughts here plx..." v-model="reflex">
        </form> 
        <p>These are your reflex thoughts</p>
        <ul>
          <li v-for="(data, index) in reflexthoughts" :key='index'> 
            {{data.reflex}}
            <i class="material-icons" v-on:click="removeReflexThought(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link to="/exercise2p3">
      Continue
    </router-link>
  </div>
  `
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
    },
    {
      path:'/exercise1',
      component:Exercise1
    },
    { //autonomy heteronomy
      path:'/exercise2',
      component:Exercise2
    },
    {
      path:'/exercise2p1',
      component:Exercise2p1
    },
    {
      path:'/exercise2p2',
      component:Exercise2p2
    },
    {
      path:'/exercise2p3',
      component:Exercise2p3
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


