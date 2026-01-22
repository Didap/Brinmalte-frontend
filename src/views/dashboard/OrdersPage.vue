<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { MoreHorizontal, ArrowUpDown, Package, Calendar, User, Printer, Download } from 'lucide-vue-next'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useDashboardSearch } from '@/composables/useDashboardSearch'
import { fetchAPI, updateOrderStatus } from '@/services/api'
import { useAuth } from '@/composables/useAuth'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Define Order Interface
interface Order {
    id: number | string;
    order_number: string;
    customerId?: number | string; // Link to profile if available
    customer: string;
    email: string;
    order_status: string;
    date: string;
    rawDate: string; // ISO string for filtering
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

// Filter States
const currentTab = ref('all')
const filterDate = ref<string>('all')
const filterAmount = ref<string>('all')

// Sorting
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const fetchOrders = async (page = 1, pageSize = 10) => {
    try {
        const params = new URLSearchParams()
        params.append('populate', '*')
        params.append('pagination[page]', String(page))
        params.append('pagination[pageSize]', String(pageSize))
        params.append('sort', sortKey.value ? `${sortKey.value}:${sortOrder.value}` : 'createdAt:desc')

        // 1. Tab/Status Filter
        if (currentTab.value !== 'all') {
            params.append('filters[order_status][$eq]', currentTab.value)
        }

        // 2. Date Filter
        if (filterDate.value !== 'all') {
            const now = new Date()
            let startDate: Date | null = null
            
            if (filterDate.value === 'today') {
                startDate = new Date(now.setHours(0,0,0,0))
            } else if (filterDate.value === 'last7days') {
                startDate = new Date(now.setDate(now.getDate() - 7))
            } else if (filterDate.value === 'last30days') {
                startDate = new Date(now.setDate(now.getDate() - 30))
            } else if (filterDate.value === 'last3months') {
                startDate = new Date(now.setDate(now.getDate() - 90))
            }

            if (startDate) {
                params.append('filters[createdAt][$gte]', startDate.toISOString())
            }
        }

        // 3. Amount Filter
        if (filterAmount.value !== 'all') {
             if (filterAmount.value === 'high') { // > 300
                 params.append('filters[total][$gt]', '300')
             } else if (filterAmount.value === 'medium') { // 100-300
                 params.append('filters[total][$gte]', '100')
                 params.append('filters[total][$lte]', '300')
             } else if (filterAmount.value === 'low') { // < 100
                 params.append('filters[total][$lt]', '100')
             }
        }

        // 4. Global Search (ID, Customer Name/Surname/Email/Username)
        if (globalSearchQuery.value) {
            const q = globalSearchQuery.value
            let i = 0
            
            // Search in ID (if numeric)
            if (!isNaN(Number(q))) {
                params.append(`filters[$or][${i}][id][$eq]`, q)
                i++
            }

            // Search in Customer (Name, Surname)
            // Note: Use deep filtering on the relation
            params.append(`filters[$or][${i}][customer][name][$containsi]`, q)
            i++
            params.append(`filters[$or][${i}][customer][surname][$containsi]`, q)
            i++
            
            // Search in Date (createdAt)
            // Use heuristics to avoid matching milliseconds (like "49" matching .493)
            const isNumeric = !isNaN(Number(q))
            const isValidDatePart = isNumeric && (Number(q) <= 31 || (q.length === 4 && Number(q) > 1900))
            
            if (!isNumeric || isValidDatePart) {
                params.append(`filters[$or][${i}][createdAt][$containsi]`, q) 
                i++
            }
        }

        const response = await fetchAPI<any>(`/orders?${params.toString()}`, {}, {
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
                     order_number: attrs.order_number || `#${o.id}`,
                     customerId: customerId,
                     customer: nameFromRelation || attrs.customer_name || 'Cliente Sconosciuto',
                     email: attrs.customer_email || 'No Email',
                     order_status: attrs.order_status, 
                     date: attrs.createdAt ? new Date(attrs.createdAt).toLocaleDateString('it-IT') : 'N/A',
                     rawDate: attrs.createdAt, // Store ISO string for filtering
                     amount: Number(attrs.total || 0),
                     items: (attrs.items || []).map((i: any) => ({
                         name: i.product_name || i.name || 'Prodotto sconosciuto',
                         quantity: Number(i.quantity || 0),
                         price: Number(i.unit_price || i.price || 0)
                     }))
                 }
             })
        } else {
            orders.value = [] // clear if no data
        }
    } catch (e) {
        console.error('Failed to fetch orders', e)
        orders.value = []
    }
}

const handlePageChange = (page: number) => {
    fetchOrders(page, pagination.value.pageSize)
}

// Watchers for server-side re-fetching

watch([currentTab, filterAmount, filterDate, globalSearchQuery], () => {
    // Reset to page 1 on filter change
    fetchOrders(1, pagination.value.pageSize)
})

watch([sortKey, sortOrder], () => {
    fetchOrders(pagination.value.page, pagination.value.pageSize)
})

onMounted(() => {
    fetchOrders()
})

// Details Dialog State
const isDetailsOpen = ref(false)
const selectedOrder = ref<Order | null>(null)

// Cancel Dialog State
const isCancelDialogOpen = ref(false)
const orderToCancel = ref<string | null>(null)
const isCancelling = ref(false)

// Update Status Dialog State
const isStatusDialogOpen = ref(false)
const orderToUpdate = ref<string | null>(null)
const newStatus = ref<string>('pending')
const isUpdatingStatus = ref(false)

const statusOptions = [
    { value: 'pending', label: 'In attesa' },
    { value: 'paid', label: 'Pagato' },
    { value: 'processing', label: 'In lavorazione' },
    { value: 'shipped', label: 'Spedito' },
    { value: 'delivered', label: 'Consegnato' },
    { value: 'cancelled', label: 'Cancellato' }
]

const handleSort = (key: string) => {
  let apiSortKey = key
  
  // Map frontend column names to API sort paths
  if (key === 'customer_name') apiSortKey = 'customer.name'
  if (key === 'date') apiSortKey = 'createdAt'
  
  if (sortKey.value === apiSortKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = apiSortKey
    sortOrder.value = 'asc'
  }
}

const getStatusColor = (order_status: string) => {
  switch(order_status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
    case 'processing': return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    case 'shipped': return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    case 'delivered': return 'bg-green-100 text-green-700 hover:bg-green-200'
    case 'paid': return 'bg-green-100 text-green-700 hover:bg-green-200'
    case 'cancelled': return 'bg-red-100 text-red-700 hover:bg-red-200'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusLabel = (order_status: string) => {
  switch(order_status) {
    case 'pending': return 'In attesa'
    case 'processing': return 'In lavorazione'
    case 'shipped': return 'Spedito'
    case 'delivered': return 'Consegnato'
    case 'paid': return 'Pagato'
    case 'cancelled': return 'Cancellato'
    default: return order_status
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

const handleExport = async () => {
  try {
    // Fetch ALL orders for export (no pagination limit)
    const params = new URLSearchParams()
    params.append('populate', '*')
    params.append('pagination[limit]', '-1') // Get all
    params.append('sort', 'createdAt:desc')
    
    const response = await fetchAPI<any>(`/orders?${params.toString()}`, {}, {
        headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (!response.data || response.data.length === 0) {
        toast.warning('Nessun ordine da esportare')
        return
    }
    
    // Build CSV content
    const headers = ['N. Ordine', 'Cliente', 'Email', 'Stato', 'Data', 'Totale (€)']
    const rows = response.data.map((o: any) => {
        const attrs = o.attributes || o
        const customerData = attrs.customer?.data?.attributes || attrs.customer?.attributes || attrs.customer
        const customerName = customerData 
            ? `${customerData.name || ''} ${customerData.surname || ''}`.trim() 
            : attrs.customer_name || 'N/A'
        
        return [
            attrs.order_number || o.id,
            customerName,
            attrs.customer_email || 'N/A',
            getStatusLabel(attrs.order_status),
            attrs.createdAt ? new Date(attrs.createdAt).toLocaleDateString('it-IT') : 'N/A',
            Number(attrs.total || 0).toFixed(2).replace('.', ',')
        ]
    })
    
    // Create CSV string
    const csvContent = [
        headers.join(';'),
        ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n')
    
    // Download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ordini_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Esportati ${response.data.length} ordini`)
  } catch (e: any) {
    console.error('Export failed:', e)
    toast.error('Errore durante l\'esportazione')
  }
}



const generateInvoice = (order: Order) => {
  try {
      const doc = new jsPDF()
      
      // Branding
      doc.setFontSize(22)
      doc.setTextColor(237, 137, 0) // BrinMalte Orange
      doc.text('BrinMalte', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text('Documento di Vendita', 14, 26)
      
      // Order Info
      doc.setTextColor(0)
      doc.setFontSize(11)
      doc.text(`Ordine N: ${order.order_number || order.id}`, 14, 40)
      doc.text(`Data: ${order.date}`, 14, 46)
      doc.text(`Stato: ${getStatusLabel(order.order_status)}`, 14, 52)
      
      // Customer Info (Right aligned approx)
      doc.text('Cliente:', 120, 40)
      doc.setFont("helvetica", "bold")
      doc.text(order.customer, 120, 46)
      doc.setFont("helvetica", "normal")
      doc.text(order.email, 120, 52)
      
      // Items Table
      const tableBody = order.items.map((item: any) => [
          item.name,
          item.quantity,
          formatCurrency(item.price),
          formatCurrency(item.price * item.quantity)
      ])
      
      const tableOptions: any = {
          startY: 65,
          head: [['Prodotto', 'Q.ta', 'Prezzo Unit.', 'Totale']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [237, 137, 0], textColor: 255 },
          styles: { fontSize: 10 },
      }

      // Robust autoTable call
      if (typeof autoTable === 'function') {
          autoTable(doc, tableOptions)
      } else if ((doc as any).autoTable) {
          (doc as any).autoTable(tableOptions)
      } else {
           // Fallback if no table plugin (should not happen)
           let y = 65
           doc.text('Dettaglio Prodotti:', 14, y)
           y += 10
           order.items.forEach((item: any) => {
                doc.text(`${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`, 14, y)
                y += 7
           })
           // Mock finalY for total
           ;(doc as any).lastAutoTable = { finalY: y }
      }
      
      // Total
      const finalY = ((doc as any).lastAutoTable?.finalY || 100) + 15
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text(`Totale: ${formatCurrency(order.amount)}`, 140, finalY)
      
      const filenameId = order.order_number || order.id || 'ordine'
      const sanitizedId = String(filenameId).replace(/[^a-zA-Z0-9-_]/g, '_')
      doc.save(`Fattura_BrinMalte_${sanitizedId}.pdf`)
      toast.success('Fattura scaricata con successo')
  } catch (e: any) {
      console.error('PDF Generation Error:', e)
      toast.error(`Errore generazione PDF: ${e.message || 'Libreria mancante'}`)
  }
}

const handleAction = (action: string, orderId: string) => {
  const order = orders.value.find(o => String(o.id) === orderId)

  if (action === 'Vedi dettagli') {
      if (order) {
          selectedOrder.value = order
          isDetailsOpen.value = true
      }
  } else if (action === 'Stampa Fattura') {
      if (order) generateInvoice(order)
  } else if (action === 'Cancella ordine') {
      orderToCancel.value = orderId
      isCancelDialogOpen.value = true
  } else if (action === 'Aggiorna stato') {
      orderToUpdate.value = orderId
      // Set current status as default
      if (order) {
          newStatus.value = order.order_status || 'pending'
      }
      isStatusDialogOpen.value = true
  } else {
      toast.info(`Azione "${action}" non ancora implementata`)
  }
}

const confirmCancelOrder = async () => {
  if (!orderToCancel.value) return
  
  isCancelling.value = true
  try {
      // Get documentId from order
      const response = await fetchAPI<any>(`/orders?filters[id][$eq]=${orderToCancel.value}`, {}, {
          headers: { Authorization: `Bearer ${token.value}` }
      })
      
      const documentId = response.data?.[0]?.documentId
      if (!documentId) throw new Error('Order not found')
      
      await updateOrderStatus(documentId, 'cancelled')
      toast.success('Ordine cancellato con successo')
      
      // Refresh orders
      await fetchOrders(pagination.value.page, pagination.value.pageSize)
  } catch (e: any) {
      console.error('Failed to cancel order:', e)
      toast.error(`Errore: ${e.message || 'Impossibile cancellare l\'ordine'}`)
  } finally {
      isCancelling.value = false
      isCancelDialogOpen.value = false
      orderToCancel.value = null
  }
}

const confirmUpdateStatus = async () => {
  if (!orderToUpdate.value) return
  
  isUpdatingStatus.value = true
  try {
      // Get documentId from order
      const response = await fetchAPI<any>(`/orders?filters[id][$eq]=${orderToUpdate.value}`, {}, {
          headers: { Authorization: `Bearer ${token.value}` }
      })
      
      const documentId = response.data?.[0]?.documentId
      if (!documentId) throw new Error('Order not found')
      
      await updateOrderStatus(documentId, newStatus.value)
      const statusLabel = statusOptions.find(s => s.value === newStatus.value)?.label || newStatus.value
      toast.success(`Stato aggiornato a "${statusLabel}"`)
      
      // Refresh orders
      await fetchOrders(pagination.value.page, pagination.value.pageSize)
  } catch (e: any) {
      console.error('Failed to update order status:', e)
      toast.error(`Errore: ${e.message || 'Impossibile aggiornare lo stato'}`)
  } finally {
      isUpdatingStatus.value = false
      isStatusDialogOpen.value = false
      orderToUpdate.value = null
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
                <Download class="w-4 h-4 mr-2" />
                Esporta CSV
            </Button>
        </div>
        </div>

        <!-- Tabs Filtering -->
        <Tabs default-value="all" v-model="currentTab" class="w-full">
        <TabsList class="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value="pending">In attesa</TabsTrigger>
            <TabsTrigger value="paid">Pagati</TabsTrigger>
            <TabsTrigger value="processing">In lavorazione</TabsTrigger>
            <TabsTrigger value="shipped">Spediti</TabsTrigger>
            <TabsTrigger value="delivered">Consegnati</TabsTrigger>
            <TabsTrigger value="cancelled">Cancellati</TabsTrigger>
        </TabsList>
        </Tabs>
    </div>

    <!-- Table (Flex Grow + Scroll) -->
    <div class="flex-1 rounded-md border bg-white overflow-hidden flex flex-col min-h-0 relative shadow-sm">
      <div class="overflow-auto flex-1 w-full relative">
        <Table>
            <TableHeader class="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
                <TableHead class="w-[140px] cursor-pointer hover:bg-gray-50" @click="handleSort('order_number')">
                <div class="flex items-center gap-2">
                    N. Ordine <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('customer_name')">
                <div class="flex items-center gap-2">
                    Cliente <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('order_status')">
                <div class="flex items-center gap-2">
                    Stato <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('createdAt')">
                <div class="flex items-center gap-2">
                    Data <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead class="text-right cursor-pointer hover:bg-gray-50" @click="handleSort('total')">
                <div class="flex items-center justify-end gap-2">
                    Importo <ArrowUpDown class="w-4 h-4" />
                </div>
                </TableHead>
                <TableHead></TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            <TableRow v-for="order in orders" :key="order.id" @click="handleAction('Vedi dettagli', String(order.id))" class="cursor-pointer hover:bg-gray-50">
                <TableCell class="font-medium font-mono text-sm">{{ order.order_number }}</TableCell>
                <TableCell>
                <div class="flex flex-col">
                    <span class="font-medium">{{ order.customer }}</span>
                    <span class="text-xs text-gray-500">{{ order.email }}</span>
                </div>
                </TableCell>
                <TableCell>
                <Badge class="rounded-md font-normal" :class="getStatusColor(order.order_status)">
                    {{ getStatusLabel(order.order_status) }}
                </Badge>
                </TableCell>
                <TableCell>{{ order.date }}</TableCell>
                <TableCell class="text-right font-bold">{{ formatCurrency(order.amount) }}</TableCell>
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
                    <DropdownMenuItem @click="handleAction('Vedi dettagli', String(order.id))">Vedi dettagli</DropdownMenuItem>
                    <DropdownMenuItem @click="handleAction('Aggiorna stato', String(order.id))">Aggiorna stato</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-600" @click="handleAction('Cancella ordine', String(order.id))">Cancella ordine</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
            <TableRow v-if="orders.length === 0" class="h-full">
                 <TableCell colspan="6" class="text-center h-full py-10">Nessun ordine trovato.</TableCell>
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
                        <Badge :class="getStatusColor(selectedOrder.order_status)" class="mb-1">
                            {{ getStatusLabel(selectedOrder.order_status) }}
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

    <!-- Cancel Order Alert Dialog -->
    <AlertDialog v-model:open="isCancelDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma cancellazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler cancellare questo ordine? Questa azione aggiornerà lo stato dell'ordine a "Cancellato".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isCancelling">Annulla</AlertDialogCancel>
          <AlertDialogAction 
            class="bg-red-600 hover:bg-red-700 text-white" 
            :disabled="isCancelling"
            @click="confirmCancelOrder"
          >
            {{ isCancelling ? 'Cancellazione...' : 'Conferma' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Update Status Dialog -->
    <Dialog v-model:open="isStatusDialogOpen">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Aggiorna stato ordine</DialogTitle>
          <DialogDescription>
            Seleziona il nuovo stato per questo ordine.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Select v-model="newStatus">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="isStatusDialogOpen = false" :disabled="isUpdatingStatus">
            Annulla
          </Button>
          <Button 
            class="bg-[#ED8900] hover:bg-orange-600 text-white" 
            :disabled="isUpdatingStatus"
            @click="confirmUpdateStatus"
          >
            {{ isUpdatingStatus ? 'Aggiornamento...' : 'Aggiorna' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
