<template>
  <div>
    <!-- Card -->
    <div 
        class="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
        :class="{ 'ring-2 ring-[#ED8900] border-[#ED8900]': isSelected }"
    >
      <!-- Profile Photo Container -->
      <div class="relative aspect-square overflow-hidden bg-slate-100">
          <img 
            v-if="professional.profilePhoto" 
            :src="professional.profilePhoto" 
            :alt="professional.name" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <UserIcon class="w-16 h-16 opacity-30" />
          </div>
          
          <!-- Location Tag on Image -->
          <div class="absolute bottom-3 left-3">
              <div class="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm border border-slate-100 flex items-center gap-1.5">
                  <MapPin class="w-3 h-3 text-[#ED8900]" />
                  <span class="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{{ professional.city || 'N/A' }}</span>
              </div>
          </div>
          
          <!-- Gallery Count Badge -->
          <div v-if="hasGallery" class="absolute top-3 right-3">
              <div class="bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Images class="w-3.5 h-3.5 text-white" />
                  <span class="text-[11px] font-bold text-white">{{ professional.gallery?.length }}</span>
              </div>
          </div>
      </div>

      <!-- Info Panel -->
      <div class="p-4 flex-1 flex flex-col">
        <div class="mb-3">
          <h3 class="text-lg font-bold text-slate-800 group-hover:text-[#ED8900] transition-colors line-clamp-1 mb-0.5">
            {{ professional.name }}
          </h3>
          <div class="flex items-center gap-1.5">
               <div class="w-1.5 h-1.5 rounded-full bg-[#ED8900]"></div>
               <p class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Applicatore Certificato</p>
          </div>
        </div>

        <!-- Skills (Clean Badges) -->
        <div class="mb-5 flex-1">
          <div class="flex flex-wrap gap-1.5">
            <Badge 
              v-for="skill in professional.skills.slice(0, 4)" 
              :key="skill.id"
              variant="secondary"
              class="bg-slate-100 text-slate-600 border-none font-bold text-[9px] px-2 py-0.5 rounded shadow-none"
            >
              {{ skill.name }}
            </Badge>
            <span v-if="professional.skills.length > 4" class="text-[10px] font-bold text-slate-400">
              +{{ professional.skills.length - 4 }}
            </span>
          </div>
        </div>

        <!-- CTA -->
        <div class="pt-4 border-t border-slate-100 mt-auto">
          <Button 
              v-if="hasGallery"
              @click="handleGalleryClick"
              variant="outline" 
              class="w-full h-10 border-[#ED8900] text-[#ED8900] hover:bg-[#ED8900] hover:text-white rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
              :class="{ 'bg-[#ED8900] text-white': isSelected }"
          >
              <Images class="w-4 h-4" />
              {{ isSelected ? 'Chiudi Gallery' : 'Guarda la Gallery' }}
          </Button>
          
          <!-- No gallery fallback -->
          <div v-if="!hasGallery" class="flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-lg">
              <Camera class="w-4 h-4 text-slate-300" />
              <span class="text-xs text-slate-400 font-medium">Gallery non disponibile</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Dialog for Gallery -->
    <Dialog v-model:open="isMobileDialogOpen">
        <DialogContent class="max-w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-xl">
            <DialogHeader class="p-4 pb-3 border-b bg-slate-50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <img v-if="professional.profilePhoto" :src="professional.profilePhoto" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <UserIcon class="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <DialogTitle class="text-base font-bold text-slate-800">
                            {{ professional.name }}
                        </DialogTitle>
                        <DialogDescription class="text-xs text-slate-500">
                            {{ professional.gallery?.length }} foto · {{ professional.city }}
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <div class="p-3 overflow-y-auto max-h-[70vh]">
                <div class="grid grid-cols-2 gap-2">
                    <div 
                        v-for="(img, idx) in professional.gallery" 
                        :key="idx"
                        class="aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer active:scale-95 transition-transform"
                        @click="openMobileLightbox(idx)"
                    >
                        <img 
                            :src="img" 
                            :alt="`Lavoro ${idx + 1}`" 
                            class="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
    
    <!-- Mobile Lightbox -->
    <Dialog v-model:open="isMobileLightboxOpen">
        <DialogContent class="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black border-none rounded-none">
            <DialogHeader class="sr-only">
                <DialogTitle>Immagine</DialogTitle>
            </DialogHeader>
            <div class="relative w-full h-full flex items-center justify-center">
                <img 
                    v-if="professional.gallery && mobileLightboxIndex >= 0"
                    :src="professional.gallery[mobileLightboxIndex]" 
                    alt="Immagine" 
                    class="max-w-full max-h-full object-contain"
                />
                <!-- Close button -->
                <button 
                    @click="isMobileLightboxOpen = false"
                    class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white"
                >
                    <X class="w-5 h-5" />
                </button>
                <!-- Navigation -->
                <button 
                    v-if="mobileLightboxIndex > 0"
                    @click="mobileLightboxIndex--"
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white"
                >
                    <ChevronLeft class="w-6 h-6" />
                </button>
                <button 
                    v-if="professional.gallery && mobileLightboxIndex < professional.gallery.length - 1"
                    @click="mobileLightboxIndex++"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white"
                >
                    <ChevronRight class="w-6 h-6" />
                </button>
                <!-- Counter -->
                <div class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm font-medium">
                    {{ mobileLightboxIndex + 1 }} / {{ professional.gallery?.length }}
                </div>
            </div>
        </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, User as UserIcon, Images, Camera, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import type { Professional } from '@/composables/useProfessionals'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog'

const props = defineProps<{
  professional: Professional
  isSelected?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-gallery', id: string | number): void
}>()

const isMobileDialogOpen = ref(false)
const isMobileLightboxOpen = ref(false)
const mobileLightboxIndex = ref(0)

const hasGallery = computed(() => {
    return props.professional.gallery && props.professional.gallery.length > 0
})

const handleGalleryClick = () => {
    // On mobile, open dialog
    if (window.innerWidth < 1024) {
        isMobileDialogOpen.value = true
    } else {
        // On desktop, emit event to parent for full-width expansion
        emit('toggle-gallery', props.professional.id)
    }
}

const openMobileLightbox = (index: number) => {
    mobileLightboxIndex.value = index
    isMobileLightboxOpen.value = true
}
</script>
