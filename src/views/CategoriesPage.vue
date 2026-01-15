<script setup lang="ts">
import Categories from '@/components/Categories.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="pt-12 container mx-auto px-4">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-[#4B4846] mb-4">Le Nostre Categorie</h1>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          Trova facilmente tutto ciò che ti serve esplorando le nostre categorie specializzate.
        </p>
        <div class="w-24 h-1 bg-[#ED8900] mx-auto mt-6"></div>
      </div>
    </div>
    
    <!-- Reuse the existing Categories component but maybe we can tweak it via props later if needed. 
         For now, it renders its own section wrapper, so we just include it.
         However, the Categories component has "py-24", which might be too much padding if we add our own header.
         Let's assume it's fine for now or we can adjust padding in the component if requested.
    -->
    <Categories />
  </div>
</template>
