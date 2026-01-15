<script setup lang="ts">
import Header from './components/Header.vue'
import TopBar from './components/TopBar.vue'
import Footer from './components/Footer.vue'
import CartDrawer from './components/cart/CartDrawer.vue'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-[#4B4846]">
    <TopBar v-if="!$route.meta.hideLayout" />
    <Header v-if="!$route.meta.hideLayout" />
    
    <router-view></router-view>
    
    <Footer v-if="!$route.meta.hideLayout" />
    <CartDrawer />
    <Toaster />
  </div>
</template>
