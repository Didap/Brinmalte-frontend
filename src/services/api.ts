const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

/**
 * Helper to fetch data from Strapi API
 */
export async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}, options: RequestInit = {}): Promise<T> {
    const url = new URL(`${STRAPI_URL}/api${endpoint}`);

    // Append query params
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key] as string));

    // Get token from localStorage
    const token = localStorage.getItem('strapi_jwt');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    } as Record<string, string>;

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
