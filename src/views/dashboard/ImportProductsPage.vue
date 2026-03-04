<script setup lang="ts">
import { ref } from 'vue'
import { fetchAPI } from '@/services/api'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'

interface ImportResult {
  created: number
  updated: number
  errors: number
}

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isLoading = ref(false)
const result = ref<ImportResult | null>(null)
const errorMessage = ref<string | null>(null)

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    result.value = null
    errorMessage.value = null
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  isLoading.value = true
  result.value = null
  errorMessage.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await fetchAPI<ImportResult>(
      '/products/import-excel',
      {},
      { method: 'POST', body: formData }
    )

    result.value = response
    toast.success('Importazione completata con successo')
  } catch (err: any) {
    errorMessage.value = err.message || "Errore durante l'importazione"
    toast.error(errorMessage.value ?? 'Errore sconosciuto')
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  selectedFile.value = null
  result.value = null
  errorMessage.value = null
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Aggiornamento Prodotti</h1>
      <p class="text-sm text-gray-500 mt-1">
        Carica un file Excel (.xlsx) per aggiornare lo stock dei prodotti esistenti e creare quelli nuovi.
      </p>
    </div>

    <div class="grid gap-6 max-w-2xl">
      <!-- Upload Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileSpreadsheet class="w-5 h-5 text-[#ED8900]" />
            Carica file Excel
          </CardTitle>
          <CardDescription>
            I prodotti esistenti verranno aggiornati (solo lo stock). I nuovi prodotti verranno creati. Nessun prodotto verrà eliminato.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- File Input Area -->
          <div
            class="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-[#ED8900]/50 hover:bg-orange-50/30 transition-colors"
            @click="fileInput?.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx"
              class="hidden"
              @change="handleFileChange"
            />
            <div v-if="!selectedFile" class="space-y-2">
              <Upload class="w-10 h-10 text-gray-300 mx-auto" />
              <p class="text-sm font-medium text-gray-600">Clicca per selezionare un file Excel</p>
              <p class="text-xs text-gray-400">Solo file .xlsx</p>
            </div>
            <div v-else class="space-y-1">
              <FileSpreadsheet class="w-10 h-10 text-[#ED8900] mx-auto" />
              <p class="text-sm font-semibold text-gray-800">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-400">
                {{ (selectedFile.size / 1024).toFixed(1) }} KB — clicca per cambiare file
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <Button
              :disabled="!selectedFile || isLoading"
              class="bg-[#ED8900] hover:bg-[#d67b00] text-white"
              @click="handleUpload"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
              <Upload v-else class="w-4 h-4 mr-2" />
              {{ isLoading ? 'Caricamento in corso...' : 'Carica aggiornamento' }}
            </Button>
            <Button v-if="selectedFile && !isLoading" variant="ghost" @click="resetForm">
              Annulla
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Result Card -->
      <Card v-if="result" class="border-green-200 bg-green-50/50">
        <CardContent class="pt-6">
          <div class="flex items-start gap-3">
            <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div class="space-y-2">
              <p class="font-semibold text-green-800">Importazione completata</p>
              <div class="flex flex-wrap gap-4 text-sm">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  <span class="text-gray-700"><strong>{{ result.created }}</strong> creati</span>
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  <span class="text-gray-700"><strong>{{ result.updated }}</strong> aggiornati</span>
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                  <span class="text-gray-700"><strong>{{ result.errors }}</strong> errori</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Error Card -->
      <Card v-if="errorMessage" class="border-red-200 bg-red-50/50">
        <CardContent class="pt-6">
          <div class="flex items-start gap-3">
            <XCircle class="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p class="font-semibold text-red-800">Errore durante l'importazione</p>
              <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
