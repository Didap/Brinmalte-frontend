<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Check, Download, FileText, ChevronRight, Home, ShieldCheck, Truck, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type Product } from '@/data/products'
import { useProducts } from '@/composables/useProducts'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cartStore = useCartStore()
const { fetchProduct, loading } = useProducts()
const product = ref<Product | null>(null)

const loadData = async () => {
    const id = route.params.id as string
    const data = await fetchProduct(id)
    if (data) product.value = data
}

onMounted(loadData)

const quantity = ref(1)

const increment = () => quantity.value++
const decrement = () => { if (quantity.value > 1) quantity.value-- }

// Reset quantity when product changes
watch(() => route.params.id, () => {
    quantity.value = 1
    loadData()
    window.scrollTo(0, 0)
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-12">
    <div v-if="loading" class="flex items-center justify-center p-20">
        <Loader2 class="w-10 h-10 animate-spin text-orange-500" />
    </div>
    <div v-else-if="!product" class="container mx-auto p-20 text-center text-gray-500">
        Prodotto non trovato.
    </div>
    <div v-else>
    <!-- Breadcrumbs -->
    <div class="container mx-auto px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
      <router-link to="/" class="hover:text-[#ED8900] transition-colors"><Home class="w-4 h-4" /></router-link>
      <ChevronRight class="w-4 h-4" />
      <span class="hover:text-[#ED8900] cursor-pointer">Prodotti</span>
      <ChevronRight class="w-4 h-4" />
      <span class="hover:text-[#ED8900] cursor-pointer">Malte Tecniche</span>
      <ChevronRight class="w-4 h-4" />
      <span class="font-semibold text-[#4B4846]">{{ product.name }}</span>
    </div>

    <!-- Main Product Section -->
    <div class="container mx-auto px-4 mt-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          
          <!-- Left: Gallery -->
          <div class="flex flex-col gap-4">
            <div class="bg-slate-50 rounded-lg p-6 flex items-center justify-center border border-slate-100 h-[500px]">
              <!-- 3D Product Image -->
              <img :src="product.image" :alt="product.name" class="max-h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
            </div>
            <div class="flex flex-wrap justify-center gap-2">
              <div v-for="i in 4" :key="i" class="w-20 h-20 bg-slate-50 rounded-md border border-slate-100 cursor-pointer hover:border-[#ED8900] transition-colors p-2 flex items-center justify-center">
                 <img :src="product.image" class="w-full h-full object-contain opacity-70 hover:opacity-100" />
              </div>
            </div>
          </div>

          <!-- Right: Info Panel -->
          <div class="flex flex-col">
            <!-- Header -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-2">
                 <span class="bg-[#ED8900] text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Sika Official</span>
                 <span class="text-gray-400 text-xs">{{ product.sku }}</span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-[#4B4846] mb-2">{{ product.name }}</h1>
              <p class="text-lg text-gray-600 font-medium leading-relaxed">{{ product.description }}</p>
            </div>

            <!-- Features Bullet Points -->
            <div class="mb-8">
              <ul class="space-y-2">
                <li v-for="feature in product.features" :key="feature" class="flex items-start gap-3">
                  <div class="bg-green-100 p-1 rounded-full mt-0.5">
                    <Check class="w-3 h-3 text-green-700 font-bold" />
                  </div>
                  <span class="text-gray-700">{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- Price & Action Box -->
            <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-auto">
              <div class="flex justify-between items-end mb-6">
                <div>
                  <p class="text-sm text-gray-500 mb-1">Prezzo per Unità</p>
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-[#ED8900]">{{ product.price }}€</span>
                    <span class="text-gray-400 text-sm font-medium">+ IVA</span>
                  </div>
                </div>
                <div class="text-right">
                   <div class="flex items-center gap-1.5 text-green-600 text-sm font-medium mb-1 justify-end">
                     <span class="w-2 h-2 rounded-full bg-green-600"></span>
                     {{ product.availability }}
                   </div>
                   <p class="text-xs text-gray-400">Spedizione in 24/48h</p>
                </div>
              </div>

              <div class="flex gap-4">
                <!-- Quantity Selector -->
                <div class="flex items-center border border-gray-300 rounded-md bg-white h-12">
                  <button @click="decrement" class="px-4 text-gray-500 hover:text-[#ED8900] transition-colors">-</button>
                  <input type="text" v-model="quantity" class="w-12 text-center text-[#4B4846] font-bold focus:outline-none" readonly />
                  <button @click="increment" class="px-4 text-gray-500 hover:text-[#ED8900] transition-colors">+</button>
                </div>
                
                <!-- Add to Cart -->
                <Button @click="cartStore.addItem(product!, quantity)" class="flex-1 h-12 bg-[#ED8900] hover:bg-[#d67b00] text-white text-lg font-bold shadow-md hover:shadow-lg transition-all uppercase tracking-wide">
                  Aggiungi al Carrello
                </Button>
              </div>
              
              <!-- Trust Badges -->
              <div class="mt-4 pt-4 border-t border-slate-200 flex justify-between text-xs text-gray-500">
                <div class="flex items-center gap-1.5">
                   <ShieldCheck class="w-4 h-4 text-[#4B4846]" />
                   Garanzia Ufficiale Sika
                </div>
                <div class="flex items-center gap-1.5">
                   <Truck class="w-4 h-4 text-[#4B4846]" />
                   Spedizioni Assicurate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Tabs Section -->
    <div class="container mx-auto px-4 mt-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <Tabs default-value="details" class="w-full">
          <TabsList class="w-full justify-start border-b border-gray-200 bg-transparent rounded-none h-auto p-0 mb-6 gap-6">
            <TabsTrigger value="details" class="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ED8900] data-[state=active]:text-[#ED8900] data-[state=active]:shadow-none px-0 py-2 text-base font-medium text-gray-500 hover:text-gray-700">
              Dettagli Prodotto
            </TabsTrigger>
            <TabsTrigger value="tech" class="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ED8900] data-[state=active]:text-[#ED8900] data-[state=active]:shadow-none px-0 py-2 text-base font-medium text-gray-500 hover:text-gray-700">
              Scheda Tecnica
            </TabsTrigger>
            <TabsTrigger value="docs" class="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ED8900] data-[state=active]:text-[#ED8900] data-[state=active]:shadow-none px-0 py-2 text-base font-medium text-gray-500 hover:text-gray-700">
              Documenti & Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" class="animate-fade-in-up">
            <div class="prose max-w-none text-gray-600">
              <h3 class="text-xl font-bold text-[#4B4846] mb-4">Descrizione</h3>
              <p class="mb-6">{{ product.description }}</p>
              
              <h3 class="text-xl font-bold text-[#4B4846] mb-4">Campi di Applicazione</h3>
              <ul class="list-disc pl-5 space-y-1 mb-6">
                 <li>Ripristino strutturale di travi, pilastri e solai.</li>
                 <li>Regolarizzazione di nidi di ghiaia nel calcestruzzo.</li>
                 <li>Rifacimento di frontalini di balconi danneggiati.</li>
                 <li>Riparazione di strutture prefabbricate.</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="tech" class="animate-fade-in-up">
            <h3 class="text-xl font-bold text-[#4B4846] mb-6">Dati Tecnici</h3>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-sm text-left">
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(item, index) in product.technicalData" :key="index" class="odd:bg-gray-50 even:bg-white text-gray-700">
                    <td class="px-6 py-4 font-semibold w-1/3">{{ item.label }}</td>
                    <td class="px-6 py-4">{{ item.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="docs" class="animate-fade-in-up">
            <h3 class="text-xl font-bold text-[#4B4846] mb-6">Documentazione Ufficiale</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a v-for="doc in product.documents" :key="doc.name" :href="doc.url" target="_blank" class="border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:border-[#ED8900] hover:shadow-md transition-all group cursor-pointer bg-slate-50">
                 <div class="bg-red-100 p-3 rounded-md text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <FileText class="w-6 h-6" />
                 </div>
                 <div class="flex-1">
                   <p class="font-bold text-[#4B4846] text-sm group-hover:text-[#ED8900] transition-colors">{{ doc.name }}</p>
                   <p class="text-xs text-gray-500 uppercase mt-0.5">{{ doc.size }}</p>
                 </div>
                 <Download class="w-5 h-5 text-gray-400 group-hover:text-[#ED8900]" />
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </div>
  </div>
</template>
