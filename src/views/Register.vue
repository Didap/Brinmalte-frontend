<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, CheckCircle2 } from 'lucide-vue-next'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { register, loading, error } = useAuth()

// New state for showing confirmation message
const registrationComplete = ref(false)
const registeredEmail = ref('')

const form = reactive({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
})

const handleRegister = async () => {
    if (!form.terms) {
        alert("Devi accettare i termini e condizioni")
        return
    }

    if (form.password !== form.confirmPassword) {
        alert("Le password non coincidono")
        return
    }

    const success = await register(form.name, form.surname, form.email, form.password, form.phone)
    if (success) {
        // Show confirmation message instead of redirecting
        registeredEmail.value = form.email
        registrationComplete.value = true
    }
}

const goToLogin = () => {
    router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- Email Confirmation Message -->
    <Card v-if="registrationComplete" class="w-full max-w-md shadow-xl">
      <CardHeader class="space-y-1 text-center">
        <div class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 class="w-8 h-8 text-green-600" />
        </div>
        <CardTitle class="text-2xl font-bold text-[#4B4846]">Controlla la tua email!</CardTitle>
        <CardDescription class="text-base">
          Abbiamo inviato un link di conferma a<br>
          <strong class="text-[#4B4846]">{{ registeredEmail }}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent class="text-center space-y-4">
        <div class="flex items-center justify-center gap-3 p-4 bg-orange-50 rounded-lg">
          <Mail class="w-6 h-6 text-[#ED8900]" />
          <span class="text-sm text-gray-600">
            Clicca sul link nell'email per attivare il tuo account
          </span>
        </div>
        <p class="text-sm text-gray-500">
          Non hai ricevuto l'email? Controlla la cartella spam.
        </p>
      </CardContent>
      <CardFooter class="justify-center">
        <Button @click="goToLogin" variant="outline" class="w-full">
          Vai al Login
        </Button>
      </CardFooter>
    </Card>

    <!-- Registration Form -->
    <Card v-else class="w-full max-w-md shadow-xl">
      <CardHeader class="space-y-1 text-center">
        <CardTitle class="text-3xl font-bold text-[#4B4846]">Crea Account</CardTitle>
        <CardDescription>
          Registrati per accedere a tutti i servizi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="name">Nome</Label>
                <Input 
                  id="name" 
                  v-model="form.name"
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Mario" 
                  class="focus-visible:ring-[#ED8900]"
                />
              </div>
              <div class="space-y-2">
                <Label for="surname">Cognome</Label>
                <Input 
                  id="surname" 
                  v-model="form.surname"
                  name="surname" 
                  type="text" 
                  required 
                  placeholder="Rossi" 
                  class="focus-visible:ring-[#ED8900]"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input 
                id="email" 
                v-model="form.email"
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                placeholder="mario@esempio.it" 
                class="focus-visible:ring-[#ED8900]"
              />
            </div>

            <div class="space-y-2">
               <Label for="phone">Telefono</Label>
               <Input 
                 id="phone" 
                 v-model="form.phone"
                 name="phone" 
                 type="tel" 
                 placeholder="+39 333 1234567" 
                 class="focus-visible:ring-[#ED8900]"
               />
             </div>

            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input 
                id="password" 
                v-model="form.password"
                name="password" 
                type="password" 
                autocomplete="new-password" 
                required 
                placeholder="••••••••" 
                class="focus-visible:ring-[#ED8900]"
              />
            </div>

             <div class="space-y-2">
              <Label for="confirm-password">Conferma Password</Label>
              <Input 
                id="confirm-password" 
                v-model="form.confirmPassword"
                name="confirm-password" 
                type="password" 
                autocomplete="new-password" 
                required 
                placeholder="••••••••" 
                class="focus-visible:ring-[#ED8900]"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 mt-6">
            <Checkbox id="terms" v-model:checked="form.terms" />
            <Label for="terms" class="text-sm text-gray-600 cursor-pointer font-normal">
              Accetto i <a href="#" class="text-[#ED8900] hover:underline">Termini e Condizioni</a>
            </Label>
          </div>
          
          <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>

          <div class="mt-6">
            <Button :disabled="loading" type="submit" class="w-full bg-[#ED8900] hover:bg-orange-600 text-white font-bold py-6 text-lg shadow-lg shadow-orange-500/20">
              <template v-if="loading">
                 <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                  Caricamento...
             </template>
             <template v-else>
                 Registrati
             </template>
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter class="justify-center text-sm text-gray-600">
        Hai già un account?
        <router-link to="/login" class="font-medium text-[#ED8900] hover:text-orange-600 hover:underline ml-1">
          Accedi
        </router-link>
      </CardFooter>
    </Card>
  </div>
</template>
