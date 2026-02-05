import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
    const query = ref('')

    const setQuery = (q: string) => {
        query.value = q
    }

    const clearQuery = () => {
        query.value = ''
    }

    return {
        query,
        setQuery,
        clearQuery
    }
})
