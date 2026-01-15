<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, User, ShoppingCart, Menu, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const isScrolled = ref(false)
const isLoggedIn = ref(false)
const isMenuOpen = ref(false)
const isMobileSearchOpen = ref(false)
const searchQuery = ref('')

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/prodotti', query: { q: searchQuery.value } })
  }
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-white shadow-sm transition-all duration-300">
    <!-- Dynamic height: h-24 (default) -> h-16 (scrolled) -->
    <div class="container mx-auto px-4 flex items-center justify-between gap-4 transition-all duration-300"
      :class="isScrolled ? 'h-16' : 'h-24'">
      
      <!-- Logo Section -->
      <div class="flex-shrink-0 block">
        <a href="/" class="flex items-center gap-2">
          <!-- Logo image resizing -->
          <img src="/img/image.png" alt="BrinMalte Logo" 
            class="w-auto max-w-[120px] md:max-w-none object-contain transition-all duration-300"
            :class="isScrolled ? 'h-10' : 'h-12 md:h-16'" />
        </a>
      </div>

      <!-- Mobile Search Input (Inline) -->
      <div v-if="isMobileSearchOpen" class="flex-1 lg:hidden mx-1 animate-in fade-in slide-in-from-right-4 duration-300">
        <div class="relative w-full group">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#ED8900] transition-colors" />
            <Input 
                type="text" 
                v-model="searchQuery"
                placeholder="Cerca prodotti..." 
                class="w-full pl-9 pr-4 bg-gray-100 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#ED8900] focus-visible:border-transparent h-10 rounded-full text-sm transition-all shadow-sm"
                @keyup.enter="handleSearch(); isMobileSearchOpen = false"
                autoFocus
            />
        </div>
      </div>

      <!-- Navigation Menu - Desktop -->
      <nav class="hidden lg:flex items-center gap-8 text-sm font-medium text-[#4B4846]">
        <router-link to="/" exact-active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide">Home</router-link>
        <router-link to="/categorie" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide">Categorie</router-link>
        <router-link to="/prodotti" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide">Prodotti</router-link>
        <router-link to="/chi-siamo" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide">Chi siamo</router-link>
        <router-link to="/contatti" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide">Contatti</router-link>
      </nav>

      <!-- Mobile Menu Dropdown -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="isMenuOpen" class="absolute top-full left-0 w-full bg-white border-b shadow-lg lg:hidden flex flex-col p-4 gap-4 z-40">
            <router-link @click="isMenuOpen = false" to="/" exact-active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide font-medium py-2 border-b border-gray-100">Home</router-link>
            <router-link @click="isMenuOpen = false" to="/categorie" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide font-medium py-2 border-b border-gray-100">Categorie</router-link>
            <router-link @click="isMenuOpen = false" to="/prodotti" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide font-medium py-2 border-b border-gray-100">Prodotti</router-link>
            <router-link @click="isMenuOpen = false" to="/chi-siamo" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide font-medium py-2 border-b border-gray-100">Chi siamo</router-link>
            <router-link @click="isMenuOpen = false" to="/contatti" active-class="text-[#ED8900]" class="hover:text-[#ED8900] transition-colors duration-300 uppercase tracking-wide font-medium py-2">Contatti</router-link>
            
             <!-- Mobile User Actions -->
             <div class="flex items-center gap-4 mt-2 justify-center" v-if="isLoggedIn">
                 <Button variant="ghost" class="flex gap-2 w-full justify-center hover:text-[#ED8900]">
                    <User class="h-5 w-5" /> Account
                 </Button>
            </div>
            <div class="flex items-center gap-4 mt-2 justify-center" v-else>
                 <Button @click="$router.push('/login'); isMenuOpen = false" class="bg-[#ED8900] w-full text-white">Accedi</Button>
            </div>
        </div>
      </transition>

      <!-- Right Section: Search & Actions -->
      <div class="flex items-center gap-1 lg:gap-4 justify-end lg:flex-none" :class="isMobileSearchOpen ? 'flex-none' : 'flex-1'">
        
        <!-- Search Bar (Desktop) -->
        <div class="hidden lg:flex relative w-full max-w-xs items-center">
          <Input 
            type="text" 
            v-model="searchQuery"
            placeholder="Cerca prodotti..." 
            class="w-full pr-10 border-slate-200 focus-visible:ring-[#ED8900]"
            @keyup.enter="handleSearch"
          />
          <Button size="icon" variant="ghost" class="absolute right-0 top-0 h-full hover:bg-transparent" @click="handleSearch">
             <Search class="h-4 w-4 text-slate-500" />
             <span class="sr-only">Cerca</span>
          </Button>
        </div>
        
        <!-- Mobile Search Toggle -->
        <Button size="icon" variant="ghost" class="lg:hidden text-[#4B4846] hover:text-[#ED8900]" @click="isMobileSearchOpen = !isMobileSearchOpen">
            <component :is="isMobileSearchOpen ? X : Search" class="h-5 w-5" />
        </Button>

         <!-- User Actions -->
        <div class="flex items-center gap-2">
           <!-- Cart Button (Always Visible) -->
           <Button @click="cartStore.toggleCart()" variant="ghost" size="icon" class="relative hover:text-[#ED8900] group">
              <ShoppingCart class="h-5 w-5 text-[#4B4846] group-hover:scale-110 transition-transform" />
              <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-[#ED8900] text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white pointer-events-none shadow-sm z-10">
                  {{ cartStore.totalItems }}
              </span>
              <span class="sr-only">Carrello</span>
           </Button>

           <template v-if="isLoggedIn">
             <Button variant="ghost" size="icon" class="hidden lg:flex hover:text-[#ED8900]">
              <User class="h-5 w-5 text-[#4B4846]" />
              <span class="sr-only">Account</span>
             </Button>
           </template>
           <Button v-else @click="$router.push('/login')" class="bg-[#ED8900] hover:bg-orange-600 text-white font-medium hidden lg:flex">
            Accedi
           </Button>
           
           <!-- Burger Menu Button (Mobile - Right Side) -->
           <button @click="isMenuOpen = !isMenuOpen" class="lg:hidden p-2 text-[#4B4846] hover:text-[#ED8900] transition-colors ml-1">
             <component :is="isMenuOpen ? X : Menu" class="h-6 w-6" />
           </button>
        </div>
      </div>
    </div>
    


  </header>
</template>
