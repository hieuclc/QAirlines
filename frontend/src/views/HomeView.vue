<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { useRouter } from 'vue-router';
    import AutoComplete from '@/components/AutoComplete.vue';
    import airportMapping from './airportMapping.json';

    const airports = ref(airportMapping.airports);


    const toggledMenu = ref({
        book: false,
        myTrips: false,
        travelInfo: false,
        deals: false,
        help: false,
    });

    const toggledSearch = ref({
        book: true,
        flightInfo: false,
        checkIn: false,
        myFlights: false,
    });

    const flightInfoLocation = ref(true);

    const tripType = ref('one-way');

    const router = useRouter();

    const searchDeparture = ref('');
    const searchArrival = ref('');
    const searchDate = ref('');
    const searchReturnDate = ref('');
    const searchPassengers = ref('1');
    const searchPersonalId = ref('');
    const searchFullName = ref('');

    const searchFlights = () => {
        const query = {
            departure: searchDeparture.value,
            arrival: searchArrival.value,
            date: searchDate.value,
            returnDate: tripType.value === 'round-trip' ? searchReturnDate.value : '',
            passengers: searchPassengers.value,
            tripType: tripType.value
        };
        router.push({ name: 'booking', query });
    };

    const searchMyFlights = () => {
        const query = {
            personalId: searchPersonalId.value,
            fullName: searchFullName.value,
            view: 'myFlights'
        };
        router.push({ name: 'dashboard', query });
    };

    function searchClicked(item) {
        for (const key in toggledSearch.value) {
            if (key !== item) {
                toggledSearch.value[key] = false;
            }
            else {
                toggledSearch.value[key] = true;
                
            }
        }
    }

    function toggleMenu(menu) {
        for (const key in toggledMenu.value) {
            if (key !== menu) {
                toggledMenu.value[key] = false;
            }
            else {
                toggledMenu.value[key] = !toggledMenu.value[key];
                
            }
        }
    }
    
    function handleOutsideClick(event) {
        if (!event.target.closest('.menu-item')) {
            for (const key in toggledMenu.value) {  
                toggledMenu.value[key] = false;
            }
        }
    }

    function flightInfoToggle(value) {
        if (value === 'id') {
            flightInfoLocation.value = true;
        }
        else {
            flightInfoLocation.value = false;
        }
    }

    function tripTypeClicked(value) {
        tripType.value = value;
    }

    onMounted(() => {
        document.addEventListener('click', handleOutsideClick);

    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleOutsideClick); 
    });

</script>



<template>
    <header class="sticky top-0 bg-black shadow-lg z-10">
      <nav class="container relative">
            <ul class="flex flex-col sm:flex-row items-center gap-4 text-white py-6">
                <li class="flex"><router-link :to="{ name:'home' }"><img src="../assets/images/united.svg"></router-link></li>

                <li class="flex relative menu-item">
                    <button @click="toggleMenu('book')">Book</button>
                    
                </li>

                <li class="flex relative menu-item">
                    <button @click="toggleMenu('myTrips')">My trips</button>
                    
                </li>

                <li class="flex relative menu-item">
                    <button @click="toggleMenu('travelInfo')">Travel info</button>
                    
                </li>

                <li class="flex relative menu-item">
                    <button @click="toggleMenu('deals')">Deals</button>
                    
                </li>

                <li class="flex relative">
                    <button>Help</button>
                </li>

                <li class="flex flex-1 justify-end">
                    <button>Search</button>
                </li>
                <li class="flex">
                    <router-link :to="{ name:'login' }"><button>Login</button></router-link>
                </li>
                <li class="flex">
                    <button>Sign up</button>
                </li>
            </ul>
        </nav>
        <div class="container p-0 absolute left-0 right-0 z-10 w-6/12 menu-item bg-[#181c1f] shadow-lg">
            <ul class=" mt-0 text-white p-4 min-h-[200px] shadow-md rounded-md z-10 transition-opacity duration-200" :class="{'hidden': !toggledMenu.book, 'block': toggledMenu.book}">
                <li class="py-1">Special offers</li>
                <li class="py-1">Monthly offers</li>
                <li class="py-1">Flights from Hanoi to Ho Chi Minh City</li>
                <li class="py-1">Flights from Ho Chi Minh City to Hanoi</li>
                <li class="py-1">Flights from Ho Chi Minh City to Da Nang</li>
            </ul>
            <ul class="mt-0 text-white p-4 min-h-[200px] shadow-md rounded-md z-10 transition-opacity duration-200" :class="{'hidden': !toggledMenu.myTrips, 'block': toggledMenu.myTrips}">
                <li class="py-1">My trips</li>
                <li class="py-1">View travel credits</li>
            </ul>
            <ul class="mt-0 text-white p-4 min-h-[200px] shadow-md rounded-md z-10 transition-opacity duration-200" :class="{'hidden': !toggledMenu.travelInfo, 'block': toggledMenu.travelInfo}">
                <li class="py-1">Destination info</li>
                <li class="py-1">Luggage info</li>
            </ul>
            <ul class="mt-0 text-white p-4 min-h-[200px] shadow-md rounded-md z-10 transition-opacity duration-200" :class="{'hidden': !toggledMenu.deals, 'block': toggledMenu.deals}">
                <li class="py-1">Current offers</li>
                <li class="py-1">College student discounts</li>
            </ul>
        </div>
    </header>
    
    <div class="bg-[url('../assets/images/test.webp')] bg-cover bg-center bg-fixed grid grid-cols-12 min-h-144">
           
        <div class=" col-start-3 col-end-7 mt-12 mb-auto bg-slate-300 rounded-md flex flex-col">
            <div class="grid grid-cols-2 gap-0">
                <button @click="searchClicked('book')" class="py-4 hover:bg-slate-100 rounded-md duration-300">Đặt vé</button>
                <button @click="searchClicked('flightInfo')" class="py-4 hover:bg-slate-100 rounded-md duration-300">Theo dõi chuyến bay</button>
                <!-- <button @click="searchClicked('checkIn')" class="py-4 hover:bg-slate-100 rounded-md duration-300">Check in</button> -->
            </div>
            <div class="searchContents flex flex-col">
                <div class="bookContents flex flex-col " v-if="toggledSearch.book">
                    <div class="px-10 py-2 w-full flex flex-row items-center gap-20">
                        <div class="grid grid-cols-2 gap-2 ml-2">
                            <button @click="tripTypeClicked('one-way')" :class="['px-2 py-1 rounded-md hover:duration-300 focus:duration-500 transition-colors', tripType === 'one-way' ? 'bg-blue-500' : 'hover:bg-slate-200 text-gray-800']">Một chiều</button>
                            <button @click="tripTypeClicked('round-trip')" :class="['px-2 py-1 rounded-md hover:duration-300 focus:duration-500 transition-colors', tripType === 'round-trip' ? 'bg-blue-500' : 'hover:bg-slate-200 text-gray-800']">Khứ hồi</button>
                        </div>
                    </div>
                    <div class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                        <div class="location flex flex-1 flex-col">
                            <label class="move-label py-0.5">Từ</label>
                            <AutoComplete v-model="searchDeparture" :source="airports" inputClass="py-1.5 rounded-lg px-2" placeholder="Điểm khởi hành"></AutoComplete>
                            <!-- <input v-model="searchDeparture" class="input py-1.5 rounded-lg px-2" type="text" placeholder="Điểm khởi hành"> -->
                        </div>
                        <div class="location flex flex-1 flex-col">
                            <label class="move-label py-0.5">Đến</label>
                            <AutoComplete v-model="searchArrival" :source="airports" inputClass="py-1.5 rounded-lg px-2" placeholder="Điểm đến"></AutoComplete>
                            <!-- <input v-model="searchArrival" class="input py-1.5 rounded-lg px-2" type="text" placeholder="Điểm đến"> -->
                        </div>
                    </div>
                    <div class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                        <div class="flex flex-1 flex-col">
                            <label class="move-label py-0.5">Ngày đi</label>
                            <input v-model="searchDate" class="date py-1.5 rounded-lg px-2" type="date">
                        </div>
                        <div class="flex flex-1 flex-col" v-if="tripType === 'round-trip'">
                            <label class="move-label py-0.5">Ngày đến</label>
                            <input v-model="searchReturnDate" class="date py-1.5 rounded-lg px-2" type="date">
                        </div>
                    </div>
                    <div class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                        <div class="flex flex-1 flex-col">
                            <label class="move-label py-0.5">Hạng vé</label>
                            <select class="rounded-md py-1 px-1 w-[60%] items-center">
                                <option value="Economy">Phổ thông</option>
                                <option value="Business">Thương gia</option>
                            </select>
                        </div>
                        <div class="flex flex-1 flex-col">
                            <label class="move-label py-0.5">Số hành khách</label>
                            <input v-model="searchPassengers" class="input py-1.5 rounded-lg px-2" type="text" placeholder="0 hành khách">
                        </div>
                    </div>
                    <div class="px-10 py-2 w-full grid grid-cols-4 items-center">
                        <button @click="searchFlights" class="col-start-4 col-end-5 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-md duration-300">Tìm kiếm</button>                
                    </div>
                </div>
                <div class="flightInfoContents" v-if="toggledSearch.flightInfo">
                    <div class="px-10 py-2 w-full flex flex-row items-center gap-20">
                        <div class="w-[60%] grid grid-cols-2 gap-2 ml-2">
                            
                            <button class="px-1 py-1 hover:bg-slate-200 focus:bg-blue-500 focus:text-white focus:duration-500 rounded-md hover:duration-300" @click="flightInfoToggle('id')">Theo thông tin cá nhân</button>
                            <button class="px-1 py-1 hover:bg-slate-200 focus:bg-blue-500 focus:text-white focus:duration-500 rounded-md hover:duration-300" @click="flightInfoToggle('index')">Theo mã chuyến bay</button>
                        </div>
                    </div>
                    <div>
                        <div v-if="flightInfoLocation" class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                            <div class="flex flex-1 flex-col">
                                <label class="move-label py-0.5">Số CCCD/Hộ chiếu</label>
                                <input v-model="searchPersonalId" class="input py-1.5 rounded-lg px-2" type="text" placeholder="Số CCCD/Hộ chiếu">
                            </div>
                            <div class="flex flex-1 flex-col">
                                <label class="move-label py-0.5">Họ và Tên</label>
                                <input v-model="searchFullName" class="input py-1.5 rounded-lg px-2" type="text" placeholder="Họ và tên">
                            </div>
                        </div>
                        <div v-else class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                            <div class="flex flex-1 flex-col">
                                <label class="move-label py-0.5">Nhập mã chuyến bay</label>
                                <input class="input py-1.5 rounded-lg px-2" type="text" placeholder="Mã chuyến bay">
                            </div>
                            <div class="flex flex-1 flex-col">
                                <label class="move-label py-0.5">Ngày khởi hành </label>
                                <input class="date py-1.5 rounded-lg px-2" type="date">
                            </div>
                        </div>
                        <div class="px-10 py-2 w-full grid grid-cols-4 items-center">
                            <button @click="searchMyFlights" class=" col-start-4 col-end-5 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-md duration-300">Tìm kiếm</button>                
                        </div>
                    </div>
                </div>
            </div>

            <!-- <div class="checkInContents flex flex-col" v-if="toggledSearch.checkIn">
                

                <div class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                    <div class="flex flex-1 flex-col">
                        <label class="move-label py-0.5">Họ</label>
                        <input class="input py-1.5 rounded-lg px-2" type="text" placeholder="Họ">
                    </div>
                </div>
                <div class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                    <div class="flex flex-1 flex-col">
                        <label class="move-label py-0.5">Tên đệm và tên</label>
                        <input class="input py-1.5 rounded-lg px-2" type="text" placeholder="Tên đệm và tên">
                    </div>
                </div>

                
                <div class="px-10 py-2 w-full flex flex-wrap flex-row items-center gap-5">
                    <div class="flex flex-1 flex-col ">
                        <label class="move-label py-0.5">Mã đặt chỗ</label>
                        <input class="input py-1.5 rounded-lg px-2" type="text" placeholder="Mã đặt chỗ">
                    </div>
                </div>
                
                <div class="px-10 py-2 w-full grid grid-cols-4 items-center">
                    <button class=" col-start-4 col-end-5 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-md duration-300">Tìm kiếm</button>                
                </div>
            </div> -->
        </div>
    </div>

    <footer class="bg-gray-800 text-white py-4 mb-0">
    <div class="container mx-auto text-center">
      <p>&copy; 2024 Your Project Name. All rights reserved.</p>
      <p>
        <a href="/privacy" class="text-gray-400 hover:text-white">Privacy Policy</a> |
        <a href="/terms" class="text-gray-400 hover:text-white">Terms of Service</a>
      </p>
    </div>
  </footer>
    
</template>

