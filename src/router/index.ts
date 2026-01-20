import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductPage from '../views/ProductPage.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/product/:id',
            name: 'product',
            component: ProductPage
        },
        {
            path: '/category/:id',
            name: 'category',
            component: () => import('@/views/CategoryPage.vue')
        },
        {
            path: '/chi-siamo',
            name: 'About',
            component: () => import('@/views/AboutPage.vue')
        },
        {
            path: '/prodotti',
            name: 'Products',
            component: () => import('@/views/ProductsPage.vue')
        },
        {
            path: '/categorie',
            name: 'Categories',
            component: () => import('@/views/CategoriesPage.vue')
        },
        {
            path: '/contatti',
            name: 'Contacts',
            component: () => import('@/views/Contacts.vue')
        },
        {
            path: '/checkout',
            name: 'Checkout',
            component: () => import('@/views/CheckoutPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/profile',
            name: 'Profile',
            component: () => import('@/views/ProfilePage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login.vue'),
            meta: { hideLayout: true }
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/Register.vue'),
            meta: { hideLayout: true }
        },
        {
            path: '/dashboard',
            component: () => import('@/views/dashboard/DashboardLayout.vue'),
            meta: { hideLayout: true },
            children: [
                {
                    path: '',
                    name: 'DashboardOverview',
                    component: () => import('@/views/dashboard/DashboardOverview.vue')
                },
                {
                    path: 'orders',
                    name: 'Orders',
                    component: () => import('@/views/dashboard/OrdersPage.vue')
                },
                {
                    path: 'customers',
                    name: 'Customers',
                    component: () => import('@/views/dashboard/CustomersPage.vue')
                },
                {
                    path: 'products',
                    name: 'DashboardProducts',
                    component: () => import('@/views/dashboard/DashboardProductsPage.vue')
                },
                {
                    path: 'settings',
                    name: 'DashboardSettings',
                    component: () => import('@/views/dashboard/DashboardSettings.vue')
                }
            ]
        },
        {
            path: '/admin',
            name: 'AdminDashboard',
            component: () => import('@/views/AdminDashboard.vue'),
            beforeEnter: (_to, _from, next) => {
                const storedUser = localStorage.getItem('strapi_user') || sessionStorage.getItem('strapi_user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    // Check if role is Admin (adjust 'Admin' to match Strapi role name exactly)
                    if (user?.role?.name === 'Admin' || user?.role?.type === 'admin') {
                        next();
                    } else {
                        // User is logged in but not admin
                        next('/');
                    }
                } else {
                    // Not logged in
                    next('/login');
                }
            }
        }
    ],
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('strapi_jwt') || sessionStorage.getItem('strapi_jwt')

    // Check if route requires auth
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            // Not logged in, redirect to login with return url
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
