<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { reactiveOmit } from "@vueuse/core"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-vue-next"
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, "toastOptions")
</script>

<template>
  <Sonner
    class="toaster group"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-[#4B4846] group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg !bg-white !text-[#4B4846] !border-slate-200 !shadow-lg',
        description: 'group-[.toast]:text-slate-500 !text-slate-500',
        actionButton:
          'group-[.toast]:bg-[#ED8900] group-[.toast]:text-white group-[.toast]:font-bold group-[.toast]:hover:bg-orange-600 !bg-[#ED8900] !text-white !font-bold',
        cancelButton:
          'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 group-[.toast]:hover:bg-slate-200 !bg-slate-100 !text-slate-500',
      },
    }"
    v-bind="delegatedProps"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
