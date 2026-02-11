import { ref } from 'vue'
import { fetchAPI, getStrapiMedia } from '@/services/api'
import type { Category } from '@/data/categories'

export interface Professional {
    id: number | string
    city: string
    profilePhoto?: string
    gallery?: string[]
    skills: Category[]
    name?: string // Display name from user or custom
    user?: {
        username: string
        email: string
    }
}

export function useProfessionals() {
    const professionals = ref<Professional[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        page: 1,
        pageSize: 25,
        total: 0,
        pageCount: 1
    })

    // Cities list derived from data or fetched separately. 
    // For now, we rely on the component to unique-ify, or we fetch distinct if Strapi had that endpoint.
    // We'll leave it to the UI to handle city options for now (text input).

    const fetchProfessionals = async (page = 1, pageSize = 25, params: URLSearchParams = new URLSearchParams()) => {
        loading.value = true
        error.value = null
        try {
            // Base Params
            const searchParams = new URLSearchParams(params)

            // Ensure populate is set
            searchParams.append('populate[0]', 'user')
            searchParams.append('populate[1]', 'skills')
            searchParams.append('populate[2]', 'profilePhoto')
            searchParams.append('populate[3]', 'gallery')

            // Pagination
            searchParams.append('pagination[page]', page.toString())
            searchParams.append('pagination[pageSize]', pageSize.toString())

            const response = await fetchAPI<{ data: any[], meta: any }>(`/professionals?${searchParams.toString()}`)

            professionals.value = response.data.map((item: any) => {
                // Handle name: prefer direct name field, fallback to user.username
                let displayName = 'Professionista'
                if (item.name) {
                    displayName = item.name
                } else if (item.user && item.user.username) {
                    displayName = item.user.username
                }

                // Handle photo
                let photoUrl = ''
                if (item.profilePhoto) {
                    photoUrl = getStrapiMedia(item.profilePhoto.url) || ''
                }

                return {
                    id: item.documentId || item.id,
                    city: item.city || '',
                    profilePhoto: photoUrl,
                    gallery: item.gallery ? item.gallery.map((g: any) => getStrapiMedia(g.url) || '').filter(Boolean) : [],
                    skills: item.skills ? item.skills.map((s: any) => ({
                        id: s.documentId || s.id,
                        name: s.name,
                        slug: s.slug
                    })) : [],
                    name: displayName,
                    user: item.user ? {
                        username: item.user.username,
                        email: item.user.email
                    } : undefined
                } as Professional
            })

            if (response.meta && response.meta.pagination) {
                pagination.value = response.meta.pagination
            }
        } catch (err: any) {
            console.error('Error fetching professionals:', err)
            error.value = 'Impossibile caricare i professionisti.'
        } finally {
            loading.value = false
        }
    }

    return {
        professionals,
        loading,
        error,
        pagination,
        fetchProfessionals
    }
}
