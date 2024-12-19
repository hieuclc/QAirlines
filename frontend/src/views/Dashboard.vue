<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import FlightCard from '@/components/FlightCard.vue';
import Header from '@/components/Header.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const dashboardMenu = ref({
    flightSearch: true,
    myFlights: false,
    flightHistory: false,
    accountSettings: false,
});

const menuClicked = async (item) => {
    for (const key in dashboardMenu.value) {
        dashboardMenu.value[key] = key === item;
    }
    resetSearchValues();
    await fetchFlights(item);
    router.push({ query: { menu: item } });
};

const today = ref(new Date().toISOString().split('T')[0]);
const maxDate = ref(new Date(new Date().setDate(new Date().getDate() + 365)).toISOString().split('T')[0]);
const searchDate = ref("");

const flights = ref([]);
const searchDeparture = ref('');
const searchArrival = ref('');
const searchPassengers = ref('');

const resetSearchValues = () => {
    searchDeparture.value = '';
    searchArrival.value = '';
    searchDate.value = '';
    searchPassengers.value = '';
};

const filteredFlights = computed(() => {
    const queryDeparture = searchDeparture.value.trim().toLowerCase();
    const queryArrival = searchArrival.value.trim().toLowerCase();
    const queryDate = searchDate.value.trim().toLowerCase();

    if (!queryDeparture && !queryArrival && !queryDate) {
        return flights.value.slice(0, 5);
    }

    return flights.value.filter((flight) => {
        const matchDeparture = !queryDeparture || flight.departureLocation.toLowerCase().startsWith(queryDeparture);
        const matchArrival = !queryArrival || flight.arrivalLocation.toLowerCase().startsWith(queryArrival);
        const matchDate = !queryDate || flight.departureDate.toLowerCase().includes(queryDate);
        return matchDeparture && matchArrival && matchDate;
    }).slice(0, 5);
});

const fetchFlights = async (menu) => {
    try {
        let data;
        switch (menu) {
            case 'flightSearch':
                data = await import('./flights.json').catch(() => ({ flights: [] }));
                break;
            case 'myFlights':
                data = await import('./myFlights.json').catch(() => ({ flights: [] }));
                break;
            case 'flightHistory':
                data = await import('./flightHistory.json').catch(() => ({ flights: [] }));
                break;
            default:
                data = { flights: [] };
                break;
        }
        flights.value = data.flights;
    } catch (error) {
        console.error('Error loading flight data:', error);
        flights.value = []; // Provide fallback data or handle the error appropriately
    }
};

const cancelFlight = (flightNumber) => {
    flights.value = flights.value.filter(flight => flight.flightNumber !== flightNumber);
    // Optionally, add logic to update the backend or notify the user
};

onMounted(() => {
    const menu = route.query.menu || 'flightSearch';
    menuClicked(menu);
});

watch(route, (newRoute) => {
    const menu = newRoute.query.menu || 'flightSearch';
    menuClicked(menu);
});
</script>

<template>
    <Header></Header>

    <div class="sticky top-0 z-10 bg-white border-b border-gray-300">
        <div class="container flex flex-row items-center justify-between p-4">
            <div class="flex flex-row space-x-4">
                <button @click="menuClicked('flightSearch')" :class="{'bg-blue-500 text-white': dashboardMenu.flightSearch, 'bg-gray-200': !dashboardMenu.flightSearch}" class="px-4 py-2 rounded">Tìm kiếm chuyến bay</button>
                <button @click="menuClicked('myFlights')" :class="{'bg-blue-500 text-white': dashboardMenu.myFlights, 'bg-gray-200': !dashboardMenu.myFlights}" class="px-4 py-2 rounded">Chuyến bay của tôi</button>
                <button @click="menuClicked('flightHistory')" :class="{'bg-blue-500 text-white': dashboardMenu.flightHistory, 'bg-gray-200': !dashboardMenu.flightHistory}" class="px-4 py-2 rounded">Lịch sử chuyến bay</button>
                <button @click="menuClicked('accountSettings')" :class="{'bg-blue-500 text-white': dashboardMenu.accountSettings, 'bg-gray-200': !dashboardMenu.accountSettings}" class="px-4 py-2 rounded">Cài đặt tài khoản</button>
            </div>
        </div>
    </div>

    <div class="container flex flex-col items-center p-4">
        <div v-if="dashboardMenu.flightSearch" class="flex flex-col flex-wrap">
            <div>
                <label class="text-lg">Tìm kiếm chuyến bay</label>
            </div>
            <div class="inline-flex flex-wrap my-4 items-end">
                <div class="flex flex-col flex-wrap m-4">
                    <label>Từ</label>
                    <input v-model="searchDeparture" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Điểm khởi hành">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Đến</label>
                    <input v-model="searchArrival" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Điểm đến">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Ngày khởi hành</label>
                    <input v-model="searchDate" type="date" class="px-4 py-2 border border-slate-400 rounded" :min="today" :max="maxDate" placeholder="">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Số hành khách</label>
                    <input v-model="searchPassengers" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="0 hành khách">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Tìm kiếm</button>
                </div>
            </div>
            
            <div v-if="filteredFlights.length > 0">
                <div class="flex flex-col" v-for="(flight, index) in filteredFlights" :key="index">
                    <FlightCard :flightId="flight.flightNumber"
                                :departureTime="flight.departureTime"
                                :departureLocation="flight.departureLocation"
                                :departureDate="flight.departureDate"
                                :arrivalTime="flight.arrivalTime"
                                :arrivalLocation="flight.arrivalLocation"
                                :arrivalDate="flight.arrivalDate"
                                :flightDuration="flight.flightDuration"
                                :flightNumber="flight.flightNumber"
                                :ticketType="flight.ticketType"
                                :ticketPrice="flight.ticketPrice"></FlightCard>
                </div>
            </div>
            <div v-else>
                <p>Không tìm thấy chuyến bay nào</p>
            </div>
        </div>

        <div v-if="dashboardMenu.myFlights" class="flex flex-col flex-wrap">
            <div>
                <label class="text-lg">Chuyến bay của tôi</label>
            </div>
            <div class="inline-flex flex-wrap my-4 items-end">
                <div class="flex flex-col flex-wrap m-4">
                    <label>Từ</label>
                    <input v-model="searchDeparture" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Điểm khởi hành">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Đến</label>
                    <input v-model="searchArrival" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Điểm đến">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Ngày khởi hành</label>
                    <input v-model="searchDate" type="date" class="px-4 py-2 border border-slate-400 rounded" :min="today" :max="maxDate" placeholder="">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Số hành khách</label>
                    <input v-model="searchPassengers" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="0 hành khách">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Tìm kiếm</button>
                </div>
            </div>
            <div v-if="filteredFlights.length > 0">
                <div class="flex flex-row items-center" v-for="(flight, index) in filteredFlights" :key="index">
                    <FlightCard :flightId="flight.flightNumber"
                                :departureTime="flight.departureTime"
                                :departureLocation="flight.departureLocation"
                                :departureDate="flight.departureDate"
                                :arrivalTime="flight.arrivalTime"
                                :arrivalLocation="flight.arrivalLocation"
                                :arrivalDate="flight.arrivalDate"
                                :flightDuration="flight.flightDuration"
                                :flightNumber="flight.flightNumber"
                                :ticketType="flight.ticketType"
                                :ticketPrice="flight.ticketPrice"
                                class="flex-1"></FlightCard>
                    <button @click="cancelFlight(flight.flightNumber)" class="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700">Hủy</button>
                </div>
            </div>
            <div v-else>
                <p>Không tìm thấy chuyến bay nào</p>
            </div>
        </div>

        <div v-if="dashboardMenu.flightHistory" class="flex flex-col flex-wrap">
            <div>
                <label class="text-lg">Lịch sử chuyến bay</label>
            </div>
            <div class="inline-flex flex-wrap my-4 items-end">
                <div class="flex flex-col flex-wrap m-4">
                    <label>Từ</label>
                    <input v-model="searchDeparture" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Điểm khởi hành">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Đến</label>
                    <input v-model="searchArrival" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Điểm đến">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Ngày khởi hành</label>
                    <input v-model="searchDate" type="date" class="px-4 py-2 border border-slate-400 rounded" :min="today" :max="maxDate" placeholder="">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <label>Số hành khách</label>
                    <input v-model="searchPassengers" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="0 hành khách">
                </div>
                <div class="flex flex-col flex-wrap m-4">
                    <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Tìm kiếm</button>
                </div>
            </div>
            <div v-if="filteredFlights.length > 0">
                <div class="flex flex-col" v-for="(flight, index) in filteredFlights" :key="index">
                    <FlightCard :flightId="flight.flightNumber"
                                :departureTime="flight.departureTime"
                                :departureLocation="flight.departureLocation"
                                :departureDate="flight.departureDate"
                                :arrivalTime="flight.arrivalTime"
                                :arrivalLocation="flight.arrivalLocation"
                                :arrivalDate="flight.arrivalDate"
                                :flightDuration="flight.flightDuration"
                                :flightNumber="flight.flightNumber"
                                :ticketType="flight.ticketType"
                                :ticketPrice="flight.ticketPrice"></FlightCard>
                </div>
            </div>
            <div v-else>
                <p>Không tìm thấy chuyến bay nào</p>
            </div>
        </div>
    </div>
</template>