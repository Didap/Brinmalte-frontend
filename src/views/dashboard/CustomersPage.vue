<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MoreHorizontal, ArrowUpDown, Euro, ShoppingBag, Mail, Package, ChevronRight, ArrowLeft, Download } from 'lucide-vue-next'
import { useDashboardSearch } from '@/composables/useDashboardSearch'
import { fetchAPI } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

// Remove mocks
// import { customers as customersData, type Customer } from '@/data/customers'
// import { orders as ordersData, type Order } from '@/data/orders'

interface Customer {
    id: number | string;
    name: string;
    email: string;
    status: string;
    spent: number;
    orders: number;
    avatar: string;
    rawOrders?: any[]; // To store fetched orders for this user
}

interface Order {
    id: number | string;
    order_status: string;
    date: string;
    amount: number;
    items: any[];
}

const customers = ref<Customer[]>([])
const { globalSearchQuery } = useDashboardSearch() // Use global search
const { token } = useAuth()

const pagination = ref({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0
})

// Filter States (Declared BEFORE fetchCustomers)
const currentTab = ref('all')
// const filterSpent = ref<string>('all') 
// const filterOrders = ref<string>('all')

// Sorting States (Declared BEFORE fetchCustomers)
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const fetchCustomers = async (page = 1, pageSize = 10) => {
    try {
        const params = new URLSearchParams()
        // Populate user with specific fields (avoid * which tries to get role)
        params.append('populate[user][fields][0]', 'email')
        params.append('populate[user][fields][1]', 'username')
        params.append('populate[user][fields][2]', 'blocked')
        // Populate orders with specific fields (avoid * which causes issues with items)
        params.append('populate[orders][fields][0]', 'id')
        params.append('populate[orders][fields][1]', 'total')
        params.append('populate[orders][fields][2]', 'order_status')
        params.append('populate[orders][fields][3]', 'createdAt')
        params.append('populate[orders][fields][4]', 'order_number')
        params.append('pagination[page]', String(page))
        params.append('pagination[pageSize]', String(pageSize))
        params.append('sort', sortKey.value ? `${sortKey.value}:${sortOrder.value}` : 'createdAt:desc')

        // Search filter (only on Customer fields, not nested user fields to avoid API issues)
        if (globalSearchQuery.value) {
            const q = globalSearchQuery.value
            let i = 0
            // 1. ID (if numeric)
            if (!isNaN(Number(q))) {
                params.append(`filters[$or][${i}][id][$eq]`, q)
                i++
            }

            // 2. Name & Surname (on Customer - safe to filter)
            params.append(`filters[$or][${i}][name][$containsi]`, q)
            i++
            params.append(`filters[$or][${i}][surname][$containsi]`, q)
            i++
            
            // 3. Phone (on Customer - safe to filter)
            params.append(`filters[$or][${i}][phone][$containsi]`, q)
            i++

            // 4. Email (on User relation)
            params.append(`filters[$or][${i}][user][email][$containsi]`, q)
            i++

            // 5. Username (on User relation)
            params.append(`filters[$or][${i}][user][username][$containsi]`, q)
        }

        const response = await fetchAPI<any>(`/customers?${params.toString()}`, {}, {
             headers: { Authorization: `Bearer ${token.value}` }
        })
        
        if (response.meta && response.meta.pagination) {
            pagination.value = response.meta.pagination
        }

        if (response && response.data) {
            customers.value = response.data.map((c: any) => {
                // Support both Strapi v4 (attributes) and v5/flat structures
                const attrs = c.attributes || c
                
                // Get user data (Strapi v5 flat structure)
                let userData = attrs.user?.data?.attributes || attrs.user?.attributes || attrs.user
                
                // Get orders from Customer (not from User!)
                let customerOrders = []
                if (attrs.orders) {
                    if (Array.isArray(attrs.orders)) {
                        customerOrders = attrs.orders
                    } else if (attrs.orders.data) {
                        customerOrders = attrs.orders.data.map((o: any) => o.attributes || o)
                    }
                }
                
                // Use DB fields if available (for server-side sorting consistency), fallback to calc
                const spent = attrs.total_spent !== undefined ? Number(attrs.total_spent) : customerOrders.reduce((sum: number, o: any) => {
                    const total = o.total !== undefined ? o.total : 0
                    return sum + Number(total)
                }, 0)

                const ordersCount = attrs.orders_count !== undefined ? Number(attrs.orders_count) : customerOrders.length

                const name = `${attrs.name || ''} ${attrs.surname || ''}`.trim() || userData?.username || 'Cliente'

                return {
                    id: c.id, 
                    documentId: c.documentId,
                    name: name,
                    email: userData?.email || attrs.user?.email || 'N/A',
                    status: userData?.blocked ? 'Blocked' : 'Active', 
                    spent: spent,
                    orders: ordersCount,
                    avatar: name.substring(0, 2).toUpperCase(),
                    rawOrders: customerOrders.map((o: any) => {
                        const oAttrs = o.attributes || o
                        return {
                            id: o.id || o.documentId,
                            ...oAttrs
                        }
                    })
                }
            })
        }
    } catch (e) {
         console.error('Failed to fetch customers', e)
    }
}

const handlePageChange = (page: number) => {
    fetchCustomers(page, pagination.value.pageSize)
}

// Watchers
// Watchers

watch([currentTab, globalSearchQuery], () => {
    fetchCustomers(1, pagination.value.pageSize)
})

watch([sortKey, sortOrder], () => {
    fetchCustomers(pagination.value.page, pagination.value.pageSize)
})

onMounted(() => {
    fetchCustomers()
})

// Quick Filters State
// const filterSpent = ref<string>('all')
// const filterOrders = ref<string>('all')

// Profile Sheet State
const isProfileOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)

// Order Details Dialog State
const selectedOrder = ref<Order | null>(null)

const selectedCustomerOrders = computed<Order[]>(() => {
    if (!selectedCustomer.value || !selectedCustomer.value.rawOrders) return []
    return selectedCustomer.value.rawOrders.map(o => ({
        id: o.id,
        order_status: o.order_status || 'Pending',
        date: new Date(o.createdAt).toLocaleDateString('it-IT'),
        amount: Number(o.total) || 0,
        items: [] 
    }))
})

/* Removed filteredCustomers computed property - using 'customers' directly from server */
const handleSort = (key: string) => {
  let apiSortKey = key
  
  // Map frontend keys to backend fields
  if (key === 'status') apiSortKey = 'user.blocked'
  if (key === 'spent') apiSortKey = 'total_spent'
  if (key === 'orders') apiSortKey = 'orders_count'
  
  // Reset page to 1 on sort change
  pagination.value.page = 1

  if (sortKey.value === apiSortKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = apiSortKey
    sortOrder.value = 'asc' // Default to asc, but for numbers usually desc is better first? Standard is asc.
    if (key === 'spent' || key === 'orders') {
        sortOrder.value = 'desc' // UX: usually want to see highest spenders first
    }
  }
  fetchCustomers(1, pagination.value.pageSize)
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Active': return 'bg-green-100 text-green-700 hover:bg-green-200'
    case 'Inactive': return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    case 'Blocked': return 'bg-red-100 text-red-700 hover:bg-red-200'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'Active': return 'Attivo'
    case 'Inactive': return 'Inattivo'
    case 'Blocked': return 'Bloccato'
    default: return status
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}



const handleExport = async () => {
  try {
    // Fetch ALL customers for export
    const params = new URLSearchParams()
    // Populate user specific fields
    params.append('populate[user][fields][0]', 'email')
    params.append('populate[user][fields][1]', 'username')
    params.append('populate[user][fields][2]', 'blocked')
    
    // Populate orders specific fields to avoid 'items' error
    params.append('populate[orders][fields][0]', 'id')
    params.append('populate[orders][fields][1]', 'total')
    params.append('pagination[limit]', '-1')
    params.append('sort', 'createdAt:desc')
    
    const response = await fetchAPI<any>(`/customers?${params.toString()}`, {}, {
        headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (!response.data || response.data.length === 0) {
        toast.warning('Nessun cliente da esportare')
        return
    }
    
    // Build CSV content
    const headers = ['ID', 'Nome', 'Cognome', 'Email', 'Telefono', 'Stato', 'N. Ordini', 'Totale Speso (€)']
    const rows = response.data.map((c: any) => {
        const attrs = c.attributes || c
        const userData = attrs.user?.data?.attributes || attrs.user?.attributes || attrs.user
        
        // Calculate orders and spent
        let customerOrders = []
        if (attrs.orders) {
            if (Array.isArray(attrs.orders)) {
                customerOrders = attrs.orders
            } else if (attrs.orders.data) {
                customerOrders = attrs.orders.data.map((o: any) => o.attributes || o)
            }
        }
        
        const spent = customerOrders.reduce((sum: number, o: any) => {
            return sum + Number(o.total || 0)
        }, 0)
        
        return [
            c.id,
            attrs.name || '',
            attrs.surname || '',
            userData?.email || attrs.user?.email || 'N/A',
            attrs.phone || '',
            userData?.blocked ? 'Bloccato' : 'Attivo',
            customerOrders.length,
            spent.toFixed(2).replace('.', ',')
        ]
    })
    
    // Create CSV string
    const csvContent = [
        headers.join(';'),
        ...rows.map((row: (string | number)[]) => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n')
    
    // Download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clienti_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Esportati ${response.data.length} clienti`)
  } catch (e: any) {
    console.error('Export failed:', e)
    toast.error('Errore durante l\'esportazione')
  }
}

const handleAction = (action: string, customerId: string) => {
  const customer = customers.value.find(c => String(c.id) === customerId)

  if (action === 'Vedi profilo') {
      if (customer) {
        selectedCustomer.value = customer
        selectedOrder.value = null // Reset order detail view
        isProfileOpen.value = true
      }
  } else if (action === 'Invia email') {
      if (customer) window.location.href = `mailto:${customer.email}`
  } else if (action === 'Dettaglio Ordine') {
      // Find order in the currently selected customer's orders
      // Note: customerId here is actually orderId passed from the template
      const orderId = customerId 
      const foundOrder = selectedCustomerOrders.value.find(o => String(o.id) === orderId)
      
      if (foundOrder) {
          selectedOrder.value = foundOrder
      }
  } else {
      toast.info(`Azione "${action}" non ancora implementata`)
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] gap-4">
    <!-- Header Section (Fixed) -->
    <div class="flex-none space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold tracking-tight text-[#4B4846]">Clienti</h2>
            <p class="text-gray-500">Gestisci i dati dei tuoi clienti.</p>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" class="w-full md:w-auto" @click="handleExport">
                <Download class="w-4 h-4 mr-2" />
                Esporta CSV
            </Button>
        </div>
        </div>

        <!-- Tabs Filtering -->
        <Tabs default-value="all" v-model="currentTab" class="w-full">
        <TabsList>
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value="Active">Attivi</TabsTrigger>
            <TabsTrigger value="Inactive">Inattivi</TabsTrigger>
            <TabsTrigger value="Blocked">Bloccati</TabsTrigger>
        </TabsList>
        </Tabs>
    </div>

    <!-- Table (Flex Grow + Scroll) -->
    <div class="flex-1 rounded-md border bg-white overflow-hidden flex flex-col min-h-0 relative shadow-sm">
      <div class="overflow-auto flex-1 w-full relative">
        <Table>
            <TableHeader class="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
                <TableHead class="w-[300px] cursor-pointer hover:bg-gray-50" @click="handleSort('name')">
                <div class="flex items-center gap-2">
                    Cliente <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('status')">
                <div class="flex items-center gap-2">
                    Stato <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('spent')">
                <div class="flex items-center gap-2">
                    Totale Speso <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('orders')">
                <div class="flex items-center gap-2">
                    Ordini Totali <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="text-right">Azioni</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            <TableRow v-for="customer in customers" :key="customer.id" @click="handleAction('Vedi profilo', String(customer.id))" class="cursor-pointer hover:bg-gray-50">
                <TableCell>
                <div class="flex items-center gap-3">
                    <Avatar class="h-9 w-9">
                        <AvatarFallback>{{ customer.avatar }}</AvatarFallback>
                    </Avatar>
                    <div class="flex flex-col">
                    <span class="font-medium">{{ customer.name }}</span>
                    <span class="text-xs text-gray-500">{{ customer.email }}</span>
                    </div>
                </div>
                </TableCell>
                <TableCell>
                <Badge class="rounded-md font-normal" :class="getStatusColor(customer.status)">
                    {{ getStatusLabel(customer.status) }}
                </Badge>
                </TableCell>
                <TableCell class="font-medium">{{ formatCurrency(customer.spent) }}</TableCell>
                <TableCell>{{ customer.orders }}</TableCell>
                <TableCell class="text-right" @click.stop>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                    <Button variant="ghost" class="h-8 w-8 p-0">
                        <span class="sr-only">Open menu</span>
                        <MoreHorizontal class="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                    <DropdownMenuItem @click="handleAction('Vedi profilo', String(customer.id))">Vedi profilo</DropdownMenuItem>
                    <DropdownMenuItem @click="handleAction('Invia email', String(customer.id))">Invia email</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
            <TableRow v-if="customers.length === 0" class="h-full">
                 <TableCell colspan="5" class="text-center h-full py-10">Nessun cliente trovato.</TableCell>
            </TableRow>
            </TableBody>
        </Table>
      </div>
    </div>

    <!-- Customer Profile Dialog (Overlay) -->
    <Dialog v-model:open="isProfileOpen">
      <DialogContent class="sm:max-w-[700px]">
        <DialogTitle class="sr-only">Profilo Cliente</DialogTitle>
        <DialogDescription class="sr-only">Dettagli cliente</DialogDescription>
        
           <div v-if="selectedCustomer" class="mt-4">
           <Tabs default-value="overview" class="w-full">
             <TabsList class="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
               <TabsTrigger value="overview">Panoramica</TabsTrigger>
               <TabsTrigger value="orders">Storico Ordini</TabsTrigger>
             </TabsList>
             
             <TabsContent value="overview" class="space-y-6 animate-in fade-in-50 duration-500">
                <!-- Header Section -->
                <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 pb-6 border-b">
                     <Avatar class="h-24 w-24 text-2xl border-4 border-white shadow-lg">
                            <AvatarFallback class="bg-[#ED8900] text-white">{{ selectedCustomer.avatar }}</AvatarFallback>
                     </Avatar>
                     <div class="space-y-1 w-full">
                         <h3 class="text-3xl font-bold tracking-tight text-[#4B4846]">{{ selectedCustomer.name }}</h3>
                         <p class="text-gray-500 flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                            {{ selectedCustomer.email }}
                            <Badge variant="outline" :class="getStatusColor(selectedCustomer.status)">
                                {{ getStatusLabel(selectedCustomer.status) }}
                            </Badge>
                         </p>
                     </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                           <CardTitle class="text-sm font-medium">Spesa Totale</CardTitle>
                           <Euro class="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div class="text-2xl font-bold text-[#ED8900]">{{ formatCurrency(selectedCustomer.spent) }}</div>
                           <p class="text-xs text-muted-foreground">Lifetime Value</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                           <CardTitle class="text-sm font-medium">Ordini Effettuati</CardTitle>
                           <ShoppingBag class="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div class="text-2xl font-bold">{{ selectedCustomer.orders }}</div>
                           <p class="text-xs text-muted-foreground">Ordini totali</p>
                        </CardContent>
                    </Card>
                </div>

                <!-- Actions -->
                <div class="space-y-3 pt-2">
                    <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Azioni Rapide</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <Button variant="outline" class="h-auto py-4 flex flex-col gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200" @click="handleAction('Invia email', String(selectedCustomer.id))">
                            <Mail class="h-5 w-5" />
                            <span>Invia Email</span>
                        </Button>
                    </div>
                </div>
             </TabsContent>

             <TabsContent value="orders" class="min-h-[300px]">
                <!-- Order List View -->
                <div v-if="!selectedOrder" class="space-y-4 animate-in slide-in-from-left-2 duration-300">
                   <div v-if="selectedCustomerOrders.length === 0" class="text-center py-12 text-gray-500">
                       <p>Nessun ordine trovato per questo cliente.</p>
                   </div>
                   <div v-else class="space-y-2">
                       <div v-for="order in selectedCustomerOrders" :key="order.id" 
                            class="flex items-center justify-between p-3 border rounded-lg bg-white hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group"
                            @click="handleAction('Dettaglio Ordine', String(order.id))">
                           <div class="flex items-center gap-3">
                               <div class="bg-gray-100 p-2 rounded text-gray-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                   <Package class="h-5 w-5" />
                               </div>
                               <div>
                                   <div class="font-medium text-sm text-gray-900">{{ order.id }}</div>
                                   <div class="text-xs text-gray-500">{{ order.date }}</div>
                               </div>
                           </div>
                           <div class="flex items-center gap-4">
                                <div class="text-right">
                                     <div class="font-bold text-sm">{{ formatCurrency(order.amount) }}</div>
                                     <Badge variant="outline" class="text-[10px] px-1 py-0 h-4 border-gray-200">{{ order.order_status }}</Badge>
                                </div>
                                <Button variant="ghost" size="icon" class="h-8 w-8 text-gray-400 group-hover:text-orange-600">
                                    <span class="sr-only">Dettagli</span>
                                    <ChevronRight class="h-5 w-5" />
                                </Button>
                           </div>
                       </div>
                   </div>
                </div>
                
                <!-- Order Detail View (Nested) -->
                <div v-else class="space-y-4 animate-in slide-in-from-right-2 duration-300">
                    <div class="flex items-center justify-between pb-2 border-b">
                        <Button variant="ghost" size="sm" @click="selectedOrder = null" class="-ml-2 gap-1 text-gray-600 hover:text-gray-900">
                             <ArrowLeft class="h-4 w-4" />
                             Torna alla lista
                        </Button>
                        <div class="text-sm text-gray-500 font-mono">
                            Preordine {{ selectedOrder.id }}
                        </div>
                    </div>

                    <div class="rounded-lg border overflow-hidden">
                        <Table>
                           <TableHeader class="bg-gray-50">
                              <TableRow>
                                 <TableHead>Prodotto</TableHead>
                                 <TableHead class="text-right">Qta</TableHead>
                                 <TableHead class="text-right">Prezzo</TableHead>
                                 <TableHead class="text-right">Totale</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              <TableRow v-for="(item, index) in selectedOrder.items" :key="index">
                                 <TableCell class="font-medium">{{ item.name }}</TableCell>
                                 <TableCell class="text-right">{{ item.quantity }}</TableCell>
                                 <TableCell class="text-right">{{ formatCurrency(item.price) }}</TableCell>
                                 <TableCell class="text-right">{{ formatCurrency(item.price * item.quantity) }}</TableCell>
                              </TableRow>
                           </TableBody>
                        </Table>
                    </div>

                    <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div class="flex flex-col">
                             <span class="text-xs text-gray-500 uppercase tracking-wider">Stato</span>
                             <Badge class="w-fit mt-1">{{ selectedOrder.order_status }}</Badge>
                        </div>
                        <div class="text-right">
                             <div class="text-xs text-gray-500 uppercase tracking-wider">Totale</div>
                             <div class="text-2xl font-bold text-[#ED8900]">{{ formatCurrency(selectedOrder.amount) }}</div>
                        </div>
                    </div>
                </div>
             </TabsContent>
           </Tabs>
           </div>

      </DialogContent>
    </Dialog>

     <!-- Pagination (Footer) -->
    <div class="flex-none flex justify-end mt-0 pt-2" v-if="pagination.pageCount > 1">
       <Pagination :total="pagination.total" :sibling-count="1" show-edges :default-page="1" :page="pagination.page" :items-per-page="pagination.pageSize" @update:page="handlePageChange">
        <PaginationContent v-slot="{ items }">
          <li class="flex items-center">
            <PaginationPrevious />
          </li>

          <template v-for="(item, index) in items">
            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" :is-active="item.value === pagination.page">
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <li class="flex items-center">
            <PaginationNext />
          </li>
        </PaginationContent>
      </Pagination>
    </div>

  </div>
</template>
