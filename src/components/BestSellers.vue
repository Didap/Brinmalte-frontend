<script setup lang="ts">
import { onMounted } from 'vue'
import ProductCard from './ProductCard.vue'
import { useProducts } from '@/composables/useProducts'

const { products, fetchProducts } = useProducts()

onMounted(() => {
  // Fetch 4 most recent products as "Best Sellers" for now
  // In a real scenario, this would filter by { isBestSeller: true }
  const params = new URLSearchParams()
  params.append('sort', 'createdAt:desc')
  fetchProducts(1, 4, params)
})
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

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        <ProductCard 
          v-for="product in products" 
          :key="product.id"
          :id="product.id"
          :slug="product.slug"
          :title="product.name"
          :price="product.price"
          :image="product.image"
          :isNew="false" 
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
