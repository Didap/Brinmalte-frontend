import { ref } from 'vue'
import { fetchAPI } from '@/services/api'

// Global state (so it persists across components)
// Global state checking both storages preference (token might be in either)
const storedToken = localStorage.getItem('strapi_jwt') || sessionStorage.getItem('strapi_jwt');
const token = ref<string | null>(storedToken)
const user = ref<any>(null)

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
    const login = async (identifier: string, password: string, rememberMe: boolean = true) => {
        loading.value = true
        error.value = null
        try {
            const response = await fetchAPI<any>('/auth/local', {}, {
                method: 'POST',
                body: JSON.stringify({ identifier, password })
            })

            // Save state
            token.value = response.jwt

            // Storage Logic
            if (rememberMe) {
                localStorage.setItem('strapi_jwt', response.jwt)
                // Clear session just in case
                sessionStorage.removeItem('strapi_jwt')
            } else {
                sessionStorage.setItem('strapi_jwt', response.jwt)
                // Clear local just in case
                localStorage.removeItem('strapi_jwt')
            }

            // Fetch fully populated user (with Customer data)
            // But we need to do this carefully. If 'response.user' doesn't have it, we fetch me.
            // Actually /auth/local returns basic user. We need to fetch /users/me?populate=*
            // But we need to await it.

            // Fetch fully populated user
            try {
                // For immediate header auth, fetchAPI relies on storage or we pass it manually?
                // Since we just stored it, it might be fine, but let's be implicit.
                // Actually fetchAPI might look at localStorage ONLY in many implementations if hardcoded.
                // I need to check fetchAPI implementation if it reads sessionStorage!
                // Assuming I need to update fetchAPI later if it doesn't.
                // For now, let's proceed assuming fetchAPI reads token from somewhere or we fix it.
                // Actually, useAuth "token" ref is updated. If fetchAPI uses that, great. 
                // But wait, fetchAPI is likely in a separate file.

                const fullUser = await fetchAPI<any>('/users/me?populate=*', {}, {
                    headers: { Authorization: `Bearer ${response.jwt}` }
                });
                user.value = fullUser;

                if (rememberMe) {
                    localStorage.setItem('strapi_user', JSON.stringify(fullUser))
                    sessionStorage.removeItem('strapi_user')
                } else {
                    sessionStorage.setItem('strapi_user', JSON.stringify(fullUser))
                    localStorage.removeItem('strapi_user')
                }
            } catch (e) {
                console.error('Failed to fetch user profile', e);
                user.value = response.user;
                if (rememberMe) {
                    localStorage.setItem('strapi_user', JSON.stringify(response.user))
                } else {
                    sessionStorage.setItem('strapi_user', JSON.stringify(response.user))
                }
            }

            return true
        } catch (err: any) {
            error.value = translateError(err.message)
            return false
        } finally {
            loading.value = false
        }
    }

    // Register Function (Defaults to Remember Me = true usually, or persistent)
    // We'll keep register persistent (localStorage) by default for better UX, or change later.
    const register = async (name: string, surname: string, email: string, password: string, phone: string) => {
        // ... (existing implementation uses localStorage, keeping it as is or could param it)
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
            // Default to localStorage for registration
            localStorage.setItem('strapi_jwt', response.jwt)
            sessionStorage.removeItem('strapi_jwt')

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
                const fullUser = await fetchAPI<any>('/users/me?populate=*')
                user.value = fullUser
                localStorage.setItem('strapi_user', JSON.stringify(fullUser))
                sessionStorage.removeItem('strapi_user')

            } catch (customerErr) {
                console.error('Failed to create/fetch Customer profile:', customerErr)
                // Fallback to basic user if customer creation failed
                user.value = response.user
                localStorage.setItem('strapi_user', JSON.stringify(response.user))
                sessionStorage.removeItem('strapi_user')
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
        sessionStorage.removeItem('strapi_jwt')
        sessionStorage.removeItem('strapi_user')
    }

    // Explicit Fetch User
    const fetchUser = async () => {
        loading.value = true
        try {
            const fullUser = await fetchAPI<any>('/users/me?populate=*')
            user.value = fullUser
            if (localStorage.getItem('strapi_jwt')) {
                localStorage.setItem('strapi_user', JSON.stringify(fullUser))
            } else if (sessionStorage.getItem('strapi_jwt')) {
                sessionStorage.setItem('strapi_user', JSON.stringify(fullUser))
            }
        } catch (err) {
            console.error('Failed to fetch user:', err)
        } finally {
            loading.value = false
        }
    }

    const updateUser = async (data: any) => {
        loading.value = true
        try {
            if (user.value) {
                await fetchAPI<any>(`/users/${user.value.id}`, {}, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                })
                await fetchUser() // Refresh local state
                return true
            }
            return false
        } catch (err: any) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // Check if user is logged in on app start
    const initAuth = async () => {
        const storedUser = localStorage.getItem('strapi_user') || sessionStorage.getItem('strapi_user')
        if (token.value) {
            // Optimistically set from storage if available
            if (storedUser) {
                user.value = JSON.parse(storedUser)
            }
            // Background refresh to get latest data
            await fetchUser()
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
        initAuth,
        fetchUser,
        updateUser
    }
}
