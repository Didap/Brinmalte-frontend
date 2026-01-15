import { ref } from 'vue'
import { fetchAPI, getStrapiMedia } from '@/services/api'
import type { Category } from '@/data/categories'

export function useCategories() {
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchCategories = async () => {
        loading.value = true
        try {
            const response = await fetchAPI<{ data: any[] }>('/categories', { populate: '*' })

            categories.value = response.data.map((item: any, index: number, arr: any[]) => {
                // Restore Mock Layout logic: First and Last items span 2 columns
                let colSpan = 'lg:col-span-1'
                if (index === 0 || index === arr.length - 1) {
                    colSpan = 'lg:col-span-2'
                }

                // Fallback for missing images (Mock)
                let image = item.heroImage ? getStrapiMedia(item.heroImage.url) || '' : ''
                if (!image) {
                    switch (item.slug) {
                        case 'colorificio': image = '/img/cat_paint.png'; break;
                        case 'cappotto-termico': image = '/img/cat_insulation.png'; break;
                        case 'cartongesso': image = '/img/cat_drywall.png'; break;
                        case 'resina': image = '/img/cat_resin.png'; break;
                        case 'piscine': image = '/img/cat_pool.png'; break;
                        case 'edilizia': image = '/img/prod_mortar.png'; break;
                    }
                }

                return {
                    id: item.documentId,
                    slug: item.slug,
                    name: item.name,
                    description: item.description,
                    heroImage: image,
                    colSpan,
                    relatedProducts: []
                }
            })
        } catch (err: any) {
            error.value = err.message
            console.error('Error fetching categories:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        categories,
        loading,
        error,
        fetchCategories
    }
}
