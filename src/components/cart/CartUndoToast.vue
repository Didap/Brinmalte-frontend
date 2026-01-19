<script setup lang="ts">
import { Undo2 } from 'lucide-vue-next'

defineProps<{
  name: string
  image: string
  onUndo: () => void
}>()
</script>

<template>
  <div class="w-full flex items-center gap-3 bg-white p-3 rounded-lg shadow-lg border border-slate-100 pointer-events-auto ring-1 ring-black/5">
    <!-- Image -->
    <div class="h-10 w-10 shrink-0 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
        <img v-if="image" :src="image" :alt="name" class="h-full w-full object-cover" />
        <div v-else class="h-full w-full bg-slate-200"></div>
    </div>

    <!-- Text -->
    <div class="flex-1 min-w-0 flex flex-col justify-center">
      <p class="text-[13px] font-medium text-slate-800 truncate leading-tight">{{ name }}</p>
      <p class="text-[11px] text-slate-500 leading-tight mt-0.5">Rimosso dal carrello</p>
    </div>

    <!-- Action -->
    <button 
      @click="onUndo" 
      class="shrink-0 group flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-all duration-200 active:scale-95"
    >
      <Undo2 class="w-3.5 h-3.5" />
      <span class="text-xs font-bold">Annulla</span>
    </button>
  </div>
</template>
