import { ref } from 'vue'

const globalSearchQuery = ref('')

export const useDashboardSearch = () => {
    return {
        globalSearchQuery
    }
}
