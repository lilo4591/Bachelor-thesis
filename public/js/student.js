/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
//import { Summary } from './exercise2.js'
'use strict';
var studentsocket = io('/students');
var groupsocket; 
//global variable to save input when going to 'explain more'
Vue.prototype.$input = [];
//global dilemma to not having to passit trough routes
Vue.prototype.$dilemma = "";
//TODO: read dilemma from file or db to be able to change it.
Vue.prototype.$staticdilemma = 
"A student are conducting her master thesis at the university. " +
  "The thesis is about developing an algorithm used to find vulnerabilities in computer systems. " +
  "To test this algorithm the student implements a system that uses the algorithm to hack into different companies systems. " +
  "The algorithm manages to find a few vulnerabilities on the different companies systems and this is added to the report. " +
  "Her professor is both impressed with her ability also concerned. " +
  "One of the companies security team notice that they have been attacked and can track the attack back to the student and are planning to press charges. " +
  "But the student however didn't do any damage to the companies system and claims that she did them a favor, because now they can make their systems more secure."

Vue.use(VuePoll);


const Help = Vue.component('Help', {
  template: `
  <div> <h1>What is this?</h1>
  <p>This is a workshop with exercises about ethical competence. You will learn different ways to think 
  and to handle moral issues. It's completely anonymous, you log in with a sessiontoken and a username of your choice. 
  After you log in the teacher will generate groups and you should find the people in the same group as you,
  to be able to discuss the exercises with them, however when you enter input to the system you will always be anonymous.</p>
        <router-link tag="button" class="navbutton" to="/">
          <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back
        </router-link>
  </div>`
  });


const Login = Vue.component('Login', {
  data: function(){
    return {
      tokenInput: null,
      username: null,
      //parameter to route to if disconnected from group
    }
  },
  methods: {
    validateToken() {
      console.log(this.$sessions);
      if  (Array.from(this.$sessions).includes(Number(this.tokenInput)) == true && (this.username != null)) {
        router.push('/start');
        studentsocket.emit('loggedIn', {"username": this.username, "session": this.tokenInput} );
        Vue.prototype.activeSession = Number(this.tokenInput);
        console.log("this session is " + this.tokenInput);
        Vue.prototype.$username = this.username;
      
      }
      else {
        window.alert("Some of the information was not correct or not filled in, please try again");
      }
      

    }
  },

 created: function() {
   
    studentsocket.on('connectionmessage', message => {
      console.log(message);
    });
    studentsocket.emit('wantsession');
    
    studentsocket.on('activeSessionsNames', function(sessions){
      Vue.prototype.$sessions = sessions;
      console.log(this.$sessions);
    }.bind(this));
       
  

    },
  template: `
   <div>
      <nav>
        <router-link to="/help">Help</router-link>
      </nav>
        <form>
          <h3>Enter Sessiontoken</h3>
          <input type="number" v-model="tokenInput" placeholder="Sessiontoken" required>
          <h3>Enter a username of your choice</h3>
          <input type="text" v-model="username" placeholder="Username"required>
       </form> 
      <button v-on:click="validateToken()" class="smallbutton">Log in</button>
    </div>
  `
});


const Start = Vue.component('Start', {
  data: function(){
    return {
      studentId: 0,
      groupName: null

    }
  },
  template: `
   <div>
    <h2>Lets go!</h2>
    <p v-if="this.groupName == null">Waiting for a group to be assigned to you...<p/>
    <p v-if="this.groupName != null">The name of your group is <ul><li class="groups">{{ this.groupName }}</li></ul></p>
    <p v-if="this.groupName != null">Waiting for an exercise to start!</p>
  </div>
  `,
  created:function() {
    studentsocket.on('namespace', function (group) {
      groupsocket = io.connect(group);
      Vue.prototype.$groupName = (group);
      this.groupName = this.$groupName;
      console.log(group);
    }.bind(this));
    this.groupName = this.$groupName;
    /*if (this.$route.params.pathfrom != null)       
      this.pathfrom = this.$route.params;
      router.push({name: this.pathfrom});
     */
  }

});


const Exercise1Situations = Vue.component('Exercise1Situations', {
  data: function() {
    return {
      studentId: null,
      thought: '',
      thoughts: [],
      groupName: this.$groupName,
      username: this.$username,

      name: "Provocative situations", 
      thoughttype:'situation', 
      collect: 'groupsituations', 
      showing: 'showgroupsituations',
      remove: 'removesituation',
      example: 'Deciding which company to buy hardware from', 
      text: 'situations that has no moral implication' 

    }
  },
  created: function() {
   studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise1situations');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
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
    collectSituations() {
      //id sent either :groupsituations, grouprisks, grouppossibities depending on wich step we are at
      groupsocket.emit(this.collect, this.thoughts);
      this.thoughts = [];
    }
  },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <h2>Ethical awareness</h2>
      <p>Try to come up with <b>real life situations</b> which has <b>no moral implications at all</b>.</p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
        </form> 
        <p>These are your {{thoughttype}}s</p>
        <ul>
          <li class="example">Example {{thoughttype}}: {{example}}.</li>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
      <div v-on:click="collectSituations()"> 
        <router-link tag="button" :to="{name: 'showgroupsituations' }">
          Submit {{thoughttype}}s to group
        </router-link>
      </div>
    </div>
  `
});

//group by group
const ShowGroupSituations = Vue.component('ShowGroupSituations', {
 data: function() {
    return {
      situations: null,
      groupName: this.$groupName,
      username: this.$username,

      name: "Ethical awareness, situations", 
      thoughttype:'situation', 
      collect: 'groupsituations', 
      showing: 'showgroupsituations',
      remove: 'removesituation',
      example: 'Deciding which company to buy hardware from', 
      text: 'situations that has no moral implication' 

   }
 },
  created: function() {
    
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/showgroupsituations');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    else {
      //showins: 'showgroupsituations', ''showgrouprisks, showgrouppossibilites
      groupsocket.on(this.showing, function(data) {
      this.situations = data;
      }.bind(this));
    }
       },
  methods: {
    removeThought(id) {
      this.situations.splice(id,1);
      groupsocket.emit(this.remove, id);  
  },
 
  },  
   template: `
  <div>
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <h2>{{ name }}</h2>
    <p>Discuss your groups list of {{text}}
    <br>Discuss and revise the list</p>
      <div class="holder">
        <p>These are your group's {{text}} </p>
        <ul>
          <li v-for="(data, index) in situations" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link tag="button" class="navbutton ":to="{ name: 'exercise1situations' } ">
       <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back 
    </router-link>
  </div>
  `
});

const SituationsFullClass = Vue.component('SituationsFullClass', {
  data: function() {
    return {
      name: "Ethical awareness, situations",
      groupName: this.$groupName,
      username: this.$username,
    
      thoughttype:'situation', 
      collect: 'groupsituations', 
      showing: 'showgroupsituations',
      remove: 'removesituation',
      example: 'Deciding which company to buy hardware from', 
      text: 'situations that has no moral implication' 
    
    }
  },
  created: function() {
  
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/situationsfullclass');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, Please log in again with the same username to join your group");
      router.push('/');
    } 
   },
 
  template: `
  <div> 
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <h2>{{ name }}</h2>
    <p>Please have a look at the bigger screen and discuss your {{thoughttype}}s.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    You can not add more {{thoughttype}}s now.</p>
    <router-link id="right" class="navbutton" tag="button" :to="{name: 'exercise1love' }">
     <i class="material-icons">
          arrow_forward
        </i>
       Continue
    </router-link>
  </div>`
});

const Exercise1Love = Vue.component('Exercise1Love', {
  data: function() {
    return {
      studentId: null,
      thought: '',
      thoughts: [],
      groupName: this.$groupName,
      username: this.$username,
            
      name: "Provocative risks", 
      thoughttype: 'risk', 
      collect: 'grouprisks', 
      showing: 'showgrouprisks',
      remove: 'removerisk',
      example:'Love makes you act irrational',
      text: 'risks with love'
    }
     
  },
  created: function () {
 
      studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise1love');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group. Please log in again with the same username to join your group");
      router.push('/');
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
    collectSituations() {
      //id sent either :groupsituations, grouprisks, grouppossibities depending on wich step we are at
      groupsocket.emit(this.collect, this.thoughts);
      this.thoughts = [];
    }
  },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <h2>Ethical awareness</h2>
      <p><b> Identify risks</b> with a morally correct principle: <b>Love.</b></p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
        </form> 
        <p>These are your {{thoughttype}}s</p>
        <ul>
          <li class="example">Example {{thoughttype}}: {{example}}.</li>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
      <div v-on:click="collectSituations()"> 
        <router-link tag="button" :to="{name: 'showgrouplove'}">
          Submit {{thoughttype}}s to group
        </router-link>
      </div>
    </div>
  `
});

//group by group
const ShowGroupLove = Vue.component('ShowGroupLove', {
 data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      situations: null,
      name: "Risks with love", 
      thoughttype: 'risk', 
      collect: 'grouprisks', 
      showing: 'showgrouprisks',
      remove: 'removerisk',
      example:'Love makes you act irrational',
      text: 'risks with love'
      
   }
 },
  created: function() {

    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/showgrouplove');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    else {
      //showins: 'showgroupsituations', ''showgrouprisks, showgrouppossibilites
      groupsocket.on(this.showing, function(data) {
        this.situations = data;
      }.bind(this));
    }
    },
  methods: {
    removeThought(id) {
      this.situations.splice(id,1);
      groupsocket.emit(this.remove, id);  
  },
 
  },  
   template: `
  <div>
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <h2>{{ name }}</h2>
    <p>Discuss your groups list of {{text}}
    <br>Discuss and revise the list</p>
      <div class="holder">
        <p>These are your group's {{text}} </p>
        <ul>
          <li v-for="(data, index) in situations" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link tag="button" class="navbutton" :to="{ name: 'exercise1love' }">
       <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back 
    </router-link>
  </div>
  `
});

const LoveFullClass = Vue.component('LoveFullClass', {
  data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Ethical awareness, risks with love",
      thoughttype: 'risk', 
      collect: 'grouprisks', 
      showing: 'showgrouprisks',
      remove: 'removerisk',
      example:'Love makes you act irrational',
      text: 'risks with love'
     
    }
  },
  created: function () {
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/lovefullclass');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
  
  }, 
  template: `
  <div> 
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <h2>{{ name }}</h2>
    <p>Please have a look at the bigger screen and discuss your {{thoughttype}}s.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    You can not add more {{thoughttype}}s now.</p>
    <router-link id="right" class="navbutton" tag="button" :to="{name: 'exercise1war' }">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
  </div>`
});


const Exercise1War = Vue.component('Exercise1War', {
  data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      studentId: null,
      thought: '',
      thoughts: [],
      
      name: "Provocative possibilities", 
      thoughttype:'possibility', 
      collect: 'groupposs', 
      showing: 'showgroupposs', 
      remove: 'removeposs',
      example:'War is a way to solve a conflict',
      text: 'possibilities with war'
      
   }
     
  },
  created: function() {
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise1war');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
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
    collectSituations() {
      //id sent either :groupsituations, grouprisks, grouppossibities depending on wich step we are at
      groupsocket.emit(this.collect, this.thoughts);
      this.thoughts = [];
    }
  },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <h2>Ethical awareness</h2>
      <p><b>Identify possibilities</b> with a morally incorrect principle: <b>War</b>.</p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
        </form> 
        <p>These are your {{thoughttype}}s</p>
        <ul>
          <li class="example">Example {{thoughttype}}: {{example}}.</li>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
      <div v-on:click="collectSituations()"> 
        <router-link tag="button" :to="{name: 'showgroupwar'}">
          Submit possibilities to group
        </router-link>
      </div>
    </div>
  `
});

//group by group
const ShowGroupWar = Vue.component('ShowGroupWar', {
 data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      situations: null,
      name: "Possibilities with war", 
      thoughttype:'possibility', 
      collect: 'groupposs', 
      showing: 'showgroupposs', 
      remove: 'removeposs',
      example:'War is a way to solve a conflict',
      text: 'possibilties with war'
     
   }
 },
  created: function() {
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/showgroupwar');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
    else {
    //showins: 'showgroupsituations', ''showgrouprisks, showgrouppossibilites
    groupsocket.on(this.showing, function(data) {
      this.situations = data;
    }.bind(this));
    }
     },
  methods: {
    removeThought(id) {
      this.situations.splice(id,1);
      groupsocket.emit(this.remove, id);  
  },
 
  },  
   template: `
  <div>
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <h2>{{ name }}</h2>
    <p>Discuss your groups list of {{text}}
    <br>Discuss and revise the list</p>
      <div class="holder">
        <p>These are your group's {{text}} </p>
        <ul>
          <li v-for="(data, index) in situations" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link class="navbutton" tag="button" :to="{ name: 'exercise1war' }">
       <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back 
    </router-link>
  </div>
  `
});

const WarFullClass = Vue.component('WarFullClass', {
  data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Provocative possibilities", 
      thoughttype:'possibility', 
  
    }
  },
  created: function() {
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/warfullclass');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
  
  }, 
  template: `
  <div> 
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <h2>Ethical awareness, possibilites.</h2>
    <p>Please have a look at the bigger screen and discuss your possibilities.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    You can not add more {{thoughttype}}s now.</p>
    <router-link id="right" class="navbutton" tag="button" :to="{name: 'start' }">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
  </div>`
});

//all students together
const Exercise2 = Vue.component('Exercise2', {
  data: function() {
    return {
      name: "Autonomy and Heteronomy",
      studentId: null,
      groupName: this.$groupName,
      username: this.$username,
      staticdilemma: this.$staticdilemma,
      thought: '',
      thoughts: []
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
      studentsocket.emit('thoughts', this.thoughts);
      this.thoughts = [];
    }
  },

  created: function() {
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
   
  },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <p id="boldtext">Adopt this dilemma and try to solve it. Then write down your most important thoughts.</p>
        <p>{{staticdilemma}}</p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
        </form> 
        <ul><li class="example">Example: It's illegal, therefor its wrong..</li></ul>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectThoughts()"> 
    <router-link tag="button" to="/exercise2p1">
    Submit Thoughts
    </router-link>
    </div>
    </div>
  `
});

const Exercise2p1 = Vue.component('Exercise2p1', {
  data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Autonomy and Heteronomy part 2.1",
      studentId: null,
    }
  },
  created: function () {
     studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p1');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
  
  },
  template: `
  <div> 
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <p>Please have a look at the bigger screen and discuss your thoughts.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    To add more thoughts press go back</p>
    <router-link tag="button" class="navbutton" to="/exercise2">
     <i id="left" class="material-icons">
           arrow_back
          </i>
          Go back
    </router-link> 
    <router-link id="right" class="navbutton" tag="button" to="/exercise2p2">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
  </div>`
});

const Exercise2p2 = Vue.component('Exercise2p2', {
 data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Autonomy and Heteronomy part 2.2",
      dilemma: "",
      notsubmitted: true,
      studentId: null,
    }
 },
  created: function() {

    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p2');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
    else {
      groupsocket.on('showdilemma', function(data) {
        this.dilemma = data.dilemma;
        this.notsubmitted = data.notsubmitted;
        Vue.prototype.$dilemma = data.dilemma;
      }.bind(this));

      groupsocket.on('editdilemma', function(data) {
        this.dilemma = data.dilemma;
        this.notsubmitted = data.notsubmitted;
        //update global variable since dilemma changed
        Vue.prototype.$dilemma = data.dilemma;
      }.bind(this));
    }
 },
  methods: {
    
    notifyGroupSubmit(bool, dilemma) {
      this.notsubmitted = bool;
      groupsocket.emit('dilemma', {'dilemma': dilemma, 'notsubmitted': false});
    },
    notifyGroupEdit(bool, dilemma) {
      this.notsubmitted = bool;
      groupsocket.emit('edit', {'dilemma': dilemma, 'notsubmitted': true});
    },
    editdilemmatest() {
      groupsocket.emit('dilemmatest', this.dilemma);

    }
   },
   
   template: `
  <div id="student">
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <p>Discuss in your group and formulate a dilemma together. The dilemma should be one that you are facing
      now in your proffession, school or in your private life.</p>
        <div v-if="notsubmitted">
          <textarea placeholder="Enter your dilemma here please" cols="40" rows="5" v-on:key-up="editdilemmatest" v-model="dilemma">
          </textarea>
          <button class="smallbutton" v-on:click="notifyGroupSubmit(false, dilemma)">Submit dilemma</button>
        </div>
        <div v-if="notsubmitted===false"><div class="text"> {{ dilemma }}</div> 
          <button class="smallbutton" v-on:click="notifyGroupEdit(true, dilemma)">Edit dilemma</button>
        </div>
        <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p3' }">
          <i class="material-icons">
            arrow_forward
          </i>
          Continue
        </router-link>
  </div>
  `
});

const ReflexHelp = Vue.component('ReflexHelp', {
  data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.3: Instructions explanation",
      dilemma: "",
    }
  },
  created: function() {
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p3');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
  },
  template: `
  <div>
      <p> This question is about the reflex thoughts that occur, for example </p>
        <ul><li class="example">This is someone elses responsibility and does not apply to me, so I'll ignore it</li></ul>
        <p>
        Discuss in your group but individually write down thoughts that implies that you dont want to deal with the dilemma.
        Think about possible instinctive thoughts of other perspectives, you don't need to agree with all thoughts.
        Write all thoughts you can come up with, independent of the solution you want to come to.
      </p>
      <router-link class="navbutton" tag="button" :to="{ name: 'exercise2p3'}">
         <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back
      </router-link>
  </div>`
  });

const Exercise2p3 = Vue.component('Exercise2p3', {
  //TODO: This is individual
 data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Autonomy and Heteronomy part 2.3: Reflex thoughts",
      notsubmitted: true,
      studentId: null,
      reflex: "",
      reflexthoughts: [],
      dilemma: "",
  }
 },
  created: function() {
    //this.dilemma = this.$route.params.dilemma;
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p3');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    this.dilemma = this.$dilemma;
    this.reflexthoughts = this.$input;
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
      groupsocket.emit('reflexthoughts', this.reflexthoughts);
      Vue.prototype.$input = [];
    }
  }
  ,
   
   template: `
  <div>
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <nav>
      <router-link :to="{ name: 'reflexhelp'}">
        Explain More!
      </router-link>
    </nav>
    <p>Discuss in your group but individually write the first things that comes to your mind when you consider this dilemma?</p> 
     Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addReflexThought">
          <input type="text" placeholder="Enter your reflex thoughts here please..." v-model="reflex">
        </form> 
        <p>These are your reflex thoughts, press continue to submit to group</p>
        <ul><li class="example">Example thought: If I don't do this someone else will do it!</li></ul>
        <ul>
          <li v-for="(data, index) in reflexthoughts" :key='index'> 
            {{data.reflex}}
            <i class="material-icons" v-on:click="removeReflexThought(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectReflexThoughts()">
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p4'}">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
    </div>
  </div>
  `
});


const Exercise2p4 = Vue.component('Exercise2p4', {
 data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Autonomy and Heteronomy part 2.4: Show groups reflex thoughts",
      dilemma: "",
      reflexthoughts: null
  }
 },
  created: function() {
 
    studentsocket.on('wantcurrentlocation', function() {
      // route to previous route if disconnected
      studentsocket.emit('currentlocation', '/exercise2p3');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    else {
      groupsocket.on('showreflexthoughts', function(data) {
        this.reflexthoughts = data;
      }.bind(this));
    
      this.dilemma = this.$dilemma; 
    }
  },
   
   template: `
  <div>
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <p>Discuss in your group! What is the first things you think about?<br>
    These are thoughts that means that you dont want to deal with or take your responsibility for the dilemma.</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <p>These are your group's reflex thoughts</p>
        <ul>
          <li v-for="(data, index) in reflexthoughts" :key='index'> 
            {{data.reflex}}
          </li>
        </ul>
      </div>
    <router-link class="navbutton" tag="button" :to="{ name: 'exercise2p3'} ">
       <i id="left" class="material-icons">
           arrow_back
          </i>
       Go Back 
    </router-link>
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p5'} ">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
  </div>
  `
});

const PrincipleHelp = Vue.component('PrincipleHelp', {
  data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.5: Instructions explanation",
      dilemma: ""
    }
  },  
  created: function() {
   studentsocket.on('wantcurrentlocation', function() {
      // route to previous route if disconnected
      studentsocket.emit('currentlocation', '/exercise2p5');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
  },
    template: `
  <div>
    <h2>Instructions explanation</h2>
      <p> This question is about the big principles which one believes or fixations by something, for example </p>
        <ul><li class="example">Our company's reputation is very important!</li></ul>
      <p> 
        These principles are the reason for the moral dilemma since you can't follow them all.
        Discuss in your group but individually write down relevant big principles that you believe in.
        Think about principle fixations of other perspectives, you don't need to agree with all.
        Write all thoughts you can come up with, independent of the solution you want to come to.
      </p>
      <router-link tag="button" class="navbutton" :to="{ name: 'exercise2p5'} ">
         <i id="left" class="material-icons">
           arrow_back
          </i>
        Go Back
      </router-link>
  </div>`
  });


const Exercise2p5 = Vue.component('Exercise2p5', {
 data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Autonomy and Heteronomy part 2.5: Principle fixations",
      notsubmitted: true,
      studentId: null,
      principle: "",
      principles: [],
      dilemma: "",
  }
 },
  created: function() {
   studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p5');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    this.dilemma = this.$dilemma;
    this.principles = this.$input;
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
      groupsocket.emit('principles', this.principles);
      Vue.prototype.$input = [];
    }
   }
  ,
   
   template: `
  <div>
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <nav>
      <router-link :to="{ name: 'principlehelp'} " >
        Explain More!
      </router-link>
    </nav>
     <p>Discuss in your group but individually write down principles fixations that relates to the dilemma.
    Write all principles you can come up with, independent of the solution you want to come to.</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addPrinciple">
          <input type="text" placeholder="Enter your principle here please..." v-model="principle">
        </form> 
        <p>These are your principles, press continue to submit them to your group.</p>
        <ul><li class="example">Example principle: You have to follow the law....</li></ul>
        <ul>
          <li v-for="(data, index) in principles" :key='index'> 
            {{data.principle}}
            <i class="material-icons" v-on:click="removePrinciple(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectPrinciples()">
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p6' }">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
    </div>
  </div>
  `
});


const Exercise2p6 = Vue.component('Exercise2p6', {
 data: function() {
    return {
      groupName: this.$groupName,
      username: this.$username,
      name: "Autonomy and Heteronomy part 2.6: Show groups principles",
      dilemma: "",
      principles: null
  }
 },
  created: function() {
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p5');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    else 
    {  //set global input to [] to not save state when going back
      groupsocket.on('showprinciples', function(data) {
        this.principles = data;
      }.bind(this));
      this.dilemma = this.$dilemma;
    }
  },
   
   template: `
  <div>
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <p>Group thoughts on principles, discuss with your group!
    <br>If you fixate by a principle will make you bild to the others </p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <p>These are your group's thoughts on principles</p>
        <ul>
          <li v-for="(data, index) in principles" :key='index'> 
            {{data.principle}}
          </li>
        </ul>
      </div>
    <router-link class="navbutton" tag="button" :to="{ name: 'exercise2p5'} ">
      <i id="left" class="material-icons">
           arrow_back
          </i>
         Go Back 
    </router-link>
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p7'} ">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
  </div>
  `
});

const ValueHelp = Vue.component('ValueHelp', {
  data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.7: Instructions explanation",
      dilemma: ""
    }
  },
  created: function() {
  
  studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p7');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }  
  },

  template: `
  <div>
      <p> This question is about the interests and concrete values of the concerned parties, for example </p>
        <ul><li class="example">Do we want to implement this customer's demand?</li></ul>
      <p>
        There is a risk to leave out relevant arguments here, to eliminate that risk try to first
        identify all parties which the moral dilemma concerns (groups, companies, people organisation, environment, society etc) 
        but always question your conclusions. Discuss in group what values, interests duties feelings etc these parties have.
        Be critical and prepared to go back and revise your conclusions.
      </p>
      <router-link tag="button" class="navbutton" :to="{ name: 'exercise2p7' } ">
         <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back
      </router-link>
  </div>`
  });


//concrete values
const Exercise2p7 = Vue.component('Exercise2p7', {
 data: function() {
    return {
      username: this.$username,
      groupName: this.$groupName,
      name: "Autonomy and Heteronomy part 2.7: Concrete and relevant values",
      notsubmitted: true,
      studentId: null,
      concreteValue: "",
      concreteValues: [],
      dilemma: "",
  }
 },
  created: function() {
  
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p7');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }   
    
    //set dilemma to global dilemma
    this.dilemma = this.$dilemma;
    //set global variable to this input instance
    this.concreteValues = this.$input;
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
      groupsocket.emit('concretevalues', this.concreteValues);
      Vue.prototype.$input = [];
    }
  }
  ,
   
   template: `
  <div>
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <nav>
      <router-link :to="{ name: 'valuehelp'} ">
        Explain More!
      </router-link>
     </nav>
    <p>Discuss with your group.
    <br>Think about and define the different parties the dilemma concerns and individually write down what their values and interests are.</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addConcreteValue">
          <input type="text" placeholder="Enter your value here please..." v-model="concreteValue">
        </form> 
        <p>These are your stakeholder values, press continue to submit them to your group</p>
        <ul>
        <li class="example">Example value: Is the collaboration with this customer important.?..</li>
          <li v-for="(data, index) in concreteValues" :key='index'> 
            {{data.concreteValue}}
            <i class="material-icons" v-on:click="removeConcreteValue(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectConcreteValues()">
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p8showvalues'}">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
    </div>
  </div>
  `
});

const Exercise2p8ShowValues = Vue.component('Exercise2p8ShowValues', {
 data: function() {
    return {
      username: this.$username,
      groupName: this.$groupName,
      name: "Autonomy and Heteronomy part 2.8: Show groups stakeholder values",
      dilemma: "",
      concreteValues: null
  }
 },
  created: function() {
  studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p7');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }  
    else {
    groupsocket.on('showconcretevalues', function(data) {
      this.concreteValues = data;
    }.bind(this));
    this.dilemma = this.$dilemma;
    }
  },
   
   template: `
  <div>
    <p>Group thoughts on all the concerned parties values and interests</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <p>These are your group's thoughts on values and interests</p>
        <ul>
          <li v-for="(data, index) in concreteValues" :key='index'> 
            {{data.concreteValue}}
          </li>
        </ul>
      </div>
    <router-link tag="button" class="navbutton" :to="{ name: 'exercise2p7'} ">
      <i id="left" class="material-icons">
           arrow_back
          </i>
         Go Back 
    </router-link>
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p9'} ">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
  </div>
  `
});

const ActionOptionHelp = Vue.component('ActionOptionHelp', {
  data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.9: Instructions explanation",
    }
  },  
  created: function() {
  
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p9');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }  
  },

  template: `
  <div>
    <h2>Instructions explanation</h2>
      <p> This question is about the different action alternatives one could take and how that will affect the values and interests from previous question, for example</p>
        <ul><li class="example">State an action alternative, with this action how are we going to make it financially?</li></ul>
      <p> 
        Write all relevant option to act and their effects on the concerned values as they are decribed in the previous question.
        There is always a risk to miss a good action alternative, so be prepared to revise the list of action alternatives later.
      </p>
      <router-link class="navbutton" tag="button" :to="{ name: 'exercise2p9'} ">
         <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back
      </router-link>
  </div>`
  });


const Exercise2p9 = Vue.component('Exercise2p9', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.9: Action alternatives and relevant values",
      username: this.$username,
      groupName: this.$groupName,
      notsubmitted: true,
      studentId: null,
      actionAlternative: "",
      actionAlternatives: [],
      dilemma: "",
  }
 },
  created: function() {
  
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p9');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }  
  
    this.dilemma = this.$dilemma;
    this.actionAlternatives = this.$input;
  },
  methods: {
    addActionAlternative() { 
      this.actionAlternatives.push({actionAlternative: this.actionAlternative});
      this.actionAlternative = '';
    },
    removeActionAlternative(id) {
      this.actionAlternatives.splice(id,1);
    },
    collectActionAlternatives() {
      groupsocket.emit('actionalternatives', this.actionAlternatives);
      //set global input to [] for backing option not saving data
      Vue.prototype.$input = [];
    }
  }
  ,
   
   template: `
  <div>
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <nav>
      <router-link :to="{ name: 'actionoptionhelp'} ">
        Explain More!
      </router-link>
     </nav>
    <p>Discuss with your group.<br>
    Individually write down what possible actions could one take and how does that effect the values from the previous question?</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addActionAlternative()">
          <input type="text" placeholder="Enter your action alternative here please..." v-model="actionAlternative">
        </form> 
        <p>These are your action alternatives and their effects, press continue to submit them to your group.</p>
        <ul>
        <li class="example">Example: state an action alternative, how will this affect our reputation?</li>
          <li v-for="(data, index) in actionAlternatives" :key='index'> 
            {{data.actionAlternative}}
            <i class="material-icons" v-on:click="removeActionAlternative(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectActionAlternatives()">
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'exercise2p9showalter'}">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
    </div>
  </div>
  `
});

const Exercise2p9ShowAlter = Vue.component('Exercise2p9ShowAlter', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.9: Show groups action alternatives and values",
      username: this.$username,
      groupName: this.$groupName,
      dilemma: "",
      actionAlternatives: null
  }
 },
  created: function() {
   
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/exercise2p9');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    else {
  
      groupsocket.on('showactionalternatives', function(data) {
        this.actionAlternatives = data;
      }.bind(this));
      this.dilemma = this.$dilemma;
  }
      
  },
   
   template: `
  <div>
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <p>Group thoughts on action alternatives. These are all action alternatives that your group find relevant. </p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <p>These are your group's thoughts on action alternatives</p>
        <ul>
          <li v-for="(data, index) in actionAlternatives" :key='index'> 
            {{data.actionAlternative}}
          </li>
        </ul>
      </div>
    <router-link tag="button" class="navbutton" :to="{ name: 'exercise2p9'} ">
      <i id="left" class="material-icons">
           arrow_back
          </i>
         Go Back 
    </router-link>
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'summary'} ">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
  </div>
  `
});


const Summary = Vue.component('Summary', {
 data: function() {
    return {
      username: this.$username,
      groupName: this.$groupName,
      name: "Summary",
      dilemma: "",
      
      reflex: "",
      reflexthoughts: [],
           
      principle: "",
      principles: [],
   
      concreteValue: "",
      concreteValues: [],
      
      actionAlternative: "",
      actionAlternatives: [],

      submitted: false
  }
 },

 created: function() {
 
   studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/summary');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }  
   else {
     //notify that we want the input from the questions
     groupsocket.emit('wantsummary', function() {
     });
     groupsocket.on('summarydata', function(data) { 
       this.actionAlternatives = data.actionAlternatives;
       this.concreteValues = data.concreteValues;
       this.principles = data.principles;
       this.reflexthoughts = data.reflexThoughts;
     }.bind(this)); 
     //so that changes on input will be seen by allgroup members
     groupsocket.on('showreflexthoughts', function(data) {
       this.reflexthoughts = data; 
     }.bind(this));

     groupsocket.on('showprinciples', function(data) {
       this.principles = data;
     }.bind(this));

     groupsocket.on('showconcretevalues', function(data) {
       this.concreteValues = data;
     }.bind(this));

     groupsocket.on('showactionalternatives', function(data) {
       this.actionAlternatives = data;
     }.bind(this));

     groupsocket.on('analysissubmitted', function(message) {
       this.submitted = true;
     }.bind(this));


     this.dilemma = this.$dilemma;
   } 
 },
  methods: {
  
    removeAlternative(index, type) {
      if (type == "reflex") {
        this.reflexthoughts.splice(index,1); 
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type});
      }
      if (type == "principle") {
        this.principles.splice(index,1); 
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type});
      }
      if (type == "concretevalue") {
        this.concreteValues.splice(index,1);
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type});
      }
      if (type == "actionalternative") {
        this.actionAlternatives.splice(index,1);
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type});
      }
    },

    addinput(type) {
      if (type == "reflex") {
        this.reflexthoughts.push({reflex: this.reflex});
        groupsocket.emit('reflexthoughts', [{ reflex : this.reflex }]);
        this.reflex = '';
      }
      if (type == "principle") {
        this.principles.push({principle: this.principle});
        groupsocket.emit('principles', [ { principle: this.principle }]);
        this.principle = '';
      }
      if (type == "concretevalue") {
        this.concreteValues.push({concreteValue: this.concreteValue});
        groupsocket.emit('concretevalues', [ {concreteValue: this.concreteValue }]);
        this.concreteValue = '';
      }
      if (type == "actionalternative") {
        this.actionAlternatives.push({actionAlternative: this.actionAlternative});
        groupsocket.emit('actionalternatives', [{actionAlternative: this.actionAlternative}]);
        this.actionAlternative = ''; 
      }
    },

    submitAnalysis() {
      groupsocket.emit('submitanalysis', function() {
      });
    }
  },
  template: `
  <div> 
  <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
  <h2>This is a summary of your group's analysis</h2>
  <p>The goal of this exercise is to differentiate between two ways to think heteronomy and autonomy
  when we face a moral problem. 
  <br><br><b>Heteronomy</b>:<br> automatic, dogmatic, constrained, intincts and reflexes, authoritarian thoughts. 
  <br><b>Autonomy</b>:<br> critical searching, systematic thinking, supervision, holistic.</p>
  <p v-if="submitted==false">You may now revise your analysis</p>
    <ul v-if="submitted"><li id="boldtext" class="groups">Your analysis is now submitted, wait for your turn to present it!</li></ul>
    This is your groups dilemma: <br>
    {{dilemma}} <br>
    <div class="wrapper" v-if="submitted==false">
      <div class="box a"><h2>Heteronomy</h2></div>
        <div class="box b"><h2>Autonomy</h2></div>
        <div class="box c">
          <div class="box g"><h3>Reflex thoughts</h3>
          (Dominated by an automatic thought.)
            <form @submit.prevent="addinput('reflex')">
              <input type="text" placeholder="Enter additional reflex thoughts..." v-model="reflex">
            </form> 
            <ul class="summaryList">
              <li v-for="(data, index) in reflexthoughts" :key='index'> 
                {{data.reflex}}
                <i class="material-icons" v-on:click="removeAlternative(index, 'reflex')">delete</i>
              </li>
            </ul>
          </div>
          <div class="box h"><h3>Dogmatic fixations</h3>
          (Fixating by a big and important principle.)
            <form @submit.prevent="addinput('principle')">
              <input type="text" placeholder="Enter additional principle thoughts..." v-model="principle">
            </form> 
            <ul class="summaryList">
              <li v-for="(data, index) in principles" :key='index'> 
                {{data.principle}}
              <i class="material-icons" v-on:click="removeAlternative(index, 'principle')">delete</i>
              </li>
            </ul>
          </div>
        </div>
        <div class="box d">
          <div class="box e"><h3>Concrete Values</h3>
          (Who does the dilemma concerns and what are their interests?)
          <form @submit.prevent="addinput('concretevalue')">
              <input type="text" placeholder="Enter additional value thoughts..." v-model="concreteValue">
            </form> 
            <ul class="summaryList">
              <li v-for="(data, index) in concreteValues" :key='index'> 
                {{data.concreteValue}}
                <i class="material-icons" v-on:click="removeAlternative(index, 'concretevalue')">delete</i>
              </li>
            </ul> 
          </div>
          <div class="box f"><h3>Action alternatives and Values</h3>
          (What can be done and how does that affect everyones interests?)
            <form @submit.prevent="addinput('actionalternative')">
              <input type="text" placeholder="Enter additional action alternatives..." v-model="actionAlternative">
            </form> 
            <ul class="summaryList">
              <li v-for="(data, index) in actionAlternatives" :key='index'> 
                {{data.actionAlternative}}
                <i class="material-icons" v-on:click="removeAlternative(index, 'actionalternative')">delete</i>
              </li>
            </ul>
          </div>
        </div>
    </div>
    <button v-if="submitted==false" class="smallbutton" v-on:click="submitAnalysis()">Submit analysis</button>
    <br>
    <router-link tag="button" class="navbutton" v-if="submitted==true" to="/studentvote">
    <i class="material-icons">
          arrow_forward
        </i>
      Next
    </router-link>
  </div>
    `

  });


const StudentVote = Vue.component('StudentVote', {
  data: function() {
    return {
      username: this.$username,
      groupName: this.$groupName,
      thought: '',
      thoughts: [],
      staticdilemma: this.$staticdilemma,
      i: 0,
      showNextButton: true,
      listoptions: [ 
            {options: {
              customId: 0,
              showTotalVotes: true,
              question: 'Do you think this thought is heteronomy or autonomy?',
              answers: [
                { value: 1, text: 'Heteronomy', votes: 0 },
                { value: 2, text: 'Autonomy', votes: 0 }
              ],
            }
            }]  

    }
  },
  created: function() {
   
    studentsocket.on('wantcurrentlocation', function() {
      studentsocket.emit('currentlocation', '/studentvote');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }  
    else {
      studentsocket.emit('initialThoughtsStudent', 'want inital thoughts student');
      studentsocket.on('displayInitialThoughts', function(thoughts) {
        this.thoughts = thoughts;
        //initialize component with as many poll objs as there are thoughts
        for (var n = 0; n < thoughts.length; n++) {
          this.listoptions.push(
            {options: {
              customId: n+1,
              showTotalVotes: true,
              question: 'Do you think this thought is heteronomy or autonomy?',
              answers: [
                { value: 1, text: 'Heteronomy', votes: 0 },
                { value: 2, text: 'Autonomy', votes: 0 }
              ],
            }
            }  
          );      
        }
      }.bind(this));

      //listen for student votes and updating the poll votes accordingly
      studentsocket.on('vote', function(obj) {
        if (obj.answer === "Heteronomy") {
          this.listoptions[obj.thoughtindex].options.answers[0].votes += 1;
        }
        else if (obj.answer === "Autonomy") {
          this.listoptions[obj.thoughtindex].options.answers[1].votes += 1; 
        }
      }.bind(this));
    }
  } ,
  methods: {
    updateShowIndex() {
      if (this.i == this.thoughts.length - 1) {
        this.showNextButton = false;
      }
      else {
        this.i += 1;
      }

    },
    addVote(obj){
      console.log('You voted ' + obj.value + '!');
      if (obj.value === 1) {
        studentsocket.emit('studentvote', {answerindex: obj.value, answer: "Heteronomy", thoughtindex: this.i});
        }
      if (obj.value === 2) {
        studentsocket.emit('studentvote', {answerindex: obj.value, answer: "Autonomy", thoughtindex: this.i});
        }
      }
  },
  template: `
  <div> 
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <h2>Inital dilemma</h2>
    <p id="boldtext">With our new aquired knowledge about heteronomy and autonomy lets discuss the inital dilemma in this exercise</p>
    <p>{{staticdilemma}}</p>
    <div v-for="(data, index) in thoughts">
      <div v-if="i == index">
        <ul>
          <li>
            {{data.thought}}
          </li>
        </ul>
        <vue-poll v-bind="listoptions[i].options" @addvote="addVote"/>
        <button class="smallbutton" v-if=showNextButton v-on:click="updateShowIndex">Next thought</button>
      </div>
    
    </div>
    <router-link class="navbutton" tag="button" to="/summary">
      <i id="left" class="material-icons">
        arrow_back
      </i>
      Go back
    </router-link> 
  </div>`
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
      name: 'start',
      component:Start
    },
    { //Provocative exercises
      path:'/exercise1Situations',
      name: 'exercise1situations',
      component:Exercise1Situations
    },
    { //Identify risks with morally correct principles such as love
      path:'/exercise1love',
      name: 'exercise1love',
      component:Exercise1Love
    },
    {
      //identify possibilies with morally incorrect principles such as war
      path:'/exercise1war',
      name: 'exercise1war',
      component:Exercise1War
    },
    { //show group situatons
      path:'/showgroupsituations',
      component:ShowGroupSituations,
      name: 'showgroupsituations'
    },
    { //show group risks
      path:'/showgrouplove',
      component:ShowGroupLove,
      name: 'showgrouplove'
    },
    { //show group possibilies
      path:'/showgroupwar',
      component:ShowGroupWar,
      name: 'showgroupwar'
    }, 
    { //
      path:'/situationsfullclass',
      component:SituationsFullClass,
      name: 'situationsfullclass'
    },
    { //
      path:'/warfullclass',
      component:WarFullClass,
      name: 'warfullclass'
    },
    { //
      path:'/lovefullclass',
      component:LoveFullClass,
      name: 'lovefullclass'
    },
     
    { //autonomy heteronomy
      path:'/exercise2',
      name: 'exercise2',
      component:Exercise2
    },
    {
      path:'/exercise2p1',
      name: 'exercise2p1',
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
    { //page explaining the reflex question
      path:'/reflexhelp',
      component: ReflexHelp,
      name: 'reflexhelp'
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
    { //page explaining the reflex question
      path:'/principlehelp',
      component: PrincipleHelp,
      name: 'principlehelp'
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
    },
    { //page explaining the value question
      path:'/valuehelp',
      component: ValueHelp,
      name: 'valuehelp'
    },
    { //concrete values show all in group
      path:'/exercise2p8showvalues',
      component:Exercise2p8ShowValues,
      name: 'exercise2p8showvalues'
    },
    { //action alternatives individual
      path:'/exercise2p9',
      component:Exercise2p9,
      name: 'exercise2p9'
    },
    { //page explaining the actionalternatives question
      path:'/actionoptionhelp',
      component: ActionOptionHelp,
      name: 'actionoptionhelp'
    },
    { //action alternatives show all in group
      path:'/exercise2p9showalter',
      component:Exercise2p9ShowAlter,
      name: 'exercise2p9showalter'
    },
    { //summary of each groups answer
      path:'/summary',
      component:Summary,
      name: 'summary'
    },
    { //vote on the inital dilemma input if auto or hetero?
      path:'/studentvote',
      component:StudentVote
    }
    
 ]
});

const app = new Vue({
  el: '#student',
  name: 'StudentWorkshop',
  router,
  data () {
    return {
      name: 'StudentWorkshop',
    }
   },
  created: function() {
    
    studentsocket.on('activeSessionsNames', function(sessions){
      //list of all active sessions
      Vue.prototype.$sessions = sessions;
      console.log(this.$sessions);
    }.bind(this));

    //specific to redirect after reconnection
    studentsocket.on('redirect', function(path) {
      router.push(path);
    }.bind(this));
   
    studentsocket.on('showdilemmareconnect', function(dilemma) {
        Vue.prototype.$dilemma = dilemma;
      }.bind(this));
 
    studentsocket.on('redirectcomponent', function(component) {
        router.push({name: component });
    }.bind(this));
  }
  });


