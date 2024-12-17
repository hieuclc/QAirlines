<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/Header.vue';

const adminMenu = ref({
    viewFlights: true,
    addFlight: false,
    removeFlight: false,
});

const menuClicked = (item) => {
    for (const key in adminMenu.value) {
        adminMenu.value[key] = key === item;
    }
};

const flights = ref([]);
const newFlight = ref({
    departureTime: '',
    departureLocation: '',
    departureDate: '',
    arrivalTime: '',
    arrivalLocation: '',
    arrivalDate: '',
    flightDuration: '',
    flightNumber: '',
    ticketType: '',
    ticketPrice: ''
});

const searchQuery = ref('');
const searchDeparture = ref('');
const searchArrival = ref('');

const filteredFlights = computed(() => {
    return flights.value.filter(flight => 
        (!searchQuery.value || flight.flightNumber.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
        (!searchDeparture.value || flight.departureLocation.toLowerCase().includes(searchDeparture.value.toLowerCase())) &&
        (!searchArrival.value || flight.arrivalLocation.toLowerCase().includes(searchArrival.value.toLowerCase()))
    );
});

const fetchFlights = async () => {
    try {
        const data = await import('./flightHistory.json').catch(() => ({ flights: [] }));
        flights.value = data.flights;
    } catch (error) {
        console.error('Error loading flight data:', error);
        flights.value = [];
    }
};

const addFlight = () => {
    flights.value.push({ ...newFlight.value });
    resetNewFlight();
};

const removeFlight = (flightNumber) => {
    flights.value = flights.value.filter(flight => flight.flightNumber !== flightNumber);
};

const resetNewFlight = () => {
    newFlight.value = {
        departureTime: '',
        departureLocation: '',
        departureDate: '',
        arrivalTime: '',
        arrivalLocation: '',
        arrivalDate: '',
        flightDuration: '',
        flightNumber: '',
        ticketType: '',
        ticketPrice: ''
    };
};

onMounted(() => {
    fetchFlights();
});
</script>

<template>
    <Header></Header>

    <div class="grid grid-cols-12 col-start-2 col-end-12">
        
        <div class="col-start-3 col-end-12">
            <div class="mt-12 flex flex-col flex-wrap w-full">
                <div v-if="adminMenu.viewFlights" class="flex flex-col flex-wrap">
                    <div>
                        <label class="text-lg">View Flights</label>
                    </div>
                    <div class="my-4 flex flex-wrap gap-4">
                        <input v-model="searchQuery" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Search by flight number">
                        <input v-model="searchDeparture" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Search by departure location">
                        <input v-model="searchArrival" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Search by arrival location">
                    </div>
                    <div v-if="filteredFlights.length > 0">
                        <table class="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th class="py-2">Flight Number</th>
                                    <th class="py-2">Departure Location</th>
                                    <th class="py-2">Departure Date</th>
                                    <th class="py-2">Departure Time</th>
                                    <th class="py-2">Arrival Location</th>
                                    <th class="py-2">Arrival Date</th>
                                    <th class="py-2">Arrival Time</th>
                                    <th class="py-2">Flight Duration</th>
                                    <th class="py-2">Ticket Type</th>
                                    <th class="py-2">Ticket Price</th>
                                    <th class="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(flight, index) in filteredFlights" :key="index">
                                    <td class="border px-4 py-2">{{ flight.flightNumber }}</td>
                                    <td class="border px-4 py-2">{{ flight.departureLocation }}</td>
                                    <td class="border px-4 py-2">{{ flight.departureDate }}</td>
                                    <td class="border px-4 py-2">{{ flight.departureTime }}</td>
                                    <td class="border px-4 py-2">{{ flight.arrivalLocation }}</td>
                                    <td class="border px-4 py-2">{{ flight.arrivalDate }}</td>
                                    <td class="border px-4 py-2">{{ flight.arrivalTime }}</td>
                                    <td class="border px-4 py-2">{{ flight.flightDuration }}</td>
                                    <td class="border px-4 py-2">{{ flight.ticketType }}</td>
                                    <td class="border px-4 py-2">{{ flight.ticketPrice }}</td>
                                    <td class="border px-4 py-2">
                                        <button @click="removeFlight(flight.flightNumber)" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Remove</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else>
                        <p>No flights available</p>
                    </div>
                </div>

                <div v-if="adminMenu.addFlight" class="flex flex-col flex-wrap">
                    <div>
                        <label class="text-lg">Add Flight</label>
                    </div>
                    <div class="inline-flex flex-wrap my-4">
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Departure Time</label>
                            <input v-model="newFlight.departureTime" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Departure Time">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Departure Location</label>
                            <input v-model="newFlight.departureLocation" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Departure Location">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Departure Date</label>
                            <input v-model="newFlight.departureDate" type="date" class="px-4 py-2 border border-slate-400 rounded">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Arrival Time</label>
                            <input v-model="newFlight.arrivalTime" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Arrival Time">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Arrival Location</label>
                            <input v-model="newFlight.arrivalLocation" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Arrival Location">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Arrival Date</label>
                            <input v-model="newFlight.arrivalDate" type="date" class="px-4 py-2 border border-slate-400 rounded">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Flight Duration</label>
                            <input v-model="newFlight.flightDuration" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Flight Duration">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Flight Number</label>
                            <input v-model="newFlight.flightNumber" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Flight Number">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Ticket Type</label>
                            <input v-model="newFlight.ticketType" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Ticket Type">
                        </div>
                        <div class="flex flex-col flex-wrap m-4">
                            <label>Ticket Price</label>
                            <input v-model="newFlight.ticketPrice" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Ticket Price">
                        </div>
                    </div>
                    <div class="flex flex-col items-end">
                        <button @click="addFlight" class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Add Flight</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
