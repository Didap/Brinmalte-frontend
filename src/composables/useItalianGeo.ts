
import { ref, computed } from 'vue'

import { STRAPI_URL } from '@/services/api'

const DATA_URL = `${STRAPI_URL}/comuni.json`

export interface CityData {
    nome: string;
    codice: string;
    sigla: string; // Province short code
    regione: {
        codice: string;
        nome: string;
    };
    provincia: {
        codice: string;
        nome: string;
    };
    [key: string]: any;
}

const allData = ref<CityData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useItalianGeo() {

    // Trigger fetch if empty
    const init = async () => {
        if (allData.value.length > 0) return

        loading.value = true
        try {
            // Try fetching from Backend (Synced via Cron)
            try {
                const res = await fetch(DATA_URL)
                if (!res.ok) throw new Error('Backend data missing')
                const json = await res.json()
                allData.value = json
                // console.log('Geo Data loaded from Backend')
            } catch (backendErr) {
                console.warn('Backend Geo Data not available, using local fallback:', backendErr)
                // Fallback to local frontend public/comuni.json
                const res = await fetch('/comuni.json')
                if (!res.ok) throw new Error('Local fallback missing')
                const json = await res.json()
                allData.value = json
                // console.log('Geo Data loaded from Local Fallback')
            }
        } catch (e: any) {
            console.error(e)
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    // Unique Regions
    const regions = computed(() => {
        const unique = new Map()
        allData.value.forEach(item => {
            if (!unique.has(item.regione.nome)) {
                unique.set(item.regione.nome, item.regione.nome)
            }
        })
        return Array.from(unique.values()).sort()
    })

    // Get Provinces for a Region
    const getProvinces = (regionName: string) => {
        if (!regionName) return []
        const unique = new Map()
        allData.value.filter(item => item.regione.nome === regionName).forEach(item => {
            // Use sigla or nome? User has 'province' in form usually as Sigla (RM) or full name? 
            // CheckoutPage input was placeholder "RM", implies Sigla. 
            // Form uses full inputs usually but let's offer Object {code, name}
            if (!unique.has(item.provincia.nome)) {
                unique.set(item.provincia.nome, {
                    name: item.provincia.nome,
                    code: item.sigla // "RM"
                })
            }
        })
        return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
    }

    // Get Cities for a Province (by Province Name or Sigla? Using Name is safer if unique map uses names)
    const getCities = (provinceName: string) => {
        if (!provinceName) return []
        return allData.value
            .filter(item => item.provincia.nome === provinceName)
            .map(item => ({
                name: item.nome,
                zip: item.cap && item.cap.length ? item.cap[0] : '' // comuni-json might have cap array or string, checking structure...
                // Actually matteocontrini/comuni-json usually has "cap": ["00100"] 
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
    }

    // Helper to find ZIP for a city if needed (auto-fill)
    const getZip = (cityName: string, provinceName: string) => {
        const match = allData.value.find(i => i.nome === cityName && i.provincia.nome === provinceName)
        // Check "cap" field. In this dataset it is usually an array "cap": ["..."]
        const cap = match?.cap
        if (Array.isArray(cap)) return cap[0]
        return cap || ''
    }

    // Reverse lookup: Find location by ZIP
    const findLocationByZip = (zip: string) => {
        if (!zip || zip.length < 5) return null

        // Find city that has this ZIP in its array
        const match = allData.value.find(i => {
            if (Array.isArray(i.cap)) {
                return i.cap.includes(zip)
            }
            // Some entries might be string if inconsistent, but dataset is usually array
            return i.cap === zip
        })

        if (match) {
            return {
                city: match.nome,
                province: match.sigla, // We use sigla for Province Value
                region: match.regione.nome
            }
        }
        return null
    }

    return {
        allData,
        loading,
        error,
        regions,
        getProvinces,
        getCities,
        getZip,
        findLocationByZip,
        init
    }
}
