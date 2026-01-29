<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(() => {
    const success = route.query.success
    const error = route.query.error

    if (success === 'true') {
        status.value = 'success'
    } else if (error) {
        status.value = 'error'
        errorMessage.value = typeof error === 'string' ? error : 'Errore durante la conferma'
    } else {
        // If no query params, show error
        status.value = 'error'
        errorMessage.value = 'Link di conferma non valido'
    }
})

const goToLogin = () => {
    router.push('/login')
}

const goToHome = () => {
    router.push('/')
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card class="w-full max-w-md shadow-xl">
            <!-- Loading State -->
            <template v-if="status === 'loading'">
                <CardHeader class="text-center">
                    <div class="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                        <Loader2 class="w-8 h-8 text-[#ED8900] animate-spin" />
                    </div>
                    <CardTitle class="text-xl">Verifica in corso...</CardTitle>
                    <CardDescription>Stiamo confermando il tuo account</CardDescription>
                </CardHeader>
            </template>

            <!-- Success State -->
            <template v-else-if="status === 'success'">
                <CardHeader class="text-center">
                    <div class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 class="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle class="text-xl text-green-700">Email Confermata!</CardTitle>
                    <CardDescription>
                        Il tuo account è stato attivato con successo. Ora puoi accedere a tutte le funzionalità di BrinMalte.
                    </CardDescription>
                </CardHeader>
                <CardContent class="flex flex-col gap-3">
                    <Button @click="goToLogin" class="w-full bg-[#ED8900] hover:bg-[#D97706]">
                        Vai al Login
                    </Button>
                    <Button @click="goToHome" variant="outline" class="w-full">
                        Torna alla Home
                    </Button>
                </CardContent>
            </template>

            <!-- Error State -->
            <template v-else>
                <CardHeader class="text-center">
                    <div class="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <XCircle class="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle class="text-xl text-red-700">Errore di Conferma</CardTitle>
                    <CardDescription>
                        {{ errorMessage || 'Il link di conferma non è valido o è già stato utilizzato.' }}
                    </CardDescription>
                </CardHeader>
                <CardContent class="flex flex-col gap-3">
                    <Button @click="goToLogin" class="w-full bg-[#ED8900] hover:bg-[#D97706]">
                        Vai al Login
                    </Button>
                    <Button @click="goToHome" variant="outline" class="w-full">
                        Torna alla Home
                    </Button>
                </CardContent>
            </template>
        </Card>
    </div>
</template>
