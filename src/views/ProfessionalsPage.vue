<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <!-- Hero / Header - Consistent with Site -->
    <div class="relative bg-slate-900 text-white py-20 px-4 overflow-hidden">
        <div class="absolute inset-0 opacity-40">
            <div class="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
        </div>
        <div class="container mx-auto relative z-10 text-center max-w-4xl">
            <Badge class="bg-[#ED8900] text-white border-none mb-4 uppercase tracking-widest px-3 py-1 text-[10px] font-bold rounded-sm">Rete Professionale</Badge>
            <h1 class="text-4xl md:text-6xl font-bold mb-6">I Nostri <span class="text-[#ED8900]">Professionisti</span></h1>
            <p class="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Trova applicatori certificati ed esperti dell'edilizia formati per i tuoi progetti con materiali Sika.
            </p>
        </div>
    </div>

    <!-- Filters Section - Consistent with Site -->
    <div class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm py-5">
      <div class="container mx-auto px-4">
        <div class="flex flex-col lg:flex-row gap-4 items-center">
          <!-- City Search -->
          <div class="relative w-full lg:w-96">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              v-model="cityQuery"
              placeholder="Cerca per città..." 
              class="pl-10 h-10 border-slate-200 focus:ring-[#ED8900] rounded-md"
            />
          </div>

          <!-- Desktop Skills Quick Filters -->
          <div class="hidden lg:flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="toggleSkill(cat.slug)"
              class="px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap border"
              :class="selectedSkills.includes(cat.slug) 
                ? 'bg-[#ED8900] text-white border-[#ED8900]' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#ED8900]'"
            >
              {{ cat.name }}
            </button>
            <div class="h-6 w-px bg-slate-200 mx-2"></div>
            <button 
              @click="clearFilters"
              class="text-xs font-medium text-slate-400 hover:text-red-500 whitespace-nowrap"
            >
              Reset
            </button>
          </div>

          <!-- Mobile Actions -->
          <div class="flex lg:hidden w-full gap-2">
            <Button 
                @click="showFilters = !showFilters"
                variant="outline"
                class="flex-1 h-10 rounded-md text-slate-600 border-slate-200"
            >
                Filtra Competenze
                <Badge v-if="selectedSkills.length" class="ml-2 bg-[#ED8900] scale-90">{{ selectedSkills.length }}</Badge>
            </Button>
            <Button @click="clearFilters" variant="outline" class="h-10 w-10 border-slate-200">
                <X class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <!-- Expanded Filters (Mobile) -->
        <div v-if="showFilters" class="lg:hidden mt-4 grid grid-cols-2 gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="toggleSkill(cat.slug)"
            class="px-3 py-2 rounded-md text-[10px] font-bold border transition-all"
            :class="selectedSkills.includes(cat.slug) 
              ? 'bg-[#ED8900] text-white border-[#ED8900]' 
              : 'bg-white text-slate-500 border-slate-100'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 pt-12">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24">
        <Loader2 class="w-10 h-10 text-[#ED8900] animate-spin mb-4" />
        <p class="text-slate-500 font-medium">Caricamento...</p>
      </div>

      <!-- No Results -->
      <div v-else-if="professionals.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-slate-200">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
          <Users class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Nessun professionista trovato</h2>
        <p class="text-slate-500 max-w-md text-center mb-8">
          Prova a cambiare città o a rimuovere i filtri applicati.
        </p>
        <Button @click="clearFilters" class="bg-[#ED8900] hover:bg-orange-600 rounded-md px-8 py-2">
          Mostra Tutti
        </Button>
      </div>

      <!-- Results Display -->
      <div v-else>
        <!-- Full Grid for all results -->
        <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-8">Tutti i Professionisti</h2>
            
            <!-- Grid with expandable gallery rows -->
            <div class="space-y-4">
                <template v-for="(row, rowIndex) in gridRows" :key="'row-' + rowIndex">
                    <!-- Card Row -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                        <div 
                            v-for="prof in row" 
                            :key="'card-' + prof.id"
                            :ref="(el: any) => cardRefs[prof.id] = el as HTMLElement"
                        >
                            <ProfessionalCard 
                                :professional="prof"
                                :is-selected="selectedProfessionalId === prof.id"
                                @toggle-gallery="toggleGallery"
                            />
                        </div>
                    </div>
                    
                    <!-- Expanded Gallery Row (full width) -->
                    <Transition
                        enter-active-class="transition-all duration-400 ease-out"
                        enter-from-class="max-h-0 opacity-0"
                        enter-to-class="max-h-[600px] opacity-100"
                        leave-active-class="transition-all duration-300 ease-in"
                        leave-from-class="max-h-[600px] opacity-100"
                        leave-to-class="max-h-0 opacity-0"
                    >
                        <div 
                            v-if="expandedRowIndex === rowIndex && selectedProfessional" 
                            :ref="(el: any) => galleryRefs[rowIndex] = el as HTMLElement"
                            class="hidden lg:block overflow-hidden"
                        >
                            <div class="bg-white rounded-xl border border-slate-200 shadow-lg p-6 mt-2">
                                <!-- Header -->
                                <div class="flex items-center justify-between mb-6">
                                    <div class="flex items-center gap-4">
                                        <div class="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-[#ED8900]">
                                            <img v-if="selectedProfessional.profilePhoto" :src="selectedProfessional.profilePhoto" class="w-full h-full object-cover" />
                                            <div v-else class="w-full h-full flex items-center justify-center">
                                                <User class="w-7 h-7 text-slate-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-bold text-slate-800">{{ selectedProfessional.name }}</h3>
                                            <div class="flex items-center gap-2 text-sm text-slate-500">
                                                <MapPin class="w-4 h-4" />
                                                <span>{{ selectedProfessional.city }}</span>
                                                <span class="text-slate-300">·</span>
                                                <Images class="w-4 h-4" />
                                                <span>{{ selectedProfessional.gallery?.length }} foto</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        @click="closeGallery"
                                        variant="ghost"
                                        size="icon"
                                        class="rounded-full hover:bg-slate-100"
                                    >
                                        <X class="w-5 h-5" />
                                    </Button>
                                </div>
                                
                                <!-- Gallery Grid -->
                                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    <div 
                                        v-for="(img, idx) in selectedProfessional.gallery" 
                                        :key="idx"
                                        class="aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer group relative"
                                        @click="openDesktopLightbox(idx)"
                                    >
                                        <img 
                                            :src="img" 
                                            :alt="`Lavoro ${idx + 1}`" 
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <ZoomIn class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </template>
            </div>
        </div>
      </div>
    </div>
    
    <!-- Desktop Lightbox -->
    <Dialog v-model:open="isDesktopLightboxOpen">
        <DialogContent class="max-w-5xl p-0 bg-black/95 border-none overflow-hidden">
            <DialogHeader class="sr-only">
                <DialogTitle>Immagine ingrandita</DialogTitle>
            </DialogHeader>
            <div class="relative">
                <img 
                    v-if="selectedProfessional?.gallery && desktopLightboxIndex >= 0"
                    :src="selectedProfessional.gallery[desktopLightboxIndex]" 
                    alt="Immagine" 
                    class="w-full h-auto max-h-[85vh] object-contain"
                />
                <!-- Close button -->
                <button 
                    @click="isDesktopLightboxOpen = false"
                    class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <X class="w-5 h-5" />
                </button>
                <!-- Navigation -->
                <button 
                    v-if="desktopLightboxIndex > 0"
                    @click="desktopLightboxIndex--"
                    class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <ChevronLeft class="w-7 h-7" />
                </button>
                <button 
                    v-if="selectedProfessional?.gallery && desktopLightboxIndex < selectedProfessional.gallery.length - 1"
                    @click="desktopLightboxIndex++"
                    class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <ChevronRight class="w-7 h-7" />
                </button>
                <!-- Counter & Info -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div class="flex items-center justify-between text-white">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full overflow-hidden bg-slate-700">
                                <img v-if="selectedProfessional?.profilePhoto" :src="selectedProfessional.profilePhoto" class="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p class="font-bold">{{ selectedProfessional?.name }}</p>
                                <p class="text-sm text-white/70">{{ selectedProfessional?.city }}</p>
                            </div>
                        </div>
                        <div class="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                            {{ desktopLightboxIndex + 1 }} / {{ selectedProfessional?.gallery?.length }}
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProfessionals, type Professional } from '@/composables/useProfessionals'
import { useCategories } from '@/composables/useCategories'
import ProfessionalCard from '@/components/ProfessionalCard.vue'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, X, Users, MapPin, Images, User, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const { professionals, loading, fetchProfessionals } = useProfessionals()
const { categories, fetchCategories } = useCategories()

const cityQuery = ref('')
const selectedSkills = ref<string[]>([])
const showFilters = ref(false)
const selectedProfessionalId = ref<string | number | null>(null)
const isDesktopLightboxOpen = ref(false)
const desktopLightboxIndex = ref(0)

// Calculate grid rows based on screen size (4 columns on xl, 3 on lg, 2 on sm, 1 on mobile)
const gridRows = computed(() => {
    const cols = 6 // 6 columns on large screens
    const rows: Professional[][] = []
    for (let i = 0; i < professionals.value.length; i += cols) {
        rows.push(professionals.value.slice(i, i + cols))
    }
    return rows
})

const galleryRefs = ref<Record<number, HTMLElement | null>>({})
const cardRefs = ref<Record<string | number, HTMLElement | null>>({})

const selectedProfessional = computed(() => {
    if (!selectedProfessionalId.value) return null
    return professionals.value.find(p => p.id === selectedProfessionalId.value) || null
})

const expandedRowIndex = computed(() => {
    if (!selectedProfessionalId.value) return -1
    const idx = professionals.value.findIndex(p => p.id === selectedProfessionalId.value)
    if (idx === -1) return -1
    return Math.floor(idx / 6) // 6 columns
})

const loadData = (page = 1) => {
  const params = new URLSearchParams()
  if (cityQuery.value) params.append('filters[city][$containsi]', cityQuery.value)
  if (selectedSkills.value.length > 0) {
    selectedSkills.value.forEach((skillSlug, index) => {
      params.append(`filters[skills][slug][$in][${index}]`, skillSlug)
    })
  }
  fetchProfessionals(page, 20, params)
}

onMounted(async () => {
  await fetchCategories()
  loadData()
})

let debounceTimer: any
watch(cityQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { loadData(1) }, 500)
})

watch(selectedSkills, () => { loadData(1) })

const toggleSkill = (slug: string) => {
  if (selectedSkills.value.includes(slug)) {
    selectedSkills.value = selectedSkills.value.filter(s => s !== slug)
  } else {
    selectedSkills.value.push(slug)
  }
}

const clearFilters = () => {
  cityQuery.value = ''
  selectedSkills.value = []
}

const toggleGallery = (id: string | number) => {
    if (selectedProfessionalId.value === id) {
        // Closing - scroll back to card
        selectedProfessionalId.value = null
        if (cardRefs.value[id]) {
            setTimeout(() => {
                cardRefs.value[id]?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                })
            }, 100)
        }
    } else {
        selectedProfessionalId.value = id
        // Scroll to gallery after it opens
        setTimeout(() => {
            const rowIdx = expandedRowIndex.value
            if (rowIdx >= 0 && galleryRefs.value[rowIdx]) {
                galleryRefs.value[rowIdx]?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                })
            }
        }, 100)
    }
}

const closeGallery = () => {
    const idToScrollTo = selectedProfessionalId.value
    selectedProfessionalId.value = null
    // Scroll back to the card
    if (idToScrollTo && cardRefs.value[idToScrollTo]) {
        setTimeout(() => {
            cardRefs.value[idToScrollTo]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            })
        }, 100)
    }
}

const openDesktopLightbox = (index: number) => {
    desktopLightboxIndex.value = index
    isDesktopLightboxOpen.value = true
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
