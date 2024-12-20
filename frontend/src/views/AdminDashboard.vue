<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Header from '@/components/Header.vue';
import { Chart, registerables } from 'chart.js';
import AutoComplete from '@/components/AutoComplete.vue';
Chart.register(...registerables);

import airportMapping from './airportMapping.json';

const airports = ref(airportMapping.airports);

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
        return 'null';
    }

    return result.code;
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
    const departureCode = getAirportCode(searchDeparture.value);
    const arrivalCode = getAirportCode(searchArrival.value);
    return flights.value.filter(flight => 
        (!searchQuery.value || flight.flightNumber.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
        (!departureCode || flight.departureLocation.toLowerCase().includes(departureCode.toLowerCase())) &&
        (!arrivalCode || flight.arrivalLocation.toLowerCase().includes(arrivalCode.toLowerCase()))
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

const editingFlight = ref(null);

const saveFlight = () => {
    const index = flights.value.findIndex(flight => flight.flightNumber === editingFlight.value.flightNumber);
    if (index !== -1) {
        flights.value[index] = { ...editingFlight.value };
    }
    editingFlight.value = null;
};

const editFlight = (flight) => {
    editingFlight.value = { ...flight };
};

const cancelEdit = () => {
    editingFlight.value = null;
};

const currentView = ref('viewFlights');

const isEditing = computed(() => editingFlight.value !== null);

const bookings = ref([]); // Add a ref to store bookings data

const fetchBookings = async () => {
    try {
        const data = await import('./bookings.json').catch(() => ({ bookings: [] }));
        bookings.value = data.bookings;
    } catch (error) {
        console.error('Error loading bookings data:', error);
        bookings.value = [];
    }
};

const getBookingCount = (flightNumber, bookingsList) => {
    return bookingsList.filter(booking => booking.flightNumber === flightNumber).length;
};

const getTotalRevenue = (flightNumber, bookingsList) => {
    return bookingsList
        .filter(booking => booking.flightNumber === flightNumber)
        .reduce((total, booking) => total + booking.ticketPrice, 0);
};

const today = ref(new Date().toISOString().split('T')[0]);


const chartFlightNumber = ref('');
const chartStartDate = ref(today.value);
const chartEndDate = ref(today.value);

const filteredBookings = computed(() => {
    console.log(bookings.value.filter(booking => 
        (!chartFlightNumber.value || booking.flightNumber.toLowerCase().includes(chartFlightNumber.value.toLowerCase())) &&
        (!chartStartDate.value || new Date(booking.bookingDate) >= new Date(chartStartDate.value)) &&
        (!chartEndDate.value || new Date(booking.bookingDate) <= new Date(chartEndDate.value))
    ));
    return bookings.value.filter(booking => 
        (!chartFlightNumber.value || booking.flightNumber.toLowerCase().includes(chartFlightNumber.value.toLowerCase())) &&
        (!chartStartDate.value || new Date(booking.bookingDate) >= new Date(chartStartDate.value)) &&
        (!chartEndDate.value || new Date(booking.bookingDate) <= new Date(chartEndDate.value))
    );
});

let chartInstance = null;

const drawChart = () => {
    const canvas = document.getElementById('bookingsChart');
    if (!canvas) return; // Ensure the canvas element exists
    const ctx = canvas.getContext('2d');

    if (chartInstance) {
        chartInstance.destroy(); // Destroy the existing chart instance
    }

    const flightNumbers = [...new Set(filteredBookings.value.map(booking => booking.flightNumber))];
    const bookingCounts = flightNumbers.map(flightNumber => getBookingCount(flightNumber, filteredBookings.value));
    const totalRevenues = flightNumbers.map(flightNumber => getTotalRevenue(flightNumber, filteredBookings.value));
    console.log(flightNumbers, bookingCounts, totalRevenues);
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: flightNumbers,
            datasets: [
                {
                    label: 'Số hành khách',
                    data: bookingCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    barThickness: 20,
                    barPercentage: 0.5,
                    categoryPercentage: 0.5
                },
                {
                    label: 'Doanh thu (VND)',
                    data: totalRevenues,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Số hành khách'
                    },
                    grace: '5%'
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Doanh thu (VND)'
                    },
                    grace: '5%'
                }
            }
        }
    });
};

const applyChartFilters = () => {
    drawChart();
};

const discounts = ref([]);
const news = ref([]);

const newDiscount = ref({
    code: '',
    description: '',
    percentage: 0,
    expiryDate: '',
    departureLocation: '', // Add departure location
    arrivalLocation: '' // Add arrival location
});

const newNews = ref({
    title: '',
    content: '',
    date: ''
});

const fetchDiscounts = async () => {
    try {
        const data = await import('./discounts.json').catch(() => ({ discounts: [] }));
        discounts.value = data.discounts;
    } catch (error) {
        console.error('Error loading discounts data:', error);
        discounts.value = [];
    }
};

const fetchNews = async () => {
    try {
        const data = await import('./news.json').catch(() => ({ news: [] }));
        news.value = data.news;
    } catch (error) {
        console.error('Error loading news data:', error);
        news.value = [];
    }
};

const addDiscount = () => {
    discounts.value.push({ ...newDiscount.value });
    resetNewDiscount();
};

const addNews = () => {
    news.value.push({ ...newNews.value });
    resetNewNews();
};

const resetNewDiscount = () => {
    newDiscount.value = {
        code: '',
        description: '',
        percentage: 0,
        expiryDate: '',
        departureLocation: '', // Reset departure location
        arrivalLocation: '' // Reset arrival location
    };
};

const resetNewNews = () => {
    newNews.value = {
        title: '',
        content: '',
        date: ''
    };
};

onMounted(() => {
    fetchFlights();
    fetchBookings();
    fetchDiscounts();
    fetchNews();
});

watch([flights, bookings, currentView], () => {
    if (flights.value.length && bookings.value.length && currentView.value === 'viewBookings') {
        setTimeout(drawChart, 0);
    }
});
</script>

<template>
    <Header></Header>

    <div class="container mx-auto p-4">
        <div class="flex justify-center space-x-4 mb-8">
            <button @click="currentView = 'viewFlights'" :class="{'bg-blue-500 text-white': currentView === 'viewFlights', 'bg-gray-200': currentView !== 'viewFlights'}" class="px-4 py-2 rounded">Xem chuyến bay</button>
            <button @click="currentView = 'addFlight'" :class="{'bg-blue-500 text-white': currentView === 'addFlight', 'bg-gray-200': currentView !== 'addFlight'}" class="px-4 py-2 rounded">Thêm chuyến bay</button>
            <button @click="currentView = 'viewBookings'" :class="{'bg-blue-500 text-white': currentView === 'viewBookings', 'bg-gray-200': currentView !== 'viewBookings'}" class="px-4 py-2 rounded">Xem đặt vé</button>
            <button @click="currentView = 'addDiscount'" :class="{'bg-blue-500 text-white': currentView === 'addDiscount', 'bg-gray-200': currentView !== 'addDiscount'}" class="px-4 py-2 rounded">Thêm giảm giá</button>
            <button @click="currentView = 'addNews'" :class="{'bg-blue-500 text-white': currentView === 'addNews', 'bg-gray-200': currentView !== 'addNews'}" class="px-4 py-2 rounded">Thêm tin tức</button>
        </div>

        <div v-if="currentView === 'viewFlights'" class="bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold mb-4">Xem chuyến bay</h2>
            <div class="flex flex-wrap gap-4 mb-4">
                <input v-model="searchQuery" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Tìm kiếm theo mã chuyến bay">
                <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="searchDeparture" :placeholder="'Điểm khởi hành'"></AutoComplete>
                <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="searchArrival" :placeholder="'Điểm đến'"></AutoComplete>
            </div>
            <div v-if="filteredFlights.length > 0">
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead class="bg-gray-200">
                        <tr>
                            <th class="py-2 px-4">Mã chuyến bay</th>
                            <th class="py-2 px-4">Địa điểm khởi hành</th>
                            <th class="py-2 px-4">Ngày khởi hành</th>
                            <th class="py-2 px-4">Giờ khởi hành</th>
                            <th class="py-2 px-4">Địa điểm đến</th>
                            <th class="py-2 px-4">Ngày đến</th>
                            <th class="py-2 px-4">Giờ đến</th>
                            <th class="py-2 px-4">Thời gian bay</th>
                            <th class="py-2 px-4">Loại vé</th>
                            <th class="py-2 px-4">Giá vé</th>
                            <th class="py-2 px-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(flight, index) in filteredFlights" :key="index" class="hover:bg-gray-100">
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
                                <button @click="editFlight(flight)" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Sửa</button>
                                <button @click="removeFlight(flight.flightNumber)" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Xóa</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>
                <p class="text-center text-gray-500">Không có chuyến bay nào</p>
            </div>
        </div>

        <div v-if="currentView === 'addFlight'" class="bg-white p-6 rounded-lg shadow-lg mt-8">
            <h2 class="text-2xl font-bold mb-4">Thêm chuyến bay</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col">
                    <label>Mã chuyến bay</label>
                    <input v-model="newFlight.flightNumber" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Mã chuyến bay">
                </div>
                <div class="flex flex-col">
                    <label>Thời gian bay</label>
                    <input v-model="newFlight.flightDuration" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Thời gian bay">
                </div>
                <div class="flex flex-col">
                    <label>Địa điểm khởi hành</label>
                    <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="newFlight.departureLocation" :placeholder="'Địa điểm khởi hành'"></AutoComplete>
                </div>
                <div class="flex flex-col">
                    <label>Ngày khởi hành</label>
                    <input v-model="newFlight.departureDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                </div>
                
                <div class="flex flex-col">
                    <label>Địa điểm đến</label>
                    <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="newFlight.arrivalLocation" :placeholder="'Địa điểm đến'"></AutoComplete>
                </div>
                <div class="flex flex-col">
                    <label>Ngày đến</label>
                    <input v-model="newFlight.arrivalDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                </div>
                <div class="flex flex-col">
                    <label>Giờ khởi hành</label>
                    <input v-model="newFlight.departureTime" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Giờ khởi hành">
                </div>
                <div class="flex flex-col">
                    <label>Giờ đến</label>
                    <input v-model="newFlight.arrivalTime" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Giờ đến">
                </div>                
                <div class="flex flex-col">
                    <label>Loại vé</label>
                    <input v-model="newFlight.ticketType" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Loại vé">
                </div>
                <div class="flex flex-col">
                    <label>Giá vé</label>
                    <input v-model="newFlight.ticketPrice" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Giá vé">
                </div>
            </div>
            <div class="flex justify-end mt-4">
                <button @click="addFlight" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Thêm chuyến bay</button>
            </div>
        </div>

        <div v-if="currentView === 'viewBookings'" class="bg-white p-6 rounded-lg shadow-lg mt-8">
            <h2 class="text-2xl font-bold mb-4">Thống kê đặt vé</h2>
            <div class="flex flex-wrap gap-4 mb-4">
                <div class="flex flex-col">
                    <label for="chartFlightNumber" class="mb-2">Mã chuyến bay</label>
                    <input id="chartFlightNumber" v-model="chartFlightNumber" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Tìm kiếm theo mã chuyến bay">
                </div>
                <div class="flex flex-col">
                    <label for="chartStartDate" class="mb-2">Ngày bắt đầu</label>
                    <input id="chartStartDate" v-model="chartStartDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                </div>
                <div class="flex flex-col">
                    <label for="chartEndDate" class="mb-2">Ngày kết thúc</label>
                    <input id="chartEndDate" v-model="chartEndDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                </div>
                <button @click="applyChartFilters" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mt-auto">Áp dụng</button>
            </div>
            <canvas id="bookingsChart" width="400" height="200"></canvas>
        </div>

        <div v-if="currentView === 'addDiscount'" class="bg-white p-6 rounded-lg shadow-lg mt-8">
            <h2 class="text-2xl font-bold mb-4">Thêm giảm giá</h2>
            <div class="grid grid-cols-1 gap-4">
                <div class="flex flex-col">
                    <label>Mã giảm giá</label>
                    <input v-model="newDiscount.code" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Mã giảm giá">
                </div>
                <div class="flex flex-col">
                    <label>Mô tả</label>
                    <input v-model="newDiscount.description" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Mô tả">
                </div>
                <div class="flex flex-col">
                    <label>Phần trăm giảm</label>
                    <input v-model="newDiscount.percentage" type="number" class="px-4 py-2 border border-gray-300 rounded" placeholder="Phần trăm giảm">
                </div>
                <div class="flex flex-col">
                    <label>Ngày hết hạn</label>
                    <input v-model="newDiscount.expiryDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                </div>
                <div class="flex flex-col">
                    <label>Địa điểm khởi hành</label>
                    <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="newDiscount.departureLocation" :placeholder="'Địa điểm khởi hành'"></AutoComplete>
                </div>
                <div class="flex flex-col">
                    <label>Địa điểm đến</label>
                    <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="newDiscount.arrivalLocation" :placeholder="'Địa điểm đến'"></AutoComplete>
                </div>
            </div>
            <div class="flex justify-end mt-4">
                <button @click="addDiscount" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Thêm giảm giá</button>
            </div>
        </div>

        <div v-if="currentView === 'addNews'" class="bg-white p-6 rounded-lg shadow-lg mt-8">
            <h2 class="text-2xl font-bold mb-4">Thêm tin tức</h2>
            <div class="grid grid-cols-1 gap-4">
                <div class="flex flex-col">
                    <label>Tiêu đề</label>
                    <input v-model="newNews.title" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Tiêu đề">
                </div>
                <div class="flex flex-col">
                    <label>Nội dung</label>
                    <textarea v-model="newNews.content" class="px-4 py-2 border border-gray-300 rounded" placeholder="Nội dung"></textarea>
                </div>
                <div class="flex flex-col">
                    <label>Ngày</label>
                    <input v-model="newNews.date" type="date" class="px-4 py-2 border border-gray-300 rounded">
                </div>
            </div>
            <div class="flex justify-end mt-4">
                <button @click="addNews" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Thêm tin tức</button>
            </div>
        </div>

        <transition name="slide">
            <div v-if="isEditing" class="fixed px-2 inset-y-0 top-24 right-0 flex items-center justify-center bg-white w-1/3 p-6 editor-container border border-gray-300 shadow-lg" style="height: calc(100vh - 4rem); overflow-y: auto;">
                <div class="w-full pt-2 pb-8 px-2 flex flex-col h-full overflow-y-auto">
                    <h2 class="text-2xl font-bold mb-4">Chỉnh sửa thông tin chuyến bay</h2>
                    <div class="grid grid-cols-1 gap-4 mb-4">
                        <div class="flex flex-col">
                            <label class="mb-2">Mã chuyến bay</label>
                            <input v-model="editingFlight.flightNumber" type="text" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Địa điểm khởi hành</label>
                            <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="editingFlight.departureLocation" :placeholder="'Địa điểm khởi hành'"></AutoComplete>
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Ngày khởi hành</label>
                            <input v-model="editingFlight.departureDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Giờ khởi hành</label>
                            <input v-model="editingFlight.departureTime" type="text" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Địa điểm đến</label>
                            <AutoComplete inputClass="px-4 py-2 border border-gray-300 rounded" :source="airports" v-model="editingFlight.arrivalLocation" :placeholder="'Địa điểm đến'"></AutoComplete>
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Ngày đến</label>
                            <input v-model="editingFlight.arrivalDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Giờ đến</label>
                            <input v-model="editingFlight.arrivalTime" type="text" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Thời gian bay</label>
                            <input v-model="editingFlight.flightDuration" type="text" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Loại vé</label>
                            <input v-model="editingFlight.ticketType" type="text" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                        <div class="flex flex-col">
                            <label class="mb-2">Giá vé</label>
                            <input v-model="editingFlight.ticketPrice" type="text" class="px-4 py-2 border border-gray-300 rounded">
                        </div>
                    </div>
                    <div class="flex justify-end mt-auto space-x-2">
                        <button @click="saveFlight" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Lưu</button>
                        <button @click="cancelEdit" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">Hủy</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>

    
</template>

<style>
/* Add styles for the sliding effect */
.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

</style>
