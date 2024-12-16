<script setup>
    import { ref } from 'vue';
    const selectedTicket = ref(null);

    const toggleTicket = (ticketType) => {
        selectedTicket.value = selectedTicket.value === ticketType ? null : ticketType;
    };
</script>

<template>
    <div class="flex flex-row flex-wrap items-center border-2 rounded-lg shadow-md bg-[#ffffff] shadow-[#eaeaea] p-4 m-4">
        <div class="flex flex-1 flex-row">
            <div class="flex flex-row items-center justify-between mx-4">
                <div class="flex flex-col mx-2">
                    <label class="text-xl font-semibold">{{ departureTime }}</label>
                    <label class="text-sm text-gray-500">{{ departureLocation }}</label>
                    <label class="text-xs text-gray-400">{{ departureDate }}</label>
                </div>
                <div class="flex items-center text-gray-500 mx-2">
                    <span class="w-16 h-[0.1rem] bg-gray-400"></span>
                    <label class="mx-2 text-sm">Bay tới</label>
                    <span class="w-16 h-[0.1rem] bg-gray-400"></span>
                </div>
                <div class="flex flex-col mx-2 items-end">
                    <label class="text-xl font-semibold">{{ arrivalTime }}</label>
                    <label class="text-sm text-gray-500">{{ arrivalLocation }}</label>
                    <label class="text-xs text-gray-400">{{ arrivalDate }}</label>
                </div>
            </div>
            <div class="border-l-[0.05em] border-gray-400"></div>
            <div class="flex flex-row items-center justify-between mx-4">
                <div class="flex flex-col">
                    <label class="text-sm text-gray-500">⏲️ Thời gian bay: {{ flightDuration }}</label>
                <label class="text-sm text-gray-500">✈️ {{ flightNumber }} Khai thác bởi QAirlines</label>
                </div>
            </div>
        </div>
        
        <div class="flex mx-4" v-if="!booking">
            <div class="flex flex-col text-center border p-4 rounded-lg bg-[#005b6a] w-[12rem]">
                <label class="text-sm text-[#ffffff]">{{ ticketType }}</label>
                <label class="text-xl font-bold text-[#ffffff]">{{ ticketPrice }}</label>
            </div>
        </div>

        <div class="flex mx-4" v-if="booking">
            <div class="flex flex-col">
                <div @click="toggleTicket('standard')" class="flex flex-col bg-[#e2eef8] hover:bg-blue-500 shadow-lg transition-colors duration-500 text-center p-4 w-[10rem] cursor-pointer">
                    <label class="">Phổ thông</label>
                    <label class="">{{ ticketPrice }}</label>
                </div>
                
            </div>
            <div class="flex flex-col">
                <div @click="toggleTicket('business')" class="flex flex-col bg-[#e3e2e9] hover:bg-slate-500 shadow-lg transition-colors duration-500 text-center p-4 w-[10rem] cursor-pointer">
                    <label class="">Thương gia</label>
                    <label class="">10.000.000 VND</label>
                </div>
            </div>
        </div>
        <div v-if="selectedTicket" class="w-full">
            <div class="relative bg-white p-4 ">
                <h2 class="text-lg font-semibold mb-2">Thông tin vé</h2>
                <p v-if="selectedTicket === 'standard'">Thông tin chi tiết về vé Tiêu chuẩn...</p>
                <p v-if="selectedTicket === 'business'">Thông tin chi tiết về vé Cao cấp...</p>
            </div>
        </div>
    </div>
</template>

<script>
    
    export default {
        name: "FlightCard",
        props: {
            booking: {
            type: Boolean,
            default: false,
            },
            departureTime: {
            type: String,
            required: true,
            },
            departureLocation: {
            type: String,
            required: true,
            },
            departureDate: {
            type: String,
            default: "",
            },
            arrivalTime: {
            type: String,
            required: true,
            },
            arrivalLocation: {
            type: String,
            required: true,
            },
            arrivalDate: {
            type: String,
            default: "",
            },
            flightDuration: {
            type: String,
            required: true,
            },
            flightNumber: {
            type: String,
            required: true,
            },
            ticketType: {
            type: String,
            required: true,
            },
            ticketPrice: {
            type: String,
            required: true,
            },
        },
    };
</script>
























<script setup>
import Header from '@/components/Header.vue';
import FlightCard from '@/components/FlightCard.vue';
import { ref, onMounted, computed } from 'vue';
import airportMapping from './airportMapping.json';

const flights = ref([]);
const airports = ref(airportMapping.airports);

const today = ref(new Date().toISOString().split('T')[0]);
const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]);
const currentStartDate = ref(new Date().toISOString().split('T')[0]);
const visibleDates = computed(() => {
    const start = new Date(currentStartDate.value);
    const dates = [];
    const queryDeparture = getAirportCode(searchDeparture.value);
    const queryArrival = getAirportCode(searchArrival.value);

    // Initialize prices object for dates
    const prices = {};

    // Calculate the lowest price for the filtered flights on each date
    flights.value.forEach(flight => {
        const isMatchingFlight =
            (!queryDeparture || flight.departureLocation === queryDeparture) &&
            (!queryArrival || flight.arrivalLocation === queryArrival);

        if (isMatchingFlight) {
            const date = flight.departureDate;
            const price = parseFloat(flight.ticketPrice.replace(/\D+/g, "")); // Convert price to a numeric value

            if (!prices[date] || price < prices[date]) {
                prices[date] = price; // Store the lowest price for the date
            }
        }
    });

    // Generate dates for the week and associate the lowest price
    for (let i = 0; i < 7; i++) {
        const fullDate = new Date(start);
        fullDate.setDate(fullDate.getDate() + i);

        const dateStr = fullDate.toISOString().split("T")[0];
        const dayName = fullDate.toLocaleString("vi-VN", { weekday: "short" });
        const displayDate = fullDate.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "short",
        });

        dates.push({
            fullDate: dateStr,
            dayName,
            displayDate,
            price: prices[dateStr] ? `${prices[dateStr].toLocaleString("vi-VN")} VND` : null,
        });
    }
    return dates;
});

// const searchDate = ref(today.value);

const numberOfSeats = ref("1");
const showFilters = ref(false);
const showModify = ref(false);

const searchDeparture = ref("Hà Nội");
const searchArrival = ref("TP Hồ Chí Minh");
const searchDate = ref(today.value);
const searchPassengers = ref("1");

const priceSortOrder = ref('ascending');
const departureTimeRange = ref('all');

const fetchFlights = async () => {
    try {
        const data = await import('./flights.json').catch(() => ({ flights: [] }));
        flights.value = data.flights;
        console.log('Flight data loaded:', data);
    } catch (error) {
        console.error('Error loading flight data:', error);
        flights.value = []; 
    }
};

const getAirportCode = (query) => {
    if (!query) return null;
    
    const result = airports.value.find(airport =>
        airport.english_name.toLowerCase().includes(query.toLowerCase()) ||
        airport.vietnamese_name.toLowerCase().includes(query.toLowerCase()) ||
        airport.city_english.toLowerCase().includes(query.toLowerCase()) ||
        airport.city_vietnamese.toLowerCase().includes(query.toLowerCase())
    );

    if (!result) {
        return null;
    }

    return result.code;
};

const departureAirports = computed(() => {
    return airports.value.filter(airport => airport.city_vietnamese !== searchArrival.value);
});

const arrivalAirports = computed(() => {
    return airports.value.filter(airport => airport.city_vietnamese !== searchDeparture.value);
});

const filteredFlights = computed(() => {
    const queryDeparture = getAirportCode(searchDeparture.value);
    const queryArrival = getAirportCode(searchArrival.value);

    let filtered = flights.value.filter(flight => {
        return (!queryDeparture || flight.departureLocation.toLowerCase().startsWith(queryDeparture.toLowerCase())) &&
               (!queryArrival || flight.arrivalLocation.toLowerCase().startsWith(queryArrival.toLowerCase())) &&
               flight.departureDate === searchDate.value;
    });

    if (departureTimeRange.value !== 'all') {
        const [startHour, endHour] = departureTimeRange.value.split('-').map(Number);
        filtered = filtered.filter(flight => {
            const departureHour = new Date(`1970-01-01T${flight.departureTime}`).getHours();
            return departureHour >= startHour && departureHour <= endHour;
        });
    }

    if (priceSortOrder.value === 'ascending') {
        filtered.sort((a, b) => parseFloat(a.ticketPrice.replace(/\D+/g, "")) - parseFloat(b.ticketPrice.replace(/\D+/g, "")));
    } else if (priceSortOrder.value === 'descending') {
        filtered.sort((a, b) => parseFloat(b.ticketPrice.replace(/\D+/g, "")) - parseFloat(a.ticketPrice.replace(/\D+/g, "")));
    }

    return filtered;
});

const previousWeek = () => {
    const newStartDate = new Date(currentStartDate.value);
    newStartDate.setDate(newStartDate.getDate() - 7);
    if (newStartDate >= new Date(today.value)) {
        currentStartDate.value = newStartDate.toISOString().split('T')[0];
    }
};

const nextWeek = () => {
    const newStartDate = new Date(currentStartDate.value);
    newStartDate.setDate(newStartDate.getDate() + 7);
    if (newStartDate <= new Date(maxDate.value)) {
        currentStartDate.value = newStartDate.toISOString().split('T')[0];
    }
};

const selectDate = (date) => {
    searchDate.value = date;
};

const formattedDateRange = (startDate, endDate = null) => {
    return computed(() => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const start = new Date(startDate).toLocaleDateString('vi-VN', options);
        if (!endDate) {
          return start;
        }
        const end = new Date(endDate).toLocaleDateString('vi-VN', options);
        return `${start} - ${end}`;
    });
};

const applyFilters = () => {
    // showModify.value = false;
};

onMounted(() => {
    fetchFlights();
});
</script>

<template>
    <Header></Header>
    <div class="sticky top-0 z-10">
        <div class="flex flex-col items-center justify-center p-4 bg-white border-b border-gray-300">
            <nav class="container flex flex-row items-center w-full">
                <div class="flex flex-row">
                    <label class="p-2 m-4 font-bold text-gray-800">{{ searchDeparture }} ↔ {{ searchArrival }}</label>
                    <label class="p-2 m-4 text-gray-600">{{ formattedDateRange(searchDate) }}</label>
                    <label class="p-2 m-4 text-gray-700">Số hành khách: {{ searchPassengers }}</label>
                    <button @click="showModify = !showModify; showFilters = false" class="p-2 m-4 text-blue-600 hover:underline">Thay đổi</button>
                    <button @click="showFilters = !showFilters; showModify = false" class="p-2 m-4 text-blue-600 hover:underline">Bộ lọc</button>
                </div>
        
                <div class="flex items-center justify-end flex-1">
                    <button class="p-2 m-4 bg-neutral-600 text-white">Thông tin đặt vé</button>
                </div>
            </nav>
        </div>
    </div>

    

    <div class="container flex flex-col p-4">
        <div v-if="showModify" class="flex flex-row items-end justify-center">
            <div class="flex flex-col flex-wrap m-4">
                <label>Từ</label>
                <select v-model="searchDeparture" class="px-4 py-2 border border-slate-400 rounded">
                    <option v-for="airport in departureAirports" :key="airport.code" :value="airport.city_vietnamese">
                        {{ airport.city_vietnamese }} ({{ airport.code }})
                    </option>
                </select>
            </div>
            <div class="flex flex-col flex-wrap m-4">
                <label>Đến</label>
                <select v-model="searchArrival" class="px-4 py-2 border border-slate-400 rounded">
                    <option v-for="airport in arrivalAirports" :key="airport.code" :value="airport.city_vietnamese">
                        {{ airport.city_vietnamese }} ({{ airport.code }})
                    </option>
                </select>
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
                <button @click="applyFilters" class="px-4 py-2 bg-blue-600 text-white rounded">Áp dụng</button>
            </div>
        </div>

        <div v-if="showFilters" class="flex flex-row items-end justify-center">
            <div class="flex flex-col flex-wrap m-4">
                <label>Sắp xếp giá</label>
                <select v-model="priceSortOrder" class="px-4 py-2 border border-slate-400 rounded">
                    <option value="ascending">Tăng dần</option>
                    <option value="descending">Giảm dần</option>
                </select>
            </div>
            <div class="flex flex-col flex-wrap m-4">
                <label>Thời gian khởi hành</label>
                <select v-model="departureTimeRange" class="px-4 py-2 border border-slate-400 rounded">
                    <option value="all">Tất cả</option>
                    <option value="0-11">0h - 11h59</option>
                    <option value="12-17">12h - 17h59</option>
                    <option value="18-23">18h - 23h59</option>
                </select>
            </div>
        </div>
    </div>
    
    <div class="flex flex-col items-center justify-center flex-wrap p-4 bg-gray-100 min-h-screen">
        <div class="flex flex-col items-center border-2 rounded-lg bg-white p-4 m-4 w-full max-w-6xl">
            <div class="flex items-center justify-center space-x-4">
                <button @click="previousWeek" class="text-gray-600 hover:text-gray-800">
                    <span class="text-2xl">&lt;</span>
                </button>

                <div class="flex space-x-6 overflow-x-auto w-full">
                    <div
                        v-for="(date, index) in visibleDates"
                        :key="index"
                        class="flex flex-col items-center justify-center cursor-pointer w-28 h-24 flex-shrink-0"
                        :class="{
                            'text-blue-600 font-semibold': searchDate === date.fullDate,
                            'text-gray-600 hover:text-gray-800': searchDate !== date.fullDate
                        }"
                        @click="selectDate(date.fullDate)"
                    >
                        <div>{{ date.dayName }}</div>
                        <div>{{ date.displayDate }}</div>
                        <div v-if="date.price" class="text-sm text-gray-500"> {{ date.price }} </div>
                        <div v-else class="text-sm text-gray-500">No flight</div>
                    </div>
                </div>

                <button @click="nextWeek" class="text-gray-600 hover:text-gray-800">
                    <span class="text-2xl">&gt;</span>
                </button>
            </div>
        </div>
        <div class="flex flex-col items-center border-2 rounded-lg shadow-md bg-white shadow-gray-300 p-4 m-4 w-full max-w-6xl">
            <div v-if="filteredFlights.length > 0" v-for="(flight, index) in filteredFlights" :key="flight.flightNumber + '-' + index" class="w-full mb-4">
                <FlightCard 
                :booking="true"
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
            
            <div v-else>
                <p>Không tìm thấy chuyến bay nào</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .cursor-pointer {
        cursor: pointer;
    }
</style>