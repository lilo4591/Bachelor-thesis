var socket = io();

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
  //TODO add more exercise
  //TODO add despription of exercises
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
    navigateStudentsTo(exerciseNum) {
      socket.emit("navigateStudentsTo",exerciseNum);
    }

  },
  template: `
  <div id= "page"><!-- TODO Show first dilemma here-->
      <!-- prevent: prevents from page reloading -->
      <div class="holder">
      <h2>Provocative</h2>
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

const analysis = Vue.component('analysis', {
  data: function() {
    return {
      groupsanalysis: [], 
    }
  
  },
   created: function() {
    socket.on('showanalysis', function(data) {
      //check if this groups analysis already exists
      this.groupsanalysis.push(data)
    }.bind(this));  
   },
  template:`
  <div id="app">
    <nav v-for="obj in groupsanalysis">
      <router-link :to="{name: 'showanalysis', params: {groupanalys: obj} }">{{ obj.group }}</router-link>
    </nav>
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
      thoughts: []
    }
  },
  created: function() {
    socket.on('session', function(session){
      this.token = session;
    }.bind(this));
  }
}); 
