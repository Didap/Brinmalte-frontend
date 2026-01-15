import { ref } from 'vue'
import { fetchAPI } from '@/services/api'

// Global state (so it persists across components)
const user = ref<any>(null)
const token = ref<string | null>(localStorage.getItem('strapi_jwt'))

export function useAuth() {
    const error = ref<string | null>(null)
    const loading = ref(false)

    // Error Translation Helper
    const translateError = (errorMsg: string) => {
        if (errorMsg.includes('Invalid identifier or password')) {
            return 'Email o password non corretti.'
        }
        if (errorMsg.includes('Email is already taken')) {
            return 'Questa email è già registrata.'
        }
        if (errorMsg.includes('Username is already taken')) {
            return 'Questo nome utente è già in uso.'
        }
        if (errorMsg.includes('password must be at least')) {
            return 'La password deve avere almeno 6 caratteri.'
        }
        return 'Si è verificato un errore. Riprova più tardi.'
    }

    // Login Function
    const login = async (identifier: string, password: string) => {
        loading.value = true
        error.value = null
        try {
            const response = await fetchAPI<any>('/auth/local', {}, {
                method: 'POST',
                body: JSON.stringify({ identifier, password })
            })

            // Save state
            token.value = response.jwt

            // Fetch fully populated user (with Customer data)
            // But we need to do this carefully. If 'response.user' doesn't have it, we fetch me.
            // Actually /auth/local returns basic user. We need to fetch /users/me?populate=*
            // But we need to await it.

            localStorage.setItem('strapi_jwt', response.jwt)

            try {
                const fullUser = await fetchAPI<any>('/users/me?populate=customer', {}, {
                    headers: { Authorization: `Bearer ${response.jwt}` } // Although fetchAPI handles token if set in state? 
                    // Wait, fetchAPI uses `useAuth().token` which is reactive. check implementation.
                    // fetchAPI reads `localStorage.getItem('strapi_jwt')` usually or we pass header.
                    // `api.ts` reads `localStorage`?
                    // Let's check api.ts. It reads `localStorage.getItem('strapi_jwt')`.
                    // Since we JUST set it above, it should work.
                });
                user.value = fullUser;
                localStorage.setItem('strapi_user', JSON.stringify(fullUser));
            } catch (e) {
                console.error('Failed to fetch user profile', e);
                user.value = response.user;
                localStorage.setItem('strapi_user', JSON.stringify(response.user));
            }

            return true
        } catch (err: any) {
            error.value = translateError(err.message)
            return false
        } finally {
            loading.value = false
        }
    }

    // Register Function
    const register = async (name: string, surname: string, email: string, password: string, phone: string) => {
        loading.value = true
        error.value = null
        try {
            // Step 1: Create Auth User (Standard Strapi User)
            const registerPayload = {
                username: email, // Map email to username as requested
                email,
                password,
            }

            // This will return the JWT and the User object
            const response = await fetchAPI<any>('/auth/local/register', {}, {
                method: 'POST',
                body: JSON.stringify(registerPayload)
            })

            // Save Auth State immediately
            token.value = response.jwt
            localStorage.setItem('strapi_jwt', response.jwt)

            // Step 2: Create Customer Profile (Linked to User)
            try {
                const customerPayload = {
                    data: {
                        name,
                        surname,
                        phone,
                        user: response.user.id // Link to the created user
                    }
                }

                await fetchAPI<any>('/customers', {}, {
                    method: 'POST',
                    body: JSON.stringify(customerPayload)
                })

                // Step 3: Fetch full user profile with customer data to update state
                // This ensures we have the name/surname correctly in the UI
                const fullUser = await fetchAPI<any>('/users/me?populate=customer')
                user.value = fullUser
                localStorage.setItem('strapi_user', JSON.stringify(fullUser))

            } catch (customerErr) {
                console.error('Failed to create/fetch Customer profile:', customerErr)
                // Fallback to basic user if customer creation failed
                user.value = response.user
                localStorage.setItem('strapi_user', JSON.stringify(response.user))
            }

            return true
        } catch (err: any) {
            error.value = translateError(err.message)
            return false
        } finally {
            loading.value = false
        }
    }

    // Logout Function
    const logout = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('strapi_jwt')
        localStorage.removeItem('strapi_user')
    }

    // Check if user is logged in on app start
    const initAuth = () => {
        const storedUser = localStorage.getItem('strapi_user')
        if (token.value && storedUser) {
            user.value = JSON.parse(storedUser)
        }
    }

    return {
        user,
        token,
        error,
        loading,
        login,
        register,
        logout,
        initAuth
    }
}
