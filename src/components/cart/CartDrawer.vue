
<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price)
}

const goToCheckout = () => {
    cartStore.isOpen = false
    const token = localStorage.getItem('strapi_jwt') || sessionStorage.getItem('strapi_jwt')
    
    if (!token) {
        router.push({ path: '/login', query: { redirect: '/checkout' } })
    } else {
        router.push('/checkout')
    }
}
</script>

<template>
  <Sheet v-model:open="cartStore.isOpen">
    <SheetContent class="w-full sm:max-w-md flex flex-col h-full">
      <SheetHeader class="space-y-1 pr-6">
        <SheetTitle class="text-xl font-bold flex items-center gap-2 text-[#4B4846]">
            <ShoppingBag class="w-5 h-5" />
            Il tuo Carrello
        </SheetTitle>
        <SheetDescription v-if="cartStore.totalItems > 0">
            Hai {{ cartStore.totalItems }} articoli nel carrello
        </SheetDescription>
      </SheetHeader>

      <!-- Cart Items List -->
      <div class="flex-1 overflow-y-auto py-6 -mx-6 px-6">
        <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <ShoppingBag class="w-16 h-16 opacity-20" />
            <p>Il carrello è vuoto</p>
            <SheetClose as-child>
                <Button variant="outline" class="mt-4">Inizia lo shopping</Button>
            </SheetClose>
        </div>

        <div v-else class="space-y-6">
            <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4">
                <!-- Image -->
                <div class="w-20 h-20 bg-gray-50 rounded-md border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                    <img :src="item.image" :alt="item.name" class="w-full h-full object-contain p-1" />
                </div>

                <!-- Info -->
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-semibold text-sm text-[#4B4846] line-clamp-2">{{ item.name }}</h4>
                        <p class="text-xs text-gray-500 mt-0.5">{{ item.sku }}</p>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <p class="font-bold text-[#ED8900]">{{ formatPrice(item.price) }}</p>
                        
                        <!-- Quantity Controls -->
                        <div class="flex items-center border border-gray-200 rounded-md h-8 bg-white">
                            <button @click="cartStore.updateQuantity(item.id, -1)" class="w-8 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                                <Minus class="w-3 h-3" />
                            </button>
                            <span class="w-8 text-center text-xs font-medium">{{ item.quantity }}</span>
                            <button @click="cartStore.updateQuantity(item.id, 1)" class="w-8 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                                <Plus class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Remove -->
                <button @click="cartStore.removeItem(item.id)" class="text-gray-400 hover:text-red-500 transition-colors self-start p-1">
                    <Trash2 class="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      <!-- Footer / Checkout -->
      <SheetFooter v-if="cartStore.items.length > 0" class="border-t border-gray-100 pt-6 mt-auto">
        <div class="w-full space-y-4">
            <div class="flex justify-between items-center text-lg font-bold text-[#4B4846]">
                <span>Totale</span>
                <span>{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <p class="text-xs text-gray-400 text-center">Spedizione e IVA calcolate al checkout</p>
            <Button @click="goToCheckout" class="w-full bg-[#ED8900] hover:bg-[#d67b00] h-12 text-lg font-bold shadow-lg shadow-orange-500/20">
                Procedi al Checkout
            </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
