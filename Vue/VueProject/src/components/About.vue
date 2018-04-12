<template>
  <div class="about">
    <h1>{{ this.name }}</h1> 
    <p>this is an about page</p>  
  </div>
</template>

<script>
export default {
  name: 'Teacher',
  data () {
    return {
      name: 'Teacher Page',
    }
  }
}

</script>
