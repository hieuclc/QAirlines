<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import FlightCard from '@/components/FlightCard.vue';
import Header from '@/components/Header.vue';

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
};

const today = ref(new Date().toISOString().split('T')[0]);
const maxDate = ref(new Date(new Date().setDate(new Date().getDate() + 365)).toISOString().split('T')[0]);
const searchDate = ref("");

const flights = ref([]);
const searchDeparture = ref('');
const searchArrival = ref('');
const searchPassengers = ref('');
const searchPersonalId = ref('');
const searchFullName = ref('');

const resetSearchValues = () => {
    searchDeparture.value = '';
    searchArrival.value = '';
    searchDate.value = '';
    searchPassengers.value = '';
    searchPersonalId.value = '';
    searchFullName.value = '';
};

const filteredFlights = computed(() => {
    const queryDeparture = searchDeparture.value.trim().toLowerCase();
    const queryArrival = searchArrival.value.trim().toLowerCase();
    const queryDate = searchDate.value.trim().toLowerCase();
    const queryPersonalId = searchPersonalId.value.trim().toLowerCase();
    const queryFullName = searchFullName.value.trim().toLowerCase();

    if (!queryDeparture && !queryArrival && !queryDate && !queryPersonalId && !queryFullName) {
        return flights.value.slice(0, 5);
    }

    return flights.value.filter((flight) => {
        const matchDeparture = !queryDeparture || flight.departureLocation.toLowerCase().startsWith(queryDeparture);
        const matchArrival = !queryArrival || flight.arrivalLocation.toLowerCase().startsWith(queryArrival);
        const matchDate = !queryDate || flight.departureDate.toLowerCase().includes(queryDate);
        const matchPersonalId = !queryPersonalId || flight.personalId.toLowerCase().includes(queryPersonalId);
        const matchFullName = !queryFullName || flight.fullName.toLowerCase().includes(queryFullName);
        return matchDeparture && matchArrival && matchDate && matchPersonalId && matchFullName;
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

const route = useRoute();

onMounted(() => {
    fetchFlights('flightSearch');
    if (route.query.personalId) {
        searchPersonalId.value = route.query.personalId;
    }
    if (route.query.fullName) {
        searchFullName.value = route.query.fullName;
    }
    if (route.query.view === 'myFlights') {
        dashboardMenu.value.myFlights = true;
        dashboardMenu.value.flightSearch = false;
    }
});
</script>

<template>
    <Header></Header>

    <div class="grid grid-cols-12 col-start-2 col-end-12">
        <div class="col-start-2 col-end-4 flex flex-col flex-wrap">
            <div class="mt-12 flex flex-col flex-wrap justify-center items-center bg-gray-300">
                <div role="button" class="w-full px-10 py-2 border-b border-slate-400 text-center">
                    Bảng điều khiển
                </div>
                <div role="button" @click="menuClicked('flightSearch')" class="w-full px-10 py-2 border-b border-slate-400 text-center">
                    Tìm kiếm chuyến bay
                </div>
                <div role="button" @click="menuClicked('myFlights')" class="w-full px-10 py-2 border-b border-slate-400 text-center">
                    Chuyến bay của tôi
                </div>
                <div role="button" @click="menuClicked('flightHistory')" class="w-full px-10 py-2 border-b border-slate-400 text-center">
                    Lịch sử chuyến bay
                </div>
                <div role="button" @click="menuClicked('accountSettings')" class="w-full px-10 py-2 border-slate-400 text-center">
                    Cài đặt tài khoản
                </div>
            </div>
        </div>
        <div class="col-start-5 col-end-12">
            <div class="mt-12 flex flex-col flex-wrap w-full">
                <div v-if="dashboardMenu.flightSearch" class="flex flex-col flex-wrap">
                    <div>
                        <label class="text-lg">Tìm kiếm chuyến bay</label>
                    </div>
                    <div class="inline-flex flex-wrap my-4">
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
                    </div>
                    <div class="flex flex-col items-end">
                        <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Tìm kiếm</button>
                    </div>
                    <div v-if="filteredFlights.length > 0">
                        <div class="flex flex-col" v-for="(flight, index) in filteredFlights" :key="index">
                            <FlightCard :departureTime="flight.departureTime"
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
                    <div class="inline-flex flex-wrap my-4 w-full items-end">
                        <div class="flex flex-col flex-wrap m-4 flex-1">
                            <label>Số Căn cước công dân/Hộ chiếu</label>
                            <input v-model="searchPersonalId" type="text" class="px-4 py-2 border border-slate-400 rounded w-full" placeholder="CCCD/Hộ chiếu">
                        </div>
                        <div class="flex flex-col flex-wrap m-4 flex-1">
                            <label>Họ và tên</label>
                            <input v-model="searchFullName" type="text" class="px-4 py-2 border border-slate-400 rounded w-full" placeholder="Họ và tên">
                        </div>
                        <div class="flex flex-col flex-wrap m-4 ml-auto">
                            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Tìm kiếm</button>
                        </div>
                    </div>
                    <div v-if="filteredFlights.length > 0">
                        <div class="flex flex-col" v-for="(flight, index) in filteredFlights" :key="index">
                            <FlightCard :departureTime="flight.departureTime"
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

                <div v-if="dashboardMenu.flightHistory" class="flex flex-col flex-wrap">
                    <div>
                        <label class="text-lg">Lịch sử chuyến bay</label>
                    </div>
                    <div class="inline-flex flex-wrap my-4">
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
                    </div>
                    <div class="flex flex-col items-end">
                        <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Tìm kiếm</button>
                    </div>
                    <div v-if="filteredFlights.length > 0">
                        <div class="flex flex-col" v-for="(flight, index) in filteredFlights" :key="index">
                            <FlightCard :departureTime="flight.departureTime"
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
        </div>
    </div>
</template>