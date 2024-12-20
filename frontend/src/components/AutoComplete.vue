<template>
    <div class="relative" ref="autocomplete" @click.outside="handleClickOutside">
        <input type="text" :value="modelValue" @input="handleInput" @focus="handleFocus" :class="['w-full', inputClass]" :placeholder="placeholder">
        <ul class="mt-1 w-full max-h-60 border border-gray-300 rounded-md bg-white absolute overflow-y-auto z-[20]" v-show="searchResults.length && isOpen">
            <li v-for="result in searchResults" :key="result.code" :value="result.city_vietnamese" @click="setSelected(result)" class="px-4 py-3 border-b border-gray-200 text-stone-600 cursor-pointer hover:bg-gray-100 ">{{ result.city_vietnamese }} ({{ result.code }})</li>
        </ul>
    </div>
</template>

<script setup>
    import { ref, defineProps, defineEmits, computed, onMounted, onBeforeUnmount } from 'vue';
    const props = defineProps({
        source: {
            type: Array,
            required: true,
            default: () => [],
        },
        modelValue: String,
        inputClass: String,
        placeholder: String,
    });
    const search = ref('');
    const isOpen = ref(false);
    const searchResults = computed(() => {
        if (search.value === '') {
            return [];
        }
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

    const handleFocus = () => {
        isOpen.value = true;
        search.value = ' ';
    };

    

    const autocomplete = ref(null);

    const handleClickOutside = (event) => {
        if (autocomplete.value && !autocomplete.value.contains(event.target)) {
            isOpen.value = false;
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside);
    });
</script>