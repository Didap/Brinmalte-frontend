import { ref } from 'vue'
import { fetchAPI, getStrapiMedia } from '@/services/api'
import type { Product } from '@/data/products'

export function useProducts() {
    const products = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchProducts = async () => {
        loading.value = true
        try {
            const response = await fetchAPI<{ data: any[] }>('/products', { populate: '*' })

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
                description: productData.description,
                price: Number(productData.price),
                stock: Number(productData.stock),
                sku: productData.sku,
                subtitle: productData.subtitle,
                category: productData.categoryId ? Number(productData.categoryId) : undefined,
                availability: 'Disponibile',
            }

            let body: string | FormData;

            if (file) {
                const formData = new FormData()
                formData.append('data', JSON.stringify(dataObj))
                formData.append('files.image', file)
                body = formData
            } else {
                body = JSON.stringify({ data: dataObj })
            }

            await fetchAPI('/products', {}, {
                method: 'POST',
                body
            })

            // Refresh list
            await fetchProducts()
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
                description: productData.description,
                price: Number(productData.price),
                stock: Number(productData.stock),
                sku: productData.sku,
                subtitle: productData.subtitle,
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

            await fetchProducts()
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
            await fetchProducts()
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
        loading,
        error,
        fetchProducts,
        fetchProduct,
        createProduct,
        updateProduct,
        deleteProduct
    }
}
