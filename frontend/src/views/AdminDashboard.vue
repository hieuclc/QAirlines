<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/Header.vue';

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

onMounted(() => {
    fetchFlights();
});
</script>

<template>
    <Header></Header>

    <div class="container mx-auto p-4">
        <div class="flex justify-center space-x-4 mb-8">
            <button @click="currentView = 'viewFlights'" :class="{'bg-blue-500 text-white': currentView === 'viewFlights', 'bg-gray-200': currentView !== 'viewFlights'}" class="px-4 py-2 rounded">Xem chuyến bay</button>
            <button @click="currentView = 'addFlight'" :class="{'bg-blue-500 text-white': currentView === 'addFlight', 'bg-gray-200': currentView !== 'addFlight'}" class="px-4 py-2 rounded">Thêm chuyến bay</button>
        </div>

        <div v-if="currentView === 'viewFlights'" class="bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold mb-4">Xem chuyến bay</h2>
            <div class="flex flex-wrap gap-4 mb-4">
                <input v-model="searchQuery" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Tìm kiếm theo mã chuyến bay">
                <input v-model="searchDeparture" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Tìm kiếm theo địa điểm khởi hành">
                <input v-model="searchArrival" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Tìm kiếm theo địa điểm đến">
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
                    <input v-model="newFlight.departureLocation" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Địa điểm khởi hành">
                </div>
                <div class="flex flex-col">
                    <label>Ngày khởi hành</label>
                    <input v-model="newFlight.departureDate" type="date" class="px-4 py-2 border border-gray-300 rounded">
                </div>
                
                <div class="flex flex-col">
                    <label>Địa điểm đến</label>
                    <input v-model="newFlight.arrivalLocation" type="text" class="px-4 py-2 border border-gray-300 rounded" placeholder="Địa điểm đến">
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
                            <input v-model="editingFlight.departureLocation" type="text" class="px-4 py-2 border border-gray-300 rounded">
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
                            <input v-model="editingFlight.arrivalLocation" type="text" class="px-4 py-2 border border-gray-300 rounded">
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
