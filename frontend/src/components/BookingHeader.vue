<template>
    <div class="flex flex-col items-center justify-center p-4 bg-white border-b border-gray-300">
      <nav class="container flex flex-row items-center w-full">
        <div class="flex flex-row">
          <label class="p-2 m-4 font-bold text-gray-800">{{ departureLocation }} ↔ {{ arrivalLocation }}</label>
          <label class="p-2 m-4 text-gray-600">{{ formattedDateRange }}</label>
          <label class="p-2 m-4 text-gray-700">Số hành khách: {{ numberOfSeats }}</label>
          <button @click="toggleModify" class="p-2 m-4 text-blue-600 hover:underline">Thay đổi</button>
        </div>
  
        <div class="flex items-center justify-end flex-1">
          <button class="p-2 m-4 bg-neutral-600 text-white">Thông tin đặt vé</button>
        </div>
      </nav>
  
      <div v-if="showModify" class="w-full mt-4 p-4 bg-gray-100 border rounded-lg">
        <label class="block mb-2 text-gray-700">Chọn ngày bắt đầu:</label>
        <input type="date" v-model="newStartDate" class="p-2 border rounded-lg w-full">
        <button @click="applyNewStartDate" class="mt-4 p-2 bg-blue-600 text-white rounded-lg">Áp dụng</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      departureLocation: {
        type: String,
        required: true,
      },
      arrivalLocation: {
        type: String,
        required: true,
      },
      numberOfSeats: {
        type: Number,
        required: true,
      },
      startDate: {
        type: String,
        required: true,
      },
      endDate: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        showModify: false,
        newStartDate: this.startDate,
      };
    },
    computed: {
      formattedDateRange() {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const start = new Date(this.startDate).toLocaleDateString('vi-VN', options);
        if (!this.endDate) {
          return start;
        }
        const end = new Date(this.endDate).toLocaleDateString('vi-VN', options);
        return `${start} - ${end}`;
      },
    },
    methods: {
      toggleModify() {
        this.showModify = !this.showModify;
      },
      applyNewStartDate() {
        this.$emit('update:startDate', this.newStartDate);
        this.showModify = false;
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add custom styles if needed */
  </style>