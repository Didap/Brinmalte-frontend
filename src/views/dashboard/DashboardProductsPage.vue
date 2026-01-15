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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, ArrowUpDown, Plus, Filter, Package, Loader2 } from 'lucide-vue-next'
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
const { products, fetchProducts, createProduct, updateProduct, deleteProduct, loading: productsLoading } = useProducts()
const { categories, fetchCategories } = useCategories()
const currentTab = ref('all')

onMounted(() => {
    fetchProducts()
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

const filteredProducts = computed(() => {
  let result = products.value
  
  if (currentTab.value !== 'all') {
     result = result.filter(p => {
        const stock = getStock(p.availability || '')
        if (currentTab.value === 'available') return stock > 0
        if (currentTab.value === 'low_stock') return stock > 0 && stock <= 10
        if (currentTab.value === 'out_of_stock') return stock === 0
        return true
     })
  }

  if (filterPrice.value === 'low') {
    result = result.filter(p => parseFloat(p.price) < 20)
  } else if (filterPrice.value === 'medium') {
    result = result.filter(p => parseFloat(p.price) >= 20 && parseFloat(p.price) <= 50)
  } else if (filterPrice.value === 'high') {
    result = result.filter(p => parseFloat(p.price) > 50)
  }

  if (globalSearchQuery.value) {
    const query = globalSearchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    )
  }

  if (sortKey.value) {
     result = [...result].sort((a: any, b: any) => {
      let valA: any = a[sortKey.value!]
      let valB: any = b[sortKey.value!]
      
      if (sortKey.value === 'price') {
         valA = parseFloat(a.price)
         valB = parseFloat(b.price)
      } else if (sortKey.value === 'stock') {
         valA = getStock(a.availability)
         valB = getStock(b.availability)
      } else if (typeof valA === 'string') {
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
  <div class="space-y-6">
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

    <!-- Table -->
    <div class="rounded-md border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
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
          <TableRow v-for="product in filteredProducts" :key="product.id">
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
        </TableBody>
      </Table>
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
                     <div class="grid grid-cols-2 gap-4">
                        <div class="grid w-full items-center gap-1.5">
                            <Label for="price">Prezzo (€) *</Label>
                            <Input id="price" type="number" step="0.01" v-model="selectedProduct.price" />
                        </div>
                        <div class="grid w-full items-center gap-1.5">
                            <Label for="stock">Stock Iniziale</Label>
                            <Input id="stock" type="number" v-model="selectedProduct.stock" />
                        </div>
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

    <!-- Stock Management Dialog (Simplified) -->
    <Dialog v-model:open="isStockOpen">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Gestione Stock</DialogTitle>
          <DialogDescription>Aggiorna la quantità.</DialogDescription>
        </DialogHeader>
        <div class="py-4 flex items-center justify-center gap-4">
             <Button variant="outline" size="icon" @click="stockQuantity > 0 ? stockQuantity-- : null">-</Button>
             <span class="text-2xl font-bold">{{ stockQuantity }}</span>
             <Button variant="outline" size="icon" @click="stockQuantity++">+</Button>
        </div>
        <DialogFooter>
             <Button class="bg-[#ED8900] text-white w-full" @click="handleSaveStock">Aggiorna</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
