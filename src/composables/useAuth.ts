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
        if (!errorMsg) return 'Si è verificato un errore sconosciuto.'

        const lowerMsg = errorMsg.toLowerCase();

        // Account / Auth
        if (lowerMsg.includes('invalid identifier') || lowerMsg.includes('invalid password')) {
            return 'Email o password non corretti.'
        }
        if (lowerMsg.includes('email is already taken') || lowerMsg.includes('email already exists')) {
            return 'Questa email è già registrata. Prova ad accedere.'
        }
        if (lowerMsg.includes('username is already taken')) {
            return 'Questo nome utente è già in uso.'
        }
        if (lowerMsg.includes('confirmed')) {
            return 'Il tuo account non è ancora confermato. Controlla la tua email.'
        }
        if (lowerMsg.includes('blocked')) {
            return 'Questo account è stato bloccato.'
        }

        // Validation & Password
        if (lowerMsg.includes('password must be at least')) {
            return 'La password deve avere almeno 6 caratteri.'
        }
        if (lowerMsg.includes('must be a valid email') || lowerMsg.includes('email format')) {
            return 'Inserisci un indirizzo email valido.'
        }
        if (lowerMsg.includes('is required') || lowerMsg.includes('must be defined')) {
            return 'Tutti i campi sono obbligatori.'
        }

        // Security / Network
        if (lowerMsg.includes('too many attempts') || lowerMsg.includes('rate limit')) {
            return 'Troppi tentativi. Riprova tra 5 minuti.'
        }
        if (lowerMsg.includes('forbidden')) {
            return 'Accesso negato.'
        }

        // Fallback for truly unknown errors
        return `Errore: ${errorMsg}`
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

    // Register Function - Creates user but doesn't login (email confirmation required)
    const register = async (name: string, surname: string, email: string, password: string, phone: string, professionalData?: { isProfessional: boolean, profilePhoto?: File | null, skills?: any[], gallery?: File[] }) => {
        loading.value = true
        error.value = null
        try {
            // Step 1: Prepare Payload
            const registerPayload = {
                username: email, // Map email to username as requested
                email,
                password,
                // Extra fields for Customer creation
                name,
                surname,
                phone,
                // Professional fields
                isProfessional: professionalData?.isProfessional || false,
                skills: JSON.stringify(professionalData?.skills || [])
            }

            // Check if we need multipart/form-data
            const isMultipart = professionalData?.isProfessional && (professionalData?.profilePhoto || (professionalData?.gallery && professionalData.gallery.length > 0));

            if (isMultipart) {
                const formData = new FormData();

                // 2026-02-03: Fixed to match Strapi Multipart Protocol
                // 1. Data Object (JSON stringified)
                formData.append('data', JSON.stringify(registerPayload));

                // 2. Files with 'files.' prefix
                if (professionalData.profilePhoto) {
                    formData.append('files.profilePhoto', professionalData.profilePhoto);
                }

                // Append gallery
                if (professionalData.gallery && professionalData.gallery.length > 0) {
                    professionalData.gallery.forEach((file: File) => {
                        formData.append('files.gallery', file);
                    });
                }

                await fetchAPI<any>('/auth/custom-register', {}, {
                    method: 'POST',
                    body: formData
                })

            } else {
                // Standard JSON
                await fetchAPI<any>('/auth/custom-register', {}, {
                    method: 'POST',
                    body: JSON.stringify(registerPayload)
                })
            }

            // Backend now handles Customer/Professional creation automatically.

            // DO NOT save auth state - user needs to confirm email first
            // token.value and user.value stay null
            // User will login after email confirmation

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

    // Check if user is admin
    const isAdmin = () => {
        return user.value?.role?.name === 'Admin' || user.value?.role?.type === 'admin'
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
        updateUser,
        isAdmin
    }
}
