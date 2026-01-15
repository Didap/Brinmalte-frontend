<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Facebook } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-[#4B4846] text-white pt-16 pb-8">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        <!-- Contact Form Section -->
        <div>
          <div class="mb-8">
            <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm mb-2 block">Parla con noi</span>
            <h2 class="text-3xl font-bold mb-4">Richiedi informazioni o <br>un preventivo gratuito</h2>
            <p class="text-gray-300">Compila il form per essere ricontattato dai nostri tecnici specializzati.</p>
          </div>

          <form class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="name" class="text-gray-300">Nome e Cognome</Label>
                <Input id="name" placeholder="Mario Rossi" class="bg-[#5d5a58] border-none text-white placeholder:text-gray-400 focus-visible:ring-[#ED8900]" />
              </div>
              <div class="space-y-2">
                <Label for="email" class="text-gray-300">Email</Label>
                <Input id="email" type="email" placeholder="mario@email.com" class="bg-[#5d5a58] border-none text-white placeholder:text-gray-400 focus-visible:ring-[#ED8900]" />
              </div>
            </div>
            
            <div class="space-y-2">
              <Label for="message" class="text-gray-300">Messaggio</Label>
              <Textarea rows="2" id="message" placeholder="Salve, vorrei ricevere informazioni su..." class="min-h-[120px] bg-[#5d5a58] border-none text-white placeholder:text-gray-400 focus-visible:ring-[#ED8900]" />
            </div>

            <Button class="w-full bg-[#ED8900] hover:bg-orange-600 text-white font-bold py-6">
              Invia Richiesta
            </Button>
          </form>
        </div>

        <!-- Map & Info Section -->
        <div class="space-y-8">
          <div>
             <span class="text-[#ED8900] font-bold tracking-widest uppercase text-sm mb-2 block">Dove Siamo</span>
             <h2 class="text-3xl font-bold mb-6">Vieni a trovarci a Brindisi</h2>
          </div>

          <!-- Google Maps Embed -->
          <div class="w-full h-[300px] rounded-xl overflow-hidden shadow-lg border-4 border-[#5d5a58] relative group">
            <!-- Overlay Link to open in Google Maps -->
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
              class="grayscale invert transition-all duration-500 pointer-events-none"
            ></iframe>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-300">
            <div class="flex items-start gap-3">
              <div class="bg-[#ED8900]/20 p-2 rounded-lg">
                <MapPin class="h-6 w-6 text-[#ED8900]" />
              </div>
              <div>
                <h4 class="font-bold text-white uppercase text-sm mb-1">Sede Operativa</h4>
                <p class="text-sm">Via Enrico Fermi, 12<br>72100 Brindisi (BR)</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="bg-[#ED8900]/20 p-2 rounded-lg">
                <Phone class="h-6 w-6 text-[#ED8900]" />
              </div>
              <div>
                <h4 class="font-bold text-white uppercase text-sm mb-1">Contatti</h4>
                <p class="text-sm">+39 0831 367066<br>brinmalte@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-[#686563] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <p>&copy; 2026 Brinmalte Srl. P.IVA 01675330748. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="#" class="hover:text-[#ED8900] transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-[#ED8900] transition-colors">Cookie Policy</a>
          <div class="flex gap-4 ml-4">
             <a href="https://www.facebook.com/brinmalteSrL/?locale=it_IT" target="_blank" class="hover:text-white transition-colors"><Facebook class="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
