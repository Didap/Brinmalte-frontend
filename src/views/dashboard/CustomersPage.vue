<script setup lang="ts">
import { ref, computed } from 'vue'
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
  DropdownMenuSeparator, 
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
import { MoreHorizontal, ArrowUpDown, Euro, ShoppingBag, Mail, Ban, Package, ChevronRight, ArrowLeft } from 'lucide-vue-next'
import { useDashboardSearch } from '@/composables/useDashboardSearch' // Import composable

import { customers as customersData, type Customer } from '@/data/customers'
import { orders as ordersData, type Order } from '@/data/orders'

const customers = ref(customersData)
const { globalSearchQuery } = useDashboardSearch() // Use global search

const currentTab = ref('all')
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

// Quick Filters State
const filterSpent = ref<string>('all')
const filterOrders = ref<string>('all')

// Profile Sheet State
const isProfileOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)

// Order Details Dialog State
const selectedOrder = ref<Order | null>(null)

const selectedCustomerOrders = computed(() => {
    if (!selectedCustomer.value) return []
    // Match by email as it is unique
    return ordersData.filter(o => o.email === selectedCustomer.value?.email)
})

const filteredCustomers = computed(() => {
  let result = customers.value

  // Tabs Filter
  if (currentTab.value !== 'all') {
    result = result.filter(c => c.status === currentTab.value)
  }

  // Quick Filters: Spent
  if (filterSpent.value === 'high') {
    result = result.filter(c => c.spent > 1000)
  } else if (filterSpent.value === 'medium') {
    result = result.filter(c => c.spent > 500)
  }

  // Quick Filters: Orders
  if (filterOrders.value === 'frequent') {
    result = result.filter(c => c.orders > 5)
  }

  // Filter
  if (globalSearchQuery.value) {
    const query = globalSearchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    )
  }

  // Sort
  if (sortKey.value) {
    result = [...result].sort((a: any, b: any) => {
      let valA = a[sortKey.value!]
      let valB = b[sortKey.value!]
      
      if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
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

const handleCreate = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).alert('Creazione nuovo cliente avviata!')
}

const handleAction = (action: string, customerId: string) => {
  const customer = customers.value.find(c => c.id === customerId)

  if (action === 'Vedi profilo') {
      if (customer) {
        selectedCustomer.value = customer
        selectedOrder.value = null // Reset order detail view
        isProfileOpen.value = true
      }
  } else if (action === 'Invia email') {
      if (customer) window.location.href = `mailto:${customer.email}`
  } else if (action === 'Dettaglio Ordine') {
      // Find the order by ID (customerId here actually carries orderId from the button payload)
      const order = ordersData.find(o => o.id === customerId)
      if (order) {
          selectedOrder.value = order
          // We don't open a new dialog, we just set the selectedOrder which triggers the view in the tab
      }
  } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).alert(`Azione "${action}" eseguita sul cliente ${customerId}`)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-[#4B4846]">Clienti</h2>
        <p class="text-gray-500">Gestisci i dati dei tuoi clienti.</p>
      </div>
      <div class="flex items-center gap-2 w-full md:w-auto">


         <Button class="w-full md:w-auto bg-[#ED8900] hover:bg-orange-600 text-white" @click="handleCreate">Nuovo Cliente</Button>
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

    <!-- Table -->
    <div class="rounded-md border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
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
          <TableRow v-for="customer in filteredCustomers" :key="customer.id">
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
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" class="h-8 w-8 p-0">
                    <span class="sr-only">Open menu</span>
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                  <DropdownMenuItem @click="handleAction('Vedi profilo', customer.id)">Vedi profilo</DropdownMenuItem>
                  <DropdownMenuItem @click="handleAction('Invia email', customer.id)">Invia email</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-red-600" @click="handleAction('Blocca utente', customer.id)">Blocca utente</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
                        <Button variant="outline" class="h-auto py-4 flex flex-col gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200" @click="handleAction('Invia email', selectedCustomer.id)">
                            <Mail class="h-5 w-5" />
                            <span>Invia Email</span>
                        </Button>
                        <Button variant="outline" class="h-auto py-4 flex flex-col gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-red-600 border-red-100" @click="handleAction('Blocca utente', selectedCustomer.id)">
                            <Ban class="h-5 w-5" />
                            <span>Blocca Cliente</span>
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
                            @click="handleAction('Dettaglio Ordine', order.id)">
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
                                     <Badge variant="outline" class="text-[10px] px-1 py-0 h-4 border-gray-200">{{ order.status }}</Badge>
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
                             <Badge class="w-fit mt-1">{{ selectedOrder.status }}</Badge>
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

  </div>
</template>
