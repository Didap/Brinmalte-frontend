<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-vue-next'
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
        router.push('/dashboard')
    }
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md shadow-xl">
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
