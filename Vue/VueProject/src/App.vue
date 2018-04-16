<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/About">About</router-link>
    </nav>
    <router-view/>
    <div>
      <button v-on:click=goBack()>Go back</button>
    </div>
  </div>
</template>

<script>
import Teacher from './components/Teacher.vue'

export default {
  name: 'app',
  components: {
    Teacher
  },
  methods: {  
    goBack() {
      window.history.back()
    }
  }
}
</script>

<style>

@import url('https://fonts.googleapis.com/css?family=Montserrat:400,700');

body {
  background-color: #EEEEEE;
  font-family: 'Montserrat', sans-serif;
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
  padding-top: 50px;
}

body, html {
  margin: 0;
  height: 100%;
}

#app {
  width: 50%;
}

nav {
  padding: 20px 20px 20px 0;
}

nav a {
  padding: 10px;
  text-decoration: none;
  background: #fff;
  border-radius: 3px;
  color: rgb(0, 110, 255);
  font-weight: bold;
  margin-right: 15px;
}

button {
  border-radius: 4px;
  width: 20%;
  margin-left: 0;
  margin-right: 0;
  background: #5b97f0;
  background-image: linear-gradient(to bottom, #5b97f0, #2980b9);
  border-radius: 10px;
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

</style>
