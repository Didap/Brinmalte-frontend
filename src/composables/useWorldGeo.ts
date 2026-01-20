
import { ref, computed } from 'vue'

const DATA_URL = '/country-codes.json' // Local public file

export interface CountryData {
    name: string;
    code: string;
    dial_code: string;
}

const allData = ref<CountryData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useWorldGeo() {

    const init = async () => {
        if (allData.value.length > 0) return

        loading.value = true
        try {
            const res = await fetch(DATA_URL)
            if (!res.ok) throw new Error('Country Data missing')
            const json = await res.json()
            // Sort by name
            allData.value = json.sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name))
        } catch (e: any) {
            console.error(e)
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    const countries = computed(() => allData.value)

    const getDialCode = (countryCode: string) => {
        const country = allData.value.find(c => c.code === countryCode)
        return country ? country.dial_code : ''
    }

    return {
        countries,
        loading,
        error,
        init,
        getDialCode
    }
}
