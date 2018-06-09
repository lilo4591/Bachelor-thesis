var socket = io();

//global variable to keep track analysis input each group as an obj
Vue.prototype.$analys = [];
Vue.use(VuePoll);

const Help = Vue.component('Help', {
  template: `
  <div> <h1>this is the teacher help page </h1>
        <router-link to="/">Back</router-link>
  </div>`
  });

const TeacherStartPage = Vue.component('TeacherStartPage', {
  template:`
        <div id="app">
        <nav>
          <router-link to="/help">Help</router-link>
        </nav>
        <router-link to="/startworkshop">
          <button class="button">Start Workshop</button>
          </router-link><br>
          <button class= "button">Edit Workshop</button> 
        </div>
    `
});

const StartWorkshop = Vue.component('StartWorkshop', {
  data: function() {
    return {
      name: 'Startworkshop',
      student: '',
      students: [],
      token: null,
      numEachGroup: null,
      groupObject: null,
    };
  },
  //TODO in case on no students connected print appropiate
  //TODO redo group generating
   template: `
 
    <div id="app">
     Component: {{name}}
      
      <h2>Log in to localhost:3000/student with sessiontoken {{ token }} </h2>
      <ul>
        <li v-for="(data, index) in students" :key='index'>
          Student number {{students[index]}} has connected</li>
      </ul>
      <form @submit.prevent="generateGroups(numEachGroup)">
        Enter number of student in each group<br>
        <input type="number" min="0" placeholder="Enter number of students in each group" v-model="numEachGroup" required>
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
        <router-link to="/">Back</router-link>
      </div>
    </div>
  
  
  `,
  created: function() {
      //TODO bugz!! sessiontoken not shown when going to startworkshop, only when a studentpage loads
      socket.on('session', function(session) {
        this.token = session;
      }.bind(this));
      socket.on("StudentLoggedIn", function(studentNumber) {
        this.addStudent(studentNumber);
        console.log(this.students);
      }.bind(this));    
      socket.on('groupInfo', function(data) {
        this.groupObject = data.groupObject;
      }.bind(this));
    },

 methods: {    
    addStudent(studentNumber) { 
      this.students.push(studentNumber);
    },
    generateGroups(n) {
    socket.emit('generateGroups', n);
    console.log("start generate: " + n); 
    }
 }
});

const workshopExercises = Vue.component('WorkshopExercises', {
  data: function() {
    return {
      name: 'workshopExercises',
      exerciseOptions: [
        "Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"
      ]
    };
  },
   template: `
 
    <div id="app">
        <router-link to="/provocative1">
        <button class="workshopbutton" v-on:click="navigateStudentsTo(1)"> {{this.exerciseOptions[0]}}</button>
        </router-link>
    
        <router-link to="/autonomyheteronomy1">
        <button class="workshopbutton" v-on:click="navigateStudentsTo(2)"> {{this.exerciseOptions[1]}}</button>
        </router-link>
 
    <br><router-link to="/startworkshop">Back</router-link>
    </div> 
  
  ` ,
  methods: { 
    navigateStudentsTo(exerciseNum) {
      socket.emit("navigateStudentsTo",exerciseNum);
    }
  }
});

const Provocative1 = Vue.component('provocative1', {
  data: function() {
    return {
      thought: '',
      thoughts: []
    }
  },
  created: function() {
    socket.on('collectsituations', function(situations) {
      this.thoughts = situations;
      console.log(situations);
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
    navigateStudentsTo(exerciseNum) {
      socket.emit("navigateStudentsTo",exerciseNum);
    },
    collectAllSituations() {
      socket.emit("wantsituations");
      socket.emit("navigateStudentsToComp", "situationsfullclass");
    }
  },
  template: `
  <div id= "page">
      <h2>Ethical awareness exercise</h2>      
      <p>The first part of this exercise is to come up with real life situations which has no moral implication at all.</p>
      <div class="holder">
      <button class="button" v-on:click="collectAllSituations">Show group's situations</button>
        <p>These are situations from all groups</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
        <router-link to="/provocative2love">
          Continue
        </router-link>
    </div>
  `
});


const Provocative2love = Vue.component('provocative2love', {
  data: function() {
    return {
      thought: '',
      thoughts: [],
      uppgift: 'collectrisks'
    }
  },
  created: function() {
    socket.on(this.uppgift, function(risks) {
      this.thoughts = risks;
      console.log(risks);
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
    navigateStudentsTo(exerciseNum) {
      socket.emit("navigateStudentsTo",exerciseNum);
    },
    collectAllRisks() {
      socket.emit("wantrisks");
      socket.emit("navigateStudentsToComp", "lovefullclass");
    }
  },
  //TODO generate loverisks arguments from txtfile or db
  template: `
  <div id= "page">
      <h2>Ethical awareness exercise</h2>      
      <p>This exercise is about identifing risks with Love.</p>
      <div class="holder">
      <button class="button" v-on:click="collectAllRisks">Show group's risks</button>
        <p>Risks with love</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
        <router-link to="/provocative3war">
          Continue
        </router-link>
    </div>
  `
});


const Provocative3War = Vue.component('provocative3war', {
  data: function() {
    return {
      thought: '',
      thoughts: [],
    }
  },
  created: function() {
    socket.on('collectposs', function(poss) {
      this.thoughts = poss;
  }.bind(this));
  },
  methods: {
   removeThought(id) {
      this.thoughts.splice(id,1);
    },
    navigateStudentsTo(exerciseNum) {
      socket.emit("navigateStudentsTo",exerciseNum);
    },
    collectAll() {
      socket.emit("wantposs");
      socket.emit("navigateStudentsToComp", "warfullclass");
    }
  },
  //TODO generate arguments from txtfile or db
  template: `
  <div id= "page">
      <h2>Ethical awareness exercise</h2>      
      <p>This exercise is about identifing possibilities with war.</p>
      <div class="holder">
      <button class="button" v-on:click="collectAll">Show group's possibilites</button>
        <p>Possibilies with war</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
        <router-link to="/provocative3war">
          Continue
        </router-link>
    </div>
  `
});



//Teacher showing dilemma and displaying student thoughts
//TODO: should the theacher route the students here to first input dilemma? 
//instead ofcontinuing
const autonomyHeteronomy1 = Vue.component('autonomyHeteronomy1', {
  data: function() {
    return {
      thought: '',
      thoughts: [
        {"thought": "Example: I think this is wrong because of current laws.." }
      ]
    }
  },
  created: function() {
    socket.on('displayThoughts', function(thoughts) {
     this.thoughts = thoughts;
      
    }.bind(this));  
  } ,
  methods: {
    addThought() { 
      this.thoughts.push({thought: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    },
    navigateStudentsTo(exerciseNum) {
      socket.emit("navigateStudentsTo",exerciseNum);
    }

  },
  template: `
  <div id= "page"><!-- TODO Show first dilemma here-->
      <!-- prevent: prevents from page reloading -->
      <h2>Dilemma goes here</h2>
      <div class="holder">
        <p>These are your thoughts</p>
        <ul>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.thought}}
          </li>
        </ul>
      </div> 
      <router-link to="/autonomyheteronomy2">Continue</router-link>
    </div>
  `
});

//Instructions on formulation own dilemma and thought reflexes
const autonomyHeteronomy2 = Vue.component('autonomyHeteronomy2', {
  data: function() {
    return {
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
    <p v-if="displayreflex===false">Formulate your own dilemma in your groups</p>
  
      <div v-if="displayreflex==false" v-on:click="updateDisplayReflex(true)">
        <button id="smallbutton">
        Start!
        </button>
      </div>
        <div v-if="displayreflex">
          <p>Write down your instinctive thoughts about this dilemma.<br>
            This is Individuall, but discuss with your group.</p>
        </div>
    <router-link to="/autonomyHeteronomy3" v-if="displayreflex">
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
      name: "autonomyHeteronomy3"
    }
  }, 
 template: `
  <div id="app"> 
    <p>Write down principlee fixations about this dilemma.<br>
      This is Individuall but discuss with your group.</p>
    <router-link to="/autonomyHeteronomy4">
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
      name: "autonomyHeteronomy4"
    }
  }, 
 template: `
  <div id="app"> 
    <p>Write down concrete values about this dilemma.<br>
      This is Individuall but discuss with your group.</p>
    <router-link to="/autonomyHeteronomy5">
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
      name: "autonomyHeteronomy5"
    }
  }, 
 template: `
  <div id="app"> 
    <p>Write down what can be done about this dilemma.<br>
      This is Individuall but discuss with your group.</p>
    <router-link to="/analysis">
      Continue
    </router-link>
  </div>
  `
});

var analysis = Vue.component('analysis', {
  data: function() {
    return {
      groupsanalys: this.$analys,
    }
  
  },
   created: function() {
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
   },

  template:`
  <div id="app">
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

    <router-link to="/vote">
      Continue 
    </router-link>
  </div>
    `
});

const showAnalysis = Vue.component('showAnalysis', {
  data:function() {
    return {
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
  <div> <h2>This is a summary of {{group}}'s analysis</h2>
    This is your groups dilemma: <br>
    {{dilemma}}
    <div class="wrapper">
      <div class="box a"><h2>A. Heteronomy</h2></div>
        <div class="box b"><h2>B. Autonomy</h2></div>
        <div class="box c">
          <div class="box g"><h3>G. Reflex thoughts</h3>
            <ul class="summaryList">
              <li v-for="(data, index) in reflexthoughts" :key='index'> 
                {{data.reflex}}
              </li>
            </ul>
          </div>
          <div class="box h"><h3>H. Dogmatic fixations</h3> 
            <ul class="summaryList">
              <li v-for="(data, index) in principles" :key='index'> 
                {{data.principle}}
              </li>
            </ul>
          </div>
        </div>
        <div class="box d">
          <div class="box e"><h3>E. Concrete Values</h3>
            <ul class="summaryList">
              <li v-for="(data, index) in concreteValues" :key='index'> 
                {{data.concreteValue}}
              </li>
            </ul> 
          </div>
          <div class="box f"><h3>F. Action alternatives and Values</h3>
            <ul class="summaryList">
              <li v-for="(data, index) in actionAlternatives" :key='index'> 
                {{data.actionAlternative}}
              </li>
            </ul>
          </div>
        </div>
    </div>
    <router-link to="/analysis">
      Go back
    </router-link>
  </div>
` 

});

const Vote = Vue.component('Vote', {
  data: function() {
    return {
      thought: '',
      thoughts: null,
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
    socket.emit('initialThoughts', 'want inital thoughts');
    socket.on('displayInitialThoughts', function(thoughts) {
     this.thoughts = thoughts;
    //initialize component with as many poll objs as there are thoughts
      for (var n = 0; n < thoughts.length; n++) {
        console.log("loop step: " + n);
          this.listoptions.push(
            {options: {
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
   }.bind(this));
   
  //listen for student votes and updating the poll votes accordingly
  socket.on('vote', function(obj) {
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
  }.bind(this));
  } ,
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
      console.log("navcomp");
      socket.emit('navigateStudentsToComp', "/start");
    }
  },
  //TODO add initial dilemma here
  //TODO sync with student votes
  //TODO no voting possibilty on teacher side only student side
  template: `
  <div> 
    <h1>Inital dilemma</h1>
    <p>With our new aquired knowledge about heteronomy and autonomy lets discuss the inital dilemma in this exercise</p>
    <div v-for="(data, index) in thoughts">
      <div v-if="i == index">
        <ul>
          <li>
            {{data.thought}}
          </li>
        </ul>
        <vue-poll v-bind="listoptions[index].options" @addvote="addVote"/>
        <button id="smallbutton" v-if=showNextButton v-on:click="updateShowIndex">Next thought</button>
      </div>
    </div>
    <div v-on:click="navigateStudentsToStart()">
      <router-link to="/workshopexercises">Exit exercise</router-link>
    </div>
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
      token: null,
      thoughts: [],
    }
  },
  created: function() {
    socket.on('session', function(session){
      this.token = session;
    }.bind(this));
  }
}); 
