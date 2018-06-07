/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
//import { Summary } from './exercise2.js'
'use strict';
var studentsocket = io('/students');
var groupsocket; 
var socket = io();
//global variable to save input when going to 'explain more'
Vue.prototype.$input = [];
//global dilemma to not having to passit trough routes
Vue.prototype.$dilemma = "";
Vue.use(VuePoll);

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
//TODO: base for all exercise, should not say you are logged in at all routes here maybe only first om ens det
  template: `
   <div>
    <h2>You are logged in</h2>
    <p v-if="this.groupName != null">The name of your group is <ul><li class="groups">{{ groupName }}</li></ul></p>
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
      thoughts: []
    }
  },
  methods: {
    addThought() { 
      this.thoughts.push({situation: this.thought});
      this.thought = '';
    },
    removeThought(id) {
      this.thoughts.splice(id,1);
    },
    collectSituations() {
      groupsocket.emit('groupsituations', this.thoughts);
      this.thoughts = [];
    }
  },
  template: `
  <div id= "page"><!-- TODO Show first dilemma here-->
      <!-- prevent: prevents from page reloading -->
      <h2>This exercise is about ethical awareness</h2>
      <p>The first part of this exercise is to come up with real life situations which has no moral implication at all.</p>
      <div class="holder">
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your sitations here please..." v-model="thought">
        </form> 
        <p>These are your situations</p>
        <ul>
          <li>Example sitations: Deciding which company to by harddrive from.</li>
          <li v-for="(data, index) in thoughts" :key='index'> 
            {{data.situation}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>  
      <div v-on:click="collectSituations()"> 
        <router-link to="/exercise1p2">
          Submit situations to group
        </router-link>
      </div>
    </div>
  `
});

//group by group
const Exercise1p2 = Vue.component('Exercise1p2', {
 data: function() {
    return {
      name: "Ethical awareness part 1.1: Show groups situations",
      situations: null
  }
 },
  created: function() {
    groupsocket.on('showgroupsituations', function(data) {
      this.situations = data;
    }.bind(this));

    socket.on('redirectcomponent', function(component) {
        router.push('/situationsfullclass');
    }.bind(this));
  },
  methods: {
    removeThought(id) {
      this.situations.splice(id,1);
      groupsocket.emit('removesituation', id);  
  },
 
  },  
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Discuss your groups list of situations that has no moral implication.
    <br>Discuss and revise the list</p>
      <div class="holder">
        <p>These are your group's sitations with no moral implications </p>
        <ul>
          <li v-for="(data, index) in situations" :key='index'> 
            {{data.situation}}
            <i class="material-icons" v-on:click="removeThought(index)">delete</i>
          </li>
        </ul>
      </div>
    <router-link :to="{ name: 'exercise1'} ">
      Go Back /
    </router-link>
  </div>
  `
});

const SituationsFullClass = Vue.component('SituationsFullClass', {
  data: function() {
    return {
      name: "Ethical awareness part 1.2",
    }
  },

  template: `
  <div> 
    <h2>Exercise 2 {{ name }}</h2>
    <p>Please have a look at the bigger screen and discuss your situations.<br>
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
    You can not add more situations now.</p>
    <router-link to="/exercise2p2">
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
      sessiontoken: null,
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
      socket.emit('thoughts', this.thoughts);
      this.thoughts = [];
    }
  },
  template: `
  <div id= "page"><!-- TODO Show first dilemma here-->
      <!-- prevent: prevents from page reloading -->
      <h3>This exercise is about {{ name }} </h3>
      <div class="holder">
        <p>Description of dilemma goes here</p>
        <form @submit.prevent="addThought">
          <input type="text" placeholder="Enter your thoughts here plx..." v-model="thought">
        </form> 
        <ul><li>Example: I think this is wrong because of current laws..</li></ul>
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
    When you the teacher tells you it is time for the next step in this exercise press continue..<br>
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
 },
  methods: {
    
    notifyGroupSubmit(bool, dilemma) {
      this.notsubmitted = bool;
      groupsocket.emit('dilemma', {'dilemma': dilemma, 'notsubmitted': false});
    },
    notifyGroupEdit(bool, dilemma) {
      this.notsubmitted = bool;
      groupsocket.emit('edit', {'dilemma': dilemma, 'notsubmitted': true});
    }
   },
   
   template: `
  <div id="student">
    <h2>Exercise 2 {{ name }}</h2>
    <p>Discuss in your group and formulate your own dilemma relevant to your occupation.</p>
        <div v-if="notsubmitted">
          <textarea placeholder="Enter your dilemma here please" cols="40" rows="5" v-model="dilemma">
          </textarea>
          <button id="smallbutton" v-on:click="notifyGroupSubmit(false, dilemma)">Submit dilemma</button>
        </div>
        <div v-if="notsubmitted===false"><div class="text"> {{ dilemma }}</div> 
          <button id="smallbutton" v-on:click="notifyGroupEdit(true, dilemma)">Edit dilemma</button>
        </div>
        <router-link :to="{ name: 'exercise2p3' }">
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

  template: `
  <div>
    <h1>Instructions explanation</h1>
      <p> This question is about the reflex thoughts that occur, for example 
        <ul><li>This is someone elses responsibility and does not apply to me, so I'll ignore it</li></ul>
        Discuss in your group but individually write down thoughts that implies that you dont want to deal with the dilemma.
        Think about possible instinctive thoughts of other perspectives, you don't need to agree with all thoughts.
        Write all thoughts you can come up with, independent of the solution you want to come to.
      </p>
      <router-link :to="{ name: 'exercise2p3'}">
        Back
      </router-link>
  </div>`
  });

const Exercise2p3 = Vue.component('Exercise2p3', {
  //TODO: This is individual
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.3: Reflex thoughts",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null,
      reflex: "",
      reflexthoughts: [],
      dilemma: "",
  }
 },
  created: function() {
    //this.dilemma = this.$route.params.dilemma;
    this.dilemma = this.$dilemma;
    this.reflexthoughts = this.$input;
    console.log("global: " + this.$dilemma);
    console.log("instance: " + this.dilemma);
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
    <h2>Exercise 2 {{ name }}</h2>
    <nav>
      <router-link :to="{ name: 'reflexhelp'}">
        Explain More!
      </router-link>
    </nav>
    <p>Discuss in your group.
    <br>What is the first things that comes to your mind?</p> 
     Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addReflexThought">
          <input type="text" placeholder="Enter your reflex thoughts here plx..." v-model="reflex">
        </form> 
        <p>These are your reflex thoughts</p>
        <ul><li>Example thought: If I don't do this someone else will do it!</li></ul>
        <ul>
          <li v-for="(data, index) in reflexthoughts" :key='index'> 
            {{data.reflex}}
            <i class="material-icons" v-on:click="removeReflexThought(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectReflexThoughts()">
    <router-link :to="{ name: 'exercise2p4'}">
      Continue
    </router-link>
    </div>
  </div>
  `
});


const Exercise2p4 = Vue.component('Exercise2p4', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.4: Show groups reflex thoughts",
      dilemma: "",
      reflexthoughts: null
  }
 },
  created: function() {
    groupsocket.on('showreflexthoughts', function(data) {
      this.reflexthoughts = data;
    }.bind(this));
    this.dilemma = this.$dilemma;
  },
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Group thoughts
    <br>What is the first thing you think about? </p>
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
    <router-link :to="{ name: 'exercise2p3'} ">
      Go Back /
    </router-link>
    <router-link :to="{ name: 'exercise2p5'} ">
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

  template: `
  <div>
    <h1>Instructions explanation</h1>
      <p> This question is about the big principles which one believes or fixations by something, for example 
        <ul><li>Our company's reputation is very important!</li></ul>
        These principles are the reason for the moral dilemma since you can't follow them all.
        Discuss in your group but individually write down relevant big principles that you believe in.
        Think about principle fixations of other perspectives, you don't need to agree with all.
        Write all thoughts you can come up with, independent of the solution you want to come to.
      </p>
      <router-link :to="{ name: 'exercise2p5'} ">
        Back
      </router-link>
  </div>`
  });


const Exercise2p5 = Vue.component('Exercise2p5', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.5: Principle fixations",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null,
      principle: "",
      principles: [],
      dilemma: "",
  }
 },
  created: function() {
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
    <h2>Exercise 2 {{ name }}</h2>
    <nav>
      <router-link :to="{ name: 'principlehelp'} " >
        Explain More!
      </router-link>
    </nav>
     <p>Discuss with your group.
    Individually write down principles fixations that relates to the dilemma.
    Write all principles you can come up with, independent of the solution you want to come to.</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addPrinciple">
          <input type="text" placeholder="Enter your principle here plx..." v-model="principle">
        </form> 
        <p>These are your principles</p>
        <ul><li>Example principle: You have to follow the law....</li></ul>
        <ul>
          <li v-for="(data, index) in principles" :key='index'> 
            {{data.principle}}
            <i class="material-icons" v-on:click="removePrinciple(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectPrinciples()">
    <router-link :to="{ name: 'exercise2p6' }">
      Continue
    </router-link>
    </div>
  </div>
  `
});


const Exercise2p6 = Vue.component('Exercise2p6', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.6: Show groups principles",
      dilemma: "",
      principles: null
  }
 },
  created: function() {
    //set global input to [] to not save state when going back
    groupsocket.on('showprinciples', function(data) {
      this.principles = data;
    }.bind(this));
    this.dilemma = this.$dilemma;
  },
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Group thoughts
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
    <router-link :to="{ name: 'exercise2p5'} ">
      Go Back /
    </router-link>
    <router-link :to="{ name: 'exercise2p7'} ">
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

  template: `
  <div>
    <h1>Instructions explanation</h1>
      <p> This question is about the interests and concrete values of the concerned parties, for example 
        <ul><li>Do we want to implement this customer's demand?</li></ul>
        There is a risk to leave out relevant arguments here, to eliminate that risk try to first
        identify all parties which the moral dilemma concerns (groups, companies, people organisation, environment, society etc) 
        but always question your conclusions. Discuss in group what values, interests duties feelings etc these parties have.
        Be critical and prepared to go back and revise your conclusions.
      </p>
      <router-link :to="{ name: 'exercise2p7' } ">
        Back
      </router-link>
  </div>`
  });


//concrete values
const Exercise2p7 = Vue.component('Exercise2p7', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.7: Concrete and relevant values",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null,
      concreteValue: "",
      concreteValues: [],
      dilemma: "",
  }
 },
  created: function() {
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
    <h2>Exercise 2 {{ name }}</h2>
    <nav>
      <router-link :to="{ name: 'valuehelp'} ">
        Explain More!
      </router-link>
     </nav>
    <p>Discuss with your group.
    <br>Think about the stakeholders the dilemma concerns and individually write down their values.</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addConcreteValue">
          <input type="text" placeholder="Enter your value here plx..." v-model="concreteValue">
        </form> 
        <p>These are your stakeholder values</p>
        <ul>
        <li>Example value: Is the collaboration with this customer important.?..</li>
          <li v-for="(data, index) in concreteValues" :key='index'> 
            {{data.concreteValue}}
            <i class="material-icons" v-on:click="removeConcreteValue(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectConcreteValues()">
    <router-link :to="{ name: 'exercise2p8showvalues'}">
      Continue
    </router-link>
    </div>
  </div>
  `
});

const Exercise2p8ShowValues = Vue.component('Exercise2p8ShowValues', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.8: Show groups stakeholder values",
      dilemma: "",
      concreteValues: null
  }
 },
  created: function() {
    groupsocket.on('showconcretevalues', function(data) {
      this.concreteValues = data;
    }.bind(this));
    this.dilemma = this.$dilemma;
  },
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Group thoughts</p>
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
    <router-link :to="{ name: 'exercise2p7'} ">
      Go Back /
    </router-link>
    <router-link :to="{ name: 'exercise2p9'} ">
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

  template: `
  <div>
    <h1>Instructions explanation</h1>
      <p> This question is about the different action alternatives one could take and how that will affect the values and interests from previous question, for example
        <ul><li>actionoption first, with this action how are we going to make it financially?</li></ul>
        Write all relevant option to act and their effects on the concerned values as they are decribed in the previous question.
        There is always a risk to miss a good action alternative, so be prepared to go back and revise the list of action alternatives.
      </p>
      <router-link :to="{ name: 'exercise2p9'} ">
        Back
      </router-link>
  </div>`
  });


const Exercise2p9 = Vue.component('Exercise2p9', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.9: Action alternatives and relevant values",
      notsubmitted: true,
      studentId: null,
      sessiontoken: null,
      actionAlternative: "",
      actionAlternatives: [],
      dilemma: "",
  }
 },
  created: function() {
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
    <h2>Exercise 2 {{ name }}</h2>
    <nav>
      <router-link :to="{ name: 'actionoptionhelp'} ">
        Explain More!
      </router-link>
     </nav>
    <p>Discuss with your group.<br>
    What possible actions could one take and how does that effect the values from the previous question?</p>
      Your group's dilemma is the following: 
      <div class="text">{{dilemma}}</div>
      <div class="holder">
        <form @submit.prevent="addActionAlternative()">
          <input type="text" placeholder="Enter your action alternative here plx..." v-model="actionAlternative">
        </form> 
        <p>These are your action alternatives and their effects</p>
        <ul>
        <li>Example: state an action alternative, how will this affect our reputation?</li>
          <li v-for="(data, index) in actionAlternatives" :key='index'> 
            {{data.actionAlternative}}
            <i class="material-icons" v-on:click="removeActionAlternative(index)">delete</i>
          </li>
        </ul>
      </div>
      <div v-on:click="collectActionAlternatives()">
    <router-link :to="{ name: 'exercise2p9showalter'}">
      Continue
    </router-link>
    </div>
  </div>
  `
});

const Exercise2p9ShowAlter = Vue.component('Exercise2p9ShowAlter', {
 data: function() {
    return {
      name: "Autonomy and Heteronomy part 2.8: Show groups action alternatives and values",
      dilemma: "",
      actionAlternatives: null
  }
 },
  created: function() {
    groupsocket.on('showactionalternatives', function(data) {
      this.actionAlternatives = data;
    }.bind(this));
    this.dilemma = this.$dilemma;
  },
   
   template: `
  <div>
    <h2>Exercise 2 {{ name }}</h2>
    <p>Group thoughts</p>
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
    <router-link :to="{ name: 'exercise2p9'} ">
      Go Back /
    </router-link>
    <router-link :to="{ name: 'summary'} ">
      Continue
    </router-link>
  </div>
  `
});


const Summary = Vue.component('Summary', {
 data: function() {
    return {
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
    //notify that we want the input from the questions
    groupsocket.emit('wantsummary', function() {
      //console.log("want summary");
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
        //console.log('submitanalysis');
      });
    }
  },
  template: `
  <div> <h2>This is a summary of your group's analysis</h2>
  <p v-if="submitted==false">You may change your analysis</p>
    <p v-if="submitted">Your analysis is now submitted, wait for your turn to present it!</p>
    This is your groups dilemma: <br>
    {{dilemma}} <br>
    <div class="wrapper" v-if="submitted==false">
      <div class="box a"><h2>A. Heteronomy</h2></div>
        <div class="box b"><h2>B. Autonomy</h2></div>
        <div class="box c">
          <div class="box g"><h3>G. Reflex thoughts</h3>
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
          <div class="box h"><h3>H. Dogmatic fixations</h3> 
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
          <div class="box e"><h3>E. Concrete Values</h3>
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
          <div class="box f"><h3>F. Action alternatives and Values</h3>
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
    <button v-if="submitted==false" id="smallbutton" v-on:click="submitAnalysis()">Submit analysis</button>
    <br><router-link v-if="submitted==true" to="/studentvote">Next</router-link>
  </div>
    `

  });


const StudentVote = Vue.component('StudentVote', {
  data: function() {
    return {
      thought: '',
      thoughts: [],
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
    console.log("studentvote created");
    studentsocket.emit('initialThoughtsStudent', 'want inital thoughts student');
    studentsocket.on('displayInitialThoughts', function(thoughts) {
     this.thoughts = thoughts;
      //initialize component with as many poll objs as there are thoughts
      for (var n = 0; n < thoughts.length; n++) {
        console.log("loop step: " + n);
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
    console.log("customId: " + this.listoptions[n].options.customId);
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
  
  socket.on('redirectcomponent', function(component) {
    console.log("redirect componet");  
    if (component === "Start") {
        router.push('/start');
      }
    }.bind(this));
 
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
        socket.emit('studentvote', {answerindex: obj.value, answer: "Heteronomy", thoughtindex: this.i});
        }
      if (obj.value === 2) {
        socket.emit('studentvote', {answerindex: obj.value, answer: "Autonomy", thoughtindex: this.i});
        }
      }
  },
  //TODO add initial dilemma here
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
        Index: {{index}}
        i: {{ i }}
        <vue-poll v-bind="listoptions[i].options" @addvote="addVote"/>
        <button id="smallbutton" v-if=showNextButton v-on:click="updateShowIndex">Next thought</button>
      </div>
    
    </div>
    <router-link to="/summary">Go back</router-link> 
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
      component:Start
    },
    {
      path:'/exercise1',
      name: "exercise1",
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
    },
    { //show group situatons
      path:'/exercise1p2',
      component:Exercise1p2
    },
    { //
      path:'/situationsfullclass',
      component:SituationsFullClass,
      name: 'situationssfullclass'
    },

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


