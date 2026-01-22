<script setup lang="ts">
import { ref, computed } from 'vue'
import { Heart, ShoppingCart, Image as ImageIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  id: number | string
  slug?: string
  title: string
  price: string
  image: string
  isNew?: boolean
  category?: string
}>()

const imageError = ref(false)

const cartStore = useCartStore()

// Use slug if available, otherwise fall back to id
const productLink = computed(() => `/product/${props.slug || props.id}`)

const handleAddToCart = (e: Event) => {
  e.preventDefault() // Prevent link navigation
  e.stopPropagation()
  
  cartStore.addItem({
    id: props.id,
    name: props.title,
    price: props.price, // Store handles parsing if it's a number-string
    image: props.image
  })
}
</script>

<template>
  <div class="group relative bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#ED8900]/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
    
    <!-- Badge -->
    <div v-if="isNew" class="absolute top-3 left-3 z-10 bg-[#ED8900] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md -translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
      Novità
    </div>

    <!-- Wishlist Button -->
    <button class="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300 backdrop-blur-sm">
      <Heart class="w-4 h-4" />
    </button>

    <!-- Image Container with Link to Product Page -->
    <router-link :to="productLink" class="relative pt-[100%] bg-slate-50 overflow-hidden cursor-pointer flex items-center justify-center">
      <img 
        v-if="image && !imageError"
        :src="image" 
        :alt="title" 
        @error="imageError = true"
        class="absolute inset-0 w-full h-full object-contain p-4 sm:p-6 transform group-hover:scale-110 transition-transform duration-500 ease-out"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
          <ImageIcon class="w-12 h-12" />
      </div>
      <!-- Quick View Mobile Overlay (Optional) -->
    </router-link>

    <!-- Content -->
    <div class="p-3 sm:p-5 flex-1 flex flex-col">
      <div class="mb-1">
        <span class="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest">{{ category || 'Sika' }}</span>
      </div>
      
      <router-link :to="productLink">
        <h3 class="font-bold text-[#4B4846] text-base sm:text-lg leading-tight mb-2 group-hover:text-[#ED8900] transition-colors cursor-pointer line-clamp-2">
          {{ title }}
        </h3>
      </router-link>
      
      <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 group-hover:border-slate-200 transition-colors">
        <div class="flex flex-col">
           <span class="text-[10px] sm:text-xs text-slate-400 font-medium">Prezzo</span>
           <span class="text-lg sm:text-xl font-bold text-[#ED8900]">{{ price }}€</span>
        </div>
        
        <Button @click="handleAddToCart" size="icon" class="rounded-full bg-[#4B4846] hover:bg-[#ED8900] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
          <ShoppingCart class="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  </div>
</template>
