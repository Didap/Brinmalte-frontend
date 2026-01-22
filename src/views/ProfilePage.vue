<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuth } from '@/composables/useAuth'
import { getCurrentCustomer, getCustomerOrders, updateCustomer, createCustomer } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, Package, User, MapPin, Phone, Mail, FileText, Calendar } from 'lucide-vue-next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination'
import { useItalianGeo } from '@/composables/useItalianGeo'

// Auth & Router
const { user, logout } = useAuth()
const router = useRouter()

// State
const loading = ref(true)
const saving = ref(false)
const customer = ref<any>(null)
const orders = ref<any[]>([])
const pagination = ref({
    page: 1,
    pageSize: 5,
    total: 0,
    pageCount: 1
})

// Form State
const form = ref({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    number: '',
    city: '',
    zip: '',
    province: '',
    region: ''
})

const isAutoFilling = ref(false)

// Geo Data Logic
const { regions, getProvinces, getCities, getZip, findLocationByZip, init: initGeo } = useItalianGeo()
const availableProvinces = computed(() => getProvinces(form.value.region))
const availableCities = computed(() => {
    const prov = availableProvinces.value.find(p => p.code === form.value.province)
    return getCities(prov?.name || '')
})

// Watchers
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

// Functions
const fetchOrders = async (page = 1) => {
    if (!customer.value) return
    loading.value = true
    try {
        const ordersData = await getCustomerOrders(customer.value.documentId, page, pagination.value.pageSize)
        orders.value = ordersData.data || []
        if (ordersData.meta?.pagination) {
            pagination.value = {
                page: ordersData.meta.pagination.page,
                pageSize: ordersData.meta.pagination.pageSize,
                total: ordersData.meta.pagination.total,
                pageCount: ordersData.meta.pagination.pageCount
            }
        }
    } catch (e) {
        console.error('Failed to fetch orders:', e)
    } finally {
        loading.value = false
    }
}

const handlePageChange = (page: number) => {
    fetchOrders(page)
}

const handleSaveSettings = async () => {
    saving.value = true
    try {
        const combinedAddress = `${form.value.street}, ${form.value.number}`.replace(/,\s*$/, '')
        
        const customerData = {
            name: form.value.firstName,
            surname: form.value.lastName,
            phone: form.value.phone,
            address: {
                address: combinedAddress,
                city: form.value.city,
                zip: form.value.zip,
                province: form.value.province,
                region: form.value.region
            },
            user: user.value.id
        }

        if (customer.value?.documentId) {
            await updateCustomer(customer.value.documentId, customerData)
        } else {
            const newCustomer = await createCustomer(customerData) as any
            customer.value = newCustomer.data
        }
        
        // Refresh local data
        const updated = await getCurrentCustomer(user.value.id)
        if (updated) customer.value = updated
        toast.success('Profilo aggiornato con successo!')
    } catch (e) {
        console.error('Failed to update profile:', e)
        toast.error('Errore durante l\'aggiornamento del profilo.')
    } finally {
        saving.value = false
    }
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price)
}

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const getStatusColor = (order_status: string) => {
    switch (order_status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
        case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

const getStatusLabel = (order_status: string) => {
    const map: Record<string, string> = {
        'pending': 'In attesa',
        'processing': 'In lavorazione',
        'shipped': 'Spedito',
        'delivered': 'Consegnato',
        'cancelled': 'Annullato'
    }
    return map[order_status] || order_status
}

const handleLogout = () => {
    logout()
    router.push('/')
}

// Lifecycle
onMounted(async () => {
    initGeo()
    if (!user.value) {
        router.push('/login')
        return
    }

    try {
        // 1. Fetch Customer Details
        const customerData = await getCurrentCustomer(user.value.id)
        if (customerData) {
            customer.value = customerData
            
            // Prefill form
            isAutoFilling.value = true
            
            form.value.firstName = customerData.name || ''
            form.value.lastName = customerData.surname || ''
            form.value.phone = customerData.phone || ''
            form.value.city = customerData.address?.city || ''
            form.value.zip = customerData.address?.zip || ''
            form.value.province = customerData.address?.province || ''
            form.value.region = customerData.address?.region || ''
            
            const fullAddress = customerData.address?.address || ''
            if (fullAddress) {
                const parts = fullAddress.split(',')
                if (parts.length > 1) {
                     form.value.number = parts.pop()!.trim()
                     form.value.street = parts.join(',').trim()
                } else {
                     form.value.street = fullAddress
                }
            }
            
            // Reset autofill flag after a delay to allow watchers to flush without clearing
            setTimeout(() => {
                isAutoFilling.value = false
            }, 100)

            // 2. Fetch Initial Orders
            await fetchOrders(1)
        } else {
             // New user without customer profile
             loading.value = false
        }
    } catch (e) {
        console.error('Error loading profile:', e)
        toast.error('Errore nel caricamento del profilo')
    } finally {
        if (!customer.value) loading.value = false
    }
})
</script>

<template>
    <div class="min-h-screen bg-slate-50 py-12 px-4 font-sans">
        <div class="container mx-auto max-w-5xl">
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-[#4B4846]">Il mio Profilo</h1>
                    <p class="text-slate-500">Gestisci le tue informazioni e visualizza i tuoi ordini.</p>
                </div>
                <Button variant="outline" class="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" @click="handleLogout">
                    Esci
                </Button>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
                <Loader2 class="w-8 h-8 animate-spin text-[#ED8900]" />
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left Column: User Info -->
                <div class="lg:col-span-1 space-y-6">
                    <Card class="border-slate-200 shadow-sm overflow-hidden">
                        <div class="bg-gradient-to-r from-slate-800 to-slate-700 h-24 relative">
                             <div class="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-md">
                                <User class="w-8 h-8 text-slate-700" />
                             </div>
                        </div>
                        <CardHeader class="pt-10">
                            <CardTitle class="text-xl capitalize">
                                {{ customer?.name }} {{ customer?.surname }}
                            </CardTitle>
                            <CardDescription class="truncate flex items-center gap-1.5" :title="user?.email">
                                <Mail class="w-3.5 h-3.5" /> {{ user?.email }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-4">
                             <div class="flex items-center gap-3 text-sm text-slate-600">
                                <Phone class="w-4 h-4 text-slate-400" />
                                <span>{{ customer?.phone || 'Nessun telefono' }}</span>
                             </div>
                             
                             <Separator />
                             
                             <div class="space-y-2">
                                 <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Indirizzo di Spedizione</h4>
                                 <div v-if="customer?.address?.address" class="flex items-start gap-3 text-sm text-slate-600">
                                    <MapPin class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p>{{ customer.address.address }}</p>
                                        <p>{{ customer.address.zip }} {{ customer.address.city }} ({{ customer.address.province }})</p>
                                        <p>{{ customer.address.region }}</p>
                                    </div>
                                 </div>
                                 <div v-else class="text-sm text-slate-400 italic pl-7">
                                     Nessun indirizzo salvato.
                                 </div>
                              </div>
                         </CardContent>
                     </Card>
                 </div>
 
                 <!-- Right Column: Orders & Tabs -->
                 <div class="lg:col-span-2">
                     <Tabs default-value="orders" class="w-full">
                         <TabsList class="grid w-full grid-cols-2 mb-4 bg-white border border-slate-200 p-1 rounded-lg">
                             <TabsTrigger value="orders">I miei Ordini</TabsTrigger>
                             <TabsTrigger value="settings">Impostazioni</TabsTrigger>
                         </TabsList>
                         
                         <TabsContent value="orders" class="space-y-4">
                             <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                 <Package class="w-5 h-5 text-[#ED8900]" /> Storico Ordini
                             </h3>
 
                             <div v-if="orders.length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                 <FileText class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                 <h3 class="text-lg font-medium text-slate-900">Nessun ordine</h3>
                                 <p class="text-slate-500 mb-6">Non hai ancora effettuato ordini.</p>
                                 <Button @click="router.push('/prodotti')" class="bg-[#ED8900] text-white">Inizia lo shopping</Button>
                             </div>
 
                             <div v-else class="space-y-6">
                                 <div class="space-y-4">
                                     <Card v-for="order in orders" :key="order.documentId" class="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                         <CardHeader class="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
                                             <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                 <div class="flex items-center gap-2">
                                                     <span class="font-bold text-slate-700" v-if="order.order_number">#{{ order.order_number }}</span>
                                                     <span class="font-medium text-slate-500 italic text-sm" v-else>Codice in arrivo</span>
                                                    <span class="text-xs text-slate-400">|</span>
                                                    <span class="text-sm text-slate-500 flex items-center gap-1">
                                                        <Calendar class="w-3 h-3" /> {{ formatDate(order.createdAt) }}
                                                    </span>
                                                </div>
                                                <div class="px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="getStatusColor(order.order_status)">
                                                    {{ getStatusLabel(order.order_status) }}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent class="p-4">
                                            <div class="space-y-2 mb-4">
                                                <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between text-sm">
                                                    <span class="text-slate-700">
                                                        <span class="font-medium text-slate-900">{{ item.quantity }}x</span> {{ item.product_name }}
                                                    </span>
                                                    <span class="text-slate-500">{{ formatPrice(item.unit_price * item.quantity) }}</span>
                                                </div>
                                            </div>
                                            <Separator class="my-3" />
                                            <div class="flex justify-between items-center font-bold text-slate-800">
                                                <span>Totale</span>
                                                <span class="text-[#ED8900] text-lg">{{ formatPrice(order.total) }}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                <!-- Pagination -->
                                <div v-if="pagination.pageCount > 1" class="flex justify-center mt-6">
                                     <Pagination :total="pagination.total" :sibling-count="1" show-edges :default-page="1" :page="pagination.page" :items-per-page="pagination.pageSize" @update:page="handlePageChange">
                                        <PaginationContent v-slot="{ items }">
                                          <PaginationPrevious />
                                          <template v-for="(item, index) in items">
                                            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" :is-active="item.value === pagination.page">
                                              {{ item.value }}
                                            </PaginationItem>
                                            <PaginationEllipsis v-else :key="item.type" :index="index" />
                                          </template>
                                          <PaginationNext />
                                        </PaginationContent>
                                     </Pagination>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Impostazioni Profilo</CardTitle>
                                    <CardDescription>Aggiorna le tue informazioni personali e l'indirizzo di spedizione predefinito.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div class="space-y-6">
                                        
                                        <!-- Personal Info -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div class="space-y-2">
                                                <Label for="firstName">Nome</Label>
                                                <Input id="firstName" name="firstName" v-model="form.firstName" placeholder="Mario" autocomplete="given-name" />
                                            </div>
                                            <div class="space-y-2">
                                                <Label for="lastName">Cognome</Label>
                                                <Input id="lastName" name="lastName" v-model="form.lastName" placeholder="Rossi" autocomplete="family-name" />
                                            </div>
                                            <div class="space-y-2">
                                                <Label for="phone">Telefono</Label>
                                                <Input id="phone" name="phone" v-model="form.phone" placeholder="+39 333 0000000" autocomplete="tel" />
                                            </div>
                                        </div>

                                        <Separator />

                                        <!-- Address -->
                                        <div class="space-y-4">
                                            <h3 class="text-sm font-medium">Indirizzo di Spedizione</h3>
                                            
                                            <!-- Row 1: CAP + Region -->
                                            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div class="md:col-span-3 space-y-2">
                                                    <Label for="zip">CAP</Label>
                                                    <Input id="zip" name="zip" v-model="form.zip" placeholder="00100" autocomplete="postal-code" />
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

                                            <!-- Row 2: Province + City -->
                                            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
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

                                            <!-- Row 3: Street + Number -->
                                            <div class="grid grid-cols-12 gap-4">
                                                <div class="col-span-9 space-y-2">
                                                    <Label for="street">Via / Piazza</Label>
                                                    <Input id="street" name="street" v-model="form.street" placeholder="Via Roma" autocomplete="address-line1" />
                                                </div>
                                                <div class="col-span-3 space-y-2">
                                                    <Label for="number">N. Civico</Label>
                                                    <Input id="number" name="number" v-model="form.number" placeholder="10" autocomplete="address-line2" />
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex justify-end pt-4">
                                            <Button @click="handleSaveSettings" :disabled="saving" class="bg-[#ED8900] hover:bg-[#d67b00] text-white">
                                                <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
                                                {{ saving ? 'Salvataggio...' : 'Salva Modifiche' }}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    </div>
</template>
