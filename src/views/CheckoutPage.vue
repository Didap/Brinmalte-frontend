
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Loader2, ArrowLeft, Truck, CreditCard, MapPin, Mail, User as UserIcon } from 'lucide-vue-next'
import { createOrder } from '@/services/api'

const cartStore = useCartStore()
const router = useRouter()
const loading = ref(false)

const form = ref({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
})

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price)
}

const handleSubmit = async () => {
    if (cartStore.items.length === 0) return
    loading.value = true
    
    try {
        const orderPayload = {
            customer_email: form.value.email,
            customer_name: `${form.value.firstName} ${form.value.lastName}`,
            shipping_address: {
                address: form.value.address,
                city: form.value.city,
                zip: form.value.zip
            },
            total: cartStore.totalPrice,
            status: 'pending',
            items: cartStore.items.map(item => ({
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                product: item.id // Relation
            }))
        }

        await createOrder(orderPayload)
        
        // Success
        cartStore.clearCart()
        alert('Ordine ricevuto! Grazie per il tuo acquisto.')
        router.push('/')
    } catch (err) {
        console.error(err)
        alert('Errore durante l\'invio dell\'ordine.')
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="bg-gray-50/50 min-h-screen py-12 font-sans text-slate-800">
    <div class="container mx-auto px-4 max-w-6xl">
      
      <!-- Back Link -->
      <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-[#ED8900] mb-8 transition-colors font-medium text-sm">
         <ArrowLeft class="w-4 h-4" /> Torna allo shopping
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Form -->
        <div class="lg:col-span-7 space-y-6">
            <h1 class="text-3xl font-bold tracking-tight text-[#4B4846] mb-2">Checkout</h1>
            
            <form @submit.prevent="handleSubmit">
                <Card class="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Dettagli di Spedizione</CardTitle>
                        <CardDescription>Inserisci i tuoi dati per la consegna.</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent class="space-y-6 pt-6">
                        
                        <!-- Contact info -->
                        <div class="space-y-4">
                           <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <Mail class="w-4 h-4 text-[#ED8900]" /> Contatto
                           </h3>
                           <Input v-model="form.email" type="email" placeholder="Email" required class="" />
                        </div>

                        <Separator />

                        <!-- Shipping Address -->
                        <div class="space-y-4">
                            <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
                               <UserIcon class="w-4 h-4 text-[#ED8900]" /> Destinatario
                            </h3>
                            <div class="grid grid-cols-2 gap-4">
                                <Input v-model="form.firstName" placeholder="Nome" required />
                                <Input v-model="form.lastName" placeholder="Cognome" required />
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                             <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
                               <MapPin class="w-4 h-4 text-[#ED8900]" /> Indirizzo
                            </h3>
                             <Input v-model="form.address" placeholder="Via e Numero Civico" required />
                             <div class="grid grid-cols-2 gap-4">
                                <Input v-model="form.zip" placeholder="CAP" required />
                                <Input v-model="form.city" placeholder="Città" required />
                             </div>
                        </div>

                    </CardContent>
                </Card>

                <Card class="mt-6 border-slate-200 shadow-sm">
                     <CardHeader>
                        <CardTitle>Pagamento</CardTitle>
                        <CardDescription>Scegli il metodo di pagamento preferito.</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent class="pt-6">
                       <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center gap-4 opacity-75 cursor-not-allowed">
                          <CreditCard class="w-5 h-5 text-slate-400" />
                          <span class="text-sm font-medium text-slate-600">Carta di Credito / Stripe (Prossimamente)</span>
                       </div>
                       <div class="mt-2 text-xs text-slate-400">
                          * In questa demo l'ordine verrà registrato senza transazione reale.
                       </div>
                    </CardContent>
                    <CardFooter class="bg-slate-50/50 border-t border-slate-100 p-6">
                        <Button type="submit" :disabled="loading || cartStore.items.length === 0" class="w-full bg-[#ED8900] hover:bg-[#d67b00] text-lg font-bold h-12 shadow-md hover:shadow-lg transition-all">
                            <Loader2 v-if="loading" class="w-5 h-5 mr-2 animate-spin" />
                            {{ loading ? 'Elaborazione...' : 'Conferma Ordine' }}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>

        <!-- Right: Order Summary -->
        <div class="lg:col-span-5">
            <Card class="sticky top-24 border-slate-200 shadow-sm overflow-hidden">
                <CardHeader class="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle class="text-lg">Riepilogo Ordine</CardTitle>
                </CardHeader>
                
                <CardContent class="p-0">
                    <div class="max-h-[400px] overflow-y-auto p-6 space-y-4">
                        <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4">
                            <div class="w-16 h-16 bg-white rounded border border-slate-200 flex items-center justify-center shrink-0 p-1">
                                 <img :src="item.image" :alt="item.name" class="w-full h-full object-contain" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-sm text-slate-800 line-clamp-2 truncate">{{ item.name }}</h4>
                                <p class="text-xs text-slate-500 mt-1">Qt: {{ item.quantity }}</p>
                            </div>
                            <div class="font-bold text-sm text-[#ED8900] whitespace-nowrap">
                                {{ formatPrice(item.price * item.quantity) }}
                            </div>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div class="p-6 space-y-3 bg-slate-50/30">
                        <div class="flex justify-between text-sm text-slate-600">
                            <span>Subtotale</span>
                            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-slate-600">
                            <span>Spedizione</span>
                            <span class="text-green-600 font-medium">Gratis</span>
                        </div>
                        <Separator class="my-2"/>
                        <div class="flex justify-between text-xl font-bold text-[#4B4846]">
                            <span>Totale</span>
                            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
                        </div>
                    </div>
                </CardContent>
                
                <CardFooter class="bg-indigo-50 border-t border-indigo-100 p-4 justify-center">
                    <div class="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                        <Truck class="w-4 h-4" />
                        Spedizione Gratuita in tutta Italia
                    </div>
                </CardFooter>
            </Card>
        </div>

      </div>
    </div>
  </div>
</template>
