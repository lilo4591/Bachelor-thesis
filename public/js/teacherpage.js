var socket = io();

//global variable to keep track analysis input each group as an obj
Vue.prototype.$analys = [];
//TODO: read dilemma from file or db to be able to change it.
Vue.prototype.$staticdilemma = 
"A student are conducting her master thesis at the university. " +
  "The thesis is about developing an algorithm used to find vulnerabilities in computer systems. " +
  "To test this algorithm the student implements a system that uses the algorithm to hack into different companies systems. " +
  "The algorithm manages to find a few vulnerability on the different companies systems and this is added to the report. " +
  "Her professor is both impressed with her ability also concerned. " +
  "One of the companies security team notice that they have been attacked and can track the attack back to the student and are planning to press charges. " +
  "But the student however didn't do any damage to the companies system and claims that she did them a favor, because now they can make their systems more secure."

Vue.use(VuePoll);

const Help = Vue.component('Help', {
  template: `
  <div> 
    <h1>What is this?</h1> 
    <p>This is a workshop containing exercises about ethical competence
    and teaches students to be aware of their thought process.
    The exercises are done in groups step by step. 
    The groups are generated by you, the teacher at the start of the workshop. 
    You decide the size of each group, and the students are then randomly placed in a group.
    If the number of students are uneven, there will be one more student added in a random group.
    <br>
    <br>
    At the start students will log in with a sessiontoken and a username of their choice. 
    When you decide to start the workshop's exercises the students will be redirected to the first page of the exercise.
    From there the students can click their way through that exercise. The systems assumes some knowledge about the exercises from the teacher.
    </p>
    <router-link tag="button" class="navbutton" to="/">
     <i id="left" class="material-icons">
          arrow_back
        </i>
      Go Back
    </router-link>
  </div>`
  });

const TeacherStartPage = Vue.component('TeacherStartPage', {
  data: function() {
    return {
      session: null,
    };
  },
  template:`
        <div id="app">
        <nav>
          <router-link to="/help">Help</router-link>
        </nav>
        <router-link to="/sessions">
          <button class="button">Start Workshop</button>
          </router-link><br>
          <button class= "button">Edit Workshop</button> 
        </div>
    `
});

const Sessions = Vue.component('Sessions', {
data: function() {
    return {
      session: null,
      sessions: this.$sessions,
      sessionId: null,
    };
  },

  created: function()  {
   socket.emit('wantallsessions');
  
  },
  methods: {
  generateSession(min, max) {
    Vue.prototype.$session = Math.floor(Math.random() * (max - min) )+ min;
    this.session = this.$session;
    console.log(this.session);
    socket.emit('teachergeneratesession', this.session);
    socket.emit('wantallsessions');
   }
   },
  template:`
        <div id="app">
        <p>Start an existing workshop or start new</p>
          <nav>
           <router-link :to="{name:'startworkshop', params: {'sessionID': sessionId}}" v-on:click="setSession(sessionId)" v-for="(sessionId, index) in sessions" :key='index'>
            {{sessionId}}
           </router-link>
           </nav>
          <router-link to="/startworkshop">
            <button class="button" v-on:click="generateSession(1111,9999)">Start a new workshop</button>
          </router-link>
        </div>
    `

});

const StartWorkshop = Vue.component('StartWorkshop', {
  data: function() {
    return {
      name: 'Startworkshop',
      student: '',
      students: [],
      session: this.$session,
      numEachGroup: null,
      groupObject: null,
    };
  },
   template: `
 
    <div id="app">
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
      <h2>Log in to 192.168.1.5:3000/student with sessiontoken {{ session }} </h2>
      <ul>
        <li v-for="(data, index) in students" :key='index'>
          {{students[index]}} has connected</li>
      </ul>
      <form @submit.prevent="generateGroups(numEachGroup)">
        Enter number of student in each group<br>
        <input type="number" min="1" placeholder="Enter number of students in each group" v-model="numEachGroup" required>
        <br>
        <button v-if="this.groupObject==null" type="submit" class="button" >Generate groups</button>
      </form>
      <div v-if="this.groupObject != null">
        <h2>The groups are:</h2>
        <ul>
        <div v-for="(data,index) in groupObject" :key='index'> 
          <li class="groups"><b>{{ groupObject[index].name }}</b> with {{ groupObject[index].noOfStudents }} students</li>
        </div>
        </ul>
        <router-link to="/workshopexercises">
        <button class="button"> Start workshop </button>
        </router-link>
        <br>
      </div>
        <router-link tag="button" class="navbutton" to="/sessions">
          <i id="left" class="material-icons">
            arrow_back
          </i>
          Go Back
        </router-link>
    </div>
  
  
  `,
  created: function() {
    Vue.prototype.$session = this.$route.params.sessionID;
    this.session = this.$session;
    console.log('now at session: ' + this.$session);

    //TODO check username already exists  
    socket.on("StudentLoggedIn", function(info) {
      if (info.session == this.$session) {  
          this.addStudent(info.username);
          console.log(this.students);
          console.log("student logged in the same workshop" + info.session);
      }
      }.bind(this));    
      socket.on('groupInfo', function(data) {
        console.log("groupinfo");
        console.log(JSON.stringify(data.groupObject));
        this.groupObject = data.groupObject;
      }.bind(this));
    },

 methods: {    
    addStudent(studentUsername) { 
      this.students.push(studentUsername);
    },
    generateGroups(n) {
    socket.emit('generateGroups', {groupSize: n, session: this.session});
    console.log("start generate: " + n); 
    }
 }
});

const workshopExercises = Vue.component('WorkshopExercises', {
  data: function() {
    return {
      session: this.$session,
      name: 'workshopExercises',
      exerciseOptions: [
        "Exercise 1: Let's go!", "Exercise 2: Let's go!", "Exercise 3", "Exercise 4"
      ]
    };
  },
   template: `
    <div>
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
      <nav>
        <router-link to="/settings">Clear Input</router-link>
      </nav>
      <div id="contain">
          <div class="containheader1">
            <h2>Exercise 1: <br> Ethical awareness</h2>
          </div>  
          <div class="containtext1">  
            <p>This is an exercise focusing on questioning the unquestionable.</p>
          </div>
          <div class="containnav1">
            <router-link to="/provocative1">
              <button class="workshopbutton" v-on:click="navigateStudentsTo('exercise1situations')"> {{this.exerciseOptions[0]}}</button>
            </router-link>
          </div>

          <div class="containheader2">
          <h2>Exercise 2: <br>Autonomy and Heteronomy</h2>
          </div>
          <div class="containtext2">
            <p>This exercise will train your ability to recognice the two different ways to think.</p>
          </div>
          <div class="containnav2">
            <router-link to="/autonomyheteronomy1">
              <button class="workshopbutton" v-on:click="navigateStudentsTo('exercise2')"> {{this.exerciseOptions[1]}}</button>
            </router-link>
          </div>

      </div>
      <router-link tag="button" class="navbutton" to="/startworkshop">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
    </div>
  
  ` ,
  methods: { 
    navigateStudentsTo(exercisecomp) {
      socket.emit("navigateStudentsToComp", {'comp' : exercisecomp, 'session' : this.$session});
    }
  }
});

const Settings = Vue.component('Settings', {
 
  data: function() {
    return {
      responseShow: false,
      response: "All exercise input deleted.",
       session: this.$session,
    }
  },
  methods: {
  clearAllInput() {
      socket.emit('clearallinput', 'message');
      this.responseShow = true;
    }
  },
  template: `
  <div>
   <h2>You can do stuff here</h2>
   <p>This will delete all input the participants has added to the workshop.</p>
   <button id="right" class="smallbutton" v-on:click="clearAllInput()">
      Clear all input
    </button>
   <p id="textleft" v-if="responseShow">{{response}}</p>
    <router-link tag="button" class="navbutton" to="/workshopexercises">
      <i id="left" class="material-icons">
        arrow_back
      </i>
      Go Back
    </router-link>
  </div>
`
  
});

const Provocative1 = Vue.component('provocative1', {
  data: function() {
    return {
      session: this.$session,
      thought: '',
      thoughts: []
    }
  },
  created: function() {
    socket.on('collectsituations', function(info) {
      if (info.situations != null && info.session == this.$session) {
        this.thoughts = info.situations;
        console.log(info.situations);
      }
  }.bind(this));
  },
  methods: {
    addThought() { 
      this.thoughts.push({situation: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    },
    collectAllSituations() {
      socket.emit("wantsituations", this.$session);
      socket.emit("navigateStudentsToComp", {'comp' : "situationsfullclass", 'session': this.$session});
    }
  },
  template: `
  <div id= "page">
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
      <h2>Ethical awareness exercise</h2>      
      <p>The first part of this exercise is to come up with <b>real life situations</b> which has <b>no moral implication</b> at all.</p>
      <button class="button" v-on:click="collectAllSituations">End the discussion and show all group's situations</button>
      <div class="holder">
        <p>These are situations from all groups</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
      <router-link tag="button" class="navbutton" to="/workshopexercises">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
     <router-link id="right" class="navbutton" tag="button" to="/provocative2love">
        <i class="material-icons">
          arrow_forward
        </i>
        Continue
        </router-link>
    </div>
  `
});


const Provocative2love = Vue.component('provocative2love', {
  data: function() {
    return {
      session: this.$session,
      thought: '',
      thoughts: [],
    }
  },
  created: function() {
    socket.on('collectrisks', function(info) {
      if (info.risks != null && info.session == this.$session) {
        this.thoughts = info.risks;
        console.log(info.risks);
      }
  }.bind(this));
  },
  methods: {
    addThought() { 
      this.thoughts.push({risk: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    },
    collectAllRisks() {
      socket.emit("wantrisks", this.$session);
      socket.emit("navigateStudentsToComp", {'comp' : "lovefullclass", 'session': this.$session});
    }
  },
  //TODO generate loverisks arguments from txtfile or db
  template: `
  <div id= "page">
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
      <h2>Ethical awareness exercise</h2>      
      <p>This exercise is about identifing <b>risks</b> with <b>Love</b>.</p>
      <button class="button" v-on:click="collectAllRisks">End the discussion and show all group's risks</button>
      <div class="holder">
        <p>Risks with love</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
      <router-link tag="button" class="navbutton" to="/provocative1">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
   <router-link id="right" class="navbutton" tag="button" to="/provocative3war">
        <i class="material-icons">
          arrow_forward
        </i>
           Continue
        </router-link>
    </div>
  `
});


const Provocative3War = Vue.component('provocative3war', {
  data: function() {
    return {
      session: this.$session,
      groupObject: null,
      thought: '',
      thoughts: [],
    }
  },
  created: function() {
    socket.on('collectposs', function(info) {
      if (info.session == this.$session) {
        this.thoughts = info.poss;
      }
  }.bind(this));
  },
  methods: {
   removeThought(id) {
    this.thoughts.splice(id,1);
    },
   collectAll() {
    console.log('wantposs session: ' + this.$session);
    socket.emit("wantposs", this.$session);
    socket.emit("navigateStudentsToComp", {'comp' : "warfullclass", 'session' : this.$session});
    }
  },
  //TODO generate arguments from txtfile or db
  template: `
  <div id= "page">
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
      <h2>Ethical awareness exercise</h2>      
      <p>This exercise is about identifing <b>possibilities</b> with <b>war</b>.</p>
      <button class="button" v-on:click="collectAll">End the discussion and show all group's possibilites</button>
      <div class="holder">
        <p>Possibilies with war</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
      <router-link tag="button" class="navbutton" to="/provocative2love">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
 <router-link id="right" class="navbutton" tag="button" to="/provocativeconclusion">
        <i class="material-icons">
          arrow_forward
        </i>
        Continue
        </router-link>
    </div>
  `
});

const ProvocativeConclusion = Vue.component('provocativeConclusion', {
  data: function() {
    return {
      session: this.$session,
    };
  },


template:

`
<div id="app">
  <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
  <h2>To Conclude</h2>
  <p>By managing to come up with several risks and possibilites with these examples
    one realizes that many things that you take for granted can be questioned.</p>
  <router-link tag="button" class="navbutton" to="/provocative3war">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
 <router-link id="right" class="navbutton" tag="button" to="/workshopexercises">
     <i class="material-icons">
          arrow_forward
        </i>
        Continue
  </router-link>
</div>`
});

//Teacher showing dilemma and displaying student thoughts
const autonomyHeteronomy1 = Vue.component('autonomyHeteronomy1', {
  data: function() {
    return {
      session: this.$session,
      staticdilemma: this.$staticdilemma,
      thought: '',
      thoughts: []
    }
  },
  created: function() {
    socket.on('displayThoughts', function(info) {
     if (info.session == this.$session) {
      this.thoughts = info.thoughts;
    }
      
    }.bind(this));  
  } ,
  methods: {
    addThought() { 
      this.thoughts.push({thought: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    }
   
  },
  //TODO: add dilemma here
  template: `
  <div id= "page">
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
      <h2>Starting with an example dilemma</h2>
      <p id="boldtext">Adopt this dilemma and try to solve it. Then write your down most important thoughts.</p>
      <p>{{staticdilemma}}</p>
      <div class="holder">
        <p>These are your thoughts</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
          </li>
        </ul>
      </div> 
      <router-link tag="button" class="navbutton" to="/workshopexercises">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
      <router-link id="right" class="navbutton" tag="button" to="/autonomyheteronomy2">
        <i class="material-icons">
          arrow_forward
        </i>
           Continue
      </router-link>
    </div>
  `
});

//Instructions on formulation own dilemma and thought reflexes
const autonomyHeteronomy2 = Vue.component('autonomyHeteronomy2', {
  data: function() {
    return {
      session: this.$session,
      name: "autonomyHeteronomy2",
      displayreflex: false
    }
  },
  methods: {
    updateDisplayReflex(bool) {
      this.displayreflex = bool;      
    }
  }, 
 template: `
  <div id="app"> 
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
    <p v-if="displayreflex===false">Formulate your own dilemma in your groups</p>
  
      <div v-if="displayreflex==false" v-on:click="updateDisplayReflex(true)">
        <button class="smallbutton">
        Start!
        </button>
      </div>
        <div v-if="displayreflex">
          <p>Write down your <b>instinctive thoughts</b> about this dilemma.<br>
            This is Individuall, but discuss with your group.</p>
        </div>
    <router-link tag="button" class="navbutton" to="/autonomyheteronomy1">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
 <router-link id="right" class="navbutton" tag="button" to="/autonomyHeteronomy3" v-if="displayreflex">
       <i class="material-icons">
          arrow_forward
        </i>
        Continue
    </router-link>
  </div>
  `
});
  
//Dogmatiska låsningar
//TODO translate dogmatiska låsningar
const autonomyHeteronomy3 = Vue.component('autonomyHeteronomy3', {
  data: function() {
    return {
      session: this.$session,
      name: "autonomyHeteronomy3"
    }
  }, 
 template: `
  <div id="app"> 
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
    <p>Write down <b>principle fixations about</b> this dilemma.<br>
      This is Individuall but discuss with your group.</p>
    <router-link tag="button" class="navbutton" to="/autonomyheteronomy2">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
    <router-link id="right" tag="button" class="navbutton" to="/autonomyHeteronomy4">
       <i class="material-icons">
          arrow_forward
        </i>
        Continue
    </router-link>
  </div>
  `
});

//Konkreta värden
//TODO: Evaluate concretee values and explain it further
const autonomyHeteronomy4 = Vue.component('autonomyHeteronomy4', {
  data: function() {
    return {
      session: this.$session,
      name: "autonomyHeteronomy4"
    }
  }, 
 template: `
  <div id="app"> 
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
    <p>Write down <b>concrete values</b> about this dilemma.<br>
      This is Individuall but discuss with your group.</p>
    <router-link tag="button" class="navbutton" to="/autonomyheteronomy3">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
    <router-link id="right" tag="button" class="navbutton" to="/autonomyHeteronomy5">
       <i class="material-icons">
          arrow_forward
        </i>
        Continue
    </router-link>
  </div>
  `
});


//Handlingalternativ och värden(vad kan göras?)
//TODO: Evaluate actionoptions and explain it further
const autonomyHeteronomy5 = Vue.component('autonomyHeteronomy5', {
  data: function() {
    return {
      session: this.$session,
      name: "autonomyHeteronomy5"
    }
  }, 
 template: `
  <div id="app"> 
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
    <p>Write down what <b>can be done</b> about this dilemma.<br>
      This is Individuall but discuss with your group.</p>
      <router-link tag="button" class="navbutton" to="/autonomyheteronomy4">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
  <router-link id="right" tag="button" class="navbutton" to="/analysis">
       <i class="material-icons">
          arrow_forward
        </i>
        Continue
    </router-link>
  </div>
  `
});

var analysis = Vue.component('analysis', {
  data: function() {
    return {
      groupsanalys: this.$analys,
      session: this.$session
    }
  
  },
   created: function() {
   /*
     socket.on('showanalysis', function(data) {
      var contains = false;
      var index;
      //console.log("new analys " + data.group);
      for (var i in this.$analys) {
        //if this groups analysis already existis
        //console.log("existing analys in index " + i + this.$analys[i].group);
        if (data.group === this.$analys[i].group) {
          //console.log('match');
          contains = true;
          index = i;
        }
      }
      if (contains){
        //replace old analysis with new
        this.$analys.splice(index,1);
        this.$analys.push(data);
      }
      else {
        //just add the new analysis
        this.$analys.push(data); 
      }

    }.bind(this));  
  */
  },

  template:`
  <div id="app">
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
    <h3>Presentation</h3>
    <p id="boldtext">The goal with this exercise was to learn to differentiate between the different ways of thinking,
      Heteronomy and Autonomy and thus becoming more concious of one owns thoughtprocess and being able to controll it. 
    </p>
    <p> 
      Heteronomy and Autonomy are two different ways of thinking. Heteronomy is the fast way of accepting one truth without reflecting
      based on for example authority, strong principles or that you know that this is right and this is wrong so that you don't need to reflect upon it.
      Autonomy on the other hand is when you analyse the dilemma from different perspectives and weights the possible solutions against each other.
      <br>
      <br>
      All sumitted analyses will be presented here</p>
    <nav>
    <router-link :to="{name: 'showanalysis', params: {groupanalys: obj} }" 
      v-for="obj in groupsanalys" 
      v-bind:key="obj.group" >
        {{ obj.group }}
    </router-link>

    </nav>

    <router-link tag="button" class="navbutton" to="/autonomyheteronomy5">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
    <router-link id="right" tag="button" class="navbutton" to="/vote">
       <i class="material-icons">
          arrow_forward
        </i>
        Continue 
    </router-link>
  </div>
    `
});

const showAnalysis = Vue.component('showAnalysis', {
  data:function() {
    return {
      session: this.$session,
      dilemma: "",
      group: "",
      actionAlternatives: [],
      concreteValues: [],
      principles: [],
      reflexthoughts: []
    }
  },
  created: function () {
    this.dilemma = this.$route.params.groupanalys.dilemma;
    this.group = this.$route.params.groupanalys.group;
    this.actionAlternatives = this.$route.params.groupanalys.actionAlternatives;
    this.concreteValues = this.$route.params.groupanalys.concreteValues;
    this.principles = this.$route.params.groupanalys.principles; 
    this.reflexthoughts = this.$route.params.groupanalys.reflexThoughts;
    
  },

  template: `
  <div> 
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
    <h2>This is a summary of {{group}}'s analysis</h2>
    This is your groups dilemma: <br>
    {{dilemma}}
    <div class="wrapper">
      <div class="box a"><h2>Heteronomy</h2></div>
        <div class="box b"><h2>Autonomy</h2></div>
        <div class="box c">
          <div class="box g"><h3>Reflex thoughts</h3>
          (Dominated by an automatic thought.)
            <ul class="summaryList">
              <li v-for="(data, index) in reflexthoughts" :key='index'> 
                {{data.reflex}}
              </li>
            </ul>
          </div>
          <div class="box h"><h3>Dogmatic fixations</h3> 
          (Fixating by a big and important principle.)
            <ul class="summaryList">
              <li v-for="(data, index) in principles" :key='index'> 
                {{data.principle}}
              </li>
            </ul>
          </div>
        </div>
        <div class="box d">
          <div class="box e"><h3>Concrete Values</h3>
          (Who does the dilemma concerns and what are their interests?)
            <ul class="summaryList">
              <li v-for="(data, index) in concreteValues" :key='index'> 
                {{data.concreteValue}}
              </li>
            </ul> 
          </div>
          <div class="box f"><h3>Action alternatives and Values</h3>
          (What can be done and how does that affect everyones interests?)
            <ul class="summaryList">
              <li v-for="(data, index) in actionAlternatives" :key='index'> 
                {{data.actionAlternative}}
              </li>
            </ul>
          </div>
        </div>
    </div>
    <router-link class="navbutton" tag="button" to="/analysis">
     <i id="left" class="material-icons">
        arrow_back
      </i>
      Go back
    </router-link>
  </div>
` 

});

const Vote = Vue.component('Vote', {
  data: function() {
    return {
      session: this.$session,
      thought: '',
      thoughts: null,
      staticdilemma: this.$staticdilemma,
      i: 0,
      showNextButton: true,
      listoptions: [ {options: {
                      customId: 0,
                      showTotalVotes: true,
                      showResults: true,
                      question: 'Do you think this thought is heteronomy or autonomy?',
                        answers: [
                                    { value: 1, text: 'Heteronomy', votes: 0 },
                                    { value: 2, text: 'Autonomy', votes: 0 }
                                  ],
                                }
      } ]

    }
  },
  created: function() {
    socket.emit('initialThoughts', this.$session);
    socket.on('displayInitialThoughts', function (info) {
      console.log('display init thoughts '+ info.session);
      if (info.session == this.$session) {
        this.thoughts = info.thoughts;
        //initialize component with as many poll objs as there are thoughts
        for (var n = 0; n < info.thoughts.length; n++) {
          console.log("loop step: " + n);
          this.listoptions.push(
            {
              options: {
                customId: 0,
                showTotalVotes: true,
                showResults: true,
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
   
  //listen for student votes and updating the poll votes accordingly
  socket.on('vote', function(obj) {
    if (obj.session == this.$session) {
      console.log('vote recieved');
        if (obj.answer === "Heteronomy") {
          console.log(obj.answer);
          this.listoptions[obj.thoughtindex].options.answers[0].votes += 1;
          console.log("after update: " + this.listoptions[obj.thoughtindex].options.answers[0].votes);
        }
        else if (obj.answer === "Autonomy") {
          console.log(obj.answer);
          this.listoptions[obj.thoughtindex].options.answers[1].votes += 1; 
          console.log("after update: " + this.listoptions[obj.thoughtindex].options.answers[1].votes);
        }   
    }
  }.bind(this));
  },
  methods: {
    updateShowIndex() {
      if (this.i >= this.thoughts.length - 1) {
        this.showNextButton = false;
      }
      else {
        this.i += 1;
      }

    },
    addVote(obj){
      console.log('You voted ' + obj.value + '!');
      
    },
    navigateStudentsToStart() {
      socket.emit('navigateStudentsToComp', {'comp' : "start", 'session' : this.$session });
    }
  },
  template: `
  <div> 
    <div id="textleft"> Sessiontoken: <b>{{session}}</b></div>
    <h2>Inital dilemma</h2>
    <p id="boldtext">With our new aquired knowledge about heteronomy and autonomy lets discuss the inital dilemma in this exercise</p>
    <p>{{ staticdilemma }}</p>
    <div v-for="(data, index) in thoughts">
      <div v-if="i == index">
        <ul>
          <li>
            {{data.thought}}
          </li>
        </ul>
        <vue-poll v-bind="listoptions[index].options" @addvote="addVote"/>
        <button class="smallbutton" v-if=showNextButton v-on:click="updateShowIndex">Next thought</button>
      </div>
    </div>
       <router-link tag="button" class="navbutton" to="/analysis">
        <i id="left" class="material-icons">
          arrow_back
        </i>
        Go Back
      </router-link>
      <router-link id="right" class="navbutton" tag="button" v-on:click.native="navigateStudentsToStart()" to="/workshopexercises">
        <i class="material-icons">
          arrow_forward
        </i>
         Continue
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
      component:TeacherStartPage
    },
    {
      path:'/startworkshop',
      name: 'startworkshop',
      component:StartWorkshop
    },
    {
      path:'/workshopexercises',
      component:workshopExercises
    },
    {
      path:'/provocative1',
      component:Provocative1
    },
    {
      path:'/provocative2love',
      component:Provocative2love
    },
    {
      path:'/provocative3war',
      component:Provocative3War
    },
    {
      //conslusion on the provocative exercise
      path:'/provocativeconclusion',
      component:ProvocativeConclusion
    },
    {
      path:'/autonomyheteronomy1',
      component:autonomyHeteronomy1
    },
    {
      //Reflex thoughts
      path:'/autonomyheteronomy2',
      component:autonomyHeteronomy2
    },
    {
      //Dogmatiska låsningar
      path:'/autonomyheteronomy3',
      component:autonomyHeteronomy3
    },
    {
      //Konkreta värden (vem berörs och vad är deras värderingar)
      path:'/autonomyheteronomy4',
      component:autonomyHeteronomy4
    },
    {
      //Handlingalternativ och värden(vad kan göras?)
      path:'/autonomyheteronomy5',
      component:autonomyHeteronomy5
    },
    {
      //rediricting page with summaryanalyisis links
      path:'/analysis',
      component: analysis,
      name: 'analysis'
    },
    {
      //rediricting page with summaryanalyisis links
      path:'/showanalysis',
      component: showAnalysis,
      name: 'showanalysis'
    },
    {
      //voting on the inital dilemma input, autonomy or heteronomy?
      path:'/vote',
      component:Vote
    },
    {
      //delete input from server
      path:'/settings',
      component:Settings
    },
    {
      //decide which session to start with
      path:'/sessions',
      component:Sessions
    }
  
 
 
  ]
});

const app = new Vue({
  el: '#teacher',
  name: 'Workshop',
  router,
  socket,
  data () {
    return {
      name: 'Workshop',
      session: null,
      thoughts: [],
    }
  },
  created: function() {
   socket.emit('wantallsessions');
    socket.on('allsessions', function(sessions) {
      Vue.prototype.$sessions = sessions;
      console.log('vue sessionscomp: ' + this.$sessions);
    });
    socket.on('showanalysis', function (data) {
      if (data.session == this.$session) {
        var contains = false;
        var index;
        //console.log("new analys " + data.group);
        for (var i in this.$analys) {
          //if this groups analysis already existis
          //console.log("existing analys in index " + i + this.$analys[i].group);
          if (data.group === this.$analys[i].group) {
            //console.log('match');
            contains = true;
            index = i;
          }
        }
        if (contains) {
          //replace old analysis with new
          this.$analys.splice(index, 1);
          this.$analys.push(data);
        }
        else {
          //just add the new analysis
          this.$analys.push(data);
        }
      }
    }.bind(this));

  }
}); 
