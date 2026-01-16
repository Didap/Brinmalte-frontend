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
import { useProducts } from '@/composables/useProducts'
import { computed, onMounted, ref } from 'vue'
import { fetchAPI } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

const { products, fetchProducts } = useProducts()
const { token } = useAuth()

const realOrders = ref<any[]>([])
const totalOrdersCount = ref(0)
const totalRevenueAmount = ref(0)
const totalCustomersCount = ref(0)

const fetchDashboardData = async () => {
    try {
        // Fetch Orders (Get latest 100 for revenue calc - approximation)
        // Also gives us meta.pagination.total for Total Orders
        const ordersRes = await fetchAPI<any>('/orders?populate=*&sort=createdAt:desc&pagination[pageSize]=100', {}, {
             headers: { Authorization: `Bearer ${token.value}` }
        })
        
        if (ordersRes.data) {
            realOrders.value = ordersRes.data
            totalOrdersCount.value = ordersRes.meta?.pagination?.total || ordersRes.data.length
            
            // Calculate Revenue from the fetched subset (approximation if > 100 orders)
            // Assuming 'total' is the field name in the Order model for price
            totalRevenueAmount.value = ordersRes.data.reduce((sum: number, order: any) => {
                const val = order.attributes?.total || 0 // standard Strapi v4 structure
                return sum + Number(val)
            }, 0)
        }

        // Fetch Customers count
        try {
            const customersRes = await fetchAPI<any>('/customers?pagination[pageSize]=1', {}, { // Just need count
                 headers: { Authorization: `Bearer ${token.value}` }
            })
            if (customersRes.meta && customersRes.meta.pagination) {
                 totalCustomersCount.value = customersRes.meta.pagination.total
            }
        } catch (e) {
            console.warn('Error fetching customers', e)
        }
        
    } catch (e) {
        console.error('Error fetching dashboard data', e)
    }
}

onMounted(() => {
    fetchProducts()
    fetchDashboardData()
})

const totalRevenue = computed(() => totalRevenueAmount.value)
const totalOrders = computed(() => totalOrdersCount.value)
// Use real count if available, otherwise fallback to unique emails approach (though less accurate)
const totalCustomers = computed(() => {
    if (totalCustomersCount.value > 0) return totalCustomersCount.value
    // Fallback
    const emails = new Set(realOrders.value.map(o => {
        const attrs = o.attributes || o
        return attrs.customer_email
    }).filter(Boolean))
    return emails.size
})
const totalProducts = computed(() => products.value.length)

// Get recent sales (last 5 orders)
const recentSales = computed(() => {
   // realOrders is already sorted desc by query
   return realOrders.value.slice(0, 5).map(order => {
      // Clean access to flat or nested attributes
      const attrs = order.attributes || order
      return {
         name: attrs.customer_name || 'Cliente',
         email: attrs.customer_email || 'No Email',
         amount: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(attrs.total || 0)),
         // Initials for avatar
         avatar: (attrs.customer_name || 'User').substring(0, 2).toUpperCase()
      }
   })
})

const currentMonthSalesCount = computed(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return realOrders.value.filter(o => {
        const attrs = o.attributes || o
        if (!attrs.createdAt) return false
        const d = new Date(attrs.createdAt)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).length
})

const monthlySales = computed(() => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const currentYear = new Date().getFullYear()
    const sales = new Array(12).fill(0)

    realOrders.value.forEach(order => {
        const attrs = order.attributes || order
        if (!attrs.createdAt) return
        
        const date = new Date(attrs.createdAt)
        if (date.getFullYear() === currentYear) {
            const month = date.getMonth() // 0-11
            const amount = Number(attrs.total || 0)
            sales[month] += amount
        }
    })

    const maxSale = Math.max(...sales, 100) // Avoid division by zero, min 100 scale

    return sales.map((amount, index) => ({
        label: months[index],
        amount: amount,
        formattedAmount: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount),
        percentage: (amount / maxSale) * 100
    }))
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
          <p class="text-xs text-gray-500">Basato sugli ultimi 100 ordini</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Ordini Totali</CardTitle>
          <CreditCard class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalOrders }}</div>
          <p class="text-xs text-gray-500">Ordini registrati</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Clienti Totali</CardTitle>
          <Users class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalCustomers }}</div>
          <p class="text-xs text-gray-500">Clienti in database</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Prodotti a Catalogo</CardTitle>
          <Package class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalProducts }}</div>
          <p class="text-xs text-gray-500">Prodotti attivi</p>
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
                 <!-- Real chart bars -->
                 <div v-for="(monthData, index) in monthlySales" :key="index" 
                      class="w-full bg-orange-100 rounded-t-sm hover:bg-orange-200 transition-colors relative group" 
                      :style="{ height: `${monthData.percentage}%` }">
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                        {{ monthData.formattedAmount }}
                    </div>
                 </div>
             </div>
             <div class="flex justify-between mt-2 text-xs text-gray-500 px-2 overflow-x-auto">
                 <span v-for="m in monthlySales" :key="m.label" class="w-full text-center">{{ m.label }}</span>
             </div>
        </CardContent>
      </Card>

      <!-- Recent Sales -->
      <Card class="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>Vendite Recenti</CardTitle>
          <CardDescription>Hai fatto {{ currentMonthSalesCount }} vendite questo mese.</CardDescription>
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
