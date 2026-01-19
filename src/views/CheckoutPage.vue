
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Loader2, ArrowLeft, Truck, CreditCard, Mail, User as UserIcon } from 'lucide-vue-next'
import { createOrder, getCurrentCustomer, updateCustomer, createCustomer } from '@/services/api'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/composables/useAuth'
import { useItalianGeo } from '@/composables/useItalianGeo'

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
    street: '',
    number: '',
    city: '',
    zip: '',
    province: '',
    region: '',
})

// Geo Data
const { regions, getProvinces, getCities, getZip, findLocationByZip, init: initGeo } = useItalianGeo()
const availableProvinces = computed(() => getProvinces(form.value.region))
const availableCities = computed(() => {
    const prov = availableProvinces.value.find(p => p.code === form.value.province)
    return getCities(prov?.name || '')
})

// Watchers for cascading reset
import { watch, computed } from 'vue'

const isAutoFilling = ref(false)

watch(() => form.value.region, () => {
    if (isAutoFilling.value) return
    form.value.province = ''
    form.value.city = ''
    form.value.zip = ''
})

watch(() => form.value.province, () => {
    if (isAutoFilling.value) return
    form.value.city = ''
    form.value.zip = ''
})

watch(() => form.value.city, (newCity) => {
    if (isAutoFilling.value) return
    if (newCity) {
         // Auto-fill zip
         const prov = availableProvinces.value.find(p => p.code === form.value.province)
         if (prov) {
             const zip = getZip(newCity, prov.name)
             if (zip) form.value.zip = zip
         }
    }
})

watch(() => form.value.zip, (newZip) => {
    if (!newZip || newZip.length !== 5) return
    if (isAutoFilling.value) return // Avoid loop if city set zip

    const location = findLocationByZip(newZip)
    if (location) {
        // Found a match! Auto-fill everything
        isAutoFilling.value = true
        
        // We set values in order but since we have the flag, order matters less for watchers
        form.value.region = location.region
        
        // We need to wait for computed 'availableProvinces' to update? 
        // No, computed allows immediate set of next value usually, but to be safe with UI
        // we can just set them. Vue reactivity handles dependencies.
        form.value.province = location.province
        form.value.city = location.city

        // Reset flag after DOM cycle to ensure watchers skipped
        setTimeout(() => {
            isAutoFilling.value = false
        }, 100)
    }
})

// Prefill form
import { onMounted } from 'vue'

onMounted(async () => {
    // Init Geo Data
    initGeo()

    if (user.value) {
        // Fetch customer data linked to this user
        try {
            const customer = await getCurrentCustomer(user.value.id)
            if (customer) {
                customerId.value = customer.documentId
                
                // Prevent watchers from clearing fields during prefill
                isAutoFilling.value = true
                
                form.value = {
                    email: user.value.email, // Always use user email
                    firstName: customer.name || '',
                    lastName: customer.surname || '',
                    phone: customer.phone || '',
                    street: '',
                    number: '',
                    city: customer.address?.city || '',
                    zip: customer.address?.zip || '',
                    province: customer.address?.province || '',
                    region: customer.address?.region || ''
                }
                
                // Parse existing address
                const fullAddress = customer.address?.address || ''
                if (fullAddress) {
                    // Naive split attempt if comma exists
                    const parts = fullAddress.split(',')
                    if (parts.length > 1) {
                         form.value.number = parts.pop()!.trim() // Take last part as number
                         form.value.street = parts.join(',').trim() // Rejoin rest as street
                    } else {
                         form.value.street = fullAddress
                    }
                }
                
                setTimeout(() => {
                    isAutoFilling.value = false
                }, 100)
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
    
    // Combine Street and Number
    const combinedAddress = `${form.value.street}, ${form.value.number}`.replace(/,\s*$/, '') // Remove trailing comma if number empty

    try {
        const orderPayload = {
            customer_email: form.value.email,
            customer_name: `${form.value.firstName} ${form.value.lastName}`,
            shipping_address: {
                address: combinedAddress,
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
                address: combinedAddress,
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
                    toast.error('Errore Permissions: Impossibile aggiornare i dati cliente. Controlla i permessi "update" su Customer.')
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
                 toast.error('Errore Permissions: Impossibile creare il profilo cliente. Controlla i permessi "create" su Customer.')
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
            toast.error('Errore Permissions: Impossibile creare l\'ordine. Controlla i permessi "create" su Order.')
            throw e
        }
        
        // Success
        cartStore.clearCart()
        toast.success('Ordine ricevuto! Grazie per il tuo acquisto.')
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
                                    <Input id="email" name="email" v-model="form.email" type="email" placeholder="nome@esempio.com" required autocomplete="email" />
                                </div>
                                <div class="space-y-2">
                                    <Label for="phone">Telefono</Label>
                                    <Input id="phone" name="phone" v-model="form.phone" type="tel" placeholder="+39 333 0000000" required autocomplete="tel" />
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
                                    <Input id="firstName" name="firstName" v-model="form.firstName" placeholder="Mario" required autocomplete="given-name" />
                                </div>
                                <div class="space-y-2">
                                    <Label for="lastName">Cognome</Label>
                                    <Input id="lastName" name="lastName" v-model="form.lastName" placeholder="Rossi" required autocomplete="family-name" />
                                </div>
                            </div>

                            <!-- Geo Row 1: CAP + Region -->
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div class="md:col-span-3 space-y-2">
                                    <Label for="zip">CAP</Label>
                                    <Input id="zip" name="zip" v-model="form.zip" placeholder="00100" required autocomplete="postal-code" />
                                </div>
                                
                                <div class="md:col-span-9 space-y-2">
                                    <Label for="region">Regione</Label>
                                    <!-- Hidden Input for Autocomplete -->
                                    <input type="text" id="region-input" name="region" v-model="form.region" autocomplete="address-level1" class="sr-only" tabindex="-1" aria-hidden="true" />
                                    <Select v-model="form.region">
                                        <SelectTrigger id="region">
                                            <SelectValue placeholder="Seleziona..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="r in regions" :key="r" :value="r">{{ r }}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <!-- Geo Row 2: Province + City -->
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div class="md:col-span-4 space-y-2">
                                    <Label for="province">Provincia</Label>
                                    <!-- Hidden Input for Autocomplete -->
                                    <input type="text" id="province-input" name="province" v-model="form.province" autocomplete="address-level1" class="sr-only" tabindex="-1" aria-hidden="true" />
                                    <Select v-model="form.province" :disabled="!form.region">
                                        <SelectTrigger id="province">
                                            <SelectValue placeholder="Seleziona..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="p in availableProvinces" :key="p.code" :value="p.code">
                                                {{ p.name }} ({{ p.code }})
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div class="md:col-span-8 space-y-2">
                                    <Label for="city">Città</Label>
                                    <!-- Hidden Input for Autocomplete -->
                                    <input type="text" id="city-input" name="city" v-model="form.city" autocomplete="address-level2" class="sr-only" tabindex="-1" aria-hidden="true" />
                                    <Select v-model="form.city" :disabled="!form.province">
                                        <SelectTrigger id="city">
                                            <SelectValue placeholder="Seleziona..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="c in availableCities" :key="c.name" :value="c.name">
                                                {{ c.name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <!-- Street Address Split -->
                            <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-10 space-y-2">
                                    <Label for="street">Via / Piazza</Label>
                                    <Input id="street" name="street" v-model="form.street" placeholder="Via Roma" required autocomplete="address-line1" />
                                </div>
                                <div class="col-span-2 space-y-2">
                                    <Label for="number">Civico</Label>
                                    <Input id="number" name="number" v-model="form.number" placeholder="10" required autocomplete="address-line2" />
                                </div>
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
