<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, ArrowRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const sessionId = ref(route.query.session_id)

onMounted(() => {
    if (!sessionId.value) {
        // If no session ID, maybe redirect or show generic message
    }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
          
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check class="w-8 h-8" />
          </div>

          <h1 class="text-2xl font-bold text-gray-900">Pagamento Riuscito!</h1>
          
          <p class="text-gray-600">
              Grazie per il tuo ordine. Abbiamo ricevuto il pagamento e stiamo processando la spedizione.
          </p>
          
          <div class="pt-4 space-y-3">
              <Button @click="router.push('/profile')" variant="outline" class="w-full">
                  Visualizza Ordine
              </Button>
               <Button @click="router.push('/')" class="w-full bg-[#ED8900] hover:bg-[#d67b00]">
                  Torna alla Home <ArrowRight class="ml-2 w-4 h-4" />
              </Button>
          </div>
      </div>
  </div>
</template>
