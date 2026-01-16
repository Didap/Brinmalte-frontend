<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuCheckboxItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, ArrowUpDown, Plus, Filter, Package, Loader2 } from 'lucide-vue-next'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useDashboardSearch } from '@/composables/useDashboardSearch'
import { useProducts } from '@/composables/useProducts'
import { useCategories } from '@/composables/useCategories'
import type { Product } from '@/data/products'

// Helper function to extract stock number
const getStock = (availability: string | undefined): number => {
  if (!availability) return 0
  const val = String(availability)
  const match = val.match(/\((\d+)\s*pz\)/)
  return match ? parseInt(match[1] || '0') : 0
}

const getStatusColor = (stock: number) => {
  if (stock > 50) return 'bg-green-100 text-green-700 hover:bg-green-200'
  if (stock > 10) return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  if (stock > 0) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  return 'bg-red-100 text-red-700 hover:bg-red-200'
}

const { globalSearchQuery } = useDashboardSearch()
const { products, pagination, fetchProducts, createProduct, updateProduct, deleteProduct, loading: productsLoading } = useProducts()
const { categories, fetchCategories } = useCategories()

// handlePageChange is now defined below with other filter logic

const currentTab = ref('all')

onMounted(() => {
    fetchWithFilters()
    fetchCategories()
})
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const filterPrice = ref<string>('all')

// Dialog States
const isEditOpen = ref(false)
const isStockOpen = ref(false)
const stockQuantity = ref(0)

type ProductFormState = Omit<Partial<Product>, 'categoryId'> & { categoryId?: string }
const selectedProduct = ref<ProductFormState>({}) 

// File Upload State
const selectedFile = ref<File | undefined>(undefined)

const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        selectedFile.value = input.files[0]
    }
}

const fetchWithFilters = (page = 1) => {
    const params = new URLSearchParams()
    
    // 1. Sort
    if (sortKey.value) {
        if (sortKey.value === 'stock') {
             // Stock sort might need special handling if it's computed? 
             // In Strapi, if 'stock' is a field, it works. 'availability' is computed on frontend but 'stock' is real.
             params.append('sort', `stock:${sortOrder.value}`)
        } else {
             params.append('sort', `${sortKey.value}:${sortOrder.value}`)
        }
    } else {
        params.append('sort', 'createdAt:desc')
    }

    // 2. Tabs (Availability)
    if (currentTab.value !== 'all') {
        if (currentTab.value === 'available') {
            params.append('filters[stock][$gt]', '0')
        } else if (currentTab.value === 'low_stock') {
            params.append('filters[stock][$gt]', '0')
            params.append('filters[stock][$lte]', '10')
        } else if (currentTab.value === 'out_of_stock') {
            params.append('filters[stock][$eq]', '0')
        }
    }

    // 3. Price Filter
    if (filterPrice.value !== 'all') {
        if (filterPrice.value === 'low') { // < 20
            params.append('filters[price][$lt]', '20')
        } else if (filterPrice.value === 'medium') { // 20-50
            params.append('filters[price][$gte]', '20')
            params.append('filters[price][$lte]', '50')
        } else if (filterPrice.value === 'high') { // > 50
            params.append('filters[price][$gt]', '50')
        }
    }

    // 4. Global Search
    if (globalSearchQuery.value) {
        const q = globalSearchQuery.value
        let i = 0
        
        // Name
        params.append(`filters[$or][${i}][name][$containsi]`, q)
        i++

        // SKU
        params.append(`filters[$or][${i}][sku][$containsi]`, q)
        i++
        
        // Also description might be useful? User only asked for Name and SKU.
    }

    fetchProducts(page, pagination.value.pageSize, params)
}

const handlePageChange = (page: number) => {
    fetchWithFilters(page)
}

// Watchers
import { watch } from 'vue'

watch([currentTab, filterPrice, globalSearchQuery], () => {
    fetchWithFilters(1)
})

watch([sortKey, sortOrder], () => {
    fetchWithFilters(pagination.value.page)
})

// Initial Fetch replaced by onMounted below
/* 
const filteredProducts = computed(() => { ... }) REMOVED
*/

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const handleCreate = () => {
    selectedProduct.value = { 
        name: '', 
        price: '0.00', 
        stock: 0,
        sku: '', 
        image: '', 
        subtitle: '', 
        description: '',
        categoryId: undefined 
    }
    selectedFile.value = undefined
    isEditOpen.value = true
}

const handleAction = async (action: string, productId: number | string) => {
  const p = products.value.find(p => p.id === productId)

  if (action === 'Modifica') {
    if (p) {
        // Safe cast for form compatibility
        const { categoryId, category, ...rest } = p
        selectedProduct.value = {
            ...rest,
            categoryId: category ? String((category as any).id || categoryId) : (categoryId ? String(categoryId) : undefined)
        }
        selectedFile.value = undefined // Reset file on edit open
        isEditOpen.value = true
    }
  } else if (action === 'Gestisci Stock') {
      if (p) {
          const { categoryId, category, ...rest } = p
          selectedProduct.value = { 
            ...rest,
            categoryId: category ? String((category as any).id || categoryId) : (categoryId ? String(categoryId) : undefined)
          }
          stockQuantity.value = getStock(p.availability)
          isStockOpen.value = true
      }
  } else if (action === 'Elimina prodotto') {
      if (confirm('Sei sicuro di voler eliminare DEFINITIVAMENTE questo prodotto?')) {
          const success = await deleteProduct(productId)
          if (success) {
               ;(window as any).alert(`Prodotto ${productId} eliminato con successo.`)
          }
      }
  }
}

const handleSave = async () => {
    if (!selectedProduct.value.name || !selectedProduct.value.price) return

    if (!selectedProduct.value.id) {
        // New Product
        const success = await createProduct({
            ...selectedProduct.value,
            category: selectedProduct.value.categoryId // Fix category field expected by backend if needed
        } as any, selectedFile.value)
        
        if (success) {
            isEditOpen.value = false
            ;(window as any).alert('Prodotto creato con successo!')
        }
    } else {
        // Update Product
        const success = await updateProduct(selectedProduct.value.id, {
            ...selectedProduct.value
        } as any, selectedFile.value)

        if (success) {
            isEditOpen.value = false
             ;(window as any).alert('Prodotto modificato con successo!')
        }
    }
}

const handleSaveStock = async () => {
    if (!selectedProduct.value.id) return
    const success = await updateProduct(selectedProduct.value.id, { 
        ...selectedProduct.value,
        stock: stockQuantity.value 
    } as any)

    if (success) {
        isStockOpen.value = false;
        ;(window as any).alert(`Stock aggiornato a ${stockQuantity.value} pz!`);
    }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] gap-4">
    <!-- Header Section (Fixed) -->
    <div class="flex-none space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold tracking-tight text-[#4B4846]">Prodotti</h2>
            <p class="text-gray-500">Gestisci il catalogo prodotti e l'inventario.</p>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                <Button variant="outline" class="w-full md:w-auto" :class="{'bg-orange-50 border-orange-200 text-orange-700': filterPrice !== 'all'}">
                    <Filter class="w-4 h-4 mr-2" /> 
                    Filtra
                    <span v-if="filterPrice !== 'all'" class="ml-2 flex h-2 w-2 rounded-full bg-orange-600"></span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                    <DropdownMenuLabel>Filtra per Prezzo</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem :checked="filterPrice == 'all'" @click="filterPrice = 'all'">Tutti i prezzi</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem :checked="filterPrice == 'low'" @click="filterPrice = 'low'">Economico (< 20€)</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem :checked="filterPrice == 'medium'" @click="filterPrice = 'medium'">Medio (20€ - 50€)</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem :checked="filterPrice == 'high'" @click="filterPrice = 'high'">Premium (> 50€)</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button class="w-full md:w-auto bg-[#ED8900] hover:bg-orange-600 text-white" @click="handleCreate">
                <Plus class="w-4 h-4 mr-2" />
                Nuovo Prodotto
            </Button>
        </div>
        </div>

        <!-- Tabs Filtering -->
        <Tabs default-value="all" v-model="currentTab" class="w-full">
        <TabsList>
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value="available">Disponibili</TabsTrigger>
            <TabsTrigger value="low_stock">In esaurimento</TabsTrigger>
            <TabsTrigger value="out_of_stock">Esauriti</TabsTrigger>
        </TabsList>
        </Tabs>
    </div>

    <!-- Table (Flex Grow + Scroll) -->
    <div class="flex-1 rounded-md border bg-white overflow-hidden flex flex-col min-h-0 relative shadow-sm">
      <div class="flex-1 rounded-md border bg-white overflow-hidden flex flex-col min-h-0 relative shadow-sm">
      <div class="overflow-auto flex-1 w-full relative">
        <Table>
            <TableHeader class="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
                <TableHead class="w-[80px]">Immagine</TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('name')">
                <div class="flex items-center gap-2">Nome Prodotto <ArrowUpDown class="w-4 h-4" /></div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('sku')">
                <div class="flex items-center gap-2">SKU <ArrowUpDown class="w-4 h-4" /></div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-gray-50" @click="handleSort('stock')">
                <div class="flex items-center gap-2">Stock <ArrowUpDown class="w-4 h-4" /></div>
                </TableHead>
                <TableHead class="text-right cursor-pointer hover:bg-gray-50" @click="handleSort('price')">
                <div class="flex items-center justify-end gap-2">Prezzo <ArrowUpDown class="w-4 h-4" /></div>
                </TableHead>
                <TableHead class="text-right">Azioni</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            <TableRow v-for="product in products" :key="product.id" @click="handleAction('Modifica', product.id)" class="cursor-pointer hover:bg-gray-50">
                <TableCell>
                <div class="h-12 w-12 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center p-1">
                    <img :src="product.image" :alt="product.name" class="max-h-full object-contain mix-blend-multiply" />
                </div>
                </TableCell>
                <TableCell class="font-medium">
                    <div>{{ product.name }}</div>
                    <div class="text-xs text-gray-500 truncate max-w-[200px]">{{ product.subtitle }}</div>
                </TableCell>
                <TableCell>{{ product.sku.replace('SKU: ', '') }}</TableCell>
                <TableCell>
                <Badge class="rounded-md font-normal" :class="getStatusColor(getStock(product.availability))">
                    {{ product.availability }}
                </Badge>
                </TableCell>
                <TableCell class="text-right font-bold">{{ product.price }}€</TableCell>
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
                    <DropdownMenuItem @click="handleAction('Modifica', product.id)">Modifica</DropdownMenuItem>
                    <DropdownMenuItem @click="handleAction('Gestisci Stock', product.id)">Gestisci Stock</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-600" @click="handleAction('Elimina prodotto', product.id)">Elimina prodotto</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
            <TableRow v-if="products.length === 0" class="h-full">
                 <TableCell colspan="6" class="text-center h-full py-10">Nessun prodotto trovato.</TableCell>
            </TableRow>
            </TableBody>
        </Table>
      </div>
    </div>
    </div>

    <!-- Product Edit Dialog -->
    <Dialog v-model:open="isEditOpen">
      <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
              <Package class="h-5 w-5 text-orange-600" />
              {{ !selectedProduct.id ? 'Nuovo Prodotto' : 'Modifica Prodotto' }}
          </DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del prodotto per il catalogo.
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedProduct" class="grid gap-6 py-4">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <!-- Left Column -->
                 <div class="space-y-4">
                     <div class="grid w-full items-center gap-1.5">
                        <Label for="name">Nome Prodotto *</Label>
                        <Input id="name" v-model="selectedProduct.name" placeholder="Es. Sika MonoTop" />
                    </div>
                     <div class="grid w-full items-center gap-1.5">
                        <Label for="category">Categoria</Label>
                        <Select v-model="selectedProduct.categoryId">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleziona Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
                                    {{ cat.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div class="grid w-full items-center gap-1.5">
                        <Label for="subtitle">Sottotitolo (breve desc.)</Label>
                        <Input id="subtitle" v-model="selectedProduct.subtitle" placeholder="Es. Malta strutturale R4" />
                    </div>
                 </div>

                 <!-- Right Column -->
                 <div class="space-y-4">
                        <div class="grid w-full items-center gap-1.5">
                            <Label for="price">Prezzo (€) *</Label>
                            <Input id="price" type="number" step="0.01" v-model="selectedProduct.price" />
                        </div>

                      <div class="grid w-full items-center gap-1.5">
                        <Label for="sku">SKU (Codice)</Label>
                        <Input id="sku" v-model="selectedProduct.sku" placeholder="Es. SKU-123" />
                    </div>
                 </div>
             </div>

             <!-- Full Width Description -->
             <div class="grid w-full items-center gap-1.5">
                <Label for="description">Descrizione Completa</Label>
                <Textarea id="description" v-model="selectedProduct.description" class="h-32" placeholder="Dettagli tecnici, applicazioni, vantaggi..." />
            </div>

            <!-- Image Upload -->
             <div class="grid w-full items-center gap-1.5">
                <Label for="image">Immagine Prodotto</Label>
                <div class="flex items-center gap-4">
                    <Input id="image" type="file" accept="image/*" @change="handleFileChange" class="cursor-pointer file:cursor-pointer" />
                </div>
                <!-- Preview existing or new file name -->
                <p v-if="selectedFile" class="text-xs text-green-600 font-medium">File selezionato: {{ selectedFile.name }}</p>
                <p v-else-if="selectedProduct.image" class="text-xs text-gray-500">Immagine attuale presente.</p>
            </div>
        </div>
        
        <DialogFooter>
             <Button variant="outline" @click="isEditOpen = false">Annulla</Button>
             <Button class="bg-[#ED8900] hover:bg-orange-600 text-white" @click="handleSave" :disabled="productsLoading">
                <Loader2 v-if="productsLoading" class="w-4 h-4 mr-2 animate-spin" />
                {{ productsLoading ? 'Salvataggio...' : 'Salva Prodotto' }}
             </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Stock Management Dialog (Enhanced) -->
    <Dialog v-model:open="isStockOpen">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gestione Stock</DialogTitle>
          <DialogDescription>Aggiorna la quantità disponibile in magazzino.</DialogDescription>
        </DialogHeader>

        <div class="py-6 flex flex-col items-center gap-2">
             <Label for="stock-adjust" class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Quantità Attuale</Label>
             
             <div class="flex items-center justify-center gap-3 w-full">
                <!-- Decrement Controls -->
                <div class="flex items-center gap-1">
                    <Button variant="outline" class="h-8 w-10 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200" @click="stockQuantity = Math.max(0, stockQuantity - 100)">-100</Button>
                    <Button variant="outline" class="h-8 w-10 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200" @click="stockQuantity = Math.max(0, stockQuantity - 10)">-10</Button>
                    <Button variant="outline" class="h-8 w-10 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200" @click="stockQuantity = Math.max(0, stockQuantity - 1)">-1</Button>
                </div>

                <!-- Manual Input (Central) -->
                <div class="relative mx-2">
                    <Input 
                        id="stock-adjust" 
                        type="number" 
                        v-model="stockQuantity" 
                        class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-2xl font-bold font-mono h-12 w-28 text-center p-0 border-2 border-orange-100 focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg shadow-sm bg-white" 
                    />
                </div>

                <!-- Increment Controls -->
                <div class="flex items-center gap-1">
                    <Button variant="outline" class="h-8 w-10 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200" @click="stockQuantity += 1">+1</Button>
                    <Button variant="outline" class="h-8 w-10 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200" @click="stockQuantity += 10">+10</Button>
                    <Button variant="outline" class="h-8 w-10 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200" @click="stockQuantity += 100">+100</Button>
                </div>
             </div>
        </div>

        <DialogFooter>
             <Button class="bg-[#ED8900] text-white w-full hover:bg-orange-600" @click="handleSaveStock">Conferma Aggiornamento</Button>
        </DialogFooter>
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
