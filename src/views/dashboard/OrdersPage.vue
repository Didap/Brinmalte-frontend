<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MoreHorizontal, ArrowUpDown, Package, Calendar, User, Printer } from 'lucide-vue-next'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useDashboardSearch } from '@/composables/useDashboardSearch'
import { fetchAPI } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

// Define Order Interface
interface Order {
    id: number | string;
    customerId?: number | string; // Link to profile if available
    customer: string;
    email: string;
    status: string;
    date: string;
    amount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
}

const orders = ref<Order[]>([])
const { globalSearchQuery } = useDashboardSearch() // Use global search
const { token } = useAuth()

const pagination = ref({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0
})

const fetchOrders = async (page = 1, pageSize = 10) => {
    try {
        const queryParams = `?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`
        const response = await fetchAPI<any>(`/orders${queryParams}`, {}, {
             headers: { Authorization: `Bearer ${token.value}` }
        })
        
        if (response.meta && response.meta.pagination) {
            pagination.value = response.meta.pagination
        }

        if (response && response.data) {
             orders.value = response.data.map((o: any) => {
                 // Support both Strapi v4 (attributes) and v5/flat structures
                 const attrs = o.attributes || o
                 
                 // Safe navigation for customer data
                 const customerData = attrs.customer?.data?.attributes || attrs.customer?.attributes || attrs.customer
                 const customerId = attrs.customer?.data?.id || attrs.customer?.id
                 
                 const nameFromRelation = customerData && (customerData.name || customerData.surname)
                    ? `${customerData.name || ''} ${customerData.surname || ''}`.trim() 
                    : null

                 return {
                     id: o.id,
                     customerId: customerId,
                     customer: nameFromRelation || attrs.customer_name || 'Cliente Sconosciuto',
                     email: attrs.customer_email || 'No Email',
                     status: attrs.status, 
                     date: attrs.createdAt ? new Date(attrs.createdAt).toLocaleDateString('it-IT') : 'N/A',
                     amount: Number(attrs.total || 0),
                     items: attrs.items || [] 
                 }
             })
        }
    } catch (e) {
        console.error('Failed to fetch orders', e)
    }
}

const handlePageChange = (page: number) => {
    fetchOrders(page, pagination.value.pageSize)
}

onMounted(() => {
    fetchOrders()
})

const currentTab = ref('all')
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

// Quick Filters State
const filterDate = ref<string>('all')
const filterAmount = ref<string>('all')

// Details Dialog State
const isDetailsOpen = ref(false)
const selectedOrder = ref<Order | null>(null)

// ... (existing computed/functions) ...

const filteredOrders = computed(() => {
  let result = orders.value

  // Tabs Filter (Status)
  if (currentTab.value !== 'all') {
    result = result.filter(order => order.status === currentTab.value)
  }

  // Quick Filters: Amount
  if (filterAmount.value === 'high') {
    result = result.filter(order => order.amount > 300)
  } else if (filterAmount.value === 'medium') {
    result = result.filter(order => order.amount >= 100 && order.amount <= 300)
  } else if (filterAmount.value === 'low') {
    result = result.filter(order => order.amount < 100)
  }

  // Quick Filters: Date
  if (filterDate.value !== 'all') {
     const today = new Date()
     result = result.filter(order => {
        const orderDate = new Date(order.date)
        const diffTime = Math.abs(today.getTime() - orderDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (filterDate.value === 'today') return diffDays <= 1
        if (filterDate.value === 'last7days') return diffDays <= 7
        if (filterDate.value === 'last30days') return diffDays <= 30
        if (filterDate.value === 'last3months') return diffDays <= 90
        return true
     })
  }

    // Global Search Filter
    if (globalSearchQuery.value) {
      const query = globalSearchQuery.value.toLowerCase()
      result = result.filter(order => 
        String(order.id).toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query)
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
    case 'Completed': return 'bg-green-100 text-green-700 hover:bg-green-200'
    case 'Processing': return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    case 'Cancelled': return 'bg-red-100 text-red-700 hover:bg-red-200'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'Completed': return 'Completato'
    case 'Processing': return 'In lavorazione'
    case 'Cancelled': return 'Cancellato'
    default: return status
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

const handleExport = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).alert('Funzionalità di esportazione CSV avviata!')
}

const handleAction = (action: string, orderId: string) => {
  const order = orders.value.find(o => o.id === orderId)

  if (action === 'Vedi dettagli') {
      if (order) {
          selectedOrder.value = order
          isDetailsOpen.value = true
      }
  } else if (action === 'Stampa Fattura') {
      window.print()
  } else if (action === 'Cancella ordine') {
      if (confirm('Sei sicuro?')) {
          // Logic to delete
          (window as any).alert(`Ordine ${orderId} cancellato`)
      }
  } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).alert(`Azione "${action}" eseguita sull'ordine ${orderId}`)
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] gap-4">
    <!-- Header Section (Fixed) -->
    <div class="flex-none space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold tracking-tight text-[#4B4846]">Ordini</h2>
            <p class="text-gray-500">Gestisci e monitora tutti gli ordini dei clienti.</p>
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
            <!-- Date Filter -->
            <Select v-model="filterDate">
                <SelectTrigger class="w-full sm:w-[180px] bg-white">
                    <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Oggi</SelectItem>
                    <SelectItem value="last7days">Ultimi 7 giorni</SelectItem>
                    <SelectItem value="last30days">Ultimi 30 giorni</SelectItem>
                    <SelectItem value="last3months">Ultimi 3 mesi</SelectItem>
                    <SelectItem value="all">Tutto il periodo</SelectItem>
                </SelectContent>
            </Select>

            <!-- Amount Filter -->
            <Select v-model="filterAmount">
                <SelectTrigger class="w-full sm:w-[180px] bg-white">
                    <SelectValue placeholder="Importo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Qualsiasi Importo</SelectItem>
                    <SelectItem value="high">Alto (> 300€)</SelectItem>
                    <SelectItem value="medium">Medio (100-300€)</SelectItem>
                    <SelectItem value="low">Basso (&lt; 100€)</SelectItem>
                </SelectContent>
            </Select>

            <Button class="w-full sm:w-auto bg-[#ED8900] hover:bg-orange-600 text-white sm:ml-2 mt-2 sm:mt-0" @click="handleExport">
                <Printer class="w-4 h-4 mr-2" />
                Esporta
            </Button>
        </div>
        </div>

        <!-- Tabs Filtering -->
        <Tabs default-value="all" v-model="currentTab" class="w-full">
        <TabsList>
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value="Completed">Completati</TabsTrigger>
            <TabsTrigger value="Processing">In lavorazione</TabsTrigger>
            <TabsTrigger value="Cancelled">Cancellati</TabsTrigger>
        </TabsList>
        </Tabs>
    </div>

    <!-- Table (Flex Grow + Scroll) -->
    <div class="flex-1 rounded-md border bg-white overflow-hidden flex flex-col min-h-0 relative shadow-sm">
      <div class="overflow-auto flex-1 w-full relative">
        <Table class="h-full">
            <TableHeader class="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
                <TableHead class="w-[100px] cursor-pointer hover:bg-gray-50" @click="handleSort('id')">
                <div class="flex items-center gap-2">
                    ID Ordine <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('customer')">
                <div class="flex items-center gap-2">
                    Cliente <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('status')">
                <div class="flex items-center gap-2">
                    Stato <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('date')">
                <div class="flex items-center gap-2">
                    Data <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="text-right cursor-pointer hover:bg-gray-50" @click="handleSort('amount')">
                <div class="flex items-center justify-end gap-2">
                    Importo <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead></TableHead>
            </TableRow>
            </TableHeader>
            <TableBody class="h-full">
            <TableRow v-for="order in filteredOrders" :key="order.id">
                <TableCell class="font-medium">{{ order.id }}</TableCell>
                <TableCell>
                <div class="flex flex-col">
                    <span class="font-medium">{{ order.customer }}</span>
                    <span class="text-xs text-gray-500">{{ order.email }}</span>
                </div>
                </TableCell>
                <TableCell>
                <Badge class="rounded-md font-normal" :class="getStatusColor(order.status)">
                    {{ getStatusLabel(order.status) }}
                </Badge>
                </TableCell>
                <TableCell>{{ order.date }}</TableCell>
                <TableCell class="text-right font-bold">{{ formatCurrency(order.amount) }}</TableCell>
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
                    <DropdownMenuItem @click="handleAction('Vedi dettagli', String(order.id))">Vedi dettagli</DropdownMenuItem>
                    <DropdownMenuItem @click="handleAction('Aggiorna stato', String(order.id))">Aggiorna stato</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-600" @click="handleAction('Cancella ordine', String(order.id))">Cancella ordine</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
            <TableRow v-if="filteredOrders.length === 0" class="h-full">
                 <TableCell colspan="6" class="text-center h-full">Nessun ordine trovato.</TableCell>
            </TableRow>
            </TableBody>
        </Table>
      </div>
    </div>

    <!-- Order Details Dialog -->
    <Dialog v-model:open="isDetailsOpen">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
              <Package class="h-5 w-5 text-orange-600" />
              Dettaglio Ordine {{ selectedOrder?.id }}
          </DialogTitle>
          <DialogDescription>
            Informazioni complete sull'ordine.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedOrder" class="space-y-6">
            <!-- Info Cards -->
            <div class="grid grid-cols-2 gap-4">
                 <Card>
                     <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium">Cliente</CardTitle>
                        <User class="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        <div class="font-bold">{{ selectedOrder.customer }}</div>
                        <p class="text-xs text-muted-foreground">{{ selectedOrder.email }}</p>
                     </CardContent>
                 </Card>
                 <Card>
                     <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium">Stato & Data</CardTitle>
                        <Calendar class="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        <Badge :class="getStatusColor(selectedOrder.status)" class="mb-1">
                            {{ getStatusLabel(selectedOrder.status) }}
                        </Badge>
                        <p class="text-xs text-muted-foreground">{{ selectedOrder.date }}</p>
                     </CardContent>
                 </Card>
            </div>

            <!-- Items Table -->
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

            <!-- Footer Summary -->
            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                <div>
                     <Button variant="outline" @click="handleAction('Stampa Fattura', String(selectedOrder.id))">
                        <Printer class="w-4 h-4 mr-2" />
                        Stampa Fattura
                     </Button>
                </div>
                <div class="text-right">
                     <div class="text-xs text-gray-500 uppercase tracking-wider">Totale Ordine</div>
                     <div class="text-2xl font-bold text-[#ED8900]">{{ formatCurrency(selectedOrder.amount) }}</div>
                </div>
            </div>
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
