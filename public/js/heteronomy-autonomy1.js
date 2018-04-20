'use strict';
var socket = io();

var vm = new Vue({
  el: "#page",
  name: 'HeteronomyAutonomy1',
  
  data() {
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
  }
});


