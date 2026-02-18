<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Clock, Loader2 } from 'lucide-vue-next'
import { sendContactForm } from '@/services/api'
import { toast } from 'vue-sonner'

const nome = ref('')
const email = ref('')
const telefono = ref('')
const messaggio = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!nome.value || !email.value || !messaggio.value) {
    toast.error('Compila i campi obbligatori', { description: 'Nome, email e messaggio sono richiesti.' })
    return
  }

  loading.value = true
  try {
    await sendContactForm('contatto', {
      nome: nome.value,
      email: email.value,
      telefono: telefono.value,
      messaggio: messaggio.value,
    })
    toast.success('Messaggio inviato!', { description: 'Ti risponderemo il prima possibile.' })
    nome.value = ''
    email.value = ''
    telefono.value = ''
    messaggio.value = ''
  } catch (err: any) {
    toast.error('Errore nell\'invio', { description: err.message || 'Riprova più tardi.' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F0]">
    <div class="pt-24 pb-8">
      <div class="container mx-auto px-4">

        <!-- Page Header -->
        <div class="text-center mb-16">
          <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm mb-2 block">Siamo qui per te</span>
          <h1 class="text-4xl md:text-5xl font-bold text-[#4B4846] mb-4">Contattaci</h1>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Hai domande sui nostri prodotti o servizi? Compila il form o vieni a trovarci nella nostra sede.
            Il nostro team è a tua completa disposizione.
          </p>
        </div>

        <!-- Info Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

           <!-- Sede -->
           <div class="flex items-center gap-6">
                <div class="bg-[#ED8900]/10 w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-xl">
                  <MapPin class="h-8 w-8 text-[#ED8900]" />
                </div>
                <div>
                    <h3 class="font-bold text-[#4B4846] text-lg mb-1">Sede Operativa</h3>
                    <p class="text-gray-600">Via Enrico Fermi, 12<br>72100 Brindisi (BR)</p>
                </div>
           </div>

           <!-- Contatti -->
           <div class="flex items-center gap-6">
                <div class="bg-[#ED8900]/10 w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-xl">
                  <Phone class="h-8 w-8 text-[#ED8900]" />
                </div>
                <div>
                    <h3 class="font-bold text-[#4B4846] text-lg mb-1">Contatti</h3>
                    <p class="text-gray-600">
                    <a href="tel:+390831367066" class="hover:text-[#ED8900] transition-colors">+39 0831 367066</a><br>
                    <a href="mailto:brinmalte@gmail.com" class="hover:text-[#ED8900] transition-colors">brinmalte@gmail.com</a>
                    </p>
                </div>
           </div>

        </div>
      </div>
    </div>

    <!-- Prominent Opening Hours Section -->
    <div class="bg-slate-50 py-20">
        <div class="container mx-auto px-4 text-center">
            <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm mb-4 block">Disponibilità</span>
            <h2 class="text-3xl md:text-4xl font-bold text-[#4B4846] mb-12">Orari di Apertura</h2>

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
    </div>

    <!-- Full Width Google Maps -->
    <div class="w-full h-[500px] relative group bg-gray-200">
        <a
        href="https://www.google.com/maps/place/Brinmalte+S.R.L.+-+Sika+Point/@40.6323143,17.9524246,17z/data=!3m1!4b1!4m6!3m5!1s0x1346799392c36675:0xc3fd38ddcb2f575e!8m2!3d40.6323143!4d17.9524246!16s%2Fg%2F11c5rvq_5?entry=ttu"
        target="_blank"
        class="absolute inset-0 z-10 bg-transparent"
        title="Apri su Google Maps"
      ></a>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.8897056623005!2d17.952424612197895!3d40.63231427128651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1346799392c36675%3A0xc3fd38ddcb2f575e!2sBrinmalte%20S.R.L.%20-%20Sika%20Point!5e0!3m2!1sit!2sit!4v1768212455679!5m2!1sit!2sit"
        width="100%"
        height="100%"
        style="border:0;"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="grayscale transition-all duration-500 pointer-events-none"
      ></iframe>
    </div>

    <!-- Contact Form Section (Bottom) -->
    <div class="py-24 bg-white">
        <div class="container mx-auto px-4 max-w-4xl">
            <div class="text-center mb-12">
                <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm mb-2 block">Scrivici</span>
                <h2 class="text-3xl md:text-4xl font-bold text-[#4B4846]">Inviaci un messaggio</h2>
                <p class="text-gray-500 mt-4">Compila il form sottostante per richiedere informazioni o preventivi.</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <Label for="name" class="text-[#4B4846]">Nome e Cognome *</Label>
                    <Input id="name" v-model="nome" placeholder="Mario Rossi" class="bg-gray-50 border-gray-200 focus-visible:ring-[#ED8900] h-12" />
                </div>
                <div class="space-y-2">
                    <Label for="email" class="text-[#4B4846]">Email *</Label>
                    <Input id="email" v-model="email" type="email" placeholder="mario@email.com" class="bg-gray-50 border-gray-200 focus-visible:ring-[#ED8900] h-12" />
                </div>
                </div>

                <div class="space-y-2">
                <Label for="phone" class="text-[#4B4846]">Telefono (opzionale)</Label>
                <Input id="phone" v-model="telefono" type="tel" placeholder="+39 333 1234567" class="bg-gray-50 border-gray-200 focus-visible:ring-[#ED8900] h-12" />
                </div>

                <div class="space-y-2">
                <Label for="message" class="text-[#4B4846]">Messaggio *</Label>
                <Textarea rows="6" id="message" v-model="messaggio" placeholder="Salve, vorrei ricevere informazioni su..." class="bg-gray-50 border-gray-200 focus-visible:ring-[#ED8900]" />
                </div>

                <div class="text-center pt-4">
                    <Button type="submit" :disabled="loading" class="w-full md:w-auto px-12 bg-[#ED8900] hover:bg-orange-600 text-white font-bold py-6 text-lg shadow-lg shadow-orange-500/20 disabled:opacity-70">
                      <Loader2 v-if="loading" class="w-5 h-5 animate-spin mr-2" />
                      {{ loading ? 'Invio in corso...' : 'Invia Richiesta' }}
                    </Button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>
