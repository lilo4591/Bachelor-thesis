/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
//import { Summary } from './exercise2.js'
'use strict';
var studentsocket = io('/students');
var groupsocket; 
//global variable to save input when going to 'explain more'
Vue.prototype.$input = [];
//global dilemma to not having to pass it trough routes
Vue.prototype.$dilemma = "";
//TODO: read dilemma from file or db to be able to change it.
Vue.prototype.$staticdilemma = 
"A student are conducting her master thesis at the university. " +
  "The thesis is about developing an algorithm used to find vulnerabilities in computer systems. " +
  "To test this algorithm the student implements a system that uses the algorithm to hack into different companies's systems. " +
  "The algorithm manages to find a few vulnerabilities and this is added to the report. " +
  "Her professor is both impressed with her ability but also concerned. " +
  "One of the companies's security team notices that they have been attacked and can track the attack back to the student and are planning to press charges. " +
  "But the student however did not do any damage to the companies's system and claims that she did them a favor, because now they can make their systems more secure."

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
        Vue.prototype.$activeSession = Number(this.tokenInput);
        console.log("this session is " + this.$activeSession);
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
          <h3>Enter a username of your choice.</h3>
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
      groupName: this.$groupName,
      username: this.$username

    }
  },
  template: `
   <div>
    <div id="textleft"> Group: <b v-if="this.groupName != null">{{groupName}}</b> <b v-else>Not assigned</b> Username: <b>{{username}}</b></div>
    <p v-if="this.groupName == null">Waiting for a group to be assigned to you...</p>
    <p v-if="this.groupName != null">Waiting for an exercise to start!..</p>
    <p v-if="this.groupName != null">The name of your group is <ul><li class="groups">{{ this.groupName }}</li></ul></p>
  </div>
  `,
  created:function() {
    if (this.$activeSession == undefined) {
      window.alert("You are disconnected from your session, please log in again with the same username");
      router.push('/');
    }
    studentsocket.on('namespace', function (info) {
      if (info.session == this.$activeSession) {
        groupsocket = io.connect(info.group);
        Vue.prototype.$groupName = info.group;
        this.groupName = this.$groupName;
        //groupsocket = this.$groupName;
        console.log(info.group);
      }
    }.bind(this));
    this.groupName = this.$groupName;

  }

});


const Exercise1Situations = Vue.component('Exercise1Situations', {
  data: function() {
    return {
      studentId: null,
      thought: '',
      thoughts: [],
      situations: [],
      groupName: this.$groupName,
      username: this.$username,

      name: "Provocative situations", 
      thoughttype:'situation', 
      collect: 'groupsituations', 
      showing: 'showgroupsituations',
      remove: 'removesituation',
      example: 'Deciding which company to buy hardware from', 
      text: 'situations that has no moral implications' 

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
    else {
      groupsocket.emit('wantgroupsituations', this.$activeSession);
      groupsocket.on('showgroupsituations', function (data) {
        console.log('showgroupsit: ' + data.session);
        console.log('situations are now: ' + JSON.stringify(data.situations));
        if (data.session == this.$activeSession) {
          console.log("helliii");
          this.thoughts = data.situations;
        }
      }.bind(this));
    }

  },
  methods: {
    addThought() { 
      //this.thoughts.push({thought: this.thought});
      groupsocket.emit('groupsituations', {situation: {thought: this.thought}, session: this.$activeSession});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
      groupsocket.emit(this.remove, {'id': id, 'session' : this.$activeSession});  
    }
  },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</div>
      <div id="textright">Step <b>1</b> of <b>6</b></div></br>
      <h2>Ethical awareness</h2>
      <p>Try to come up with <b>real life situations</b> which has <b>no moral implications at all</b>.</p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
          </form> 
          <button v-on:click="addThought()">Submit situation to group</button>
        <p>These are your group's {{thoughttype}}s</p>
        <ul>
          <li class="example">Example {{thoughttype}}: {{example}}.</li>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
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
      text: 'situations that has no moral implications' 
    
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
    <div id="textright">Step <b>2</b> of <b>6</b></div></br>
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
 
    else {
    //showins: 'showgroupsituations', ''showgrouprisks, showgrouppossibilites
      groupsocket.emit('wantgrouprisks', this.$activeSession);
      groupsocket.on('showgrouprisks', function(data) {
        if (data.session == this.$activeSession) {
          this.thoughts = data.risks;
        }
      }.bind(this));


    }
  },
  methods: {
    addThought() { 
      //this.thoughts.push({thought: this.thought});
      groupsocket.emit('grouprisks', {'risks' : {thought: this.thought}, 'session': this.$activeSession});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
      groupsocket.emit('removerisk', {'id' : id, 'session' : this.$activeSession});  
    }
     },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <div id="textright">Step <b>3</b> of <b>6</b></div></br>
      <h2>Ethical awareness</h2>
      <p><b> Identify risks</b> with a morally correct principle: <b>Love.</b></p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
        </form> 
        <button v-on:click="addThought()">Submit risk to group</button>
        <p>These are your group's {{thoughttype}}s</p>
        <ul>
          <li class="example">Example {{thoughttype}}: {{example}}.</li>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
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
    <div id="textright">Step <b>4</b> of <b>6</b></div></br>
    <h2>{{ name }}</h2>
    <p>Please have a look at the bigger screen and discuss your risks.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    You can not add more risks now.</p>
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
    else {
    groupsocket.emit('wantgroupposs', this.$activeSession);
    groupsocket.on('showgroupposs', function(data) {
      if (data.session == this.$activeSession) {
        this.thoughts = data.poss;
      }
    }.bind(this));
    }
   },
  methods: {
    addThought() { 
      //this.thoughts.push({thought: this.thought});
      groupsocket.emit('groupposs', {'poss' : {thought: this.thought}, 'session' : this.$activeSession });
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
      groupsocket.emit('removeposs', { 'id': id , 'session' : this.$activeSession });  
    },
     },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <div id="textright">Step <b>5</b> of <b>6</b></div></br>
      <h2>Ethical awareness</h2>
      <p><b>Identify possibilities</b> with a morally incorrect principle: <b>War</b>.</p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
        </form> 
        <button v-on:click="addThought()">Submit possibility to group</button>
        <p>These are your group's possibilities</p>
        <ul>
          <li class="example">Example possibility: {{example}}.</li>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
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
    <div id="textright">Step <b>6</b> of <b>6</b></div></br>
    <h2>Ethical awareness, possibilities.</h2>
    <p>Please have a look at the bigger screen and discuss your possibilities.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    You can not add more possibilities now.</p>
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
//      this.thoughts.push({thought: this.thought});
      studentsocket.emit('thought', {'thought' : {thought: this.thought}, 'session' : this.$activeSession});
      this.thought = '';
    },
    removeThought(id) {
      studentsocket.emit('removeinitialthought', {'id': id, 'session': this.$activeSession});
      //this.thoughts.splice(id,1);
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
    studentsocket.emit("wantInitialThoughts", this.$activeSession); 
    studentsocket.on('displayThoughts', function(info) {
      console.log(JSON.stringify(info.thoughts));
      if (info.session == this.$activeSession) {
      this.thoughts = info.thoughts;
    }
      
    }.bind(this));  
 
  },
  template: `
  <div id= "page">
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <div id="textright">Step <b>1</b> of <b>9</b></div></br>
      <p id="boldtext">Adopt this dilemma and try to solve it. Then write down your most important thoughts.</p>
        <p>{{staticdilemma}}</p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here please..." v-model="thought">
        </form> 
        <button v-on:click="addThought()">Submit thought</button>
        <ul><li class="example">Example: It's illegal, therefor it's wrong..</li></ul>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>
      <div> 
    <router-link tag="button" class="navbutton" id="right" to="/exercise2p1">
    Continue
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
      <div id="textright">Step <b>2</b> of <b>9</b></div></br>
    <p>Please have a look at the bigger screen and discuss your thoughts.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    To add more thoughts press go back.</p>
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
      dilemma: this.$dilemma,
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

      groupsocket.emit('wantdilemma', this.$activeSession);
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
    
      groupsocket.on('dilemmakeyup', function (data){
        if(data.session == this.$activeSession) {
          this.dilemma = data.dilemma
        }
      }.bind(this));
    }
 },
  methods: {
    
    notifyGroupSubmit(bool, dilemma) {
      this.notsubmitted = bool;
      groupsocket.emit('dilemma', {'dilemma': dilemma, 'notsubmitted': false, 'session' : this.$activeSession });
    },
    notifyGroupEdit(bool, dilemma) {
      this.notsubmitted = bool;
      groupsocket.emit('edit', {'dilemma': dilemma, 'notsubmitted': true, 'session' : this.$activeSession });
    },
    editdilemmakeyup() {
      groupsocket.emit('dilemmakeyup', {'dilemma' : this.dilemma, 'session': this.$activeSession });

    }
   },
   
   template: `
  <div id="student">
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <div id="textright">Step <b>3</b> of <b>9</b></div></br>
    <p>Discuss in your group and <b>formulate</b> an <b>ethical dilemma</b> together. The dilemma should be one that you are facing
      now in your profession, school or in your private life.</p>
        <div v-if="notsubmitted">
          <textarea placeholder="Enter your dilemma here please" cols="40" rows="5" v-on:keyup="editdilemmakeyup" v-model="dilemma">
          </textarea>
          <button class="smallbutton" v-on:click="notifyGroupSubmit(false, dilemma)">Submit dilemma</button>
        </div>
        <div v-if="notsubmitted===false"><div class="text"> {{ dilemma }}</div> 
          <button class="smallbutton" v-on:click="notifyGroupEdit(true, dilemma)">Edit dilemma</button>
        </div>
        <router-link id="right" class="navbutton" tag="button" :to="{ name: 'reflex' }">
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
      studentsocket.emit('currentlocation', '/reflex');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
  },
  template: `
  <div>
      <p> This question is about the reflex thoughts that occur, for example </p>
        <ul><li class="example">This is someone else's responsibility and does not apply to me, so I'll ignore it</li></ul>
        <p>
        Discuss in your group but individually write down thoughts that implies that you don't want to deal with the dilemma.
        Think about possible instinctive thoughts of other perspectives, you don't need to agree with all thoughts.
        Write all thoughts you can come up with, independent of the solution you want to come to.
      </p>
      <router-link class="navbutton" tag="button" :to="{ name: 'reflex'}">
         <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back
      </router-link>
  </div>`
  });

const Reflex = Vue.component('Reflex', {
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
      studentsocket.emit('currentlocation', '/reflex');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    else {
      groupsocket.emit('wantgroupreflex', this.$activeSession);
      groupsocket.on('showgroupreflexthoughts', function(data) {
        console.log(JSON.stringify(data));
        this.reflexthoughts = data;
        Vue.prototype.$input = data;
      }.bind(this));
    }
    this.dilemma = this.$dilemma;
    this.reflexthoughts = this.$input;
 },
  methods: {
    addReflexThought() { 
      //this.reflexthoughts.push({reflex: this.reflex});
      groupsocket.emit('reflexthoughts', {'thoughts' : [{reflex : this.reflex}],  'session' : this.$activeSession});
      //Vue.prototype.$input = [];
      this.reflex = '';
 },
    removeReflexThought(id) {
      //this.reflexthoughts.splice(id,1);
      groupsocket.emit('removesummaryinput', {'indx': id, 'inputtype': "reflex", 'session': this.$activeSession});
    },
    resetInputVariable() {
      //groupsocket.emit('reflexthoughts', {'thoughts' : this.reflexthoughts,  'session' : this.$activeSession});
      Vue.prototype.$input = [];
    }
  }
  ,
   
   template: `
  <div>
    <nav>
      <router-link :to="{ name: 'reflexhelp'}">
        Explain More!
      </router-link>
    </nav><br>
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <div id="textright">Step <b>4</b> of <b>9</b></div></br>
    <p>Discuss in your group but individually write <b>the first things that comes to your mind</b> when you consider this dilemma?</p> 
     Your group's ethical dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addReflexThought">
          <input type="text" placeholder="Enter your reflex thoughts here please..." v-model="reflex">
        </form> 
        <p>These are your group's reflex thoughts</p>
        <ul><li class="example">Example thought: If I don't do this someone else will do it!</li></ul>
        <ul>
          <li v-for="(data, index) in reflexthoughts" :key='index'> 
            {{data.reflex}}
            <i class="material-icons" v-on:click="removeReflexThought(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link id="right" class="navbutton" v-on:click="resetInputVariable" tag="button" :to="{ name: 'principlefixations'}">
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
      studentsocket.emit('currentlocation', '/principlefixations');
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
      <router-link tag="button" class="navbutton" :to="{ name: 'principlefixations'} ">
         <i id="left" class="material-icons">
           arrow_back
          </i>
        Go Back
      </router-link>
  </div>`
  });


const PrincipleFixations = Vue.component('PrincipleFixations', {
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
      studentsocket.emit('currentlocation', '/principlefixations');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
    else {
      groupsocket.emit('wantgroupprinciples', this.$activeSession);
      groupsocket.on('showgroupprinciples', function(data) {
        console.log(JSON.stringify(data));
        this.principles = data;
        Vue.prototype.$input = data;
      }.bind(this));
    } 
    this.dilemma = this.$dilemma;
    this.principles = this.$input;
 },
  methods: {
    addPrinciple() { 
      //this.principles.push({principle: this.principle});
      groupsocket.emit('principles', {'principles' : [{ principle : this.principle }], 'session' : this.$activeSession });
      this.principle = '';
    },
    removePrinciple(id) {
      groupsocket.emit('removesummaryinput', {'indx': id, 'inputtype': "principle", 'session': this.$activeSession});
     // this.principles.splice(id,1);
    }
   }
  ,
   
   template: `
  <div>
    <nav>
      <router-link :to="{ name: 'principlehelp'} " >
        Explain More!
      </router-link>
    </nav><br>
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <div id="textright">Step <b>5</b> of <b>9</b></div></br>
     <p>Discuss in your group but individually write down <b>principles fixations</b> that relates to the dilemma.
    Write all principles you can come up with, independent of the solution you want to come to.</p>
      Your group's ethical dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addPrinciple">
          <input type="text" placeholder="Enter your principle here please..." v-model="principle">
        </form> 
        <p>These are your group's principles.</p>
        <ul><li class="example">Example principle: You have to follow the law....</li></ul>
        <ul>
          <li v-for="(data, index) in principles" :key='index'> 
            {{data.principle}}
            <i class="material-icons" v-on:click="removePrinciple(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'concretevalues' }">
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
      studentsocket.emit('currentlocation', '/concretevalues');
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
        identify all parties which the moral dilemma concerns (groups, companies, people organization, environment, society etc) 
        but always question your conclusions. Discuss in group what values, interests duties feelings etc these parties have.
        Be critical and prepared to go back and revise your conclusions.
      </p>
      <router-link tag="button" class="navbutton" :to="{ name: 'concretevalues' } ">
         <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back
      </router-link>
  </div>`
  });


//concrete values
const ConcreteValues = Vue.component('ConcreteValues', {
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
      studentsocket.emit('currentlocation', '/concretevalues');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }   
   
    else {
      groupsocket.emit('wantgroupconcretevalues', this.$activeSession);
        groupsocket.on('showgroupconcretevalues', function(data) {
          console.log(JSON.stringify(data));
          this.concreteValues = data;
          Vue.prototype.$input = data;
        }.bind(this));
    }
    //set dilemma to global dilemma
    this.dilemma = this.$dilemma;
    //set global variable to this input instance
    this.concreteValues = this.$input;
 },
  methods: {
    addConcreteValue() { 
      //this.concreteValues.push({concreteValue: this.concreteValue});
      groupsocket.emit('concretevalues', {'concretevalues' : [{ concreteValue : this.concreteValue}], 'session': this.$activeSession });
      this.concreteValue = '';
    },
    removeConcreteValue(id) {
      groupsocket.emit('removesummaryinput', {'indx': id, 'inputtype': "concretevalue", 'session': this.$activeSession});
      //this.concreteValues.splice(id,1);
    },
    resetInputVariable() {
   //   groupsocket.emit('concretevalues', {'concretevalues' : this.concreteValues, 'session': this.$activeSession });
      Vue.prototype.$input = [];
    }
  }
  ,
   
   template: `
  <div>
    <nav>
      <router-link :to="{ name: 'valuehelp'} ">
        Explain More!
      </router-link>
     </nav>
      <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <div id="textright">Step <b>6</b> of <b>9</b></div></br>
    <p>Discuss with your group.
    <br>Think about and <b>define the different parties</b> the ethical dilemma concerns and individually write down what their <b>values and interests</b> are.</p>
      Your group's ethical dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addConcreteValue">
          <input type="text" placeholder="Enter your values here please..." v-model="concreteValue">
        </form> 
        <p>These are your group's stakeholder values.</p>
        <ul>
        <li class="example">Example value: Is the collaboration with this customer important.?..</li>
          <li v-for="(data, index) in concreteValues" :key='index'> 
            {{data.concreteValue}}
            <i class="material-icons" v-on:click="removeConcreteValue(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="resetInputVariable()">
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'actions'}">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
    </div>
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
      studentsocket.emit('currentlocation', '/actions');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }  
  },

  template: `
  <div>
    <h2>Instructions explanation</h2>
      <p>This question is about the different action alternatives one could take and how that will affect the values and interests from previous question, for example</p>
        <ul><li class="example">State an action alternative, with this action how are we going to make it financially?</li></ul>
      <p> 
        Write all relevant options to act and their effects on the concerned values as they are decribed in the previous question.
        There is always a risk to miss a good action alternative, so be prepared to revise the list of action alternatives later.
      </p>
      <router-link class="navbutton" tag="button" :to="{ name: 'actions'} ">
         <i id="left" class="material-icons">
           arrow_back
          </i>
          Go Back
      </router-link>
  </div>`
  });


const Actions = Vue.component('Actions', {
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
      studentsocket.emit('currentlocation', '/actions');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    } 
    else {
      groupsocket.emit('wantgroupactionalternatives', this.$activeSession);
        groupsocket.on('showgroupactionalternatives', function(data) {
          console.log(JSON.stringify(data));
          this.actionAlternatives = data;
          Vue.prototype.$input = data;
        }.bind(this));
       
    } 
  
    this.dilemma = this.$dilemma;
    this.actionAlternatives = this.$input;
  },
  methods: {
    addActionAlternative() { 
      //this.actionAlternatives.push({actionAlternative: this.actionAlternative});
      groupsocket.emit('actionalternatives', {'actionalternatives' : [{ actionAlternative: this.actionAlternative}], 'session': this.$activeSession });
      this.actionAlternative = '';
    },
    removeActionAlternative(id) {
      groupsocket.emit('removesummaryinput', {'indx': id, 'inputtype': "actionalternative", 'session': this.$activeSession});
      //this.actionAlternatives.splice(id,1);
    },
    resetInputVariable() {
      //set global input to [] for backing option not saving data
      Vue.prototype.$input = [];
    }
  }
  ,
   
   template: `
  <div>
    <nav>
      <router-link :to="{ name: 'actionoptionhelp'} ">
        Explain More!
      </router-link>
     </nav>
     <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
     <div id="textright">Step <b>7</b> of <b>9</b></div></br>
    <p>Discuss with your group.<br>
    Individually write down what <b>possible actions</b> could one take and how that effects the values from the previous question?</p>
      Your group's ethical dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addActionAlternative()">
          <input type="text" placeholder="Enter your action alternative here please..." v-model="actionAlternative">
        </form> 
        <p>These are your group's action alternatives and their effects.</p>
        <ul>
        <li class="example">Example: state an action alternative, how will this affect our reputation?</li>
          <li v-for="(data, index) in actionAlternatives" :key='index'> 
            {{data.actionAlternative}}
            <i class="material-icons" v-on:click="removeActionAlternative(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="resetInputVariable()">
    <router-link id="right" class="navbutton" tag="button" :to="{ name: 'summary'}">
      <i class="material-icons">
          arrow_forward
        </i>
      Continue
    </router-link>
    </div>
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
     groupsocket.emit('wantsummary', {'session' :this.$activeSession});
     groupsocket.on('summarydata', function(data) { 
       this.actionAlternatives = data.actionAlternatives;
       this.concreteValues = data.concreteValues;
       this.principles = data.principles;
       this.reflexthoughts = data.reflexThoughts;
     }.bind(this)); 
     //so that changes on input will be seen by allgroup members
     groupsocket.on('showgroupreflexthoughts', function(data) {
       this.reflexthoughts = data; 
     }.bind(this));

     groupsocket.on('showgroupprinciples', function(data) {
       this.principles = data;
     }.bind(this));

     groupsocket.on('showgroupconcretevalues', function(data) {
       this.concreteValues = data;
     }.bind(this));

     groupsocket.on('showgroupactionalternatives', function(data) {
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
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type, 'session': this.$activeSession});
      }
      if (type == "principle") {
        this.principles.splice(index,1); 
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type, 'session': this.$activeSession});
      }
      if (type == "concretevalue") {
        this.concreteValues.splice(index,1);
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type, 'session': this.$activeSession});
      }
      if (type == "actionalternative") {
        this.actionAlternatives.splice(index,1);
        groupsocket.emit('removesummaryinput', {'indx': index, 'inputtype': type, 'session': this.$activeSession});
      }
    },

    addinput(type) {
      if (type == "reflex") {
        this.reflexthoughts.push({reflex: this.reflex});
        groupsocket.emit('reflexthoughts', { 'thoughts' :[{reflex: this.reflex}], 'session': this.$activeSession });
        this.reflex = '';
      }
      //TODO add session and check name of data input thought ^
      if (type == "principle") {
        this.principles.push({principle: this.principle});
        groupsocket.emit('principles', { 'principles': [{principle : this.principle}], 'session' : this.$activeSession });
        this.principle = '';
      }
      if (type == "concretevalue") {
        this.concreteValues.push({concreteValue: this.concreteValue});
        groupsocket.emit('concretevalues', {'concretevalues': [{concreteValue : this.concreteValue}], 'session' : this.$activeSession });
        this.concreteValue = '';
      }
      if (type == "actionalternative") {
        this.actionAlternatives.push({actionAlternative: this.actionAlternative});
        groupsocket.emit('actionalternatives', {'actionalternatives' :[{actionAlternative: this.actionAlternative}], 'session': this.$activeSession });
        this.actionAlternative = ''; 
      }
    },

    submitAnalysis() {
      groupsocket.emit('submitanalysis', this.$activeSession);
    }
  },
  template: `
  <div> 
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
    <div id="textright">Step <b>8</b> of <b>9</b></div></br>
      <h2>This is a summary of your group's analysis</h2>
      <p>The goal of this exercise is to differentiate between two ways to think, heteronomy and autonomy
      when we face a moral problem. 
      <br><br><b>Heteronomy</b>:<br> automatic, dogmatic, constrained, instincts and reflexes, authoritarian thoughts. 
      <br><b>Autonomy</b>:<br> critical searching, systematic thinking, supervision, holistic.</p>
      <p v-if="submitted==false">You may now revise your analysis</p>
        <ul v-if="submitted"><li id="boldtext" class="groups">Your analysis is now submitted, wait for your turn to present it!</li></ul>
      This is your group's ethical dilemma: <br>
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
          (Who does the dilemma concern and what are their interests?)
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
          (What can be done and how does that affect everyone's interests?)
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
    <router-link tag="button" id="right" class="navbutton" v-if="submitted==true" to="/studentvote">
    <i class="material-icons">
          arrow_forward
        </i>
      Continue
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
              showResults: false,
              question: 'Do you think this thought is heteronomy or autonomy?',
              answers: [
                { value: 1, text: 'Heteronomy', votes: 0 },
                { value: 2, text: 'Autonomy', votes: 0 }
              ],
            }
            }]  

    }
  },
  created: function () {

    studentsocket.on('wantcurrentlocation', function () {
      studentsocket.emit('currentlocation', '/studentvote');
    });

    if (groupsocket == undefined) {
      window.alert("You are disconnected from your group, please log in again with the same username to join your group");
      router.push('/');
    }
    else {
      studentsocket.emit('initialThoughtsStudent', this.$activeSession);
      studentsocket.on('displayInitialThoughts', function (info) {
        if (info.session == this.$activeSession) {
          this.thoughts = info.thoughts;
          //initialize component with as many poll objs as there are thoughts
          for (var n = 0; n < info.thoughts.length; n++) {
            this.listoptions.push(
              {
                options: {
                  customId: n + 1,
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
        }
      }.bind(this));

      studentsocket.emit('studentwantvotes', this.$activeSession);
      studentsocket.on('studentshowvotes', function (info) {
          console.log("student want wotes: " + JSON.stringify(info.votes));
          console.log("student want wotes: " + info.session + " and "+ this.$activeSession);
          
        if (info.session == this.$activeSession) {
          console.log(JSON.stringify(info.votes));
          for (var i in info.votes) {
            this.addVoteObj(info.votes[i]);
          }
        }
      }.bind(this));

      //listen for student votes and updating the poll votes accordingly
      studentsocket.on('vote', function(obj) {
        if (obj.session == this.$activeSession) {
            this.addVoteObj(obj);
        }
      }.bind(this));
    }
  } ,
  methods: {
    addVoteObj(obj) {
      if (obj.answer === "Heteronomy") {
        this.listoptions[obj.thoughtindex].options.answers[0].votes += 1;
      }
      else if (obj.answer === "Autonomy") {
        this.listoptions[obj.thoughtindex].options.answers[1].votes += 1;
      }
    },
 updateShowIndex(options) {
      if (this.i == this.thoughts.length - 1) {
        this.showNextButton = false;
      }
      else {
        this.i += 1;
      }
    },
      goBackOneQuestion(options) {
        if (this.i != 0) {
          this.i -= 1;
        }
        this.showNextButton = true;
      },
    addVote(obj){
      console.log('You voted ' + obj.value + '!');
      console.log("student vote object: " + JSON.stringify(obj));
      if (obj.value === 1) {
        studentsocket.emit('studentvote', {session: this.$activeSession, answerindex: obj.value, answer: "Heteronomy", thoughtindex: this.i});
        }
      if (obj.value === 2) {
        studentsocket.emit('studentvote', {session: this.$activeSession, answerindex: obj.value, answer: "Autonomy", thoughtindex: this.i});
        }
      //set the poll you answered to show results
      this.listoptions[this.i].options.showResults = true; 
        }
  },
  template: `
  <div> 
    <div id="textleft"> Group: <b>{{groupName}}</b> Username: <b>{{username}}</b></div>
      <div id="textright">Step <b>9</b> of <b>9</b></div></br>
      <h2>Inital dilemma</h2>
      <p id="boldtext">With our newly acquired knowledge about heteronomy and autonomy lets discuss the initial dilemma in this exercise.</p>
      <p>{{staticdilemma}}</p>
      <div id="clear">
        <button class="halfbutton" id="left" v-if="i != 0" v-on:click="goBackOneQuestion(listoptions[i].options)">
          Previous thought
        </button>
        <button class="halfbutton" id="right" v-if="i != (thoughts.length - 1)" v-on:click="updateShowIndex(listoptions[i].options)">
          Next thought
        </button>
      </div>
      <br><br>
      <div v-for="(data, index) in thoughts">
      <div v-if="i == index">
        <ul>
          <li>
            {{data.thought}}
          </li>
        </ul>
       <vue-poll v-bind="listoptions[i].options" @addvote="addVote"/>
        </div>
    
    </div>
    <router-link id="left" class="navbutton" tag="button" to="/summary">
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
    { //reflex thoughts individual in groups
      path:'/reflex',
      component:Reflex,
      name: 'reflex'
    },
    { //page explaining the reflex question
      path:'/reflexhelp',
      component: ReflexHelp,
      name: 'reflexhelp'
    },
    /* DELETED
    { //reflex thoughts all thoughts in group
      path:'/exercise2p4',
      component:Exercise2p4,
      name: 'exercise2p4'
    },
    */
    { //Principles individual (Dogmatic låsningar)
      path:'/principlefixations',
      component:PrincipleFixations,
      name: 'principlefixations'
    },
    { //page explaining the reflex question
      path:'/principlehelp',
      component: PrincipleHelp,
      name: 'principlehelp'
    },
    { //concrete values individual
      path:'/concretevalues',
      component:ConcreteValues,
      name: 'concretevalues'
    },
    { //page explaining the value question
      path:'/valuehelp',
      component: ValueHelp,
      name: 'valuehelp'
    },
    { //action alternatives individual
      path:'/actions',
      component:Actions,
      name: 'actions'
    },
    { //page explaining the actionalternatives question
      path:'/actionoptionhelp',
      component: ActionOptionHelp,
      name: 'actionoptionhelp'
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
 
    studentsocket.on('redirectcomponent', function(info) {
      if (info.session == this.$activeSession)  {
        router.push({name: info.comp});
      }
    }.bind(this));
  }
  });


