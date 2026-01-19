<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Facebook, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { login, register, loading, error, user } = useAuth()
const isSignUp = ref(false)

// Password Visibility States
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)

    // Form Data
    const loginForm = reactive({
        email: '',
        password: '',
        remember: false
    })

    const registerForm = reactive({
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })

    const handleSignIn = async () => {
        if (!loginForm.email || !loginForm.password) return

        const success = await login(loginForm.email, loginForm.password, loginForm.remember)
        if (success) {
            // Check for redirect query param
            const redirectPath = route.query.redirect as string
            if (redirectPath) {
                router.push(redirectPath)
                return
            }

            // Updated Admin Redirect Logic
            if (user.value?.role?.name === 'Admin' || user.value?.role?.type === 'admin') {
                router.push('/dashboard')
            } else {
                router.push('/')
            }
        }
    }

    const handleSignUp = async () => {
        if (registerForm.password !== registerForm.confirmPassword) {
            alert("Le password non coincidono")
            return
        }
        
        const success = await register(registerForm.name, registerForm.surname, registerForm.email, registerForm.password, registerForm.phone)
        if (success) {
            router.push('/')
        }
    }
    </script>
    
    <template>
      <div class="min-h-screen bg-[#f6f5f7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
        
        <!-- Back to Site Button -->
        <router-link to="/" class="absolute top-4 left-4 md:top-8 md:left-8 z-10">
            <Button variant="ghost" class="flex items-center gap-2 text-gray-500 hover:text-[#ED8900] hover:bg-transparent transition-colors duration-300 font-medium">
                <ArrowLeft class="w-5 h-5" />
                Torna al sito
            </Button>
        </router-link>
    
        <div class="auth-container relative bg-white rounded-[20px] shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] overflow-hidden w-full max-w-[1000px] min-h-[600px]" :class="{ 'right-panel-active': isSignUp }">
          
          <!-- Sign Up Form -->
          <div class="form-container sign-up-container absolute top-0 h-full left-0 w-1/2">
            <form @submit.prevent="handleSignUp" class="bg-white flex flex-col items-center justify-center gap-3 h-full px-6 md:px-[50px] text-center">
              <h1 class="font-bold text-4xl m-0 text-[#ED8900] mb-2 tracking-tight">Crea Account</h1>
              <div class="social-container my-1 flex gap-4">
                <Button variant="outline" size="icon" type="button" class="rounded-full w-10 h-10 border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-[#ED8900] hover:text-[#ED8900] transition-all duration-300 hover:scale-110">
                    <Facebook class="w-5 h-5"/>
                </Button>
                <Button variant="outline" size="icon" type="button" class="rounded-full w-10 h-10 border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-[#ED8900] hover:text-[#ED8900] transition-all duration-300 hover:scale-110">
                    <svg role="img" viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                </Button>
              </div>
              <span class="text-xs text-gray-400 mb-2 font-medium">oppure usa la tua email</span>
              
              <div class="flex gap-3 w-full">
                <Input v-model="registerForm.name" type="text" placeholder="Nome" class="bg-gray-50 border border-gray-100 text-gray-700 py-5 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" required />
                <Input v-model="registerForm.surname" type="text" placeholder="Cognome" class="bg-gray-50 border border-gray-100 text-gray-700 py-5 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" required />
              </div>
              <!-- Input v-model="registerForm.username" removed -->
              <Input v-model="registerForm.email" type="email" placeholder="Email" class="bg-gray-50 border border-gray-100 text-gray-700 py-5 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" required />
          <Input v-model="registerForm.phone" type="tel" placeholder="Telefono" class="bg-gray-50 border border-gray-100 text-gray-700 py-5 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" />
          
          <div class="flex gap-3 w-full">
            <div class="relative w-full">
                <Input v-model="registerForm.password" :type="showRegisterPassword ? 'text' : 'password'" placeholder="Password" class="bg-gray-50 border border-gray-100 text-gray-700 py-5 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" required />
                <button type="button" @click="showRegisterPassword = !showRegisterPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ED8900] focus:outline-none transition-colors">
                    <component :is="showRegisterPassword ? EyeOff : Eye" class="w-4 h-4" />
                </button>
            </div>
            <div class="relative w-full">
                <Input v-model="registerForm.confirmPassword" :type="showRegisterConfirmPassword ? 'text' : 'password'" placeholder="Conf. Password" class="bg-gray-50 border border-gray-100 text-gray-700 py-5 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" required />
                <button type="button" @click="showRegisterConfirmPassword = !showRegisterConfirmPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ED8900] focus:outline-none transition-colors">
                    <component :is="showRegisterConfirmPassword ? EyeOff : Eye" class="w-4 h-4" />
                </button>
            </div>
          </div>
          
           <p v-if="error && isSignUp" class="text-red-500 text-sm mt-1">{{ error }}</p>

          <Button :disabled="loading" class="rounded-full bg-[#ED8900] text-white text-xs font-bold py-4 px-12 uppercase tracking-[1px] transform transition-all hover:bg-orange-600 shadow-[0_4px_14px_0_rgba(237,137,0,0.39)] hover:shadow-[0_6px_20px_rgba(237,137,0,0.23)] hover:-translate-y-[1px] mt-3 w-full sm:w-auto">
             <template v-if="loading">
                 <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                  Caricamento...
             </template>
             <template v-else>
                 Registrati
             </template>
          </Button>
          
          <!-- Mobile Switch Link -->
          <p class="md:hidden mt-6 text-sm text-gray-500">
            Hai già un account? 
            <button type="button" @click="isSignUp = false" class="text-[#ED8900] font-bold hover:underline">Accedi</button>
          </p>
        </form>
      </div>

      <!-- Sign In Form -->
      <div class="form-container sign-in-container absolute top-0 h-full transition-all duration-1000 ease-in-out left-0 w-1/2 z-2">
        <form @submit.prevent="handleSignIn" class="bg-white flex flex-col items-center justify-center gap-4 h-full px-6 md:px-[50px] text-center">
          <h1 class="font-bold text-4xl m-0 text-[#ED8900] mb-2 tracking-tight">Accedi</h1>
          <div class="social-container my-2 flex gap-4">
            <Button variant="outline" size="icon" type="button" class="rounded-full w-12 h-12 border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-[#ED8900] hover:text-[#ED8900] transition-all duration-300 hover:scale-110">
                <Facebook class="w-5 h-5"/>
            </Button>
            <Button variant="outline" size="icon" type="button" class="rounded-full w-12 h-12 border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-[#ED8900] hover:text-[#ED8900] transition-all duration-300 hover:scale-110">
                <svg role="img" viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
            </Button>
          </div>
          <span class="text-xs text-gray-400 mb-4 font-medium">oppure usa il tuo account</span>
          
          <Input v-model="loginForm.email" type="email" placeholder="Email" class="bg-gray-50 border border-gray-100 text-gray-700 py-6 px-4 my-2 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" required />
          
          <div class="relative w-full my-2">
              <Input v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" placeholder="Password" class="bg-gray-50 border border-gray-100 text-gray-700 py-6 px-4 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg" required />
              <button type="button" @click="showLoginPassword = !showLoginPassword" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ED8900] focus:outline-none transition-colors">
                  <component :is="showLoginPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center justify-between w-full my-2 px-1">
             <div class="flex items-center gap-2">
                <Checkbox id="remember" v-model:checked="loginForm.remember" />
                <label for="remember" class="text-sm font-medium leading-none text-gray-500 cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-[#ED8900] transition-colors">
                  Ricordami
                </label>
             </div>
             <a href="#" class="text-gray-500 text-sm no-underline hover:text-[#ED8900] hover:underline transition-colors font-medium">Password dimenticata?</a>
          </div>
          
          <p v-if="error && !isSignUp" class="text-red-500 text-sm">{{ error }}</p>

          <Button :disabled="loading" class="rounded-full bg-[#ED8900] text-white text-xs font-bold py-4 px-12 uppercase tracking-[1px] transform transition-all hover:bg-orange-600 shadow-[0_4px_14px_0_rgba(237,137,0,0.39)] hover:shadow-[0_6px_20px_rgba(237,137,0,0.23)] hover:-translate-y-[1px] mt-4 w-full sm:w-auto">
             <template v-if="loading">
                 <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                  Caricamento...
             </template>
             <template v-else>
                 Accedi
             </template>
          </Button>
          
          <!-- Mobile Switch Link -->
          <p class="md:hidden mt-6 text-sm text-gray-500">
            Non hai un account? 
            <button type="button" @click="isSignUp = true" class="text-[#ED8900] font-bold hover:underline">Registrati</button>
          </p>
        </form>
      </div>

      <!-- Overlay -->
      <div class="overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-1000 ease-in-out z-[100]">
        <div class="overlay bg-no-repeat bg-cover bg-center text-white relative left-[-100%] h-full w-[200%] transform transition-transform duration-1000 ease-in-out"
             style="background-image: url('/img/hero.png');">
             
             <!-- Dark overlay for contrast -->
             <div class="absolute inset-0 bg-black/40 z-0"></div>
             <!-- Orange Gradient -->
             <div class="absolute inset-0 bg-gradient-to-r from-[#ED8900]/80 to-[#ffb347]/80 z-0 mix-blend-multiply"></div>
             
             <!-- Left Panel (Ghost) -->
             <div class="overlay-panel overlay-left absolute top-0 flex flex-col items-center justify-center px-12 text-center h-full w-1/2 transform translate-x-[-20%] transition-transform duration-1000 ease-in-out z-10 left-0">
                <h1 class="font-bold text-4xl m-0 mb-6 text-white drop-shadow-md tracking-tight">Hai già un account?</h1>
                <p class="text-base font-light leading-6 tracking-wide m-[0_0_40px] text-white/95 drop-shadow-sm max-w-sm mx-auto">
                    Per rimanere connesso con noi effettua il login con i tuoi dati personali
                </p>
                <Button @click="isSignUp = false" class="bg-transparent border-2 border-white text-white rounded-full text-xs font-bold py-4 px-16 uppercase tracking-widest hover:bg-white hover:text-[#ED8900] transition-all shadow-xl hover:scale-105">Accedi</Button>
             </div>

             <!-- Right Panel (Ghost) -->
             <div class="overlay-panel overlay-right absolute top-0 flex flex-col items-center justify-center px-12 text-center h-full w-1/2 transform translate-x-0 transition-transform duration-1000 ease-in-out z-10 right-0">
                <h1 class="font-bold text-4xl m-0 mb-6 text-white drop-shadow-md tracking-tight">Non hai un account?</h1>
                <p class="text-base font-light leading-6 tracking-wide m-[0_0_40px] text-white/95 drop-shadow-sm max-w-sm mx-auto">
                    Inserisci i tuoi dati personali e inizia il viaggio con noi
                </p>
                <Button @click="isSignUp = true" class="bg-transparent border-2 border-white text-white rounded-full text-xs font-bold py-4 px-16 uppercase tracking-widest hover:bg-white hover:text-[#ED8900] transition-all shadow-xl hover:scale-105">Registrati</Button>
             </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS Animations for Sliding Effect */

/* Specific transition for Sign Up to handle Z-index delay on exit */
.sign-up-container {
    opacity: 0;
    z-index: 1;
    /* Transition transform/opacity normally, but delay z-index change until END of animation */
    transition-property: transform, opacity, z-index;
    transition-duration: 1s, 1s, 0s;
    transition-delay: 0s, 0s, 1s;
    transition-timing-function: ease-in-out, ease-in-out, linear;
}

/* Move Sign Up container to active position */
.auth-container.right-panel-active .sign-up-container {
	transform: translateX(100%);
	opacity: 1;
	z-index: 5;
    /* Animation handles entry z-index */
    animation: show 0.6s;
}

/* Move Sign In container out */
.auth-container.right-panel-active .sign-in-container {
	transform: translateX(100%);
}

/* Move Overlay Container */
.auth-container.right-panel-active .overlay-container {
	transform: translateX(-100%);
}

/* Move Overlay Background */
.auth-container.right-panel-active .overlay {
	transform: translateX(50%);
}

/* Move Overlay Panels */
.auth-container.right-panel-active .overlay-left {
	transform: translateX(0);
}

.auth-container.right-panel-active .overlay-right {
	transform: translateX(20%);
}

@keyframes show {
	0%, 49.99% {
		opacity: 0;
		z-index: 1;
	}
	
	50%, 100% {
		opacity: 1;
		z-index: 5;
	}
}

/* Fix Input Interaction */
.sign-in-container {
    z-index: 2;
}

.auth-container.right-panel-active .sign-in-container {
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
}

.auth-container:not(.right-panel-active) .sign-up-container {
    pointer-events: none;
}
@media (max-width: 768px) {
    .auth-container {
        min-height: auto;
        height: auto;
        max-width: 450px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .overlay-container {
        display: none;
    }
    
    .form-container {
        position: relative;
        width: 100%;
        height: auto;
        padding: 1rem 0;
        top: 0;
        left: 0;
    }
    
    .sign-in-container, .sign-up-container {
        position: relative;
        width: 100%;
        opacity: 1 !important;
        z-index: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
    }
    
    .auth-container:not(.right-panel-active) .sign-up-container {
        display: none;
    }
    
    .auth-container.right-panel-active .sign-in-container {
        display: none;
    }
    
    .auth-container.right-panel-active .sign-up-container {
        display: block;
    }
}
</style>
