<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/composables/useAuth'
import { User, Lock, Mail, Phone, MapPin, Loader2 } from 'lucide-vue-next'

const { user, updateUser, loading, fetchUser } = useAuth()

const form = ref({
    username: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zip: '',
    country: 'Italia'
})

const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

onMounted(async () => {
    if (!user.value) await fetchUser()
    if (user.value) {
        form.value = {
            username: user.value.username || '',
            email: user.value.email || '',
            phone: user.value.phone || '',
            address: user.value.address || '',
            city: user.value.city || '',
            province: user.value.province || '',
            zip: user.value.zip || '',
            country: user.value.country || 'Italia'
        }
    }
})

const handleUpdateProfile = async () => {
    const success = await updateUser(form.value)
    if (success) {
        ;(window as any).alert('Profilo aggiornato con successo!')
    }
}

const handleUpdatePassword = async () => {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert('Le password non coincidono.')
        return
    }
    // Note: Password update logic relies on backend support (usually a separate endpoint or user update)
    // For now we just simulate or check if updateUser handles password.
    // Standard Strapi user update endpoint allows password change if authenticated.
    const success = await updateUser({ password: passwordForm.value.newPassword })
    if (success) {
        alert('Password aggiornata!')
        passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    }
}
</script>

<template>
    <div class="space-y-6 max-w-4xl mx-auto">
        <div>
            <h2 class="text-3xl font-bold tracking-tight text-[#4B4846]">Impostazioni</h2>
            <p class="text-gray-500">Gestisci il tuo profilo e le preferenze dell'account.</p>
        </div>

        <div class="grid gap-6">
            <!-- Profile Info -->
            <div class="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-6">
                <div class="flex items-center gap-2 border-b border-gray-100 pb-4">
                    <User class="w-5 h-5 text-orange-500" />
                    <h3 class="font-semibold text-lg">Informazioni Personali</h3>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label>Nome Utente</Label>
                        <div class="relative">
                            <User class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input v-model="form.username" class="pl-10" />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <Label>Email</Label>
                        <div class="relative">
                            <Mail class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input v-model="form.email" type="email" class="pl-10" disabled />
                        </div>
                    </div>
                </div>

                <div class="pt-2 flex justify-end">
                    <Button class="bg-[#ED8900] hover:bg-orange-600 text-white" @click="handleUpdateProfile" :disabled="loading">
                        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                        Salva Modifiche
                    </Button>
                </div>
            </div>

            <!-- Security -->
            <div class="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-6">
                <div class="flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Lock class="w-5 h-5 text-orange-500" />
                    <h3 class="font-semibold text-lg">Sicurezza</h3>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label>Nuova Password</Label>
                        <Input v-model="passwordForm.newPassword" type="password" />
                    </div>
                    <div class="space-y-2">
                        <Label>Conferma Password</Label>
                        <Input v-model="passwordForm.confirmPassword" type="password" />
                    </div>
                </div>

                 <div class="pt-2 flex justify-end">
                    <Button variant="outline" @click="handleUpdatePassword" :disabled="loading || !passwordForm.newPassword">
                        Aggiorna Password
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
