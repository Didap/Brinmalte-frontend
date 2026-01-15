const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

/**
 * Helper to fetch data from Strapi API
 */
export async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}, options: RequestInit = {}): Promise<T> {
    const url = new URL(`${STRAPI_URL}/api${endpoint}`);

    // Append query params
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key] as string));

    const headers = {
        ...options.headers,
    } as Record<string, string>;

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
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
