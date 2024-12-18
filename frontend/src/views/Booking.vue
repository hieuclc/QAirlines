<script setup>
import Header from '@/components/Header.vue';
import FlightCard from '@/components/FlightCard.vue';
import AutoComplete from '@/components/AutoComplete.vue';
import { ref, onMounted, computed, watch } from 'vue';
import airportMapping from './airportMapping.json';
import { useRouter, useRoute } from 'vue-router';


const router = useRouter();
const route = useRoute();

const flights = ref([]);
const airports = ref(airportMapping.airports);

const today = ref(new Date().toISOString().split('T')[0]);
const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]);
const currentStartDate = ref(new Date().toISOString().split('T')[0]);

const searchDeparture = ref(route.query.departure || 'Hà Nội');
const searchArrival = ref(route.query.arrival || 'TP Hồ Chí Minh');
const searchDate = ref(route.query.date || today.value);
const searchReturnDate = ref(route.query.returnDate || '');
const searchPassengers = ref(route.query.passengers || '1');
const tripType = ref(route.query.travelType || 'one-way');

const firstDay = (currentDate, firstDayOfWeek) => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
    date.setDate(date.getDate() - diff);
    return date;
};

const visibleDates = (date) => computed(() => {
    currentStartDate.value = firstDay(searchDate.value, new Date(currentStartDate.value).getDay()).toISOString().split('T')[0];
    const start = new Date(currentStartDate.value);
    const dates = [];
    const queryDeparture = getAirportCode(searchDeparture.value);
    const queryArrival = getAirportCode(searchArrival.value);
    const queryReturnDate = searchReturnDate.value ? new Date(searchReturnDate.value).toISOString().split('T')[0] : null;

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

const numberOfSeats = ref("1");
const showFilters = ref(false);
const showModify = ref(false);

const priceSortOrder = ref('ascending');
const departureTimeRange = ref('all');

const selectedFlights = ref({
    departure: null,
    return: null
});

const showBookingInfo = ref(false);
const showFlights = ref(true);
const showSeatPicking = ref(false);
const showCustomerForm = ref(false);
const showConfirmation = ref(false);

const toggleBookingInfo = () => {
    showBookingInfo.value = !showBookingInfo.value;
};

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
    query = query.trim();
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

const previousWeek = (date) => {
    const newStartDate = new Date(currentStartDate.value);
    newStartDate.setDate(newStartDate.getDate() - 7);
    if (newStartDate >= new Date(today.value)) {
        currentStartDate.value = newStartDate.toISOString().split('T')[0];
        searchDate.value = currentStartDate.value;

    }
};

const nextWeek = (date) => {
    const newStartDate = new Date(currentStartDate.value);
    newStartDate.setDate(newStartDate.getDate() + 7);
    if (newStartDate <= new Date(maxDate.value)) {
        currentStartDate.value = newStartDate.toISOString().split('T')[0];
        searchDate.value = currentStartDate.value;
    }
    console.log(currentStartDate);
};

const selectDate = (date) => {
    searchDate.value = date;
    // const selectedDate = new Date(date);
    // const startDate = new Date(currentStartDate.value);
    // const endDate = new Date(startDate);
    // endDate.setDate(startDate.getDate() + 6);

    // if (selectedDate < startDate || selectedDate > endDate) {
    //     currentStartDate.value = new Date(selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay())).toISOString().split('T')[0];
    // }
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

const handleTicketSelected = ({ flightId, ticketType }) => {
    const selectedFlight = flights.value.find(flight => flight.flightNumber === flightId);
    if (tripType.value === 'one-way') {
        selectedFlights.value.departure = selectedFlight;
        showFlights.value = false;
        showSeatPicking.value = true;
    } else if (tripType.value === 'round-trip') {
        if (!selectedFlights.value.departure) {
            selectedFlights.value.departure = selectedFlight;
            alert('Hãy chọn vé chiều về');
            // Automatically switch to the return date selection
            searchDate.value = searchReturnDate.value;
        } else {
            selectedFlights.value.return = selectedFlight;
            showFlights.value = false;
            showSeatPicking.value = true;
        }
    }
};

const canProceedToCustomerInfo = computed(() => {
    return selectedSeats.value.length > 0;
});

const proceedToCustomerInfo = () => {
    if (!canProceedToCustomerInfo.value) {
        alert('Hãy chọn ghế ngồi trước!');
        return;
    }
    console.log('Proceeding to customer info with selected flights:', selectedFlights.value);
    showSeatPicking.value = false;
    showCustomerForm.value = true;
    showFlights.value = false;
};

const canSubmitBooking = computed(() => {
    if (tripType.value === 'round-trip') {
        return selectedFlights.value.departure && selectedFlights.value.return;
    }
    return selectedFlights.value.departure;
});

const selectedSeats = computed(() => {
    return rows.value.flat().filter(seat => seat.selected);
});

const submitBooking = () => {
    if (!canSubmitBooking.value) {
        if (tripType.value === 'round-trip') {
            alert('Hãy chọn hai vé chiều đi - chiều về');
        } else {
            alert('Hãy chọn vé chiều đi.');
        }
        return;
    }
    console.log('Customer Info:', customerInfo.value);
    console.log('Selected Flights:', selectedFlights.value);
    console.log('Selected Seats:', selectedSeats.value);
    showCustomerForm.value = false;
    showConfirmation.value = true;
};

const goBackToFlightPicking = () => {
    showCustomerForm.value = false;
    showSeatPicking.value = false;
    showFlights.value = true;
    showConfirmation.value = false;
    selectedFlights.value.departure = null;
    selectedFlights.value.return = null;
    rows.value.forEach(row => row.forEach(seat => seat.selected = false));
    if (tripType.value === 'round-trip') {
        searchDate.value = route.query.date || today.value;
    }
};

const goBackToSeatPicking = () => {
    showCustomerForm.value = false;
    showSeatPicking.value = true;
    showFlights.value = false;
};

const deleteFlight = (type) => {
    if (type === 'departure') {
        selectedFlights.value.departure = null;
    } else if (type === 'return') {
        selectedFlights.value.return = null;
    }
};

const currentSelection = computed(() => {
    if (tripType.value === 'round-trip') {
        return selectedFlights.value.departure ? 'return' : 'departure';
    }
    return 'departure';
});

const customerInfo = ref({
    name: '',
    email: '',
    id: '',
    phone: ''
});

const createSeatLayout = (rows, cols) => {
    return Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) => ({
            label: `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`, // Seat labels like A1, B1
            selected: false
        }))
    );
};

const rows = ref(createSeatLayout(4, 12));

const toggleSeat = (rowIndex, seatIndex) => {
    rows.value[rowIndex][seatIndex].selected = !rows.value[rowIndex][seatIndex].selected;
};

onMounted(() => {
    fetchFlights();
});

// Watch for changes in route query parameters and update the filters accordingly
watch(route, (newRoute) => {
    searchDeparture.value = newRoute.query.departure || 'Hà Nội';
    searchArrival.value = newRoute.query.arrival || 'TP Hồ Chí Minh';
    searchDate.value = newRoute.query.date || today.value;
    searchReturnDate.value = newRoute.query.returnDate || '';
    searchPassengers.value = newRoute.query.passengers || '1';
    tripType.value = newRoute.query.travelType || 'one-way';
});

watch(tripType, (newType) => {
    selectedFlights.value.departure = null;
    selectedFlights.value.return = null;
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
                    <button @click="toggleBookingInfo" class="p-2 m-4 bg-neutral-600 text-white">Thông tin đặt vé</button>
                </div>
            </nav>
        </div>
    </div>

    <div class="container flex flex-col p-4">
        <div v-if="showModify" class="flex flex-row items-end justify-center">
            <div class="flex flex-col flex-wrap m-4">
                <label>Từ</label>
                <AutoComplete inputClass="px-4 py-2 border border-slate-400 rounded" :source="airports" v-model="searchDeparture"></AutoComplete>
            </div>
            <div class="flex flex-col flex-wrap m-4">
                <label>Đến</label>
                <AutoComplete inputClass="px-4 py-2 border border-slate-400 rounded" :source="airports" v-model="searchArrival"></AutoComplete>
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

        <div v-if="showFlights" class="flex flex-row items-center justify-center">
            <label class="m-4">Loại chuyến bay:</label>
            <select v-model="tripType" class="px-4 py-2 border border-slate-400 rounded">
                <option value="one-way">Một chiều</option>
                <option value="round-trip">Khứ hồi</option>
            </select>
        </div>
    </div>
    
    <div v-if="showFlights" class="flex flex-col items-center justify-center flex-wrap p-4 bg-gray-100 min-h-screen">
        <div class="flex flex-col items-center border-2 rounded-lg bg-white p-4 m-4 w-full max-w-6xl">
            <div class="flex items-center justify-center space-x-4">
                <button @click="previousWeek(searchDate)" class="text-gray-600 hover:text-gray-800">
                    <span class="text-2xl">&lt;</span>
                </button>

                <div class="flex space-x-6 overflow-x-auto w-full">
                    <div
                        v-for="(date, index) in visibleDates(searchDate).value"
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

                <button @click="nextWeek(searchDate)" class="text-gray-600 hover:text-gray-800">
                    <span class="text-2xl">&gt;</span>
                </button>
            </div>
        </div>
        <div class="flex flex-col items-center border-2 rounded-lg shadow-md bg-white shadow-gray-300 p-4 m-4 w-full max-w-6xl">
            <div v-if="tripType === 'round-trip'" class="text-lg font-bold mb-4">
                Chọn vé {{ currentSelection === 'departure' ? 'chiều đi' : 'chiều về' }}
            </div>
            <div v-if="filteredFlights.length > 0" v-for="(flight, index) in filteredFlights" :key="flight.flightNumber + '-' + index" class="w-full mb-4">
                <FlightCard 
                    :flightId="flight.flightNumber"
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
                    :ticketPrice="flight.ticketPrice"
                    @ticketSelected="handleTicketSelected"
                />
            </div>
            
            <div v-else>
                <p>Không tìm thấy chuyến bay nào</p>
            </div>
        </div>
    </div>

    <div v-if="showSeatPicking" class="container flex flex-col p-4">
        <h2 class="text-2xl font-bold mb-4">Seat Picking</h2>
        <div class="flex justify-center items-center min-h-screen">
            <div class="relative w-[48rem] h-80 bg-gray-300 rounded-l-full overflow-hidden">
                <div class="absolute top-1/2 left-8 transform -translate-y-1/2 w-32 h-3/4 bg-gray-400 rounded-l-full"></div>
                <div class="absolute top-0 left-48 w-[40rem] h-full flex flex-col justify-center px-4">
                    <div v-for="(row, rowIndex) in rows"
                        :key="rowIndex"
                        class="flex items-center justify-between mb-4"
                    >
                        <div class="flex space-x-2">
                            <div
                                v-for="(seat, seatIndex) in row"
                                :key="seatIndex"
                                class="w-8 h-8 p-1 m-1 flex items-center justify-center rounded-lg font-bold cursor-pointer shadow-md"
                                :class="{
                                    'bg-green-500 text-white': seat.selected,
                                    'bg-red-500 text-white': seat.pickedByOthers,
                                    'bg-blue-500 text-white': !seat.selected && !seat.pickedByOthers
                                }"
                                @click="toggleSeat(rowIndex, seatIndex)"
                            >
                                {{ seat.label }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-start ml-8">
                <div class="flex items-center space-x-4 m-2">
                    <div class="w-8 h-8 bg-blue-500 rounded-lg"></div>
                    <span>Ghế chưa được chọn</span>
                </div>
                <div class="flex items-center space-x-4 m-2">
                    <div class="w-8 h-8 bg-red-500 rounded-lg"></div>
                    <span>Ghế đã được đặt trước</span>
                </div>
                <div class="flex items-center space-x-4 m-2">
                    <div class="w-8 h-8 bg-green-500 rounded-lg"></div>
                    <span>Ghế bạn đang chọn</span>
                </div>
            </div>
        </div>
        <div class="flex justify-between mt-4">
            <button @click="goBackToFlightPicking" class="px-4 py-2 bg-gray-600 text-white rounded">Quay lại đặt vé</button>
            <button @click="proceedToCustomerInfo" class="px-4 py-2 bg-blue-600 text-white rounded">Thông tin khách hàng</button>
        </div>
    </div>

    <div v-if="showCustomerForm" class="container flex flex-col p-4">
        <h2 class="text-2xl font-bold mb-4">Thông tin khách hàng</h2>
        <div class="flex flex-col mb-4">
            <label class="mb-2">Tên</label>
            <input v-model="customerInfo.name" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Tên của bạn">
        </div>
        <div class="flex flex-col mb-4">
            <label class="mb-2">Số căn cước công dân/Hộ chiếu</label>
            <input v-model="customerInfo.id" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Số CCCD/Hộ chiếu">
        </div>
        <div class="flex flex-col mb-4">
            <label class="mb-2">Email</label>
            <input v-model="customerInfo.email" type="email" class="px-4 py-2 border border-slate-400 rounded" placeholder="Email của bạn">
        </div>
        <div class="flex flex-col mb-4">
            <label class="mb-2">Số điện thoại</label>
            <input v-model="customerInfo.phone" type="text" class="px-4 py-2 border border-slate-400 rounded" placeholder="Số điện thoại">
        </div>
        <div class="flex flex-col mb-4">
            <h3 class="text-xl font-bold mb-2">Thông tin chuyến bay</h3>
            <div v-if="selectedFlights.departure" class="flex justify-between items-center mb-2">
                <span>Chiều đi: {{ selectedFlights.departure.departureLocation }} tới {{ selectedFlights.departure.arrivalLocation }} vào {{ selectedFlights.departure.departureDate }}</span>
                <button @click="deleteFlight('departure')" class="text-red-600 hover:underline">Xóa</button>
            </div>
            <div v-if="selectedFlights.return" class="flex justify-between items-center mb-2">
                <span>Chiều về: {{ selectedFlights.return.departureLocation }} tới {{ selectedFlights.return.arrivalLocation }} vào {{ selectedFlights.return.departureDate }}</span>
                <button @click="deleteFlight('return')" class="text-red-600 hover:underline">Xóa</button>
            </div>
            <div v-if="selectedSeats.length > 0" class="flex justify-between items-center mb-2">
                <span>Các ghế đã chọn: {{ selectedSeats.map(seat => seat.label).join(', ') }}</span>
            </div>
        </div>
        <div class="flex justify-between">
            <button @click="goBackToSeatPicking" class="px-4 py-2 bg-gray-600 text-white rounded">Quay lại chọn ghế</button>
            <button @click="submitBooking" class="px-4 py-2 bg-blue-600 text-white rounded">Đặt vé</button>
        </div>
    </div>

    <div v-if="showConfirmation" class="container flex flex-col p-4">
        <h2 class="text-2xl font-bold mb-4">Xác nhận đặt vé</h2>
        <div class="flex flex-col mb-4">
            <h3 class="text-xl font-bold mb-2">Thông tin khách hàng</h3>
            <p><strong>Tên:</strong> {{ customerInfo.name }}</p>
            <p><strong>Số căn cước công dân/Hộ chiếu:</strong> {{ customerInfo.id }}</p>
            <p><strong>Email:</strong> {{ customerInfo.email }}</p>
            <p><strong>Số điện thoại:</strong> {{ customerInfo.phone }}</p>
        </div>
        <div class="flex flex-col mb-4">
            <h3 class="text-xl font-bold mb-2">Thông tin chuyến bay</h3>
            <div v-if="selectedFlights.departure" class="flex justify-between items-center mb-2">
                <span>Chiều đi: {{ selectedFlights.departure.departureLocation }} tới {{ selectedFlights.departure.arrivalLocation }} vào {{ selectedFlights.departure.departureDate }}</span>
            </div>
            <div v-if="selectedFlights.return" class="flex justify-between items-center mb-2">
                <span>Chiều về: {{ selectedFlights.return.departureLocation }} tới {{ selectedFlights.return.arrivalLocation }} vào {{ selectedFlights.return.departureDate }}</span>
            </div>
            <div v-if="selectedSeats.length > 0" class="flex justify-between items-center mb-2">
                <span>Các ghế đã chọn: {{ selectedSeats.map(seat => seat.label).join(', ') }}</span>
            </div>
        </div>
        <div class="flex justify-end">
            <button @click="goBackToFlightPicking" class="px-4 py-2 bg-gray-600 text-white rounded">Quay lại</button>
        </div>
    </div>

    <div v-if="showBookingInfo" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-4 rounded-lg max-w-lg w-full">
            <h2 class="text-2xl font-bold mb-4">Các chuyến bay đã chọn</h2>
            <div v-if="selectedFlights.departure" class="flex justify-between items-center mb-2">
                <span>Chiều đi: {{ selectedFlights.departure.departureLocation }} tới {{ selectedFlights.departure.arrivalLocation }} vào {{ selectedFlights.departure.departureDate }}</span>
                <button @click="deleteFlight('departure')" class="text-red-600 hover:underline">Xóa</button>
            </div>
            <div v-if="selectedFlights.return" class="flex justify-between items-center mb-2">
                <span>Chiều về: {{ selectedFlights.return.departureLocation }} tới {{ selectedFlights.return.arrivalLocation }} vào {{ selectedFlights.return.departureDate }}</span>
                <button @click="deleteFlight('return')" class="text-red-600 hover:underline">Xóa</button>
            </div>
            <div v-if="selectedSeats.length > 0" class="flex justify-between items-center mb-2">
                <span>Các ghế đã chọn: {{ selectedSeats.map(seat => seat.label).join(', ') }}</span>
            </div>
            <div v-if="!selectedFlights.departure && !selectedFlights.return && selectedSeats.length === 0">
                <p>Chưa chọn ghế nào.</p>
            </div>
            <div class="flex justify-end mt-4">
                <button @click="toggleBookingInfo" class="px-4 py-2 bg-gray-600 text-white rounded">Đóng</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .cursor-pointer {
        cursor: pointer;
    }
    .fixed {
        position: fixed;
    }
    .inset-0 {
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }
    .bg-opacity-50 {
        --tw-bg-opacity: 0.5;
    }
</style>