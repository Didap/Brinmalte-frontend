<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
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
        <form @submit.prevent>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="name">Nome</Label>
                <Input 
                  id="name" 
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
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                placeholder="mario@esempio.it" 
                class="focus-visible:ring-[#ED8900]"
              />
            </div>

            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input 
                id="password" 
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
            <Checkbox id="terms" />
            <Label for="terms" class="text-sm text-gray-600 cursor-pointer font-normal">
              Accetto i <a href="#" class="text-[#ED8900] hover:underline">Termini e Condizioni</a>
            </Label>
          </div>

          <div class="mt-8">
            <Button type="submit" class="w-full bg-[#ED8900] hover:bg-orange-600 text-white font-bold py-6 text-lg shadow-lg shadow-orange-500/20">
              Registrati
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
