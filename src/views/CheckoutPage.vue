
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Loader2, ArrowLeft, Truck, CreditCard, Mail, User as UserIcon, Store as StoreIcon, Calendar, Wallet } from 'lucide-vue-next'
import { createOrder, getCurrentCustomer, updateCustomer, createCustomer, createCheckoutSession } from '@/services/api'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/composables/useAuth'
import { useItalianGeo } from '@/composables/useItalianGeo'
import { STORE, getAvailableDates, getSlotsForDate, parseISODate, getHoursSummary } from '@/config/store'

const cartStore = useCartStore()
const router = useRouter()
const { user } = useAuth()
const loading = ref(false)
const saveAddress = ref(true)

const customerId = ref<string | null>(null)

const fulfillmentMethod = ref<'shipping' | 'pickup'>('shipping')
const paymentMethod = ref<'online' | 'in_store'>('online')

const pickupDate = ref<string>('')
const pickupSlot = ref<string>('')

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

// Geo data
const { regions, getProvinces, getCities, getZip, findLocationByZip, init: initGeo } = useItalianGeo()
const availableProvinces = computed(() => getProvinces(form.value.region))
const availableCities = computed(() => {
    const prov = availableProvinces.value.find(p => p.code === form.value.province)
    return getCities(prov?.name || '')
})

// Pickup data
const availableDates = computed(() => getAvailableDates(STORE))
const availableSlots = computed(() => {
    if (!pickupDate.value) return []
    return getSlotsForDate(parseISODate(pickupDate.value), STORE)
})
const slotOptions = computed(() =>
    availableSlots.value.map(s => ({ value: `${s.start}-${s.end}`, label: `${s.start} – ${s.end}` }))
)
const storeHoursSummary = computed(() => getHoursSummary(STORE))

watch(fulfillmentMethod, m => {
    if (m === 'shipping') {
        paymentMethod.value = 'online'
        pickupDate.value = ''
        pickupSlot.value = ''
    }
})

watch(pickupDate, () => {
    pickupSlot.value = ''
})

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
         const prov = availableProvinces.value.find(p => p.code === form.value.province)
         if (prov) {
             const zip = getZip(newCity, prov.name)
             if (zip) form.value.zip = zip
         }
    }
})

watch(() => form.value.zip, (newZip) => {
    if (!newZip || newZip.length !== 5) return
    if (isAutoFilling.value) return

    const location = findLocationByZip(newZip)
    if (location) {
        isAutoFilling.value = true
        form.value.region = location.region
        form.value.province = location.province
        form.value.city = location.city
        setTimeout(() => { isAutoFilling.value = false }, 100)
    }
})

onMounted(async () => {
    initGeo()

    if (user.value) {
        try {
            const customer = await getCurrentCustomer(user.value.id)
            if (customer) {
                customerId.value = customer.documentId
                isAutoFilling.value = true
                form.value = {
                    email: user.value.email,
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
                const fullAddress = customer.address?.address || ''
                if (fullAddress) {
                    const parts = fullAddress.split(',')
                    if (parts.length > 1) {
                         form.value.number = parts.pop()!.trim()
                         form.value.street = parts.join(',').trim()
                    } else {
                         form.value.street = fullAddress
                    }
                }
                setTimeout(() => { isAutoFilling.value = false }, 100)
            } else {
               form.value.email = user.value.email
            }
        } catch (e) {
            console.error('Failed to fetch customer profile', e)
        }
    }
})

const IVA_RATE = 0.22
const ivaAmount = computed(() => cartStore.totalPrice * IVA_RATE)
const totalWithIva = computed(() => cartStore.totalPrice + ivaAmount.value)

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price)
}

const isPickup = computed(() => fulfillmentMethod.value === 'pickup')

const canSubmit = computed(() => {
    if (cartStore.items.length === 0) return false
    if (isPickup.value) {
        return !!(pickupDate.value && pickupSlot.value && form.value.firstName && form.value.lastName && form.value.email && form.value.phone)
    }
    return true
})

const handleSubmit = async () => {
    if (!canSubmit.value) return
    loading.value = true

    try {
        const orderPayload: any = {
            customer_email: form.value.email,
            customer_name: `${form.value.firstName} ${form.value.lastName}`,
            total: totalWithIva.value,
            fulfillment_method: fulfillmentMethod.value,
            payment_method: paymentMethod.value,
            order_status: paymentMethod.value === 'in_store' ? 'awaiting_pickup' : 'pending',
            items: cartStore.items.map(item => ({
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                product: item.id
            }))
        }

        if (isPickup.value) {
            const [startTime, endTime] = pickupSlot.value.split('-')
            orderPayload.pickup_slot = { date: pickupDate.value, startTime, endTime }
            orderPayload.shipping_address = null
        } else {
            const combinedAddress = `${form.value.street}, ${form.value.number}`.replace(/,\s*$/, '')
            orderPayload.shipping_address = {
                address: combinedAddress,
                city: form.value.city,
                zip: form.value.zip,
                province: form.value.province,
                region: form.value.region,
                phone: form.value.phone
            }
        }

        let customerDocumentId = customerId.value

        const customerData: any = {
            name: form.value.firstName,
            surname: form.value.lastName,
            phone: form.value.phone,
            user: user.value.id
        }
        if (!isPickup.value) {
            const combinedAddress = `${form.value.street}, ${form.value.number}`.replace(/,\s*$/, '')
            customerData.address = {
                address: combinedAddress,
                city: form.value.city,
                zip: form.value.zip,
                province: form.value.province,
                region: form.value.region,
            }
        }

        if (customerDocumentId) {
            if (saveAddress.value && !isPickup.value) {
                try {
                    await updateCustomer(customerDocumentId, customerData)
                } catch (e) {
                    console.error('Failed to update customer:', e)
                    toast.error('Errore Permissions: Impossibile aggiornare i dati cliente.')
                    throw e
                }
            }
        } else {
            try {
                const newCustomer = await createCustomer(customerData) as any
                customerDocumentId = newCustomer.data?.documentId || newCustomer.data?.id
            } catch (err) {
                console.error("Failed to create customer:", err)
                toast.error('Errore Permissions: Impossibile creare il profilo cliente.')
                throw err
            }
        }

        const finalOrderPayload = { ...orderPayload, customer: customerDocumentId }

        const newOrder = await createOrder(finalOrderPayload) as any
        const orderId = newOrder.data?.documentId || newOrder.data?.id

        if (paymentMethod.value === 'in_store') {
            cartStore.clearCart()
            router.push({ path: '/checkout/pickup-confirmed', query: { orderId } })
            return
        }

        try {
            const session = await createCheckoutSession(orderId)
            if (session.url) {
                cartStore.clearCart()
                window.location.href = session.url
            } else {
                throw new Error('No checkout URL returned')
            }
        } catch (paymentErr) {
            console.error('Payment session creation failed:', paymentErr)
            toast.error('Ordine creato, ma errore nel reindirizzamento al pagamento. Vai al tuo profilo per riprovare.')
            router.push('/profile')
        }
    } catch (err) {
        console.error('Checkout Error:', err)
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="bg-gray-50/50 min-h-screen py-12 font-sans text-slate-800">
    <div class="container mx-auto px-4 max-w-6xl">

      <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-[#ED8900] mb-8 transition-colors font-medium text-sm">
         <ArrowLeft class="w-4 h-4" /> Torna allo shopping
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div class="lg:col-span-7 space-y-6">
            <h1 class="text-3xl font-bold tracking-tight text-[#4B4846] mb-2">Checkout</h1>

            <form @submit.prevent="handleSubmit">

                <!-- Fulfillment method selector -->
                <Card class="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Come vuoi ricevere l'ordine?</CardTitle>
                        <CardDescription>Scegli tra spedizione a domicilio o ritiro in negozio.</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent class="pt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                type="button"
                                @click="fulfillmentMethod = 'shipping'"
                                :class="[
                                    'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                                    fulfillmentMethod === 'shipping'
                                        ? 'border-[#ED8900] bg-orange-50/50 ring-1 ring-[#ED8900]/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                ]"
                            >
                                <Truck class="w-5 h-5 mt-0.5 shrink-0" :class="fulfillmentMethod === 'shipping' ? 'text-[#ED8900]' : 'text-slate-400'" />
                                <div>
                                    <div class="font-semibold text-sm text-slate-900">Spedizione a domicilio</div>
                                    <div class="text-xs text-slate-500 mt-0.5">Gratis in tutta Italia</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                @click="fulfillmentMethod = 'pickup'"
                                :class="[
                                    'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                                    fulfillmentMethod === 'pickup'
                                        ? 'border-[#ED8900] bg-orange-50/50 ring-1 ring-[#ED8900]/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                ]"
                            >
                                <StoreIcon class="w-5 h-5 mt-0.5 shrink-0" :class="fulfillmentMethod === 'pickup' ? 'text-[#ED8900]' : 'text-slate-400'" />
                                <div>
                                    <div class="font-semibold text-sm text-slate-900">Ritira in negozio</div>
                                    <div class="text-xs text-slate-500 mt-0.5">Senza spese, prenota il tuo slot</div>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <!-- Contact info (always shown) -->
                <Card class="mt-6 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Dati di Contatto</CardTitle>
                        <CardDescription>{{ isPickup ? 'Ti contatteremo per confermare il ritiro.' : 'Per la conferma e la spedizione.' }}</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent class="space-y-6 pt-6">
                        <div class="space-y-4">
                            <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                               <Mail class="w-4 h-4 text-[#ED8900]" /> Contatti
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
                        </div>
                    </CardContent>
                </Card>

                <!-- Shipping address (only when shipping) -->
                <Card v-if="!isPickup" class="mt-6 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Indirizzo di Spedizione</CardTitle>
                        <CardDescription>Dove vuoi ricevere il pacco?</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent class="space-y-6 pt-6">
                        <div class="space-y-4">
                            <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                               <UserIcon class="w-4 h-4 text-[#ED8900]" /> Indirizzo
                            </h3>

                            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div class="md:col-span-3 space-y-2">
                                    <Label for="zip">CAP</Label>
                                    <Input id="zip" name="zip" v-model="form.zip" placeholder="00100" :required="!isPickup" autocomplete="postal-code" />
                                </div>

                                <div class="md:col-span-9 space-y-2">
                                    <Label for="region">Regione</Label>
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

                            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div class="md:col-span-4 space-y-2">
                                    <Label for="province">Provincia</Label>
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

                            <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-10 space-y-2">
                                    <Label for="street">Via / Piazza</Label>
                                    <Input id="street" name="street" v-model="form.street" placeholder="Via Roma" :required="!isPickup" autocomplete="address-line1" />
                                </div>
                                <div class="col-span-2 space-y-2">
                                    <Label for="number">Civico</Label>
                                    <Input id="number" name="number" v-model="form.number" placeholder="10" :required="!isPickup" autocomplete="address-line2" />
                                </div>
                            </div>

                            <div class="flex items-center space-x-2 pt-4">
                                <Checkbox id="save-address" v-model:checked="saveAddress" />
                                <Label for="save-address" class="text-sm font-medium leading-none">
                                    Salva questo indirizzo per il prossimo acquisto
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Pickup details (only when pickup) -->
                <Card v-if="isPickup" class="mt-6 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Ritiro in negozio</CardTitle>
                        <CardDescription>Scegli quando passare a ritirare il tuo ordine.</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent class="space-y-6 pt-6">

                        <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <div class="flex items-start gap-3">
                                <StoreIcon class="w-5 h-5 text-[#ED8900] mt-0.5 shrink-0" />
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold text-sm text-slate-900">{{ STORE.name }}</div>
                                    <div class="text-sm text-slate-600 mt-0.5">
                                        {{ STORE.address }}, {{ STORE.zip }} {{ STORE.city }} ({{ STORE.province }})
                                    </div>
                                    <div class="text-xs text-slate-500 mt-1">{{ STORE.phone }}</div>
                                    <div class="mt-3 grid grid-cols-1 gap-1 text-xs">
                                        <div v-for="row in storeHoursSummary" :key="row.label" class="flex justify-between gap-4">
                                            <span class="text-slate-500 font-medium">{{ row.label }}</span>
                                            <span class="text-slate-700">{{ row.hours }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
                               <Calendar class="w-4 h-4 text-[#ED8900]" /> Data e ora di ritiro
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <Label for="pickup-date">Giorno</Label>
                                    <Select v-model="pickupDate">
                                        <SelectTrigger id="pickup-date">
                                            <SelectValue placeholder="Seleziona giorno..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="d in availableDates" :key="d.iso" :value="d.iso">
                                                {{ d.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div class="space-y-2">
                                    <Label for="pickup-slot">Fascia oraria</Label>
                                    <Select v-model="pickupSlot" :disabled="!pickupDate">
                                        <SelectTrigger id="pickup-slot">
                                            <SelectValue placeholder="Seleziona orario..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="opt in slotOptions" :key="opt.value" :value="opt.value">
                                                {{ opt.label }}
                                            </SelectItem>
                                            <div v-if="pickupDate && slotOptions.length === 0" class="px-2 py-3 text-xs text-slate-500">
                                                Nessuno slot disponibile in questa giornata.
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Payment -->
                <Card class="mt-6 border-slate-200 shadow-sm">
                     <CardHeader>
                        <CardTitle>Pagamento</CardTitle>
                        <CardDescription>{{ isPickup ? 'Paga online o direttamente in negozio al ritiro.' : 'Scegli il metodo di pagamento.' }}</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent class="pt-6 space-y-3">
                        <button
                            type="button"
                            @click="paymentMethod = 'online'"
                            :class="[
                                'w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                                paymentMethod === 'online'
                                    ? 'border-[#ED8900] bg-orange-50/50 ring-1 ring-[#ED8900]/20'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            ]"
                        >
                            <CreditCard class="w-5 h-5 shrink-0" :class="paymentMethod === 'online' ? 'text-[#ED8900]' : 'text-slate-400'" />
                            <div class="flex-1">
                                <div class="font-semibold text-sm text-slate-900">Paga online</div>
                                <div class="text-xs text-slate-500 mt-0.5">Carta di credito / debito via Stripe</div>
                            </div>
                        </button>

                        <button
                            v-if="isPickup"
                            type="button"
                            @click="paymentMethod = 'in_store'"
                            :class="[
                                'w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                                paymentMethod === 'in_store'
                                    ? 'border-[#ED8900] bg-orange-50/50 ring-1 ring-[#ED8900]/20'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            ]"
                        >
                            <Wallet class="w-5 h-5 shrink-0" :class="paymentMethod === 'in_store' ? 'text-[#ED8900]' : 'text-slate-400'" />
                            <div class="flex-1">
                                <div class="font-semibold text-sm text-slate-900">Paga in negozio</div>
                                <div class="text-xs text-slate-500 mt-0.5">Salda l'ordine al ritiro (contanti o POS)</div>
                            </div>
                        </button>
                    </CardContent>
                    <CardFooter class="bg-slate-50/50 border-t border-slate-100 p-6">
                        <Button type="submit" :disabled="loading || !canSubmit" class="w-full bg-[#ED8900] hover:bg-[#d67b00] text-lg font-bold h-12 shadow-md hover:shadow-lg transition-all">
                            <Loader2 v-if="loading" class="w-5 h-5 mr-2 animate-spin" />
                            {{ loading
                                ? (paymentMethod === 'in_store' ? 'Creazione ordine...' : 'Reindirizzamento a Stripe...')
                                : (paymentMethod === 'in_store' ? 'Prenota Ritiro' : 'Vai al Pagamento') }}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>

        <!-- Order Summary -->
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
                            <span>IVA (22%)</span>
                            <span>{{ formatPrice(ivaAmount) }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-slate-600">
                            <span>{{ isPickup ? 'Ritiro in negozio' : 'Spedizione' }}</span>
                            <span class="text-green-600 font-medium">Gratis</span>
                        </div>
                        <Separator class="my-2"/>
                        <div class="flex justify-between text-xl font-bold text-[#4B4846]">
                            <span>Totale</span>
                            <span>{{ formatPrice(totalWithIva) }}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter class="bg-indigo-50 border-t border-indigo-100 p-4 justify-center">
                    <div class="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                        <component :is="isPickup ? StoreIcon : Truck" class="w-4 h-4" />
                        {{ isPickup ? 'Ritiro in negozio senza costi' : 'Spedizione Gratuita in tutta Italia' }}
                    </div>
                </CardFooter>
            </Card>
        </div>

      </div>
    </div>
  </div>
</template>
