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
          </router-link>
          <button class= "button">Edit Workshop</button> 
        </div>
    `
});

const StartWorkshop = Vue.component('StartWorkshop', {
  data: function() {
    return {
      name: 'Startworkshop',
      student: '',
      students: ["23"],
      token: null,
    };
  },
   template: `
 
    <div id="app">
     Component: {{name}}
      
      <h2>Log in to localhost:3000/student with sessiontoken {{ token }} </h2>
      <ul>
        <li v-for="(data, index) in students" :key='index'>
          Student number {{students[index]}} has connected</li>
      </ul>
      <div>
        <router-link to="/workshopexercises">
        <button class="button"> Start workshop </button>
        </router-link>
      </div> 
        <router-link to="/">Back</router-link>
    </div>
  
  
  `,
  created: function() {
      //TODO bugz!! sessiontoken not shown when going to startworkshop, only when a studentpage loads
      socket.on('session', function(session) {
        this.token = session;
      }.bind(this));
      console.log("prior to socket studentlogin");
      socket.on("StudentLoggedIn", function(studentId) {
        console.log("YES");
        this.addStudent(studentId);
        console.log(this.students);
      }.bind(this));    
    },

 methods: {    
    addStudent(studentId) { 
      this.students.push(studentId);
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
      console.log("teacher called navigateStudentsTo");
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

const autonomyHeteronomy1 = Vue.component('autonomyHeteronomy1', {
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
      <router-link to="/autonomyheteronomy2">Show Thoughts</router-link>
    </div>
  `
});


const autonomyHeteronomy2 = Vue.component('autonomyHeteronomy2', {
  data: function() {
    return {
      thought: '',
      thoughts: []
    }
  },
  created: function() {
    socket.on('displayThoughts', function(thoughts) {
      for ( var i = 0, l = thoughts.length; i < l; i++) {
        this.thoughts.push(thoughts[i]);
    }
      console.log("display thoughts"); 
    }.bind(this));  
  
  },
  template: `
  <div id="app"> 
  <p>These are your thoughts</p>
    <ul>
      <li v-for="(data, index) in thoughts" :key='index'> 
        {{data.thought}}
      </li>
    </ul>
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
      path:'/autonomyheteronomy2',
      component:autonomyHeteronomy2
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
    }
  },
  created: function() {
    socket.on('session', function(session){
      this.token = session;
    }.bind(this));
  }
}); 
