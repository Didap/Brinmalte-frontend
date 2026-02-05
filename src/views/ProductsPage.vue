<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { useCategories } from '@/composables/useCategories'
import ProductCard from '@/components/ProductCard.vue'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const route = useRoute()
const router = useRouter()
const { products, fetchProducts, loading, pagination } = useProducts()
const { categories, fetchCategories } = useCategories()
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()

// State
const searchQuery = ref('')
const selectedCategories = ref<string[]>([])
const priceRange = ref<[number, number]>([0, 200])
const sortOrder = ref('featured')
const maxPrice = ref(500) // Increased default max

// Fetch Data with Filters
const fetchWithFilters = async (page = 1) => {
    const params = new URLSearchParams()
    
    // 1. Search Query
    if (searchQuery.value) {
        // Search in Name or SKU case-insensitive
        let i = 0
        params.append(`filters[$or][${i}][name][$containsi]`, searchQuery.value)
        i++
        params.append(`filters[$or][${i}][sku][$containsi]`, searchQuery.value)
    }

    // 2. Categories
    if (selectedCategories.value.length > 0) {
        selectedCategories.value.forEach((catSlug) => {
             params.append(`filters[category][slug][$in]`, catSlug)
        })
    }

    // 3. Price
    if (priceRange.value[0] > 0) {
        params.append('filters[price][$gte]', String(priceRange.value[0]))
    }
    if (priceRange.value[1] < maxPrice.value) {
        params.append('filters[price][$lte]', String(priceRange.value[1]))
    }

    // 4. Sorting
    switch (sortOrder.value) {
        case 'price-asc':
            params.append('sort', 'price:asc')
            break
        case 'price-desc':
            params.append('sort', 'price:desc')
            break
        case 'name-asc':
            params.append('sort', 'name:asc')
            break
        case 'name-desc':
            params.append('sort', 'name:desc')
            break
        default: 
            params.append('sort', 'createdAt:desc') // Featured/Default
            break
    }

    await fetchProducts(page, 20, params) // Page size 20 aligns with 2, 4, 5 columns (best cover)
}

const handlePageChange = (page: number) => {
    fetchWithFilters(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
    await fetchCategories()
    
    // Initialize from Store (transient state)
    if (searchStore.query) {
        searchQuery.value = searchStore.query
    }

    if (route.query.category) {
        const cat = route.query.category.toString()
        if (!selectedCategories.value.includes(cat)) {
            selectedCategories.value.push(cat)
        }
    }
    
    // Initial Fetch
    await fetchWithFilters(1)
})

// Watchers
watch(() => searchStore.query, (newQ) => {
    searchQuery.value = newQ
})

watch([searchQuery, selectedCategories, priceRange, sortOrder], () => {
    // Debounce could be added here for price/search but for now direct call
    fetchWithFilters(1)
})

const handleCategoryChange = (catSlug: string, isChecked: boolean) => {
    if (isChecked) {
        if (!selectedCategories.value.includes(catSlug)) {
            selectedCategories.value = [...selectedCategories.value, catSlug]
        }
    } else {
        selectedCategories.value = selectedCategories.value.filter(id => id !== catSlug)
    }
}

const clearFilters = () => {
    selectedCategories.value = []
    priceRange.value = [0, maxPrice.value]
    searchQuery.value = ''
    searchStore.clearQuery()
    router.push({ query: {} })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
    <div class="container mx-auto px-4 py-8">
      
      <!-- Header / Breadcrumb area -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
              <h1 class="text-3xl font-bold text-[#4B4846]">Catalogo Prodotti</h1>
              <p class="text-slate-500 mt-1">{{ pagination.total }} prodotti trovati</p>
          </div>
          
          <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-slate-600 hidden md:inline-block">Ordina per:</span>
              <Select v-model="sortOrder">
                  <SelectTrigger class="w-[180px] bg-white border-slate-200">
                      <SelectValue placeholder="Ordina per" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="featured">Migliori</SelectItem>
                      <SelectItem value="price-asc">Prezzo: Basso - Alto</SelectItem>
                      <SelectItem value="price-desc">Prezzo: Alto - Basso</SelectItem>
                      <SelectItem value="name-asc">Nome: A - Z</SelectItem>
                      <SelectItem value="name-desc">Nome: Z - A</SelectItem>
                  </SelectContent>
              </Select>

              <!-- Mobile Filter Trigger -->
              <Sheet>
                 <SheetTrigger asChild>
                    <Button variant="outline" class="lg:hidden gap-2 border-slate-200">
                        <Filter class="w-4 h-4" /> Filtri
                    </Button>
                 </SheetTrigger>
                 <SheetContent side="left" class="w-[300px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtri</SheetTitle>
                      <SheetDescription>Raffina la tua ricerca.</SheetDescription>
                    </SheetHeader>
                    
                    <div class="py-6 space-y-6">
                         <!-- Mobile Filter Content (Same as Desktop) -->
                         <Accordion type="multiple" class="w-full" :defaultValue="['category', 'price']">
                             <AccordionItem value="category">
                                <AccordionTrigger>Categorie</AccordionTrigger>
                                <AccordionContent>
                                   <div class="space-y-2">
                                       <div v-for="cat in categories" :key="cat.id" class="flex items-center space-x-2">
                                           <div class="relative flex items-center">
                                               <input type="checkbox" 
                                                   :id="'m-cat-' + cat.id"
                                                   :checked="selectedCategories.includes(cat.slug)"
                                                   @change="(e) => handleCategoryChange(cat.slug, (e.target as HTMLInputElement).checked)"
                                                   class="peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 text-[#ED8900] focus:ring-[#ED8900] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                               <Label :for="'m-cat-' + cat.id" class="ml-2 text-sm font-normal cursor-pointer select-none">{{ cat.name }}</Label>
                                           </div>
                                       </div>
                                   </div>
                                </AccordionContent>
                             </AccordionItem>
                             <AccordionItem value="price">
                                <AccordionTrigger>Prezzo</AccordionTrigger>
                                <AccordionContent class="px-2 pt-4">
                                   <Slider v-model="priceRange" :max="maxPrice" :step="1" class="mb-6" />
                                   <div class="flex items-center justify-between text-sm text-slate-600">
                                       <span>€ {{ priceRange[0] }}</span>
                                       <span>€ {{ priceRange[1] }}</span>
                                   </div>
                                </AccordionContent>
                             </AccordionItem>
                         </Accordion>
                    </div>
                    
                    <SheetFooter>
                        <div class="flex gap-2 w-full">
                            <Button variant="outline" class="flex-1" @click="clearFilters">Reset</Button>
                            <Button class="flex-1 bg-[#ED8900] text-white hover:bg-orange-600">Applica</Button>
                        </div>
                    </SheetFooter>
                 </SheetContent>
              </Sheet>
          </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <!-- Desktop Sidebar -->
          <div class="hidden lg:block space-y-6">
              <div class="bg-white p-6 rounded-lg border border-slate-100 shadow-sm sticky top-24">
                  <div class="flex items-center justify-between mb-4">
                      <h3 class="font-semibold text-lg">Filtri</h3>
                      <button v-if="selectedCategories.length > 0 || priceRange[0] > 0 || searchQuery" 
                              @click="clearFilters"
                              class="text-xs text-[#ED8900] hover:underline font-medium">
                          Reset tutto
                      </button>
                  </div>
                  
                  <Accordion type="multiple" class="w-full" :defaultValue="['category', 'price']">
                     <AccordionItem value="category">
                        <AccordionTrigger class="hover:no-underline">Categorie</AccordionTrigger>
                        <AccordionContent>
                           <div class="space-y-3 pt-2">
                               <!-- Search Filter Badge -->
                               <div v-if="searchQuery" class="flex items-center gap-2 text-sm bg-orange-50 text-orange-700 p-2 rounded mb-2">
                                   <span class="truncate">S: "{{ searchQuery }}"</span>
                                   <button @click="searchQuery = ''; router.push({ query: {} })"><X class="w-3 h-3" /></button>
                               </div>

                               <div v-for="cat in categories" :key="cat.id" class="flex items-center space-x-2">
                                           <div class="relative flex items-center">
                                               <input type="checkbox" 
                                                   :id="'cat-' + cat.id"
                                                   :checked="selectedCategories.includes(cat.slug)"
                                                   @change="(e) => handleCategoryChange(cat.slug, (e.target as HTMLInputElement).checked)"
                                                   class="peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 text-[#ED8900] focus:ring-[#ED8900] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                               <Label :for="'cat-' + cat.id" class="ml-2 text-sm cursor-pointer select-none">{{ cat.name }}</Label>
                                           </div>
                               </div>
                           </div>
                        </AccordionContent>
                     </AccordionItem>
                     <AccordionItem value="price">
                        <AccordionTrigger class="hover:no-underline">Prezzo</AccordionTrigger>
                        <AccordionContent class="px-2 pt-6 pb-2">
                           <Slider v-model="priceRange" :max="maxPrice" :step="1" class="mb-6" />
                           <div class="flex items-center justify-between text-sm font-medium text-slate-700">
                               <div class="bg-slate-100 px-2 py-1 rounded">€ {{ priceRange[0] }}</div>
                               <div class="bg-slate-100 px-2 py-1 rounded">€ {{ priceRange[1] }}</div>
                           </div>
                        </AccordionContent>
                     </AccordionItem>
                  </Accordion>
              </div>
          </div>

          <!-- Product Grid -->
          <div class="lg:col-span-3">
              <!-- Loading Skeleton -->
              <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  <div v-for="i in 10" :key="i" class="h-[400px] rounded-xl border border-slate-100 bg-white p-4 space-y-4">
                      <Skeleton class="h-[200px] w-full rounded-lg" />
                      <div class="space-y-2">
                          <Skeleton class="h-4 w-3/4" />
                          <Skeleton class="h-4 w-1/2" />
                      </div>
                      <div class="pt-8 flex justify-between">
                          <Skeleton class="h-6 w-20" />
                          <Skeleton class="h-10 w-10 rounded-full" />
                      </div>
                  </div>
              </div>

              <!-- Product List -->
              <div v-else-if="products.length > 0">
                 <TransitionGroup 
                    name="product-list" 
                    tag="div" 
                    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-8"
                 >
                   <ProductCard
                     v-for="product in products"
                     :key="product.id"
                     :id="product.id"
                     :slug="product.slug"
                     :title="product.name"
                     :price="product.price"
                     :image="product.image"
                     :category="product.category?.name"
                     :stock="product.stock"
                     :isNew="false"
                   />
                 </TransitionGroup>

                 <!-- Pagination -->
                 <div class="flex justify-center mt-8">

                     
                     <!-- Re-implementing correctly using the slot approach seen in OrdersPage -->
                     <Pagination :total="pagination.total" :sibling-count="1" show-edges :default-page="1" :page="pagination.page" :items-per-page="pagination.pageSize" @update:page="handlePageChange">
                        <PaginationContent v-slot="{ items }">
                          <PaginationPrevious />
                          <template v-for="(item, index) in items">
                            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" :is-active="item.value === pagination.page">
                              {{ item.value }}
                            </PaginationItem>
                            <PaginationEllipsis v-else :key="item.type" :index="index" />
                          </template>
                          <PaginationNext />
                        </PaginationContent>
                     </Pagination>
                 </div>
              </div>
              
              <!-- Empty State -->
              <div v-else class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-200 animate-in fade-in zoom-in duration-500">
                  <div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                      <Filter class="w-8 h-8 text-[#ED8900]" />
                  </div>
                  <h3 class="text-xl font-bold text-[#4B4846] mb-2">Nessun prodotto trovato</h3>
                  <p class="text-slate-500 max-w-xs mx-auto mb-6">Non ci sono prodotti che corrispondono ai filtri selezionati. Prova a rimuovere qualche filtro.</p>
                  <Button @click="clearFilters" variant="outline" class="border-[#ED8900] text-[#ED8900] hover:bg-orange-50">
                      Resetta Filtri
                  </Button>
              </div>
          </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.product-list-move,
.product-list-enter-active,
.product-list-leave-active {
  transition: all 0.5s ease;
}

.product-list-enter-from,
.product-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.product-list-leave-active {
  position: absolute;
}
</style>
