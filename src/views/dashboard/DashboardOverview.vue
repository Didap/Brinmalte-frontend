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
const realCustomers = ref<any[]>([])
const totalOrdersCount = ref(0)
const totalRevenueAmount = ref(0)

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

        // Fetch Customers (or Users)
        // We use the Customer model if available, or users.
        // Let's try /customers first as per our schema
        try {
            const customersRes = await fetchAPI<any>('/customers?pagination[pageSize]=1', {}, { // Just need count
                 headers: { Authorization: `Bearer ${token.value}` }
            })
            // Strapi response structure check
            if (customersRes.meta) {
                 realCustomers.value = customersRes.data // If needed
                 // If we want total count, use meta
                 // But wait, we need realCustomers for Avatar lookup? 
                 // Actually /customers might populate user?
            }
             // Let's actually fetch /users for a more consistent count if /customers fails or is restricted 
             // But let's assume /customers works for now as we defined it. 
             // To be safe, let's just get the count from meta.
             // We can also fetch all if needed for recent sales avatars.
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
// If we can't reliably get customer count from /customers, we might use order unique emails as proxy or just show 0
// Let's assume we can get it from users/me if admin or just explicit customers count
// For now, let's try to get it from the successful response above or fallback to order unique emails
const totalCustomers = computed(() => {
    // Unique emails from orders as a fallback for "Customers"
    const emails = new Set(realOrders.value.map(o => o.attributes?.customer_email))
    return emails.size
})
const totalProducts = computed(() => products.value.length)

// Get recent sales (last 5 orders)
const recentSales = computed(() => {
   // realOrders is already sorted desc by query
   return realOrders.value.slice(0, 5).map(order => {
      const attrs = order.attributes
      return {
         name: attrs.customer_name || 'Cliente',
         email: attrs.customer_email || 'No Email',
         amount: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(attrs.total || 0),
         // Initials for avatar
         avatar: (attrs.customer_name || 'User').substring(0, 2).toUpperCase()
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
