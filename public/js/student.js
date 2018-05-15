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
      groupName: null,

    }
  },

  template: `
   <div>
    <h2>You are logged in</h2>
    <p v-if="this.groupName != null">The name of your group is {{ groupName }}</p>
    <p>This should be the base for all starts of exercises</p>
  </div>
  `,
  created:function() {
    //TODO sessiontoken here is null, only updated in login component atm
    //notify namespace students that student logged in
    studentsocket.emit('loggedIn', {"sessiontoken": this.sessionToken,
                             "studentId": this.studentId     
    });

    studentsocket.on('namespace', function (group) {
      groupsocket = io.connect(group);
      this.groupName = (group);
      console.log(group);
    }.bind(this));


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

//all students together
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
    <h2>Exercise 2 {{ name }}</h2>
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
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.2",
      dilemma: "",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null
    }
 },
  created: function() {
    groupsocket.on('showdilemma', function(data) {
      console.log("showdilemma");
      this.dilemma = data.dilemma;
      this.notsubmitted = data.notsubmitted;
    }.bind(this));

    groupsocket.on('editdilemma', function(data) {
      console.log("editDilemma");
      this.dilemma = data.dilemma;
      this.notsubmitted = data.notsubmitted;
    }.bind(this));
 },
  methods: {
    
    notifyGroupSubmit(bool, dilemma) {
      console.log("notifyGroupSubmit");
      this.notsubmitted = bool;
      groupsocket.emit('dilemma', {'dilemma': dilemma, 'notsubmitted': false});
    },
    notifyGroupEdit(bool, dilemma) {
      console.log("notifyGroupEdit");
      this.notsubmitted = bool;
      groupsocket.emit('edit', {'dilemma': dilemma, 'notsubmitted': true});
    },
 /*   saveDilemma(dilemma) {
      groupsocket.emit('savedilemma', dilemma);
    }*/
  }
  ,
   
  //<form class="largeInput" v-if="this.notsubmitted" @submit=updateSubmit() >
  //TODO: Textara output {{dilemma}} should inlude linebreaks 
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Discuss in your group and formulate your own dilemma relevant to your occupation.</p>
        <div v-if="notsubmitted">
          <textarea placeholder="Enter your dilemma here please" cols="40" rows="5" v-model="dilemma">
          </textarea>
          <button id="smallbutton" v-on:click="notifyGroupSubmit(false, dilemma)">Submit dilemma</button>
        </div>
        <div v-if="notsubmitted===false"> {{ dilemma }} <br> 
          <button id="smallbutton" v-on:click="notifyGroupEdit(true, dilemma)">Edit dilemma</button>
        </div>
        <router-link :to="{ name: 'exercise2p3', params: {dilemma: this.dilemma} } ">
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
      ],
      dilemma: "",
  }
 },
  created: function() {
    this.dilemma = this.$route.params.dilemma;
  },
  methods: {
    addReflexThought() { 
      this.reflexthoughts.push({reflex: this.reflex});
      this.reflex = '';
    },
    removeReflexThought(id) {
      this.reflexthoughts.splice(id,1);
    },
    collectReflexThoughts() {
      console.log("collecting reflex thoughts");
      groupsocket.emit('reflexthoughts', this.reflexthoughts);
    }
  }
  ,
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Discuss in your group.
    <br>Individually write down instinctive thoughts that occur about the dilemma
    <br>What is the first thing you think about about this dilemma?? 
    <br>Also write possible instinctive thoughts of other perspectives.
    <br>Write all thoughts you can come up with, independent of the solution you want to come to.</p>
      dilemma goex here
      {{dilemma}}
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
      <div v-on:click="collectReflexThoughts()">
    <router-link :to="{ name: 'exercise2p4', params: {dilemma: this.dilemma} }">
      Continue
    </router-link>
    </div>
  </div>
  `
});


const Exercise2p4 = Vue.component('Exercise2p4', {
  //TODO: This is individual
  //TODO: Update relevant example thought
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.4: Show groups reflex thoughts",
      dilemma: "",
      reflexthoughts: null
  }
 },
  created: function() {
    groupsocket.on('showreflexthoughts', function(data) {
      console.log("showreflexthougts");
      console.log(data);
      this.reflexthoughts = data;
    }.bind(this));
    this.dilemma = this.$route.params.dilemma;
  },
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Group thoughts
    <br>What is the first thing you think about about this dilemma?? </p>
      dilemma goex here
      {{dilemma}}
      <div class="holder">
        <p>These are your group's reflex thoughts</p>
        <ul>
          <li v-for="(data, index) in reflexthoughts" :key='index'> 
            {{data.reflex}}
            <i class="material-icons" v-on:click="removeReflexThought(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link :to="{ name: 'exercise2p3', params: {dilemma: this.dilemma} } ">
      Go Back /
    </router-link>
    <router-link :to="{ name: 'exercise2p5', params: {dilemma: this.dilemma} } ">
      Continue
    </router-link>
  </div>
  `
});

const Exercise2p5 = Vue.component('Exercise2p5', {
  //TODO: This is individual
  //TODO: translate dogmatic låsningar
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.5: Principle fixations",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null,
      principle: "",
      principles: [ 
        {"principle": "Example principle: You have to follow the law...." }
      ],
      dilemma: "",
  }
 },
  created: function() {
    this.dilemma = this.$route.params.dilemma;
  },
  methods: {
    addPrinciple() { 
      this.principles.push({principle: this.principle});
      this.principle = '';
    },
    removePrinciple(id) {
      this.principles.splice(id,1);
    },
    collectPrinciples() {
      console.log("collecting principle thoughts");
      groupsocket.emit('principles', this.principles);
    }
  }
  ,
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Discuss with your group.
    <br>Individually write down principles that relates to the dilemma.
    <br>These principles are the reason for the moral dilemma since you can't follow them all.
    <br>Write all principles you can come up with, independent of the solution you want to come to.</p>
      Your group's dilemma is the following: 
      {{dilemma}}
      <div class="holder">
        <form @submit.prevent="addPrinciple">
          <input type="text" placeholder="Enter your principle here plx..." v-model="principle">
        </form> 
        <p>These are your principles</p>
        <ul>
          <li v-for="(data, index) in principles" :key='index'> 
            {{data.principle}}
            <i class="material-icons" v-on:click="removePrinciple(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectPrinciples()">
    <router-link :to="{ name: 'exercise2p6', params: {dilemma: this.dilemma} }">
      Continue
    </router-link>
    </div>
  </div>
  `
});


const Exercise2p6 = Vue.component('Exercise2p6', {
  //TODO: This is individual
  //TODO: Update relevant example thought
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.6: Show groups principles",
      dilemma: "",
      principles: null
  }
 },
  created: function() {
    groupsocket.on('showprinciples', function(data) {
      console.log("showprinciples");
      console.log(data);
      this.principles = data;
    }.bind(this));
    this.dilemma = this.$route.params.dilemma;
  },
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Group thoughts
    <br>If you fixate by a principle will make you bild to the others </p>
      Your group's dilemma is: 
      {{dilemma}}
      <div class="holder">
        <p>These are your group's thoughts on principles</p>
        <ul>
          <li v-for="(data, index) in principles" :key='index'> 
            {{data.principle}}
            <i class="material-icons" v-on:click="removePrinciple(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link :to="{ name: 'exercise2p5', params: {dilemma: this.dilemma} } ">
      Go Back /
    </router-link>
    <router-link :to="{ name: 'exercise2p7', params: {dilemma: this.dilemma} } ">
      Continue
    </router-link>
  </div>
  `
});

//concrete values
const Exercise2p7 = Vue.component('Exercise2p7', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.7: Concrete and relecant values",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null,
      concreteValue: "",
      concreteValues: [ 
        {"concreteValue": "Example value: Is the collaboration with this customer important.." }
      ],
      dilemma: "",
  }
 },
  created: function() {
    this.dilemma = this.$route.params.dilemma;
  },
  methods: {
    addConcreteValue() { 
      this.concreteValues.push({concreteValue: this.concreteValue});
      this.concreteValue = '';
    },
    removeConcreteValue(id) {
      this.concreteValues.splice(id,1);
    },
    collectConcreteValues() {
      console.log("collecting concrete values thoughts");
      groupsocket.emit('concretevalues', this.concreteValues);
    }
  }
  ,
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Discuss with your group.
    <br>Think about the stakeholders effeced by the dilemma 
    <br>and individually write down their values.
    <br>Write all values you can come up with, independent of the solution you want to come to.</p>
      Your group's dilemma is the following: 
      {{dilemma}}
      <div class="holder">
        <form @submit.prevent="addConcreteValue">
          <input type="text" placeholder="Enter your value here plx..." v-model="concreteValue">
        </form> 
        <p>These are your stakeholder values</p>
        <ul>
          <li v-for="(data, index) in concreteValues" :key='index'> 
            {{data.concreteValue}}
            <i class="material-icons" v-on:click="removeConcreteValue(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectConcreteValues()">
    <router-link :to="{ name: 'exercise2p7', params: {dilemma: this.dilemma} }">
      Continue
    </router-link>
    </div>
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
    { //reflex thoughts individual
      path:'/exercise2p3',
      component:Exercise2p3,
      name: 'exercise2p3'
    },
    { //reflex thoughts all thoughts in group
      path:'/exercise2p4',
      component:Exercise2p4,
      name: 'exercise2p4'
    },
    { //Principles individual (Dogmatic låsningar)
      path:'/exercise2p5',
      component:Exercise2p5,
      name: 'exercise2p5'
    },
    { //Principles show all in group
      path:'/exercise2p6',
      component:Exercise2p6,
      name: 'exercise2p6'
    },
    { //concrete values individual
      path:'/exercise2p7',
      component:Exercise2p7,
      name: 'exercise2p7'
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


