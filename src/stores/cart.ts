
import { defineStore } from 'pinia'
import { ref, computed, h } from 'vue'

import { toast } from 'vue-sonner'
import CartUndoToast from '@/components/cart/CartUndoToast.vue'

export interface CartItem {
    id: number | string
    name: string
    price: number
    quantity: number
    image: string
    sku?: string
    stock?: number
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
        const stockLimit = product.stock // assume product object has stock if passed from updated components

        if (existing) {
            // Update stock info if provided
            if (stockLimit !== undefined) existing.stock = stockLimit

            // Check limit
            if (existing.stock !== undefined && existing.quantity + quantity > existing.stock) {
                toast.error("Quantità massima raggiunta", {
                    description: `Disponibilità limitata. Hai già ${existing.quantity} pezzi.`
                })
                return
            }
            existing.quantity += quantity
        } else {
            if (stockLimit !== undefined && quantity > stockLimit) {
                toast.error("Quantità richiesta non disponibile")
                return
            }

            items.value.push({
                id: pid,
                name: product.name,
                price: Number(product.price),
                image: product.image,
                sku: product.sku,
                stock: stockLimit,
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
    }

    const removeItem = (id: number | string) => {
        const idx = items.value.findIndex(i => i.id === id)
        if (idx > -1) {
            const removedItem = items.value[idx]
            items.value.splice(idx, 1)

            if (removedItem) {
                let undone = false
                let toastId: string | number
                toastId = toast.custom(() => h(CartUndoToast, {
                    name: removedItem.name,
                    image: removedItem.image,
                    onUndo: () => {
                        if (undone) return
                        undone = true
                        items.value.splice(idx, 0, removedItem)
                        toast.dismiss(toastId)
                    }
                }), { duration: 4000, unstyled: true })
            }
        }
    }

    const updateQuantity = (id: number | string, delta: number) => {
        const item = items.value.find(i => i.id === id)
        if (item) {
            if (delta > 0 && item.stock !== undefined && item.quantity + delta > item.stock) {
                toast.error("Quantità massima raggiunta", {
                    description: `Non puoi aggiungere altri pezzi.`
                })
                return
            }
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
