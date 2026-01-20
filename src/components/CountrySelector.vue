<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next'
import { useWorldGeo, type CountryData } from '@/composables/useWorldGeo'

const props = defineProps<{
  modelValue: string // e.g. "+39"
  triggerClass?: string
}>()

const emit = defineEmits(['update:modelValue'])

const { countries } = useWorldGeo()
const open = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// Parse modelValue to find selected country
const selectedCountry = computed(() => {
    return countries.value.find(c => c.dial_code === props.modelValue)
})

const filteredCountries = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return countries.value.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) || 
        c.dial_code.includes(q)
    )
})

const toggle = () => {
    open.value = !open.value
    if (open.value) {
        nextTick(() => {
            searchInput.value?.focus()
        })
    } else {
        searchQuery.value = ''
    }
}

const select = (country: CountryData) => {
    emit('update:modelValue', country.dial_code)
    open.value = false
    searchQuery.value = ''
}

// Close on click outside (simple implementation)
import { onBeforeUnmount } from 'vue'
const containerRef = ref<HTMLElement | null>(null)

const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        open.value = false
        searchQuery.value = ''
    }
}

// Add global listener
if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside)
}

onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleClickOutside)
    }
})
</script>

<template>
  <div class="relative shrink-0 flex h-full" ref="containerRef">
    <!-- Trigger -->
    <button
      type="button"
      @click.stop="toggle"
      class="flex w-full h-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-100 bg-gray-50 text-gray-700 shadow-sm"
      :class="[{ 'ring-2 ring-[#ED8900] ring-offset-2': open }, triggerClass]"
    >
      <div v-if="selectedCountry" class="flex items-center gap-2 truncate">
         <span class="font-bold">{{ selectedCountry.code }}</span>
         <span>{{ selectedCountry.dial_code }}</span>
      </div>
      <span v-else class="text-gray-500">Prefisso</span>
      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </button>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95 mt-1 w-[200px] bg-white border-gray-200"
    >
      <!-- Search -->
      <div class="flex items-center border-b px-3">
        <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Cerca paese..."
        />
      </div>

      <!-- List -->
      <div class="max-h-[300px] overflow-y-auto p-1">
          <div 
             v-if="filteredCountries.length === 0"
             class="py-6 text-center text-sm text-gray-500"
          >
             Nessun risultato.
          </div>
          <div
            v-for="country in filteredCountries"
            :key="country.code"
            @click="select(country)"
            class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-orange-50 hover:text-orange-900 cursor-pointer transition-colors"
            :class="{ 'bg-orange-50 text-orange-900': modelValue === country.dial_code }"
          >
            <Check
              class="mr-2 h-4 w-4"
              :class="modelValue === country.dial_code ? 'opacity-100' : 'opacity-0'"
            />
            <span class="font-bold w-6 inline-block">{{ country.code }}</span>
            <span class="ml-2 text-gray-500">{{ country.dial_code }}</span>
            <span class="ml-auto text-xs text-gray-400 pl-2 truncate max-w-[80px]">{{ country.name }}</span>
          </div>
      </div>
    </div>
  </div>
</template>
