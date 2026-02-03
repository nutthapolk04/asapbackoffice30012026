import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'แดชบอร์ด' }
      },
      // Banner
      {
        path: 'banners',
        name: 'BannerList',
        component: () => import('@/views/banner/BannerList.vue'),
        meta: { title: 'จัดการแบนเนอร์' }
      },
      {
        path: 'banners/create',
        name: 'BannerCreate',
        component: () => import('@/views/banner/BannerForm.vue'),
        meta: { title: 'เพิ่มแบนเนอร์' }
      },
      {
        path: 'banners/:id/edit',
        name: 'BannerEdit',
        component: () => import('@/views/banner/BannerForm.vue'),
        meta: { title: 'แก้ไขแบนเนอร์' }
      },
      // App Banner (Home Application Banner)
      {
        path: 'app-banner',
        name: 'AppBanner',
        component: () => import('@/views/pages/AppBanner.vue'),
        meta: { title: 'จัดการ Home Application Banner' }
      },
      // Promotion
      {
        path: 'promotions',
        name: 'PromotionList',
        component: () => import('@/views/promotion/PromotionList.vue'),
        meta: { title: 'จัดการโปรโมชัน' }
      },
      {
        path: 'promotions/create',
        name: 'PromotionCreate',
        component: () => import('@/views/promotion/PromotionForm.vue'),
        meta: { title: 'เพิ่มโปรโมชัน' }
      },
      {
        path: 'promotions/:id/edit',
        name: 'PromotionEdit',
        component: () => import('@/views/promotion/PromotionForm.vue'),
        meta: { title: 'แก้ไขโปรโมชัน' }
      },
      {
        path: 'coupons',
        name: 'CouponList',
        component: () => import('@/views/promotion/CouponList.vue'),
        meta: { title: 'จัดการคูปอง' }
      },
      // Province
      {
        path: 'provinces',
        name: 'ProvinceList',
        component: () => import('@/views/province/ProvinceList.vue'),
        meta: { title: 'จัดการจังหวัด' }
      },
      {
        path: 'provinces/create',
        name: 'ProvinceCreate',
        component: () => import('@/views/province/ProvinceForm.vue'),
        meta: { title: 'เพิ่มจังหวัด' }
      },
      {
        path: 'provinces/:id/edit',
        name: 'ProvinceEdit',
        component: () => import('@/views/province/ProvinceForm.vue'),
        meta: { title: 'แก้ไขจังหวัด' }
      },
      // Article
      {
        path: 'articles',
        name: 'ArticleList',
        component: () => import('@/views/article/ArticleList.vue'),
        meta: { title: 'จัดการบทความ' }
      },
      {
        path: 'articles/create',
        name: 'ArticleCreate',
        component: () => import('@/views/article/ArticleForm.vue'),
        meta: { title: 'เพิ่มบทความ' }
      },
      {
        path: 'articles/:id/edit',
        name: 'ArticleEdit',
        component: () => import('@/views/article/ArticleForm.vue'),
        meta: { title: 'แก้ไขบทความ' }
      },
      {
        path: 'articles/categories',
        name: 'ArticleCategoryList',
        component: () => import('@/views/article/CategoryList.vue'),
        meta: { title: 'หมวดหมู่บทความ' }
      },
      // FAQ
      {
        path: 'faqs',
        name: 'FAQList',
        component: () => import('@/views/faq/FAQList.vue'),
        meta: { title: 'จัดการคำถามที่พบบ่อย' }
      },
      {
        path: 'faqs/create',
        name: 'FAQCreate',
        component: () => import('@/views/faq/FAQForm.vue'),
        meta: { title: 'เพิ่มคำถาม' }
      },
      {
        path: 'faqs/:id/edit',
        name: 'FAQEdit',
        component: () => import('@/views/faq/FAQForm.vue'),
        meta: { title: 'แก้ไขคำถาม' }
      },
      {
        path: 'faqs/categories',
        name: 'FAQCategoryList',
        component: () => import('@/views/faq/CategoryList.vue'),
        meta: { title: 'หมวดหมู่คำถาม' }
      },
      // Check-in Online
      {
        path: 'check-ins',
        name: 'CheckInList',
        component: () => import('@/views/check-in/CheckInList.vue'),
        meta: { title: 'เช็คอินออนไลน์' }
      },
      {
        path: 'check-ins/:id',
        name: 'CheckInDetail',
        component: () => import('@/views/check-in/CheckInDetail.vue'),
        meta: { title: 'รายละเอียดเช็คอิน' }
      },
      // Car Models
      {
        path: 'car-models',
        name: 'CarModelList',
        component: () => import('@/views/car/CarModelList.vue'),
        meta: { title: 'จัดการรูปภาพรถยนต์' }
      },
      {
        path: 'car-models/:id',
        name: 'BrandDetail',
        component: () => import('@/views/car/BrandDetail.vue'),
        meta: { title: 'จัดการรูปภาพรถยนต์' }
      },
      // Car Categories
      {
        path: 'car-categories',
        name: 'CarCategoryList',
        component: () => import('@/views/car/CarCategoryList.vue'),
        meta: { title: 'จัดการประเภทกลุ่มรถ' }
      },
      // Static Pages
      {
        path: 'pages/contact',
        name: 'ContactUs',
        component: () => import('@/views/pages/ContactUs.vue'),
        meta: { title: 'ข้อมูลติดต่อ' }
      },
      {
        path: 'contact-submissions',
        name: 'ContactSubmissions',
        component: () => import('@/views/pages/ContactSubmissions.vue'),
        meta: { title: 'ข้อความจากลูกค้า' }
      },
      {
        path: 'pages/about',
        name: 'AboutUs',
        component: () => import('@/views/pages/AboutUs.vue'),
        meta: { title: 'เกี่ยวกับเรา' }
      },
      {
        path: 'pages/privacy',
        name: 'PrivacyPolicy',
        component: () => import('@/views/pages/PrivacyPolicy.vue'),
        meta: { title: 'นโยบายความเป็นส่วนตัว' }
      },
      // Account
      {
        path: 'accounts',
        name: 'AccountList',
        component: () => import('@/views/account/AccountList.vue'),
        meta: { title: 'จัดการผู้ใช้งาน' }
      },
      {
        path: 'accounts/create',
        name: 'AccountCreate',
        component: () => import('@/views/account/AccountForm.vue'),
        meta: { title: 'เพิ่มผู้ใช้งาน' }
      },
      {
        path: 'accounts/:id/edit',
        name: 'AccountEdit',
        component: () => import('@/views/account/AccountForm.vue'),
        meta: { title: 'แก้ไขผู้ใช้งาน' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/account/Profile.vue'),
        meta: { title: 'โปรไฟล์ของฉัน' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: 'เข้าสู่ระบบ' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'หน้าหลัก'} | ASAP Backoffice`
  next()
})

export default router
