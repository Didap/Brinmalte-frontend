<script setup lang="ts">
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Package, 
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { orders } from '@/data/orders'
import { customers } from '@/data/customers'
import { useProducts } from '@/composables/useProducts'
import { computed, onMounted } from 'vue'

const { products, fetchProducts } = useProducts()

onMounted(() => {
    fetchProducts()
})

const totalRevenue = computed(() => {
  return orders.reduce((sum, order) => sum + order.amount, 0)
})

const totalOrders = computed(() => orders.length)
const totalCustomers = computed(() => customers.length)
const totalProducts = computed(() => products.value.length)

// Get recent sales (last 5 orders)
const recentSales = computed(() => {
   return [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(order => {
      // Find customer avatar if possible, else generic
      const customer = customers.find(c => c.email === order.email)
      return {
         name: order.customer,
         email: order.email,
         amount: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(order.amount),
         avatar: customer?.avatar || 'US'
      }
   })
})
</script>

<template>
  <div class="space-y-8">
    
    <!-- Header Page -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-[#4B4846]">Panoramica</h2>
        <p class="text-gray-500">Benvenuto nella dashboard di gestione BrinMalte.</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button class="bg-[#ED8900] hover:bg-orange-600 text-white">Scarica Report</Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Ricavi Totali</CardTitle>
          <DollarSign class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totalRevenue) }}</div>
          <p class="text-xs text-gray-500">+20.1% rispetto al mese scorso</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Ordini Totali</CardTitle>
          <CreditCard class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">+{{ totalOrders }}</div>
          <p class="text-xs text-gray-500">+2 rispetto a ieri</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Clienti Totali</CardTitle>
          <Users class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalCustomers }}</div>
          <p class="text-xs text-gray-500">+1 nell'ultimo mese</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Prodotti a Catalogo</CardTitle>
          <Package class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalProducts }}</div>
          <p class="text-xs text-gray-500">In 4 categorie</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      
      <!-- Chart Placeholder -->
      <Card class="col-span-full lg:col-span-4">
        <CardHeader>
          <CardTitle>Panoramica Vendite</CardTitle>
          <CardDescription>Andamento vendite per l'anno corrente</CardDescription>
        </CardHeader>
        <CardContent class="pl-2">
             <div class="h-[350px] flex items-end justify-between gap-2 px-2">
                 <!-- Mock chart bars -->
                 <div v-for="i in 12" :key="i" class="w-full bg-orange-100 rounded-t-sm hover:bg-orange-200 transition-colors relative group" :style="{ height: `${Math.random() * 100}%` }">
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-1 rounded">
                        €{{ Math.floor(Math.random() * 5000) }}
                    </div>
                 </div>
             </div>
             <div class="flex justify-between mt-2 text-xs text-gray-500 px-2 overflow-x-auto">
                 <span>Gen</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mag</span><span>Giu</span><span>Lug</span><span>Ago</span><span>Set</span><span>Ott</span><span>Nov</span><span>Dic</span>
             </div>
        </CardContent>
      </Card>

      <!-- Recent Sales -->
      <Card class="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>Vendite Recenti</CardTitle>
          <CardDescription>Hai fatto 265 vendite questo mese.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-8">
            <div v-for="sale in recentSales" :key="sale.email" class="flex items-center">
              <Avatar class="h-9 w-9">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>{{ sale.avatar }}</AvatarFallback>
              </Avatar>
              <div class="ml-4 space-y-1">
                <p class="text-sm font-medium leading-none">{{ sale.name }}</p>
                <p class="text-sm text-gray-500">{{ sale.email }}</p>
              </div>
              <div class="ml-auto font-medium">{{ sale.amount }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
