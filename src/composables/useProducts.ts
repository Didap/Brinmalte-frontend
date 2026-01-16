import { ref } from 'vue'
import { fetchAPI, getStrapiMedia } from '@/services/api'
import type { Product } from '@/data/products'

export function useProducts() {
    const products = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const pagination = ref({
        page: 1,
        pageSize: 7,
        pageCount: 1,
        total: 0
    })

    const fetchProducts = async (page = 1, pageSize = 7) => {
        loading.value = true
        try {
            // Include pagination parameters
            const queryParams = `?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`
            const response = await fetchAPI<{ data: any[], meta: any }>(`/products${queryParams}`)

            if (response.meta && response.meta.pagination) {
                pagination.value = response.meta.pagination
            }

            products.value = response.data.map((item: any) => ({
                id: item.documentId || item.id,
                name: item.name,
                subtitle: item.subtitle || '',
                sku: item.sku || '',
                price: String(item.price), // backend is number
                unit: 'Pz', // Default or from API if added
                availability: item.stock > 0 ? `Disponibile (${item.stock} pz)` : 'Esaurito',
                stock: item.stock,
                image: (item.images && item.images.length > 0)
                    ? (getStrapiMedia(item.images[0].url) || '')
                    : (item.image ? (getStrapiMedia(item.image.url) || '') : ''),
                description: item.description || '', // Basic text from rich text if simple
                features: [], // Needs extra field or parsing
                technicalData: item.technical_data || [], // Needs component
                documents: item.technical_sheet ? [{
                    name: "Scheda Tecnica",
                    url: getStrapiMedia(item.technical_sheet.url),
                    size: 'PDF',
                    type: 'PDF'
                }] : [],
                category: item.category ? {
                    slug: item.category.slug,
                    name: item.category.name
                } : null
            })) as Product[]
        } catch (err: any) {
            error.value = err.message
            console.error('Error fetching products:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchProduct = async (id: string | number) => {
        loading.value = true
        try {
            const response = await fetchAPI<{ data: any }>(`/products/${id}`, { populate: '*' })
            const item = response.data
            return {
                id: item.documentId || item.id,
                name: item.name,
                subtitle: item.subtitle || '',
                sku: item.sku || '',
                price: String(item.price),
                unit: 'Pz',
                availability: item.stock > 0 ? `Disponibile (${item.stock} pz)` : 'Esaurito',
                stock: item.stock,
                image: (item.images && item.images.length > 0)
                    ? (getStrapiMedia(item.images[0].url) || '')
                    : (item.image ? (getStrapiMedia(item.image.url) || '') : ''),
                description: item.description || '',
                features: [],
                technicalData: item.technical_data || [],
                documents: item.technical_sheet ? [{
                    name: "Scheda Tecnica",
                    url: getStrapiMedia(item.technical_sheet.url),
                    size: 'PDF',
                    type: 'PDF'
                }] : [],
                category: item.category ? {
                    slug: item.category.slug,
                    name: item.category.name
                } : null
            } as Product
        } catch (err: any) {
            error.value = err.message
            console.error('Error fetching product:', err)
            return null
        } finally {
            loading.value = false
        }
    }

    const createProduct = async (productData: Partial<Product>, file?: File) => {
        loading.value = true
        try {

            const dataObj = {
                name: productData.name,
                description: productData.description || undefined,
                price: Number(productData.price),
                stock: Number(productData.stock),
                sku: productData.sku || undefined,
                subtitle: productData.subtitle || undefined,
                category: productData.categoryId ? Number(productData.categoryId) : undefined,
                availability: 'Disponibile',
                // Generate slug from name
                slug: productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `product-${Date.now()}`
            }

            let body: string | FormData;

            if (file) {
                const formData = new FormData()
                formData.append('data', JSON.stringify(dataObj))
                formData.append('files.image', file)

                // Debug FormData
                console.log('--- FormData Content ---')
                // @ts-ignore
                for (const pair of formData.entries()) {
                    console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
                }
                console.log('------------------------')

                body = formData
            } else {
                body = JSON.stringify({ data: dataObj })
            }

            await fetchAPI('/products', {}, {
                method: 'POST',
                body
            })

            // Refresh list
            await fetchProducts(pagination.value.page, pagination.value.pageSize)
            return true
        } catch (err: any) {
            error.value = err.message
            console.error('Error creating product:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    const updateProduct = async (id: number | string, productData: Partial<Product>, file?: File) => {
        loading.value = true
        try {
            const dataObj = {
                name: productData.name,
                description: productData.description || undefined,
                price: Number(productData.price),
                stock: Number(productData.stock),
                sku: productData.sku || undefined,
                subtitle: productData.subtitle || undefined,
                category: productData.categoryId ? Number(productData.categoryId) : undefined,
                availability: (Number(productData.stock) > 0) ? 'Disponibile' : 'Esaurito',
            }

            let body: string | FormData;
            const isMultipart = !!file

            if (isMultipart) {
                const formData = new FormData()
                formData.append('data', JSON.stringify(dataObj))
                formData.append('files.image', file)
                body = formData
            } else {
                body = JSON.stringify({ data: dataObj })
            }

            // For Strapi v4/v5 update usually uses PUT
            await fetchAPI(`/products/${id}`, {}, {
                method: 'PUT',
                body
            })

            await fetchProducts(pagination.value.page, pagination.value.pageSize)
            return true
        } catch (err: any) {
            error.value = err.message
            console.error('Error updating product:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    const deleteProduct = async (id: number | string) => {
        loading.value = true
        try {
            await fetchAPI(`/products/${id}`, {}, {
                method: 'DELETE'
            })
            await fetchProducts(pagination.value.page, pagination.value.pageSize)
            return true
        } catch (err: any) {
            error.value = err.message
            console.error('Error deleting product:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        products,
        pagination,
        loading,
        error,
        fetchProducts,
        fetchProduct,
        createProduct,
        updateProduct,
        deleteProduct
    }
}
