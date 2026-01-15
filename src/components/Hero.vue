<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="relative h-[calc(100vh-128px)] w-full overflow-hidden flex items-center">
    <!-- Background Image with Overlay -->
    <div 
      class="absolute inset-0 bg-cover bg-center z-0" 
      style="background-image: url('/img/hero.png');"
    >
      <div class="absolute inset-0 bg-black/60"></div>
    </div>

    <div class="container mx-auto px-4 relative z-10 text-white">
      <div class="max-w-3xl space-y-6">
        <div class="flex items-center gap-2">
           <span class="px-3 py-1 bg-[#ED8900] text-white text-xs font-bold uppercase tracking-wider rounded-sm">
             Partner Sika Ufficiale
           </span>
        </div>
        
        <h1 class="text-5xl md:text-6xl font-bold leading-tight">
          Il Tuo Partner di Fiducia per <span class="text-[#ED8900]">l'Edilizia Professionale</span>
        </h1>
        
        <p class="text-lg md:text-xl text-gray-200 max-w-2xl">
          Dal 2011, forniamo soluzioni tecniche avanzate, pavimentazioni e materiali per professionisti, imprese e privati a Brindisi.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <RouterLink to="/prodotti">
            <Button class="bg-[#ED8900] hover:bg-orange-600 text-white h-12 px-8 text-lg font-medium hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/20">
              I nostri prodotti
              <ArrowRight class="ml-2 h-5 w-5" />
            </Button>
          </RouterLink>
          
          <RouterLink to="/contatti">
            <Button variant="outline" class="h-12 px-8 text-lg font-medium border-white text-white hover:bg-white hover:text-black bg-transparent hover:scale-105 active:scale-95">
              Richiedi Consulenza
            </Button>
          </RouterLink>
        </div>

        <div class="pt-8 flex items-center gap-8 opacity-80 text-sm">
           <div class="flex items-center gap-2">
             <div class="w-2 h-2 rounded-full bg-[#ED8900]"></div>
             <span>Assistenza Tecnica</span>
           </div>
           <div class="flex items-center gap-2">
             <div class="w-2 h-2 rounded-full bg-[#ED8900]"></div>
             <span>Ampio Magazzino</span>
           </div>
           <div class="flex items-center gap-2">
             <div class="w-2 h-2 rounded-full bg-[#ED8900]"></div>
             <span>Consegne Rapide</span>
           </div>
        </div>
      </div>
    </div>
  </section>
</template>
