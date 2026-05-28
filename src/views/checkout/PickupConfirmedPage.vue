
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, Store as StoreIcon, Calendar, Wallet, ArrowRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { fetchAPI } from '@/services/api'
import { STORE, formatPickupSlot } from '@/config/store'

const route = useRoute()
const router = useRouter()
const order = ref<any>(null)
const loading = ref(true)
const error = ref(false)

const orderId = computed(() => route.query.orderId as string | undefined)

const formatPrice = (price: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price)

const pickupSlotLabel = computed(() => {
    const slot = order.value?.pickup_slot
    if (!slot) return ''
    return formatPickupSlot(slot)
})

onMounted(async () => {
    if (!orderId.value) {
        error.value = true
        loading.value = false
        return
    }
    try {
        const res = await fetchAPI<{ data: any }>(`/orders/${orderId.value}`, { populate: '*' })
        order.value = res.data
    } catch (e) {
        console.error('Failed to fetch order', e)
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
    <div class="max-w-xl w-full space-y-6">

      <div class="text-center space-y-3 animate-in zoom-in-95 duration-300">
        <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 class="w-9 h-9" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Ritiro prenotato!</h1>
        <p class="text-gray-600">
          Abbiamo registrato il tuo ordine. Ti aspettiamo in negozio per il ritiro e il pagamento.
        </p>
      </div>

      <div v-if="loading" class="text-center text-sm text-slate-500 py-6">
        Caricamento dettagli ordine...
      </div>

      <div v-else-if="error" class="text-center text-sm text-red-600 py-6">
        Non siamo riusciti a caricare l'ordine. Controlla il tuo profilo per i dettagli.
      </div>

      <Card v-else class="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-base">Dettagli ritiro</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent class="pt-6 space-y-4">

          <div class="flex items-start gap-3">
            <StoreIcon class="w-5 h-5 text-[#ED8900] mt-0.5 shrink-0" />
            <div>
              <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">Negozio</div>
              <div class="text-sm font-semibold text-slate-900 mt-0.5">{{ STORE.name }}</div>
              <div class="text-sm text-slate-600">
                {{ STORE.address }}, {{ STORE.zip }} {{ STORE.city }} ({{ STORE.province }})
              </div>
              <div class="text-xs text-slate-500 mt-0.5">{{ STORE.phone }}</div>
            </div>
          </div>

          <Separator />

          <div class="flex items-start gap-3">
            <Calendar class="w-5 h-5 text-[#ED8900] mt-0.5 shrink-0" />
            <div>
              <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">Quando</div>
              <div class="text-sm font-semibold text-slate-900 mt-0.5">{{ pickupSlotLabel }}</div>
            </div>
          </div>

          <Separator />

          <div class="flex items-start gap-3">
            <Wallet class="w-5 h-5 text-[#ED8900] mt-0.5 shrink-0" />
            <div class="flex-1">
              <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">Pagamento</div>
              <div class="text-sm font-semibold text-slate-900 mt-0.5">Da saldare in negozio</div>
              <div class="text-lg font-bold text-[#ED8900] mt-1">{{ formatPrice(order.total) }}</div>
            </div>
          </div>

          <div v-if="order.order_number" class="text-xs text-slate-400 pt-2">
            Riferimento ordine: <span class="font-mono">{{ order.order_number }}</span>
          </div>
        </CardContent>
      </Card>

      <div class="flex flex-col sm:flex-row gap-3">
        <Button @click="router.push('/profile')" variant="outline" class="flex-1">
          Vedi i miei ordini
        </Button>
        <Button @click="router.push('/')" class="flex-1 bg-[#ED8900] hover:bg-[#d67b00]">
          Continua lo shopping <ArrowRight class="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
