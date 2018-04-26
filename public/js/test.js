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
      name: 'teacherstartworkshop',
      student: '',
      students: ["23"],
      token: null,
    };
  },
   template: `
 
    <div id="app">
     jsfile: {{name}}
      
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

      socket.on("session", function(session) {
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
        {"exerciseOption": "Exercise 1"},
        {"exerciseOption": "Exercise 2"},
        {"exerciseOption": "Exercise 3"},
        {"exerciseOption": "Exercise 4"}
      ]
    };
  },
   template: `
 
    <div id="app">
        <router-link to="/autonomyheteronomy1">
        <button class="workshopbutton" v-for="(data, index) in exerciseOptions" :key='index'> {{data.exerciseOption}}</button>
        </router-link>
    <br><router-link to="/startworkshop">Back</router-link>
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
      path:'/autonomyheteronomy1',
      component:autonomyHeteronomy1
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
    socket.on("session", function(session){
      this.token = session;
    }.bind(this));
  }
}); 