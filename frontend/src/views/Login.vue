<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
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

    const travelType = ref('oneWay');

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
        console.log(oneWay);
        console.log(roundTrip);
    }

    


    function flightInfoToggle(value) {
        if (value === 'location') {
            flightInfoLocation.value = true;
        }
        else {
            flightInfoLocation.value = false;
        }
    }

    function travelTypeClicked(value) {
        travelType.value = value;
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
    
    <div class="bg-[url('../assets/images/test.webp')] bg-cover bg-center bg-fixed ">


        <div class=" my-12 flex justify-center items-center">
            <div class="bg-slate-300 w-96 rounded-md flex flex-col shadow-lg">
                <div class="flex flex-col">
                    <div class="px-4 py-2 w-full flex flex-wrap flex-row items-center">
                        <div class="pt-4 px-10 py-2 w-full flex flex-wrap flex-col items-center gap-5">
                            <label class="text-center text-xl">Đăng nhập QAirlines</label>
                        </div>
                        <div class="px-10 py-4 w-full flex flex-wrap flex-row items-center gap-5">
                            <div class="flex flex-1 flex-col ">
                                <label class="move-label py-0.5">Email</label>
                                <input class="input py-1.5 rounded-lg px-2" type="text" placeholder="Email của bạn">
                            </div>
                        </div>
                        <div class="px-10 py-4 w-full flex flex-wrap flex-row items-center gap-5">
                            <div class="flex flex-1 flex-col ">
                                <label class="move-label py-0.5">Mật khẩu</label>
                                <input type="password" class="input py-1.5 rounded-lg px-2" placeholder="Mật khẩu của bạn">
                            </div>
                        </div>
                        <div class="px-10 w-full grid grid-cols-4 items-center">
                            <label class=" col-start-3 col-end-5 px-2 py-1.5 text-right ">Quên mật khẩu?</label>                
                        </div>
                        <div class="px-10 py-4 w-full grid grid-cols-4 items-center">
                            <button class=" col-start-1 col-end-5 px-2 py-1.5 bg-blue-300 hover:bg-blue-400 rounded-md duration-300">Đăng nhập</button>                
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>

