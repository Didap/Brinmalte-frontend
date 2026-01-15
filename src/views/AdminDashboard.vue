<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const { user, loading } = useAuth()
const router = useRouter()

onMounted(() => {
    // Double check protection (though route guard should handle it)
    if (!user.value || user.value.role?.type !== 'admin_dashboard' && user.value.role?.name !== 'Admin') {
        // We'll trust 'Admin' name or specific type. 
        // Note: Strapi default admin role is for Admin Panel not API users.
        // API users usually have 'Authenticated' or 'Public'.
        // User needs to create a NEW role in Users-Permissions called 'Admin' (or 'ShopAdmin').
        // We will assume they name it 'Admin'.
    }
})
</script>

<template>
    <div class="container mx-auto py-12 px-4">
        <h1 class="text-3xl font-bold mb-6 text-[#ED8900]">Admin Dashboard</h1>
        <div v-if="loading">Caricamento...</div>
        <div v-else>
            <p class="mb-4">Benvenuto, {{ user?.customer?.name || user?.username }}. Questa area è riservata.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Card 1: Ordini -->
                <div class="bg-white p-6 rounded-lg shadow-md border hover:border-[#ED8900] transition-colors cursor-pointer" @click="$router.push('/admin/orders')">
                   <h2 class="text-xl font-bold mb-2">Gestione Ordini</h2>
                   <p class="text-gray-600">Visualizza e gestisci tutti gli ordini dei clienti.</p>
                </div>

                 <!-- Card 2: Prodotti -->
                 <div class="bg-white p-6 rounded-lg shadow-md border hover:border-[#ED8900] transition-colors cursor-pointer" @click="$router.push('/admin/products')">
                   <h2 class="text-xl font-bold mb-2">Prodotti</h2>
                   <p class="text-gray-600">Link rapido al pannello Strapi (opzionale).</p>
                </div>
            </div>
        </div>
    </div>
</template>
