<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAPI } from '@/services/api'

const professionals = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')

// Function to fetch pending professionals
const fetchPendingProfessionals = async () => {
    loading.value = true
    error.value = ''
    try {
        // fetchAPI handles token and base URL
        // Populate both user and skills
        const data = await fetchAPI<any>('/professionals', {
            'filters[confirmed][$eq]': 'false',
            'populate': '*'
        })

        // Data structure from Strapi response
        // Normalize skills to always be an array
        professionals.value = data.data.map((p: any) => ({
            ...p,
            skills: Array.isArray(p.skills) ? p.skills : (p.skills?.data || [])
        }))
    } catch (err: any) {
        console.error(err)
        error.value = 'Impossibile caricare i professionisti. ' + err.message
    } finally {
        loading.value = false
    }
}

// Function to approve
const approveProfessional = async (id: number) => {
    if (!confirm('Sei sicuro di voler confermare questo professionista?')) return

    try {
        await fetchAPI<any>(`/professionals/${id}/approve`, {}, {
            method: 'POST'
        })

        successMessage.value = 'Professionista approvato con successo e email inviata!'
        
        // Refresh list
        await fetchPendingProfessionals()

        // Hide success message after 3s
        setTimeout(() => successMessage.value = '', 3000)
    } catch (err: any) {
        alert(err.message)
    }
}

onMounted(() => {
    fetchPendingProfessionals()
})
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6 text-[#ED8900]">Approvazione Professionisti</h1>

        <div v-if="loading" class="text-gray-600">Caricamento...</div>
        <div v-else-if="error" class="text-red-500">{{ error }}</div>
        
        <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ successMessage }}
        </div>

        <div v-if="professionals.length === 0 && !loading" class="text-gray-500">
            Nessun professionista in attesa di approvazione.
        </div>

        <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email (Utente)</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Reg.</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="prof in professionals" :key="prof.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ prof.user?.email || 'N/A' }}
                            <div v-if="prof.user?.username && prof.user.username !== prof.user.email" class="text-sm text-gray-400">
                                {{ prof.user.username }}
                            </div>
                        </td>
                         <td class="px-6 py-4">
                             <div class="flex flex-wrap gap-1">
                                <span v-for="skill in prof.skills" :key="skill.id || skill.attributes?.name" 
                                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                    {{ skill.name || skill.attributes?.name }}
                                </span>
                                <span v-if="!prof.skills || prof.skills.length === 0" class="text-sm text-gray-400">Nessuna skill</span>
                             </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ new Date(prof.createdAt).toLocaleDateString() }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button @click="approveProfessional(prof.id)" 
                                    class="text-white bg-[#ED8900] hover:bg-[#d67b00] px-3 py-1 rounded transition-colors">
                                Conferma
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
