export const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

/**
 * Helper to fetch data from Strapi API
 */
export async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}, options: RequestInit = {}): Promise<T> {
    const url = new URL(`${STRAPI_URL}/api${endpoint}`);

    // Append query params
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key] as string));

    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('strapi_jwt') || sessionStorage.getItem('strapi_jwt');

    const headers = {
        ...options.headers,
    } as Record<string, string>;

    // Safe check for FormData (duck typing)
    const isFormData = (body: any) => body && typeof body.append === 'function';

    if (isFormData(options.body)) {
        // Let the browser set the Content-Type header with the boundary
        if (headers['Content-Type']) {
            delete headers['Content-Type'];
        }
    } else {
        headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || response.statusText;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

/**
 * Get full image URL
 */
export function getStrapiMedia(url: string | null) {
    if (url == null) {
        return null;
    }
    if (url.startsWith('http') || url.startsWith('//')) {
        return url;
    }
    return `${STRAPI_URL}${url}`;
}

export async function createOrder(orderData: any) {
    return fetchAPI('/orders', {}, {
        method: 'POST',
        body: JSON.stringify({ data: orderData })
    });
}

export async function getCurrentCustomer(userId: number) {
    // Find customer linked to this user
    const response = await fetchAPI<{ data: any[] }>(`/customers`, {
        'filters[user][id][$eq]': userId.toString(),
        'populate': '*'
    });
    return response.data[0]; // Return first match or undefined
}

export async function updateCustomer(documentId: string, data: any) {
    return fetchAPI(`/customers/${documentId}`, {}, {
        method: 'PUT',
        body: JSON.stringify({ data })
    });
}

export async function createCustomer(data: any) {
    return fetchAPI('/customers', {}, {
        method: 'POST',
        body: JSON.stringify({ data })
    });
}

export async function getCustomerOrders(customerDocumentId: string, page = 1, pageSize = 5) {
    return fetchAPI<{ data: any[], meta: any }>(`/orders`, {
        'filters[customer][documentId][$eq]': customerDocumentId,
        'populate': '*', // Get items and other relations
        'sort': 'createdAt:desc',
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString()
    });
}
export async function createCheckoutSession(orderId: string) {
    return fetchAPI<{ url: string }>('/payment/checkout-session', {}, {
        method: 'POST',
        body: JSON.stringify({ orderId })
    });
}

export async function updateOrderStatus(documentId: string, order_status: string) {
    return fetchAPI(`/orders/${documentId}`, {}, {
        method: 'PUT',
        body: JSON.stringify({ data: { order_status } })
    });
}

// ==========================================
// PROFESSIONAL & UPLOAD SERVICES
// ==========================================

export async function getProfessionalProfile(userId: number) {
    const response = await fetchAPI<{ data: any[] }>(`/professionals`, {
        'filters[user][id][$eq]': userId.toString(),
        'populate': '*',
        'status': 'published'
    });
    return response.data[0];
}

export async function updateProfessional(documentId: string, data: any) {
    return fetchAPI(`/professionals/${documentId}`, {}, {
        method: 'PUT',
        body: JSON.stringify({ data })
    });
}

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('strapi_jwt') || sessionStorage.getItem('strapi_jwt')}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const data = await response.json();
    return data[0]; // Strapi returns an array of uploaded files
}
