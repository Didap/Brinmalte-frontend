<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCategories } from '@/composables/useCategories'
import { useProducts } from '@/composables/useProducts'
import ProductCard from '@/components/ProductCard.vue'
import { HardHat, CheckCircle2, FileText, Loader2 } from 'lucide-vue-next'
import { sendContactForm } from '@/services/api'
import { toast } from 'vue-sonner'

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

// Fetch products for this category
import { watch } from 'vue'

const fetchCategoryProducts = async () => {
    if (category.value) {
        const params = new URLSearchParams()
        params.append('filters[category][slug][$eq]', category.value.slug)
        await fetchProducts(1, 100, params)
    }
}

watch(category, () => {
   fetchCategoryProducts()
})

onMounted(async () => {
    await fetchCategories()
    if (category.value) fetchCategoryProducts()
})

// Products are now already filtered in state
const relatedProducts = computed(() => products.value)

// ===== Form Preventivo =====
const prevNome = ref('')
const prevCitta = ref('')
const prevEmail = ref('')
const prevTelefono = ref('')
const prevInteresse = ref('')
const prevTipoIntervento = ref('')
const prevDettagli = ref('')
const prevLoading = ref(false)

const handlePreventivo = async () => {
  if (!prevNome.value || !prevEmail.value) {
    toast.error('Compila i campi obbligatori', { description: 'Nome e email sono richiesti.' })
    return
  }
  prevLoading.value = true
  try {
    await sendContactForm('preventivo', {
      nome: prevNome.value,
      citta: prevCitta.value,
      email: prevEmail.value,
      telefono: prevTelefono.value,
      interesse: prevInteresse.value,
      tipoIntervento: prevTipoIntervento.value,
      dettagli: prevDettagli.value,
    })
    toast.success('Richiesta inviata!', { description: 'Ti contatteremo al più presto.' })
    prevNome.value = ''
    prevCitta.value = ''
    prevEmail.value = ''
    prevTelefono.value = ''
    prevInteresse.value = ''
    prevTipoIntervento.value = ''
    prevDettagli.value = ''
  } catch (err: any) {
    toast.error('Errore nell\'invio', { description: err.message || 'Riprova più tardi.' })
  } finally {
    prevLoading.value = false
  }
}

// ===== Form Albo =====
const alboNome = ref('')
const alboCognome = ref('')
const alboEmail = ref('')
const alboCellulare = ref('')
const alboRagioneSociale = ref('')
const alboRuolo = ref('')
const alboPartitaIva = ref('')
const alboSede = ref('')
const alboCategoria = ref('')
const alboLoading = ref(false)

const handleAlbo = async () => {
  if (!alboNome.value || !alboCognome.value || !alboEmail.value) {
    toast.error('Compila i campi obbligatori', { description: 'Nome, cognome e email sono richiesti.' })
    return
  }
  alboLoading.value = true
  try {
    await sendContactForm('albo', {
      nome: alboNome.value,
      cognome: alboCognome.value,
      email: alboEmail.value,
      cellulare: alboCellulare.value,
      ragioneSociale: alboRagioneSociale.value,
      ruolo: alboRuolo.value,
      partitaIva: alboPartitaIva.value,
      sede: alboSede.value,
      categoria: alboCategoria.value,
    })
    toast.success('Iscrizione inviata!', { description: 'Verrai ricontattato entro 24h.' })
    alboNome.value = ''
    alboCognome.value = ''
    alboEmail.value = ''
    alboCellulare.value = ''
    alboRagioneSociale.value = ''
    alboRuolo.value = ''
    alboPartitaIva.value = ''
    alboSede.value = ''
    alboCategoria.value = ''
  } catch (err: any) {
    toast.error('Errore nell\'invio', { description: err.message || 'Riprova più tardi.' })
  } finally {
    alboLoading.value = false
  }
}
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

                <form @submit.prevent="handlePreventivo" class="space-y-3 flex-1 flex flex-col">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Nome / Azienda *</Label>
                            <Input v-model="prevNome" placeholder="Il tuo nome" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Città / Zona</Label>
                            <Input v-model="prevCitta" placeholder="Brindisi" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Email *</Label>
                            <Input v-model="prevEmail" type="email" placeholder="name@company.com" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Telefono</Label>
                            <Input v-model="prevTelefono" type="tel" placeholder="+39" class="h-9 focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <div class="space-y-1.5">
                            <Label class="text-xs">Interesse</Label>
                            <Select v-model="prevInteresse">
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
                             <Select v-model="prevTipoIntervento">
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
                        <Textarea v-model="prevDettagli" placeholder="Descrivi i prodotti e le quantità di cui hai bisogno..." class="resize-none focus-visible:ring-[#ED8900] min-h-[80px] flex-1" />
                    </div>
                    <Button type="submit" :disabled="prevLoading" class="w-full bg-[#ED8900] hover:bg-[#d67b00] text-white font-bold tracking-wide shadow-sm hover:shadow-md transition-all mt-auto disabled:opacity-70">
                        <Loader2 v-if="prevLoading" class="w-4 h-4 animate-spin mr-2" />
                        {{ prevLoading ? 'Invio in corso...' : 'Richiedi Preventivo' }}
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

                <form @submit.prevent="handleAlbo" class="space-y-3 relative z-10 flex-1 flex flex-col">
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Nome *</Label>
                            <Input v-model="alboNome" placeholder="Mario" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Cognome *</Label>
                            <Input v-model="alboCognome" placeholder="Rossi" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Email *</Label>
                            <Input v-model="alboEmail" type="email" placeholder="email@azienda.it" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Cellulare</Label>
                            <Input v-model="alboCellulare" type="tel" placeholder="+39" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <Label class="text-xs">Ragione Sociale</Label>
                            <Input v-model="alboRagioneSociale" placeholder="Nome Impresa" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                         <div class="space-y-1.5">
                             <Label class="text-xs">Ruolo</Label>
                             <Select v-model="alboRuolo">
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
                            <Input v-model="alboPartitaIva" placeholder="00000000000" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                        <div class="space-y-1.5">
                            <Label class="text-xs">Sede Operativa</Label>
                            <Input v-model="alboSede" placeholder="Città" class="h-9 bg-white focus-visible:ring-[#ED8900]" />
                        </div>
                    </div>
                    <div class="space-y-1.5 mb-2">
                         <Label class="text-xs">Categoria Principale</Label>
                         <Select v-model="alboCategoria">
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
                    <Button type="submit" :disabled="alboLoading" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold tracking-wide shadow-sm hover:shadow-md transition-all mt-auto disabled:opacity-70">
                        <Loader2 v-if="alboLoading" class="w-4 h-4 animate-spin mr-2" />
                        {{ alboLoading ? 'Invio in corso...' : 'Iscriviti all\'Albo' }}
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
