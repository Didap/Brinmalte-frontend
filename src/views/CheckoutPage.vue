
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Loader2, ArrowLeft, Truck, CreditCard, Mail, User as UserIcon } from 'lucide-vue-next'
import { createOrder, getCurrentCustomer, updateCustomer, createCustomer } from '@/services/api'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/composables/useAuth'

const cartStore = useCartStore()
const router = useRouter()
const { user } = useAuth()
const loading = ref(false)
const saveAddress = ref(true)
const customerId = ref<string | null>(null)

const form = ref({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    province: '',
    region: '',
})

// Prefill form
import { onMounted } from 'vue'

onMounted(async () => {
    if (user.value) {
        // Fetch customer data linked to this user
        try {
            const customer = await getCurrentCustomer(user.value.id)
            if (customer) {
                customerId.value = customer.documentId
                form.value = {
                    email: user.value.email, // Always use user email
                    firstName: customer.name || '',
                    lastName: customer.surname || '',
                    phone: customer.phone || '',
                    address: customer.address?.address || '',
                    city: customer.address?.city || '',
                    zip: customer.address?.zip || '',
                    province: customer.address?.province || '',
                    region: customer.address?.region || ''
                }
            } else {
               form.value.email = user.value.email
            }
        } catch (e) {
            console.error('Failed to fetch customer profile', e)
        }
    }
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
                zip: form.value.zip,
                province: form.value.province,
                region: form.value.region,
                phone: form.value.phone
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

        let customerDocumentId = customerId.value

        const customerData = {
            name: form.value.firstName,
            surname: form.value.lastName,
            phone: form.value.phone,
            address: {
                address: form.value.address,
                city: form.value.city,
                zip: form.value.zip,
                province: form.value.province,
                region: form.value.region,
            },
            user: user.value.id // Link to user
        }

        if (customerDocumentId) {
            // Update existing customer if saveAddress is checked
            if (saveAddress.value) {
                try {
                    await updateCustomer(customerDocumentId, customerData)
                } catch (e) {
                    console.error('Failed to update customer:', e)
                    // Continue even if update fails? Better to alert but maybe not block order?
                    // For now keeping behavior strict as per recent debugging
                    alert('Errore Permissions: Impossibile aggiornare i dati cliente. Controlla i permessi "update" su Customer.')
                    // Allow proceeding to order creation? 
                    // If we throw, we stop. Let's stop to be safe.
                    throw e 
                }
            }
        } else {
            // Create new customer profile
            try {
                const newCustomer = await createCustomer(customerData) as any
                customerDocumentId = newCustomer.data?.documentId || newCustomer.data?.id
            } catch (err) {
                 console.error("Failed to create customer:", err)
                 alert('Errore Permissions: Impossibile creare il profilo cliente. Controlla i permessi "create" su Customer.')
                 throw err 
            }
        }

        // Add customer relation to order payload
        const finalOrderPayload = {
            ...orderPayload,
            customer: customerDocumentId,
        }
        
        try {
            await createOrder(finalOrderPayload)
        } catch (e) {
            console.error('Failed to create order:', e)
            alert('Errore Permissions: Impossibile creare l\'ordine. Controlla i permessi "create" su Order.')
            throw e
        }
        
        // Success
        cartStore.clearCart()
        alert('Ordine ricevuto! Grazie per il tuo acquisto.')
        router.push('/')
    } catch (err) {
        // Main catch handles the thrown errors above
        console.error('Checkout Error:', err)
        // Alert already shown by specific catch blocks
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
                            <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                               <Mail class="w-4 h-4 text-[#ED8900]" /> Dati di Contatto
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <Label for="email">Email</Label>
                                    <Input id="email" v-model="form.email" type="email" placeholder="nome@esempio.com" required />
                                </div>
                                <div class="space-y-2">
                                    <Label for="phone">Telefono</Label>
                                    <Input id="phone" v-model="form.phone" type="tel" placeholder="+39 333 0000000" required />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <!-- Shipping Address -->
                        <div class="space-y-4">
                            <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                               <UserIcon class="w-4 h-4 text-[#ED8900]" /> Dati di Spedizione
                            </h3>
                            
                            <!-- Name -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <Label for="firstName">Nome</Label>
                                    <Input id="firstName" v-model="form.firstName" placeholder="Mario" required />
                                </div>
                                <div class="space-y-2">
                                    <Label for="lastName">Cognome</Label>
                                    <Input id="lastName" v-model="form.lastName" placeholder="Rossi" required />
                                </div>
                            </div>

                            <!-- Address -->
                            <div class="space-y-2">
                                <Label for="address">Indirizzo e N. Civico</Label>
                                <Input id="address" v-model="form.address" placeholder="Via Roma, 1" required />
                            </div>

                            <!-- City Info -->
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div class="md:col-span-3 space-y-2">
                                    <Label for="zip">CAP</Label>
                                    <Input id="zip" v-model="form.zip" placeholder="00100" required />
                                </div>
                                <div class="md:col-span-5 space-y-2">
                                    <Label for="city">Città</Label>
                                    <Input id="city" v-model="form.city" placeholder="Roma" required />
                                </div>
                                <div class="md:col-span-4 space-y-2">
                                    <Label for="province">Provincia</Label>
                                    <Input id="province" v-model="form.province" placeholder="RM" maxlength="2" class="uppercase" required />
                                </div>
                            </div>

                            <!-- Region -->
                            <div class="space-y-2">
                                <Label for="region">Regione</Label>
                                <Input id="region" v-model="form.region" placeholder="Lazio" required />
                            </div>

                            <div class="flex items-center space-x-2 pt-4">
                                <Checkbox id="save-address" v-model:checked="saveAddress" />
                                <Label for="save-address" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Salva questo indirizzo per il prossimo acquisto
                                </Label>
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
