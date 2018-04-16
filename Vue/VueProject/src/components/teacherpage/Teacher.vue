<template>
  <div>
    {{name}}
    <!-- {{btnState ? 'The Button is disabled' : 'The button is active' }}
      <button v-on:click="changeName" v-bind:disabled="btnState">Change Name</button> 
    -->
    <div class="button">
      <!-- want to loop the buttons, but then how to route to 2 different paths?-->
        <router-link to="teacher/workshop">
        <button> 
          {{ this.options[0].option }}
        </button>
        </router-link>
        <router-link to="teacher/workshop">
        <button> 
          {{ this.options[1].option }}
        </button>
        </router-link>
 </div> 
  </div>
</template>

<script>
//import Router from '../router.js'

export default {
  name: 'Teacher',
  data () {
    return {
      name: 'Teacher Page',
      btnState: true,
      options: [
        {"option": "Start Workshop"},
        {"option": "Edit Workshop"}
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
