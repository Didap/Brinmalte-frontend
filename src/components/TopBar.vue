<script setup lang="ts">
import { Phone, Truck } from 'lucide-vue-next'
</script>

<template>
  <!-- Background color explicitly set to match brand grey #4B4846 -->
  <div class="w-full bg-[#4B4846] text-white text-xs py-2 px-4 md:px-6 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <Truck class="h-3 w-3 text-orange-500" />
      <span>Spedizione Gratuita per ordini sopra i 200€</span>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1">
        <Phone class="h-3 w-3 text-orange-500" />
        <span>Supporto Tecnico: +39 0831 367066</span>
      </div>
    </div>
  </div>
</template>
