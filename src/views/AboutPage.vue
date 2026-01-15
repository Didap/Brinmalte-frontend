<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Users, Target, ShieldCheck, Clock } from 'lucide-vue-next'

const values = [
  {
    title: 'Qualità Certificata',
    description: 'Selezioniamo solo i migliori marchi e prodotti per garantire risultati duraturi e professionali.',
    icon: ShieldCheck
  },
  {
    title: 'Supporto Esperto',
    description: 'Il nostro team di specialisti è sempre pronto a consigliarti le soluzioni migliori per ogni progetto.',
    icon: Users
  },
  {
    title: 'Innovazione Costante',
    description: 'Siamo sempre aggiornati sulle ultime tecnologie e materiali nel settore dell\'edilizia.',
    icon: Target
  }
]

const history = [
  {
    year: '1985',
    title: 'La Fondazione',
    description: 'BrinMalte nasce dalla passione per l\'edilizia di qualità, aprendo il primo punto vendita a Brindisi.'
  },
  {
    year: '2000',
    title: 'Espansione',
    description: 'Ampliamento della gamma prodotti e specializzazione nei sistemi a secco e isolamento termico.'
  },
  {
    year: '2015',
    title: 'Partner Sika',
    description: 'Diventiamo rivenditori autorizzati Sika, consolidando la nostra posizione come leader nel settore.'
  },
  {
    year: '2024',
    title: 'Innovazione Digitale',
    description: 'Lancio della nuova piattaforma online per servire meglio i nostri clienti professionisti e privati.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Hero Section -->
    <section class="relative bg-[#4B4846] text-white py-24 overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
      <div class="container mx-auto px-4 relative z-10 text-center">
        <h1 class="text-5xl font-bold mb-6 text-[#ED8900]">La Nostra Storia</h1>
        <p class="text-xl max-w-2xl mx-auto text-slate-200">
          Da oltre 40 anni, BrinMalte è il punto di riferimento per professionisti e privati nel mondo dell'edilizia e del colore.
        </p>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-20 container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-[#4B4846] mb-4">I Nostri Valori</h2>
        <div class="w-24 h-1 bg-[#ED8900] mx-auto"></div>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <Card v-for="(value, index) in values" :key="index" class="border-t-4 border-t-[#ED8900] shadow-md hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <component :is="value.icon" class="w-6 h-6 text-[#ED8900]" />
            </div>
            <CardTitle class="text-xl text-[#4B4846]">{{ value.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-slate-600">{{ value.description }}</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- History Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-[#4B4846] mb-4">Il Nostro Percorso</h2>
          <div class="w-24 h-1 bg-[#ED8900] mx-auto"></div>
        </div>

        <div class="relative max-w-4xl mx-auto">
          <!-- Vertical Line -->
          <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-slate-200"></div>

          <div v-for="(item, index) in history" :key="index" class="relative mb-12 last:mb-0">
            <div class="flex items-center justify-between w-full" :class="{'flex-row-reverse': index % 2 !== 0}">
              <!-- Content -->
              <div class="w-5/12" :class="{'text-right': index % 2 === 0, 'text-left': index % 2 !== 0}">
                <span class="text-5xl font-bold text-gray-300 absolute -top-4 transition-colors duration-300" 
                      :class="{'left-0': index % 2 !== 0, 'right-0': index % 2 === 0}">
                  {{ item.year }}
                </span>
                <div class="relative z-10 pt-6">
                  <h3 class="text-xl font-bold text-[#ED8900] mb-2">{{ item.title }}</h3>
                  <p class="text-slate-600">{{ item.description }}</p>
                </div>
              </div>
              
              <!-- Center Point -->
              <div class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-[#ED8900] z-20 flex items-center justify-center shadow-sm">
                <CheckCircle2 class="w-4 h-4 text-[#ED8900]" />
              </div>

              <!-- Spacer -->
              <div class="w-5/12"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-[#4B4846] text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">Pronto a realizzare il tuo progetto?</h2>
        <p class="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Visita il nostro catalogo prodotti o contattaci per una consulenza personalizzata.
        </p>
        <div class="flex justify-center gap-4">
          <Button size="lg" class="bg-[#ED8900] hover:bg-orange-600 text-white font-bold px-8">
            Scopri i Prodotti
          </Button>
          <Button size="lg" variant="outline" class="bg-transparent border-white text-white hover:bg-white hover:text-[#4B4846] font-bold px-8">
            Contattaci
          </Button>
        </div>
      </div>
    </section>

    <!-- Opening Hours Section -->
    <section class="py-20 bg-slate-50">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-[#4B4846] mb-12">I Nostri Orari</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Weekdays -->
          <div class="group relative bg-white rounded-2xl shadow-lg border-t-4 border-[#ED8900] overflow-hidden hover:-translate-y-1 transition-all duration-300">
            <div class="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Clock class="w-40 h-40 text-[#ED8900] transform rotate-12" />
            </div>
            <div class="relative z-10 p-8 flex flex-col items-center">
              <h3 class="text-lg font-bold text-[#ED8900] mb-3 uppercase tracking-widest">Lunedì - Venerdì</h3>
              <div class="w-12 h-1 bg-orange-100 rounded-full mb-6 group-hover:bg-[#ED8900] transition-colors"></div>
              <div class="space-y-2 text-center">
                <p class="text-3xl font-bold text-[#4B4846]">06:00 - 14:00</p>
                <p class="text-2xl font-bold text-gray-500">16:00 - 18:30</p>
              </div>
            </div>
          </div>

          <!-- Saturday -->
          <div class="group relative bg-white rounded-2xl shadow-lg border-t-4 border-[#ED8900] overflow-hidden hover:-translate-y-1 transition-all duration-300">
            <div class="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Clock class="w-40 h-40 text-[#ED8900] transform rotate-12" />
            </div>
            <div class="relative z-10 p-8 flex flex-col items-center">
              <h3 class="text-lg font-bold text-[#ED8900] mb-3 uppercase tracking-widest">Sabato</h3>
              <div class="w-12 h-1 bg-orange-100 rounded-full mb-6 group-hover:bg-[#ED8900] transition-colors"></div>
              <div class="space-y-2 text-center">
                <p class="text-3xl font-bold text-[#4B4846]">06:00 - 14:00</p>
                <span class="inline-block bg-orange-100 text-[#ED8900] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Solo Mattina</span>
              </div>
            </div>
          </div>

          <!-- Sunday -->
          <div class="group relative bg-slate-50 rounded-2xl shadow border border-gray-200 overflow-hidden opacity-90">
            <div class="absolute -right-6 -bottom-6 opacity-5">
              <Clock class="w-40 h-40 text-gray-400 transform rotate-12" />
            </div>
            <div class="relative z-10 p-8 flex flex-col items-center justify-center h-full">
              <h3 class="text-lg font-bold text-gray-400 mb-3 uppercase tracking-widest">Domenica</h3>
              <div class="w-12 h-1 bg-gray-200 rounded-full mb-6"></div>
              <p class="text-3xl font-bold text-gray-400">Chiuso</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
