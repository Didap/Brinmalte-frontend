<script setup lang="ts">
import ProductCard from './ProductCard.vue'

const products = [
  {
    id: 1,
    title: 'Sika MonoTop®-627 HP',
    price: '24.50€',
    image: '/img/prod_mortar.png',
    isNew: true
  },
  {
    id: 2,
    title: 'SikaTop® Seal-107',
    price: '42.00€',
    image: '/img/prod_sealant.png',
    isNew: false
  },
  {
    id: 4,
    title: 'Sika® Ceram-255 StarFlex',
    price: '18.50€',
    image: '/img/prod_mortar.png',
    isNew: true
  },
  {
    id: 3,
    title: 'Sikalastic®-612',
    price: '68.90€',
    image: '/img/prod_sealant.png',
    isNew: false
  }
]
</script>

<template>
  <section class="py-24 bg-slate-50 relative overflow-hidden">
    <!-- Decorative Background Element -->
    <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ED8900]/30 to-transparent"></div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm mb-2 block">Il Nostro Catalogo</span>
        <h2 class="text-4xl font-bold text-slate-900 mb-4">I Prodotti Più Scelti</h2>
        <div class="w-20 h-1 bg-[#ED8900] mx-auto mb-6 rounded-full"></div>
        <p class="text-slate-600 text-lg">Soluzioni professionali testate nei cantieri di tutta Italia. Qualità certificata Sika e supporto tecnico specializzato.</p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <ProductCard 
          v-for="product in products" 
          :key="product.id"
          v-bind="product"
        />
      </div>
      
      <div class="mt-16 text-center">
         <RouterLink to="/prodotti" class="inline-flex items-center justify-center px-8 py-3 border border-slate-300 rounded-md text-slate-700 font-medium hover:border-[#ED8900] hover:text-[#ED8900] transition-colors duration-300 bg-white shadow-sm">
            Vedi tutto il catalogo 
            <span class="ml-2">&rarr;</span>
         </RouterLink>
      </div>
    </div>
  </section>
</template>
