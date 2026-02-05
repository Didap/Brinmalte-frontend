<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { HardHat, Users, CheckCircle2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <section class="py-20 bg-white border-b border-gray-100">
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        <!-- Content Side -->
        <div class="flex-1 space-y-8">
            <div class="space-y-4">
                <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                    <span class="w-8 h-px bg-[#ED8900]"></span>
                    Area Professionisti
                </span>
                <h2 class="text-4xl font-bold text-slate-900 leading-tight">
                    Lavori nell'edilizia? <br>
                    <span class="text-[#ED8900]">Diventa Partner.</span>
                </h2>
                <p class="text-slate-600 text-lg leading-relaxed max-w-xl">
                    BrinMalte supporta architetti, ingegneri e imprese edili con vantaggi esclusivi.
                    Accedi a listini riservati, assistenza prioritaria e gestione semplificata degli ordini.
                </p>
            </div>

            <!-- Benefits List -->
            <ul class="space-y-4">
                <li class="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 class="w-5 h-5 text-[#ED8900]" />
                    <span class="font-medium">Scontistica dedicata su tutto il catalogo</span>
                </li>
                <li class="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 class="w-5 h-5 text-[#ED8900]" />
                    <span class="font-medium">Consulenza tecnica specializzata in cantiere</span>
                </li>
                <li class="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 class="w-5 h-5 text-[#ED8900]" />
                    <span class="font-medium">Consegne rapide e flessibili</span>
                </li>
            </ul>
            
            <div class="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                @click="router.push('/login?tab=register&prof=true')" 
                class="bg-[#ED8900] hover:bg-orange-600 text-white font-medium text-lg h-12 px-8 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
              >
                <HardHat class="w-5 h-5 mr-2" />
                Registrati come Professionista
              </Button>
              
              <Button 
                variant="outline" 
                @click="router.push('/professionals')" 
                class="border-slate-200 text-slate-700 hover:border-[#ED8900] hover:text-[#ED8900] font-medium text-lg h-12 px-8 bg-transparent"
              >
                <Users class="w-5 h-5 mr-2" />
                Consulta l'Albo
              </Button>
            </div>
        </div>
        
        <!-- Image Side -->
        <div class="flex-1 w-full relative">
            <div class="absolute -inset-4 bg-orange-50 rounded-[2rem] transform rotate-3 -z-10"></div>
            <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative group">
                <img 
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop" 
                    alt="Edilizia Professionale" 
                    class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                >
                <!-- Overlay Gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>
