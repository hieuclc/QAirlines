<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    const toggledMenu = ref({
        book: false,
        myTrips: false,
        travelInfo: false,
        deals: false,
        help: false,
    });

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

    onMounted(() => {
        document.addEventListener('click', handleOutsideClick);

    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleOutsideClick); 
    });

</script>



<template>
    <header class="sticky top-0 z-10 bg-black shadow-lg">
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
                    <button>Login</button>
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
    
</template>

