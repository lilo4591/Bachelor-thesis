<template> 
  <div><!-- TODO Show first dilemma here-->
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
</template>

<script>

export default {
  name: 'HeteronomyAutonomy',
  
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
}


</script>

<style scoped>

@import "https://www.w3schools.com/w3css/4/w3.css";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";

button {
  border-radius: 4px;
  width: 100%;
  height: 200px;
  margin-left: 0;
  margin-right: 0;
  background: #5b97f0;
  background-image: linear-gradient(to bottom, #5b97f0, #2980b9);
  border-radius: 15px;
  font-family: Arial;
  color: #ffffff;
  font-size: 50px;
  padding: 9px 25px 10px 25px;
  text-decoration: none;

}

button:hover {
  background: #3cb0fd;
  background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
  text-decoration: none;

}

input {
  text-align: center;
  width: 100%;
  border: 0;
  border-radius: 4px;
  padding: 20px 0;
  font-size: 1.3em;
  background-color: #323333;
  color: #687F7F;
}

.holder {
  background: #fff;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

ul li {
  padding: 20px;
  font-size: 1.3em;
  background-color: #E0EDF4;
  border-left: 5px solid #3EB3F6;
  border-radius: 4px;
  margin-bottom: 2px;
  color: #3E5252;
}

p {
  text-align:center;
  padding: 30px 0;
  color: gray;
}

i {
  float:right;
  cursor:pointer;
}

.container {
  box-shadow: 0px 0px 40px lightgray;
}

</style>
