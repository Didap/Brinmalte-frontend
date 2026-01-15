<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { useCategories } from '@/composables/useCategories'

const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <section class="py-24 bg-white">
    <div class="container mx-auto px-4">
      <div class="mb-12">
        <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm mb-2 block">Esplora per Categoria</span>
        <h2 class="text-3xl font-bold text-slate-900">Tutto per il tuo Cantiere</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[300px]">
        <router-link 
          v-for="category in categories" 
          :key="category.id"
          :to="'/category/' + category.id"
          class="group relative overflow-hidden rounded-xl bg-slate-100 block"
          :class="category.colSpan"
        >
          <!-- Background Image -->
          <div class="absolute inset-0">
             <img 
               :src="category.heroImage" 
               :alt="category.name" 
               class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.70]"
             />
             <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300"></div>
          </div>

          <!-- Content -->
          <div class="absolute bottom-0 left-0 p-6 w-full text-white">
            <div class="flex items-center justify-between mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
              <h3 class="text-2xl font-bold">{{ category.name }}</h3>
              <div class="bg-[#ED8900] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-x-4 group-hover:translate-x-0">
                <ArrowUpRight class="h-5 w-5 text-white" />
              </div>
            </div>
            <div class="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
              <div class="overflow-hidden">
                <p class="text-slate-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 line-clamp-2">
                  {{ category.description }}
                </p>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>
