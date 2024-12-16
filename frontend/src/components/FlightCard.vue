<script setup>
    import { ref, defineEmits, defineProps } from 'vue';
    const props = defineProps({
        flightId: {
            type: String,
            required: true,
        },
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
    });
    const selectedTicket = ref(null);
    const emit = defineEmits(['ticketSelected']);

    const toggleTicket = (ticketType) => {
        selectedTicket.value = selectedTicket.value === ticketType ? null : ticketType;
    };

    const signUpForTicket = () => {
        emit('ticketSelected', { flightId: props.flightId, ticketType: selectedTicket.value });
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
                <p v-if="selectedTicket === 'business'">Thông tin chi tiết về vé Thương gia...</p>
                <button @click="signUpForTicket" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Chọn và Đăng ký</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "FlightCard",
        props: {
            flightId: {
                type: String,
                required: true,
            },
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

