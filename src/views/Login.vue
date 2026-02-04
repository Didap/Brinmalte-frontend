<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label' // Need Label for checkboxes
import { ArrowLeft, Eye, EyeOff, Loader2, UserRoundCog, Check } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useWorldGeo } from '@/composables/useWorldGeo'
import { useCategories } from '@/composables/useCategories' // Import useCategories
import CountrySelector from '@/components/CountrySelector.vue'

import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { login, register, loading, error, user } = useAuth()
const { init: initGeo } = useWorldGeo()
const { categories, fetchCategories, loading: loadingCategories } = useCategories()

const isSignUp = ref(false)

// Password Visibility States
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)

const phonePrefix = ref('+39') // Default Italy

// Professional State
const isProfessional = ref(false)
const profilePhoto = ref<File | null>(null)
const selectedSkills = ref<string[]>([])



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
    
    onMounted(() => {
        initGeo()
        fetchCategories()
    })

    const handleSignIn = async () => {
        if (!loginForm.email || !loginForm.password) return

        const success = await login(loginForm.email, loginForm.password, loginForm.remember)
        if (success) {
            const redirectPath = route.query.redirect as string
            if (redirectPath) {
                router.push(redirectPath)
                return
            }

            if (user.value?.role?.name === 'Admin' || user.value?.role?.type === 'admin') {
                router.push('/dashboard')
            } else {
                router.push('/')
            }
        }
    }

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const onPhoneInput = (event: Event) => {
        const input = event.target as HTMLInputElement;
        // Remove non-numeric characters
        input.value = input.value.replace(/\D/g, '');
        registerForm.phone = input.value;
    }

    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
            profilePhoto.value = target.files[0] || null
        } else {
            profilePhoto.value = null
        }
    }
    


    const toggleSkill = (categoryId: string) => {
        console.log('🔘 Toggling Skill:', categoryId);
        const index = selectedSkills.value.indexOf(categoryId)
        if (index === -1) {
            selectedSkills.value.push(categoryId)
            console.log('✅ Added. New list:', JSON.parse(JSON.stringify(selectedSkills.value)))
        } else {
            selectedSkills.value.splice(index, 1)
            console.log('❌ Removed. New list:', JSON.parse(JSON.stringify(selectedSkills.value)))
        }
    }

    const handleSignUp = async () => {
        // Reset valid state
        // Validation
        if (!registerForm.name || registerForm.name.length < 2) {
             alert("Inserisci un nome valido (min 2 caratteri)")
             return
        }
        if (!registerForm.surname || registerForm.surname.length < 2) {
             alert("Inserisci un cognome valido (min 2 caratteri)")
             return
        }
        if (!registerForm.email || !validateEmail(registerForm.email)) {
             alert("Inserisci un indirizzo email valido")
             return
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            alert("Le password non coincidono")
            return
        }
        
        if (registerForm.password.length < 6) {
             alert("La password deve essere di almeno 6 caratteri")
             return
        }

        if (!registerForm.phone || registerForm.phone.length < 8) {
            alert("Inserisci un numero di cellulare valido")
            return
        }
        
        // Format Phone
        let finalPhone = ''
        if (registerForm.phone) {
             finalPhone = `${phonePrefix.value} ${registerForm.phone}`
        }
        
        const professionalData = isProfessional.value ? {
            isProfessional: true,
            profilePhoto: profilePhoto.value,
            skills: selectedSkills.value
        } : undefined

        console.log('📌 REGISTER PAYLOAD CHECK:', {
            isProfessional: isProfessional.value,
            selectedSkills: selectedSkills.value,
            // Check specific array items to ensure they aren't proxies or objects
            skillsContents: JSON.parse(JSON.stringify(selectedSkills.value)),
            profilePhotoName: profilePhoto.value ? profilePhoto.value.name : 'NULL',
            profilePhotoSize: profilePhoto.value ? profilePhoto.value.size : 0
        });

        const success = await register(
            registerForm.name, 
            registerForm.surname, 
            registerForm.email, 
            registerForm.password, 
            finalPhone,
            professionalData
        )

        if (success) {
            // Probably should show confirmation message or auto-login logic if email confirm not strict?
            // Existing logic redirected to home. But useAuth says email confirm required.
            // Let's redirect to a confirmation page or show alert.
            // Since we don't have a separate confirm page design here, let's alert.
            alert("Registrazione completata! Controlla la tua email per confermare l'account.")
            router.push('/login') // or switch to login tab
            isSignUp.value = false;
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
            <form @submit.prevent="handleSignUp" class="bg-white flex flex-col items-center justify-center gap-3 h-full px-6 md:px-[50px] text-center overflow-y-auto py-8">
              <h1 class="font-bold text-4xl m-0 text-[#ED8900] mb-2 tracking-tight">Crea Account</h1>

              <span class="text-xs text-gray-400 mb-2 font-medium">oppure usa la tua email</span>
              
              <div class="flex gap-2 w-full shrink-0">
                <Input v-model="registerForm.name" type="text" placeholder="Nome" class="bg-gray-50 border border-gray-100 text-gray-700 h-11 px-4 my-1 w-1/2 focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg text-sm shrink-0" required />
                <Input v-model="registerForm.surname" type="text" placeholder="Cognome" class="bg-gray-50 border border-gray-100 text-gray-700 h-11 px-4 my-1 w-1/2 focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg text-sm shrink-0" required />
              </div>
              <Input v-model="registerForm.email" type="email" placeholder="Email" class="bg-gray-50 border border-gray-100 text-gray-700 h-11 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg text-sm shrink-0" required />
                <!-- Messages - Phone Input Unified -->
              <div class="flex items-stretch w-full my-1 rounded-lg border border-gray-100 bg-gray-50 text-gray-700 focus-within:ring-2 focus-within:ring-[#ED8900] focus-within:border-transparent transition-all shadow-sm h-11 shrink-0">
                  <CountrySelector 
                    v-model="phonePrefix" 
                    triggerClass="border-0 shadow-none bg-transparent focus:ring-0 w-[110px] px-3 h-full rounded-l-lg rounded-r-none text-sm shrink-0" 
                  />
                  
                  <div class="w-[1px] bg-gray-200 shrink-0 my-2"></div>

                  <Input 
                    v-model="registerForm.phone" 
                    type="tel" 
                    placeholder="Cellulare" 
                    @input="onPhoneInput"
                    class="border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-full text-sm flex-1 rounded-l-none rounded-r-lg shrink-0" 
                  />
              </div>

            <!-- Professional Toggle (Robust Re-make) -->
            <div 
                class="w-full flex items-center justify-between px-4 h-11 rounded-lg border cursor-pointer select-none my-1 shrink-0 bg-gray-50 border-gray-100 hover:border-gray-300 transition-colors"
                @click.stop="isProfessional = !isProfessional"
            >
                <div class="flex items-center gap-3">
                    <UserRoundCog class="w-4 h-4 text-gray-500" :class="{ 'text-[#ED8900]': isProfessional }" />
                    <span 
                        class="text-sm font-medium text-gray-700"
                        :class="{ 'text-[#ED8900] font-bold': isProfessional }"
                    >
                        Sei un professionista?
                    </span>
                </div>
                
                <div class="flex items-center justify-center w-5 h-5 rounded border transition-all duration-200"
                     :class="isProfessional ? 'bg-[#ED8900] border-[#ED8900]' : 'bg-white border-gray-300'"
                >
                     <Check v-if="isProfessional" class="w-3.5 h-3.5 text-white" stroke-width="3" />
                </div>
            </div>

            <!-- Professional Fields -->
            <div v-if="isProfessional" class="w-full space-y-3 p-3 bg-gray-50/50 rounded-lg border border-orange-100 shrink-0">
                <div class="text-left w-full">
                    <Label class="text-xs text-gray-500 mb-1 block">Foto Profilo</Label>
                    <!-- using native input because v-model on component breaks file inputs -->
                    <input 
                         type="file" 
                         accept="image/*"
                         @change="handleFileChange"
                         class="flex h-11 w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-gray-200 file:text-gray-700 file:text-xs file:font-semibold file:mr-4 file:px-4 file:py-2 file:h-full hover:file:bg-gray-300 cursor-pointer text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ED8900]"
                    />
                </div>
                
                <div class="text-left w-full">
                     <Label class="text-xs text-gray-500 mb-1 block">Competenze</Label>
                     <div v-if="loadingCategories" class="text-xs text-gray-400">Caricamento...</div>
                     <div v-else class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-white">
                         <div 
                            v-for="cat in categories" 
                            :key="cat.id" 
                            class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors select-none"
                            @click="toggleSkill(cat.id)"
                        >
                             <!-- 
                                Robust Interaction:
                                Native Checkbox for guaranteed state reflection.
                                Pointer events none on the input so the DIV click handles the toggle.
                             -->
                             <input 
                                 type="checkbox"
                                 :checked="selectedSkills.includes(cat.id)"
                                 class="w-3 h-3 shrink-0 pointer-events-none accent-[#ED8900] rounded border-gray-300 text-[#ED8900] focus:ring-[#ED8900]"
                                 readonly 
                             />
                             <span class="text-xs font-normal text-gray-700">{{ cat.name }}</span>
                         </div>
                     </div>
                </div>
            </div>
          
              <div class="flex gap-3 w-full shrink-0">
                <div class="relative w-full">
                    <Input v-model="registerForm.password" :type="showRegisterPassword ? 'text' : 'password'" placeholder="Password" class="bg-gray-50 border border-gray-100 text-gray-700 h-11 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg pr-10 text-sm shrink-0" required />
                    <button type="button" @click="showRegisterPassword = !showRegisterPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ED8900] focus:outline-none transition-colors">
                        <component :is="showRegisterPassword ? EyeOff : Eye" class="w-4 h-4" />
                    </button>
                </div>
                <div class="relative w-full">
                    <Input v-model="registerForm.confirmPassword" :type="showRegisterConfirmPassword ? 'text' : 'password'" placeholder="Conf. Password" class="bg-gray-50 border border-gray-100 text-gray-700 h-11 px-4 my-1 w-full focus-visible:ring-0 focus-visible:border-[#ED8900] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(237,137,0,0.1)] transition-all placeholder:text-gray-400 rounded-lg text-sm shrink-0" required />
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
