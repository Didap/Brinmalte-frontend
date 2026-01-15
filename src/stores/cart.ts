
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'

export interface CartItem {
    id: number | string
    name: string
    price: number
    quantity: number
    image: string
    sku?: string
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>([])
    const isOpen = ref(false)

    const totalItems = computed(() => {
        return items.value.reduce((acc, item) => acc + item.quantity, 0)
    })

    const totalPrice = computed(() => {
        return items.value.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    })

    const addItem = (product: any, quantity: number = 1) => {
        // Standardize ID
        const pid = product.id
        const existing = items.value.find(i => i.id === pid)

        if (existing) {
            existing.quantity += quantity
        } else {
            items.value.push({
                id: pid,
                name: product.name,
                price: Number(product.price),
                image: product.image,
                sku: product.sku,
                quantity: quantity
            })
        }

        toast.success("Prodotto aggiunto al carrello", {
            description: `${product.name} (x${quantity})`,
            action: {
                label: 'Vedi Carrello',
                onClick: () => isOpen.value = true
            }
        })
        // Auto open cart on add - DISABLED by user request
        // isOpen.value = true
    }

    const removeItem = (id: number | string) => {
        const idx = items.value.findIndex(i => i.id === id)
        if (idx > -1) items.value.splice(idx, 1)
    }

    const updateQuantity = (id: number | string, delta: number) => {
        const item = items.value.find(i => i.id === id)
        if (item) {
            item.quantity += delta
            if (item.quantity <= 0) removeItem(id)
        }
    }

    const clearCart = () => {
        items.value = []
    }

    const toggleCart = () => {
        isOpen.value = !isOpen.value
    }

    return {
        items,
        isOpen,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart
    }
}, {
    persist: true
})
