<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardSearch } from '@/composables/useDashboardSearch'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Menu,
  Bell,
  Search,
  Home,
  ChevronRight
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
const route = useRoute()
const { globalSearchQuery } = useDashboardSearch()

const isSidebarOpen = ref(true)
const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value

const navItems = [
  { name: 'Panoramica', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Ordini', path: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Clienti', path: '/dashboard/customers', icon: Users },
  { name: 'Prodotti', path: '/dashboard/products', icon: Package },
]

const breadcrumbs = computed(() => {
  const path = route.path
  const parts = path.split('/').filter(p => p)
  
  // Custom mapping for breadcrumb names
  const nameMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'orders': 'Ordini',
    'customers': 'Clienti',
    'products': 'Prodotti'
  }

  return parts.map((part, index) => {
    const isLast = index === parts.length - 1
    const to = '/' + parts.slice(0, index + 1).join('/')
    const name = nameMap[part] || part.charAt(0).toUpperCase() + part.slice(1)
    
    return { name, to, isLast }
  })
})

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    
    <!-- Desktop Sidebar (Collapsible) -->
    <aside 
      class="bg-white text-gray-500 transition-all duration-300 hidden md:flex flex-col border-r border-gray-200 shadow-sm z-20"
      :class="isSidebarOpen ? 'w-64' : 'w-20'"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-gray-100 shrink-0 bg-white relative z-10">
        <img src="/img/image.png" alt="BrinMalte" class="object-contain transition-all duration-300" :class="isSidebarOpen ? 'h-10 w-auto' : 'h-8 w-8'" />
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        <Button
          v-for="item in navItems"
          :key="item.path"
          :variant="'ghost'"
          class="w-full justify-start gap-3 font-medium transition-colors duration-200"
          :class="[
            $route.path === item.path 
              ? 'bg-[#ED8900] text-white hover:bg-[#d67b00] shadow-md' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            !isSidebarOpen ? 'justify-center px-0' : ''
          ]"
          @click="$router.push(item.path)"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="isSidebarOpen" class="truncate">{{ item.name }}</span>
        </Button>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-3 border-t border-gray-100 space-y-2 shrink-0 bg-gray-50/50">
        <Button variant="ghost" class="w-full justify-start gap-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100" :class="{ 'justify-center px-0': !isSidebarOpen }" @click="$router.push('/')">
           <Home class="w-5 h-5 shrink-0" />
           <span v-if="isSidebarOpen" class="truncate">Torna al sito</span>
        </Button>
        <Button variant="ghost" class="w-full justify-start gap-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100" :class="{ 'justify-center px-0': !isSidebarOpen }">
          <Settings class="w-5 h-5 shrink-0" />
          <span v-if="isSidebarOpen" class="truncate">Impostazioni</span>
        </Button>
        <Button variant="ghost" class="w-full justify-start gap-3 text-red-500 hover:text-red-700 hover:bg-red-50" :class="{ 'justify-center px-0': !isSidebarOpen }" @click="$router.push('/')">
          <LogOut class="w-5 h-5 shrink-0" />
          <span v-if="isSidebarOpen" class="truncate">Esci</span>
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 bg-gray-50/50">
      
      <!-- Top Header -->
      <header class="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shrink-0 shadow-sm">
        <div class="flex items-center gap-6 flex-1">
          <!-- Mobile Toggle (Sheet) -->
          <Sheet>
            <SheetTrigger as-child>
               <Button variant="ghost" size="icon" class="md:hidden">
                 <Menu class="w-5 h-5 text-gray-600" />
               </Button>
            </SheetTrigger>
            <SheetContent side="left" class="bg-[#4B4846] text-white border-r-gray-700 w-64 p-0 flex flex-col">
                 <!-- Mobile Sidebar Content -->
                 <div class="h-16 flex items-center justify-center border-b border-gray-700 shrink-0 bg-white">
                    <img src="/img/image.png" alt="BrinMalte" class="h-10 w-auto object-contain" />
                 </div>
                 <nav class="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    <Button
                      v-for="item in navItems"
                      :key="item.path"
                      :variant="'ghost'"
                      class="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10"
                      :class="{ 'bg-[#ED8900] text-white hover:bg-[#d67b00]': $route.path === item.path }"
                      @click="$router.push(item.path)"
                    >
                      <component :is="item.icon" class="w-5 h-5 shrink-0" />
                      <span>{{ item.name }}</span>
                    </Button>
                 </nav>
                 <div class="p-3 border-t border-gray-700 space-y-2 shrink-0">
                     <Button variant="ghost" class="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10" @click="$router.push('/')">
                       <Home class="w-5 h-5 shrink-0" />
                       <span >Torna al sito</span>
                    </Button>
                    <Button variant="ghost" class="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10">
                      <Settings class="w-5 h-5 shrink-0" />
                      <span>Impostazioni</span>
                    </Button>
                    <Button variant="ghost" class="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10" @click="$router.push('/')">
                      <LogOut class="w-5 h-5 shrink-0" />
                      <span>Esci</span>
                    </Button>
                 </div>
            </SheetContent>
          </Sheet>

          <!-- Desktop Sidebar Toggle -->
          <Button variant="ghost" size="icon" @click="toggleSidebar" class="hidden md:flex text-gray-500 hover:text-gray-900">
            <Menu class="w-5 h-5" />
          </Button>

          <!-- Breadcrumbs -->
          <nav class="hidden md:flex items-center text-sm text-gray-500">
             <template v-for="(crumb, index) in breadcrumbs" :key="crumb.to">
                <span v-if="index > 0" class="mx-2 text-gray-400">
                  <ChevronRight class="w-4 h-4" />
                </span>
                <router-link 
                   v-if="!crumb.isLast" 
                   :to="crumb.to"
                   class="hover:text-gray-900 transition-colors"
                >
                   {{ crumb.name }}
                </router-link>
                <span v-else class="font-medium text-gray-900">{{ crumb.name }}</span>
             </template>
          </nav>
          
          <div class="hidden md:flex relative flex-1 max-w-xl mx-auto opacity-0 md:opacity-100 transition-opacity duration-300">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input 
               v-model="globalSearchQuery"
               placeholder="Cerca nel gestionale..." 
               class="pl-10 w-full bg-gray-100/50 border-transparent focus:border-[#ED8900]/50 focus:bg-white focus:ring-2 focus:ring-[#ED8900]/20 transition-all duration-300 rounded-full" 
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" class="relative text-gray-500 hover:text-gray-900">
            <Bell class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-gray-200 transition-all">
                <Avatar class="h-9 w-9 bg-orange-100 text-orange-600">
                  <AvatarFallback>{{ user?.username?.substring(0, 2).toUpperCase() || 'AD' }}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56" align="end">
              <DropdownMenuLabel class="font-normal">
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">{{ user?.username || 'Utente' }}</p>
                  <p class="text-xs leading-none text-muted-foreground">{{ user?.email }}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profilo
              </DropdownMenuItem>
              <DropdownMenuItem>
                Fatturazione
              </DropdownMenuItem>
              <DropdownMenuItem>
                Impostazioni
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-red-600 focus:text-red-600" @click="handleLogout">
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 md:p-6 overflow-y-auto scroll-smooth">
         <router-view v-slot="{ Component }">
            <transition 
               name="fade" 
               mode="out-in"
               enter-active-class="transition ease-out duration-200"
               enter-from-class="opacity-0 translate-y-2"
               enter-to-class="opacity-100 translate-y-0"
               leave-active-class="transition ease-in duration-150"
               leave-from-class="opacity-100 translate-y-0"
               leave-to-class="opacity-0 translate-y-2"
            >
               <component :is="Component" />
            </transition>
         </router-view>
      </main>

    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for sidebar nav if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
