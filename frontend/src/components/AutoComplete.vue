<template>
    <div class="w-full relative">
        <input type="text" :value="modelValue" @input="handleInput" :class="['px-2 py-2 w-full border border-gray-300 rounded-md', inputClass]">
        <ul class="mt-1 w-full max-h-60 border border-gray-300 rounded-md bg-white absolute overflow-y-auto" v-show="searchResults.length && isOpen">
            <li v-for="result in searchResults" :key="result.code" :value="result.city_vietnamese" @click="setSelected(result)" class="px-4 py-3 border-b border-gray-200 text-stone-600 cursor-pointer hover:bg-gray-100 transition-colors">{{ result.city_vietnamese }} ({{ result.code }})</li>
        </ul>
    </div>
</template>

<script setup>
    import { ref, defineProps, defineEmits, computed } from 'vue';
    const props = defineProps({
        source: {
            type: Array,
            required: true,
            default: () => [],
        },
        modelValue: String,
        inputClass: String,
    });
    const search = ref('');
    const searchResults = computed(() => {
        if (search.value === '') {
            return [];
        }
        // console.log(props.source.filter(
        //     (airport) => airport.city_vietnamese.toLowerCase().includes(search.value.trim().toLowerCase())
        // ).length);
        return props.source.filter(
            (airport) => airport.city_vietnamese.toLowerCase().includes(search.value.trim().toLowerCase())
        )
    });

    const setSelected = (item) => {
        isOpen.value = false;
        search.value = item.city_vietnamese;
        emit('update:modelValue', search.value);
    };

    const emit = defineEmits(['update:modelValue']);

    const handleInput = (e) => {
        isOpen.value = true;
        search.value = e.target.value;
        emit('update:modelValue', search.value);
        console.log(search.value);
    };

    const isOpen = ref(false);

    
</script>

