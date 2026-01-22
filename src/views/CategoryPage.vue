<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCategories } from '@/composables/useCategories'
import { useProducts } from '@/composables/useProducts'
import ProductCard from '@/components/ProductCard.vue'
import { HardHat, CheckCircle2, FileText } from 'lucide-vue-next'

const { categories, fetchCategories } = useCategories()
const { products, fetchProducts } = useProducts()


import { Button } from '@/components/ui/button'
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

const route = useRoute()

// Find category based on ID or Slug (for now ID matches slug logic)
const category = computed(() => {
  const id = route.params.id as string
  return categories.value.find(c => c.id == id || c.slug === id)
})

// Filter related products
// Filter related products
// Fetch products for this category
import { watch } from 'vue'

const fetchCategoryProducts = async () => {
    if (category.value) {
        const params = new URLSearchParams()
        // Use the same filter syntax that worked in ProductsPage
        params.append('filters[category][slug][$eq]', category.value.slug)

        await fetchProducts(1, 100, params)
    }
}

watch(category, () => {
   fetchCategoryProducts()
})

onMounted(async () => {
    await fetchCategories()
    // Initial fetch handled by watch or implicit if category is ready
    if (category.value) fetchCategoryProducts()
})

// Products are now already filtered in state
const relatedProducts = computed(() => products.value)
</script>

<template>
  <div v-if="category" class="min-h-screen bg-white">
    <!-- Hero Section -->
    <div class="relative bg-slate-900 text-white py-24 px-4 overflow-hidden">
        <div class="absolute inset-0 opacity-40">
            <img v-if="category.heroImage" :src="category.heroImage" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800"></div>
        </div>
        <div class="container mx-auto relative z-10 text-center max-w-4xl">
            <h1 class="text-5xl font-bold mb-6 text-[#ED8900]">{{ category.name }}</h1>
            <p class="text-xl text-gray-200 leading-relaxed">{{ category.description }}</p>
        </div>
    </div>

    <!-- User vs Pro Split Section -->
    <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <!-- User Section -->
            <!-- B2B Quote Form Section -->
            <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                <div class="flex items-center gap-3 mb-4">
                    <div class="bg-slate-50 p-2.5 rounded-full border border-slate-100">
                        <FileText class="w-6 h-6 text-[#ED8900]" />
                    </div>
                    <h2 class="text-xl font-bold text-slate-800">Preventivo Personalizzato</h2>
                </div>
                <p class="text-gray-600 mb-6 text-sm leading-relaxed">
                    Sei un professionista o un'impresa? Richiedi un preventivo per le tue forniture ricorrenti. Offriamo condizioni riservate e supporto tecnico.
                </p>
                
                <form class="space-y-3 flex-1 flex flex-col">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Nome / Azienda</Label>
                            <Input placeholder="Il tuo nome" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Città / Zona</Label>
                            <Input placeholder="Brindisi" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Email</Label>
                            <Input type="email" placeholder="name@company.com" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Telefono</Label>
                            <Input type="tel" placeholder="+39" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <div class="space-y-1.5">
                            <Label class="text-xs">Interesse</Label>
                            <Select>
                                <SelectTrigger class="h-9 focus:ring-[#ED8900]">
                                    <SelectValue placeholder="Seleziona..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="materiali">Materiali Edili</SelectItem>
                                    <SelectItem value="colorificio">Colorificio</SelectItem>
                                    <SelectItem value="isolamento">Isolamento Termico</SelectItem>
                                    <SelectItem value="cartongesso">Cartongesso</SelectItem>
                                    <SelectItem value="pavimenti">Pavimenti</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Tipo Intervento</Label>
                             <Select>
                                <SelectTrigger class="h-9 focus:ring-[#ED8900]">
                                    <SelectValue placeholder="Seleziona..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nuova">Nuova Costruzione</SelectItem>
                                    <SelectItem value="ristrutturazione">Ristrutturazione Totale</SelectItem>
                                    <SelectItem value="manutenzione">Manutenzione</SelectItem>
                                    <SelectItem value="altro">Altro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col gap-1.5 min-h-0">
                        <Label class="text-xs">Dettagli Richiesta</Label>
                        <Textarea placeholder="Descrivi i prodotti e le quantità di cui hai bisogno..." class="resize-none focus-visible:ring-[#ED8900] min-h-[80px] flex-1" />
                    </div>
                    <Button class="w-full bg-[#ED8900] hover:bg-[#d67b00] text-white font-bold tracking-wide shadow-sm hover:shadow-md transition-all mt-auto">
                        Richiedi Preventivo
                    </Button>
                </form>
            </div>

            <!-- Professional Register Form Section -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col h-full">
                <div class="flex items-center gap-3 mb-4 relative z-10">
                    <div class="bg-white p-2.5 rounded-full shadow-sm border border-slate-100 group-hover:border-[#ED8900]/50 transition-colors">
                         <HardHat class="w-6 h-6 text-[#ED8900]" />
                    </div>
                    <h2 class="text-xl font-bold text-slate-800">Sei un Professionista?</h2>
                </div>
                <p class="text-gray-600 mb-6 text-sm leading-relaxed relative z-10">
                    Iscriviti al nostro Albo Applicatori Certificati. Ottieni supporto tecnico prioritario, listini dedicati e visibilità per nuovi potenziali clienti.
                </p>
                
                <form class="space-y-3 relative z-10 flex-1 flex flex-col">
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Nome</Label>
                            <Input placeholder="Mario" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Cognome</Label>
                            <Input placeholder="Rossi" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Email</Label>
                            <Input type="email" placeholder="email@azienda.it" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Cellulare</Label>
                            <Input type="tel" placeholder="+39" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Ragione Sociale</Label>
                            <Input placeholder="Nome Impresa" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                         <div class="space-y-1.5">
                             <Label class="text-xs">Ruolo</Label>
                             <Select>
                                <SelectTrigger class="h-9 bg-white focus:ring-[#ED8900]">
                                    <SelectValue placeholder="Seleziona..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="titolare">Titolare</SelectItem>
                                    <SelectItem value="tecnico">Ufficio Tecnico</SelectItem>
                                    <SelectItem value="acquisti">Ufficio Acquisti</SelectItem>
                                    <SelectItem value="libero">Libero Professionista</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Partita IVA</Label>
                            <Input placeholder="00000000000" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Sede Operativa</Label>
                            <Input placeholder="Città" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="space-y-1.5 mb-2">
                         <Label class="text-xs">Categoria Principale</Label>
                         <Select>
                            <SelectTrigger class="h-9 bg-white focus:ring-[#ED8900]">
                                <SelectValue placeholder="Seleziona..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="impresa">Impresa Edile</SelectItem>
                                <SelectItem value="applicatore">Applicatore Specializzato</SelectItem>
                                <SelectItem value="progettista">Progettista / Architetto</SelectItem>
                                <SelectItem value="rivenditore">Rivenditore</SelectItem>
                            </SelectContent>
                         </Select>
                    </div>
                    <Button class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold tracking-wide shadow-sm hover:shadow-md transition-all mt-auto">
                        Iscriviti all'Albo
                    </Button>
                </form>

                <div class="mt-8 pt-6 border-t border-slate-200 relative z-10">
                    <div class="flex items-center gap-2 text-sm text-slate-500 justify-center">
                        <CheckCircle2 class="w-4 h-4 text-[#ED8900]" />
                        <span>Verrai ricontattato entro 24h</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Related Products Carousel (Simple List for now) -->
    <div class="bg-slate-50 py-16">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-slate-900 mb-12 text-center">Prodotti Consigliati in {{ category.name }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 <ProductCard 
                    v-for="product in relatedProducts" 
                    :key="product.id"
                    :id="product.id"
                    :slug="product.slug"
                    :title="product.name"
                    :price="product.price"
                    :image="product.image"
                />
            </div>
        </div>
    </div>

  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <p class="text-xl text-gray-400">Categoria non trovata</p>
  </div>
</template>
