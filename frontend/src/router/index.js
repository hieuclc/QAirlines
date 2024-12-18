import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Booking from '../views/Booking.vue'
import Admin from '../views/AdminDashboard.vue'
import test from '@/views/test.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/booking',
      name: 'booking',
      component: Booking
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    },
    {
      path: '/test',
      name: 'test',
      component: test
    }
    
  ]
})

export default router

