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
            user.value = response.user

            // Persist to localStorage
            localStorage.setItem('strapi_jwt', response.jwt)
            localStorage.setItem('strapi_user', JSON.stringify(response.user))

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
            const body: any = {
                username: email,
                email,
                password,
                name,
                surname
            }
            if (phone) body.phone = phone

            const response = await fetchAPI<any>('/auth/local/register', {}, {
                method: 'POST',
                body: JSON.stringify(body)
            })

            token.value = response.jwt
            user.value = response.user

            localStorage.setItem('strapi_jwt', response.jwt)
            localStorage.setItem('strapi_user', JSON.stringify(response.user))

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
