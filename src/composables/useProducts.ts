import { ref } from 'vue'
import { fetchAPI, getStrapiMedia } from '@/services/api'
import type { Product } from '@/data/products'

export function useProducts() {
    const products = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const pagination = ref({
        page: 1,
        pageSize: 20,
        pageCount: 1,
        total: 0
    })

    const fetchProducts = async (page = 1, pageSize = 20, additionalParams?: URLSearchParams) => {
        loading.value = true
        try {
            // Base params
            const params = new URLSearchParams()
            params.append('populate', '*')
            params.append('pagination[page]', String(page))
            params.append('pagination[pageSize]', String(pageSize))

            // Default sort if not provided in additionalParams
            if (!additionalParams || !additionalParams.has('sort')) {
                params.append('sort', 'createdAt:desc')
            }

            // Merge additional params
            if (additionalParams) {
                additionalParams.forEach((value, key) => {
                    params.append(key, value)
                })
            }

            const response = await fetchAPI<{ data: any[], meta: any }>(`/products?${params.toString()}`)

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
            // Sanitize data object
            const cleanData: any = {
                name: productData.name,
                description: productData.description || undefined,
                price: Number(productData.price),
                stock: Number(productData.stock),
                sku: productData.sku || undefined,
                subtitle: productData.subtitle || undefined,
                availability: (Number(productData.stock) > 0) ? 'Disponibile' : 'Esaurito',
                // Generate slug
                slug: productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `product-${Date.now()}`
            }

            // Handle Category
            if (productData.categoryId && String(productData.categoryId) !== 'undefined') {
                cleanData.category = Number(productData.categoryId);
            }

            // Step 1: Upload Image if present
            if (file) {
                try {
                    const formData = new FormData()
                    formData.append('files', file)

                    const uploadResponse = await fetchAPI<any[]>('/upload', {}, {
                        method: 'POST',
                        body: formData
                    })

                    // Handle array response from /upload
                    if (Array.isArray(uploadResponse) && uploadResponse.length > 0) {
                        console.log('Image uploaded. ID:', uploadResponse[0].id)
                        cleanData.image = uploadResponse[0].id
                    }
                } catch (uploadErr) {
                    console.error('Image upload failed:', uploadErr)
                    throw new Error('Image upload failed. Product not created.')
                }
            }

            // Step 2: Create Product (JSON)
            // This avoids "Missing data payload" because it's a pure JSON request
            await fetchAPI('/products', {}, {
                method: 'POST',
                body: JSON.stringify({ data: cleanData })
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
