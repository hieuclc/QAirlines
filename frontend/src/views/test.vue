<script setup>
import { ref } from 'vue';
import AutoComplete from '@/components/AutoComplete.vue';
import airportMapping from './airportMapping.json';

const airports = ref(airportMapping.airports);
console.log(airports.value);
const airpot = ref('');
</script>

<template>
  <div>
    <h1>Selected {{ airpot }}</h1>
    <AutoComplete :source="airports" v-model="airpot"></AutoComplete>
  </div>
</template>