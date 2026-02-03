// API composable for Strapi and Mock Data
import { ref } from 'vue'
import api from '@/services/api'

const STRAPI_URL = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337'
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN

// Helper to management tags in Strapi
// (Removing localStorage implementation)

const resolveTags = async (tagNames) => {
  if (!tagNames || tagNames.length === 0) return []

  const tagIds = []
  for (const name of tagNames) {
    try {
      // 1. Check if tag exists
      const existing = await api.get(`${STRAPI_URL}/api/tags?filters[name][$eq]=${encodeURIComponent(name)}`)
      if (existing.data.data.length > 0) {
        tagIds.push(existing.data.data[0].id)
      } else {
        // 2. Create tag if it doesn't exist
        const slug = name.toLowerCase().replace(/[^\w\sก-๙-]/g, '').replace(/\s+/g, '-')
        const created = await api.post(`${STRAPI_URL}/api/tags`, { data: { name, slug } })
        tagIds.push(created.data.data.id)
      }
    } catch (e) {
      console.warn(`Failed to resolve tag: ${name}`, e)
    }
  }
  return tagIds
}

// Helper to map Strapi Article data
// Strapi v5 uses flattened structure - no 'attributes' wrapper
const mapStrapiArticle = (item) => {
  // Strapi v5: fields are directly on item, not in attributes
  const attrs = item.attributes || item

  // Extract content from dynamic zone blocks (shared.rich-text)
  const contentBlock = attrs.blocks?.find(b => b.__component === 'shared.rich-text')
  const content = contentBlock ? contentBlock.body : ''

  // Extract gallery from dynamic zone blocks (shared.media)
  // Strapi v5: file is directly accessible, not under data.attributes
  const galleryImages = attrs.blocks
    ?.filter(b => b.__component === 'shared.media')
    .map(b => {
      // Try v5 structure first, then fall back to v4
      const url = b.file?.url || b.file?.data?.attributes?.url
      return url ? (url.startsWith('http') ? url : `${STRAPI_URL}${url}`) : null
    })
    .filter(Boolean) || []

  // Extract cover image - Strapi v5: cover is direct object
  const coverUrl = attrs.cover?.url || attrs.cover?.data?.attributes?.url
  const coverImage = coverUrl
    ? (coverUrl.startsWith('http') ? coverUrl : `${STRAPI_URL}${coverUrl}`)
    : null

  // Get category - Strapi v5: category is direct object, not nested in data
  const categoryId = attrs.category?.id || attrs.category?.data?.id
  const categoryDocumentId = attrs.category?.documentId || attrs.category?.data?.documentId
  const categoryName = attrs.category?.name || attrs.category?.data?.attributes?.name || ''

  return {
    id: item.id,
    documentId: item.documentId, // For Strapi v5 Admin URL
    title: attrs.title,
    slug: attrs.slug,
    categoryId: categoryId,
    categoryDocumentId: categoryDocumentId,
    category: categoryName,
    coverImage: coverImage,
    coverImageId: attrs.cover?.id || attrs.cover?.data?.id,
    coverImageAlt: attrs.title, // Fallback as schema has no alt
    content: content,
    publishedAt: attrs.publishedAt,
    metaTitle: attrs.title, // Fallback
    metaDescription: attrs.description,
    status: attrs.publishedAt ? 'published' : 'draft',
    tags: Array.isArray(attrs.tags?.data)
      ? attrs.tags.data.map(t => t.attributes?.name || t.name)
      : (Array.isArray(attrs.tags) ? attrs.tags.map(t => t.name || t) : []),
    images: galleryImages,
    rawCategory: attrs.category
  }
}

// Helper to map Strapi Category data
// Note: Strapi schema only has name, slug, description
// We use 'description' field to store JSON with order/isActive as workaround
const mapStrapiCategory = (item) => {
  const attrs = item.attributes || item

  // Try to parse order/isActive from description JSON
  let order = 0
  let isActive = true

  if (attrs.description) {
    try {
      const meta = JSON.parse(attrs.description)
      order = meta.order ?? 0
      isActive = meta.isActive !== false
    } catch (e) {
      // If description is not JSON, use defaults
      order = 0
      isActive = true
    }
  }

  return {
    id: item.id,
    documentId: item.documentId,
    name: attrs.name,
    slug: attrs.slug,
    order: order,
    isActive: isActive
  }
}

// Mock Data
const mockBanners = ref([
  {
    id: 1,
    title: 'แบนเนอร์หลัก - เช่ารถราคาดีที่สุด',
    imageDesktop: 'https://placehold.co/1280x500/FF595A/white?text=Banner+Desktop+1',
    imageAltDesktop: 'แบนเนอร์หลัก เช่ารถราคาดีที่สุด',
    imageMobile: 'https://placehold.co/390x300/FF595A/white?text=Banner+Mobile+1',
    imageAltMobile: 'แบนเนอร์เช่ารถราคาประหยัด',
    link: 'https://example.com/promo1',
    order: 1,
    isActive: true
  },
  {
    id: 2,
    title: 'แบนเนอร์โปรโมชันพิเศษ',
    imageDesktop: 'https://placehold.co/1280x500/2574FF/white?text=Banner+Desktop+2',
    imageAltDesktop: 'แบนเนอร์โปรโมชันพิเศษ',
    imageMobile: 'https://placehold.co/390x300/2574FF/white?text=Banner+Mobile+2',
    imageAltMobile: 'โปรโมชันพิเศษสำหรับการเช่ารถ',
    link: 'https://example.com/promo2',
    order: 2,
    isActive: true
  },
  {
    id: 3,
    title: 'แบนเนอร์รถใหม่',
    imageDesktop: 'https://placehold.co/1280x500/36B37E/white?text=Banner+Desktop+3',
    imageAltDesktop: 'แบนเนอร์รถใหม่',
    imageMobile: 'https://placehold.co/390x300/36B37E/white?text=Banner+Mobile+3',
    imageAltMobile: 'เช่ารถใหม่วันนี้',
    link: '',
    order: 3,
    isActive: false
  }
])

const mockPromotions = ref([
  {
    id: 1,
    title: 'Mom\'s Day Special Price',
    image: 'https://placehold.co/736x507/FF595A/white?text=Promotion+1',
    imageAlt: 'โปรโมชันวันแม่',
    link: 'https://example.com/moms-day',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    order: 1,
    isActive: true
  },
  {
    id: 2,
    title: 'September Double Deal',
    image: 'https://placehold.co/736x507/FFAB00/white?text=Promotion+2',
    imageAlt: 'โปรโมชันเดือนกันยายน',
    link: 'https://example.com/september',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    order: 2,
    isActive: false
  }
])

// Mock Branches (สาขา)
const mockBranches = ref([
  { id: 1, name: 'กรุงเทพ - สนามบิน สุวรรณภูมิ', type: 'airport', isMaintenance: false, mapEmbed: '' },
  { id: 2, name: 'กรุงเทพ - สนามบิน ดอนเมือง', type: 'airport', isMaintenance: false, mapEmbed: '' },
  { id: 3, name: 'กรุงเทพ - สีลม', type: 'branch', isMaintenance: false, mapEmbed: '' },
  { id: 4, name: 'กรุงเทพ - รัชดา', type: 'branch', isMaintenance: true, mapEmbed: '' },
  { id: 5, name: 'ภูเก็ต - สนามบิน', type: 'airport', isMaintenance: false, mapEmbed: '' },
  { id: 6, name: 'ภูเก็ต - ป่าตอง', type: 'branch', isMaintenance: false, mapEmbed: '' },
  { id: 7, name: 'ภูเก็ต - เมือง', type: 'branch', isMaintenance: false, mapEmbed: '' },
  { id: 8, name: 'กระบี่ - สนามบิน', type: 'airport', isMaintenance: false, mapEmbed: '' },
  { id: 9, name: 'กระบี่ - อ่าวนาง', type: 'branch', isMaintenance: false, mapEmbed: '' },
  { id: 10, name: 'เชียงใหม่ - สนามบิน', type: 'airport', isMaintenance: false, mapEmbed: '' },
  { id: 11, name: 'เชียงใหม่ - นิมมาน', type: 'branch', isMaintenance: false, mapEmbed: '' },
  { id: 12, name: 'พัทยา - สาขาหลัก', type: 'branch', isMaintenance: false, mapEmbed: '' },
  { id: 13, name: 'หาดใหญ่ - สนามบิน', type: 'airport', isMaintenance: false, mapEmbed: '' },
  { id: 14, name: 'สมุย - สนามบิน', type: 'airport', isMaintenance: false, mapEmbed: '' }
])

const mockProvinces = ref([
  {
    id: 1,
    name: 'กรุงเทพมหานคร',
    image: 'https://placehold.co/570x320/FF595A/white?text=Bangkok',
    imageAlt: 'เช่ารถกรุงเทพ ราคาถูก',
    link: '/search?province=bangkok',
    order: 1,
    isActive: true,
    branches: [1, 2, 3, 4]
  },
  {
    id: 2,
    name: 'ภูเก็ต',
    image: 'https://placehold.co/570x320/2574FF/white?text=Phuket',
    imageAlt: 'เช่ารถภูเก็ต ข้ามสนามบิน',
    link: '/search?province=phuket',
    order: 2,
    isActive: true,
    branches: [5, 6, 7]
  },
  {
    id: 3,
    name: 'กระบี่',
    image: 'https://placehold.co/570x320/36B37E/white?text=Krabi',
    imageAlt: 'เช่ารถกระบี่ ท่องเที่ยวทั่วไทย',
    link: '/search?province=krabi',
    order: 3,
    isActive: true,
    branches: [8, 9]
  }
])

const mockArticleCategories = ref([
  { id: 1, name: 'ท่องเที่ยว', slug: 'travel', order: 1, isActive: true },
  { id: 2, name: 'โปรโมชัน', slug: 'promotion', order: 2, isActive: true },
  { id: 3, name: 'ข่าวสาร', slug: 'news', order: 3, isActive: true },
  { id: 4, name: 'แนะนำ', slug: 'tips', order: 4, isActive: true }
])

const mockArticles = ref([
  {
    id: 1,
    title: '10 เส้นทางท่องเที่ยวยอดนิยมในประเทศไทย',
    slug: '10-travel-routes-thailand',
    categoryId: 1,
    category: 'ท่องเที่ยว',
    coverImage: 'https://placehold.co/302x302/FF595A/white?text=Article+1',
    coverImageAlt: '10 เส้นทางท่องเที่ยวยอดนิยม',
    content: '<p>เนื้อหาบทความ...</p>',
    publishedAt: '2025-11-28T09:00:00',
    metaTitle: '',
    metaDescription: '',
    status: 'published',
    tags: ['ท่องเที่ยว', 'เที่ยวทะเล', 'เที่ยวภูเขา'],
    images: []
  },
  {
    id: 2,
    title: 'วิธีเช่ารถสำหรับมือใหม่',
    slug: 'how-to-rent-car-beginner',
    categoryId: 4,
    category: 'แนะนำ',
    coverImage: 'https://placehold.co/302x302/2574FF/white?text=Article+2',
    content: '<p>เนื้อหาบทความ...</p>',
    publishedAt: '2025-11-27T10:30:00',
    metaTitle: '',
    metaDescription: '',
    status: 'published',
    tags: ['รถประหยัด', 'ขับรถระยะไกล'],
    images: []
  },
  {
    id: 3,
    title: 'โปรโมชันส่งท้ายปี 2025',
    slug: 'year-end-promotion-2025',
    categoryId: 2,
    category: 'โปรโมชัน',
    coverImage: 'https://placehold.co/302x302/36B37E/white?text=Article+3',
    content: '<p>เนื้อหาบทความ...</p>',
    publishedAt: '2025-11-26T15:45:00',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
    tags: ['โปรโมชัน', 'รถEV', 'Deepal'],
    images: []
  }
])

const mockFAQCategories = ref([
  { id: 1, name: 'การจอง', order: 1, isActive: true },
  { id: 2, name: 'การชำระเงิน', order: 2, isActive: true },
  { id: 3, name: 'การรับ-คืนรถ', order: 3, isActive: true },
  { id: 4, name: 'เอกสารที่ต้องใช้', order: 4, isActive: true }
])

const mockFAQs = ref([
  {
    id: 1,
    title: 'ฉันสามารถจองรถล่วงหน้าได้กี่วัน?',
    detail: '<p>คุณสามารถจองรถล่วงหน้าได้สูงสุด 90 วัน</p>',
    categoryId: 1,
    category: 'การจอง',
    order: 1,
    status: 'published'
  },
  {
    id: 2,
    title: 'รับชำระเงินด้วยบัตรเครดิตอะไรบ้าง?',
    detail: '<p>เรารับบัตร Visa, Mastercard, JCB และ American Express</p>',
    categoryId: 2,
    category: 'การชำระเงิน',
    order: 1,
    status: 'published'
  },
  {
    id: 3,
    title: 'เอกสารอะไรบ้างที่ต้องใช้ในการรับรถ?',
    detail: '<p>1. บัตรประชาชน หรือ Passport<br/>2. ใบขับขี่ที่ยังไม่หมดอายุ<br/>3. บัตรเครดิต (สำหรับค้ำประกัน)</p>',
    categoryId: 4,
    category: 'เอกสารที่ต้องใช้',
    order: 1,
    status: 'published'
  }
])

const mockAccounts = ref([
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@asap.com',
    role: 'super_admin',
    isActive: true,
    lastLogin: '2025-11-28 10:30:00'
  },
  {
    id: 2,
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: 'somchai@asap.com',
    role: 'editor',
    isActive: true,
    lastLogin: '2025-11-27 15:45:00'
  },
  {
    id: 3,
    firstName: 'สมหญิง',
    lastName: 'รักดี',
    email: 'somying@asap.com',
    role: 'viewer',
    isActive: false,
    lastLogin: '2025-11-20 09:00:00'
  }
])

const mockContactUs = ref({
  heroImage: 'https://placehold.co/1280x400/FF595A/white?text=Contact+Us',
  phone: '02-123-4567',
  email: 'contact@asap.com',
  lineId: '@asapcarrental',
  address: '123 อาคาร ABC ชั้น 10 ถนน XYZ แขวง ABC เขต XYZ กรุงเทพมหานคร 10100',
  mapEmbed: '',
  workingHours: 'จันทร์-ศุกร์ 08:00-18:00 น.'
})

// Mock Contact Submissions (ข้อความจากลูกค้า)
const mockContactSubmissions = ref([
  {
    id: 1,
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: 'somchai@gmail.com',
    phone: '+66909990000',
    subject: 'การเช่ารถมากกว่า 1 เดือน',
    message: 'สนใจเช่ารถเป็นระยะเวลา 2 เดือนขึ้นไป มีส่วนลดเพิ่มเติมไหมครับ อยากทราบรายละเอียดเพิ่มเติมครับ',
    createdAt: '2025-12-15T10:30:00',
    isRead: false,
    readAt: null,
    readBy: null,
    remark: null
  },
  {
    id: 2,
    firstName: 'สมหญิง',
    lastName: 'รักเที่ยว',
    email: 'somying@hotmail.com',
    phone: '+66812345678',
    subject: 'สอบถามเรื่องประกันภัย',
    message: 'อยากทราบว่าค่าเช่ารถรวมประกันภัยชั้น 1 หรือไม่คะ และถ้าเกิดอุบัติเหตุต้องรับผิดชอบค่าใช้จ่ายอย่างไรบ้าง',
    createdAt: '2025-12-14T15:45:00',
    isRead: true,
    readAt: '2025-12-14T16:30:00',
    readBy: 'Admin',
    remark: 'ติดต่อกลับทางโทรศัพท์แล้ว'
  },
  {
    id: 3,
    firstName: 'วิชัย',
    lastName: 'ขับดี',
    email: 'wichai@yahoo.com',
    phone: '+66898765432',
    subject: 'ขอใบเสนอราคาสำหรับบริษัท',
    message: 'บริษัทต้องการเช่ารถจำนวน 5 คัน สำหรับพนักงาน ระยะเวลา 1 ปี รบกวนส่งใบเสนอราคามาที่อีเมลด้วยครับ',
    createdAt: '2025-12-13T09:00:00',
    isRead: true,
    readAt: '2025-12-13T10:00:00Z',
    readBy: 'Admin',
    remark: 'ส่งใบเสนอราคาแล้ว'
  },
  {
    id: 4,
    firstName: 'นภา',
    lastName: 'ท่องโลก',
    email: 'napa.travel@gmail.com',
    phone: '+66876543210',
    subject: 'สอบถามเรื่องรถ EV',
    message: 'สนใจเช่ารถ EV ไปเที่ยวต่างจังหวัด อยากทราบว่ามีจุดชาร์จไฟตามเส้นทางไหมคะ และแนะนำรุ่นไหนดี',
    createdAt: '2025-12-12T14:20:00',
    isRead: false,
    readAt: null,
    readBy: null,
    remark: null
  },
  {
    id: 5,
    firstName: 'ประยุทธ์',
    lastName: 'ขับปลอดภัย',
    email: 'prayut@company.co.th',
    phone: '+66891234567',
    subject: 'ขอเปลี่ยนวันรับรถ',
    message: 'มีการจองรถไว้วันที่ 20 ธ.ค. หมายเลขการจอง ASP12345 ขอเปลี่ยนเป็นวันที่ 22 ธ.ค. แทนได้ไหมครับ',
    createdAt: '2025-12-11T11:30:00',
    isRead: false,
    readAt: null,
    readBy: null,
    remark: null
  }
])

// Mock About Us
let mockAboutUs = {
  // Hero Section
  hero: {
    title: 'เราคือผู้ให้บริการรถเช่า ชั้นนำของประเทศไทย',
    subtitle: 'มุ่งมั่นนำเสนอบริการเช่ารถทั้งแบบรายวัน รายเดือน และรายปี พร้อมตอบโจทย์ทั้งลูกค้าทั่วไปและลูกค้าองค์กร',
    image: null
  },
  // Main Content (Story)
  title: 'เกี่ยวกับเรา', // Legacy title if needed, or can use hero.title
  subtitle: 'ผู้นำด้านการให้บริการรถเช่าครบวงจร', // Legacy
  heroImage: null, // Legacy, will map to hero.image in UI if needed
  content: '<p>ASAP คือผู้ให้บริการรถเช่าชั้นนำของประเทศไทย...</p>',
  // Vision & Mission
  vision: 'มุ่งมั่นสู่การเป็นผู้นำด้านนวัตกรรมยานยนต์และการบริการที่เป็นเลิศ',
  mission: 'ส่งมอบประสบการณ์การเดินทางที่ดีที่สุดให้กับลูกค้าทุกคน',
  // Service Highlight (From Home)
  serviceHighlight: {
    title: 'ปลดล็อค ทุกข้อจำกัด ของการเดินทาง',
    items: [
      { title: 'เช่ารถรายวัน/รายเดือน', detail: 'บริการรถเช่าขับเองหลากหลายรุ่น...' },
      { title: 'รถเช่ารายปี (Car Subscription)', detail: 'ทางเลือกใหม่ของการใช้รถ...' },
      { title: 'รถเช่าสำหรับองค์กร', detail: 'โซลูชันการเดินทางสำหรับธุรกิจ...' }
    ]
  },
  // Why Us (From Home)
  whyUs: {
    title: 'เพราะเราเข้าใจ ทุกความต้องการ ของการเดินทาง',
    image: null
  },
  // Rental Service (From Home)
  rentalService: {
    title: 'บริการรถยนต์ให้เช่า',
    detail: 'เตรียมตัวออกเดินทางได้อย่างมั่นใจ...'
  }
}

const mockPrivacyPolicy = ref({
  title: 'นโยบายความเป็นส่วนตัว',
  content: '<h2>1. ข้อมูลที่เราเก็บรวบรวม</h2><p>เราเก็บรวบรวมข้อมูลส่วนบุคคลที่คุณให้กับเรา...</p>',
  lastUpdated: '2025-11-01'
})

const mockAppBanner = ref({
  title: 'จองสะดวกขึ้นผ่านแอปเอแซ็ป (asap app)',
  description: 'ค้นหารถเช่า check-in สะสม ASC Coin ผ่านแอป',
  bannerImage: 'https://placehold.co/600x400/FF595A/white?text=App+Banner',
  logoImage: 'https://placehold.co/100x100/FF595A/white?text=ASAP',
  backgroundColor: '#FF595A',
  appStoreLink: 'https://apps.apple.com/app/asap',
  googlePlayLink: 'https://play.google.com/store/apps/asap',
  showAppStore: true,
  showGooglePlay: true,
  isActive: true
})

// Mock Car Categories (ประเภทกลุ่มรถ)
const mockCarCategories = ref([
  {
    id: 1,
    name: 'Economy',
    sippcodes: ['ECAR', 'CCAR'],
    image: 'https://placehold.co/400x300/FF595A/white?text=Economy',
    order: 1,
    isActive: true,
    carCount: 5
  },
  {
    id: 2,
    name: 'SUV',
    sippcodes: ['SCAR', 'IFAR'],
    image: 'https://placehold.co/400x300/2574FF/white?text=SUV',
    order: 2,
    isActive: true,
    carCount: 8
  },
  {
    id: 3,
    name: 'EV Car',
    sippcodes: ['EVAR'],
    image: 'https://placehold.co/400x300/36B37E/white?text=EV+Car',
    order: 3,
    isActive: true,
    carCount: 3
  },
  {
    id: 4,
    name: 'Hybrid Car',
    sippcodes: ['HCAR', 'HCMR'],
    image: 'https://placehold.co/400x300/9B59B6/white?text=Hybrid+Car',
    order: 4,
    isActive: true,
    carCount: 4
  },
  {
    id: 5,
    name: 'Luxury',
    sippcodes: ['LCAR', 'PCAR', 'FCAR'],
    image: 'https://placehold.co/400x300/FFAB00/white?text=Luxury',
    order: 5,
    isActive: true,
    carCount: 2
  }
])

const mockAgents = ref([
  {
    id: 1,
    name: 'เอเจนท์ เอ',
    companyName: 'บจก. เอเจนซี่ จำกัด',
    email: 'agent_a@example.com',
    phone: '081-111-1111',
    isActive: true,
    documents: [
      { label: 'สำเนาบัตรประชาชน', url: 'https://placehold.co/800x500/FF595A/white?text=Agent+A+ID', type: 'image/jpeg', fileName: 'id_a.jpg' },
      { label: 'สำเนาใบขับขี่', url: '', type: 'image/jpeg', fileName: '' },
      { label: 'สำเนาหนังสือเดินทาง', url: '', type: 'image/jpeg', fileName: '' }
    ]
  },
  {
    id: 2,
    name: 'เอเจนท์ บี',
    companyName: 'บี ทราเวล คอร์ป',
    email: 'agent_b@example.com',
    phone: '082-222-2222',
    isActive: true,
    documents: [
      { label: 'สำเนาบัตรประชาชน', url: 'https://placehold.co/800x500/2574FF/white?text=Agent+B+ID', type: 'image/jpeg', fileName: 'id_b.jpg' },
      { label: 'สำเนาใบขับขี่', url: 'https://placehold.co/800x500/36B37E/white?text=Agent+B+License', type: 'image/jpeg', fileName: 'lic_b.jpg' },
      { label: 'สำเนาหนังสือเดินทาง', url: 'https://placehold.co/800x500/9B59B6/white?text=Agent+B+Passport', type: 'image/jpeg', fileName: 'pass_b.jpg' }
    ]
  }
])

// Mock Car Brands & Models
// Mock Check-in Online
const mockCheckIns = ref([
  {
    id: 1,
    bookingNumber: 'ASP20241201001',
    bookingDate: '2024-12-01',
    customerName: 'สมชาย ใจดี',
    phone: '081-234-5678',
    email: 'somchai@gmail.com',
    carModel: 'Toyota Vios',
    branch: 'กรุงเทพ - สนามบิน สุวรรณภูมิ',
    pickupDate: '2024-12-16',
    pickupTime: '10:00',
    returnDate: '2024-12-20',
    returnTime: '10:00',
    checkInDate: '2024-12-15T14:30:00',
    status: 'pending',
    documents: [
      {
        label: 'สำเนาบัตรประชาชน',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/2574FF/white?text=ID+Card',
        fileName: 'id_card.jpg'
      },
      {
        label: 'สำเนาใบขับขี่',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/36B37E/white?text=Driving+License',
        fileName: 'driving_license.jpg'
      }
    ],
    actionBy: null,
    actionDate: null,
    rejectReason: null
  },
  {
    id: 2,
    bookingNumber: 'ASP20241201002',
    bookingDate: '2024-12-02',
    customerName: 'สมหญิง รักเที่ยว',
    phone: '089-876-5432',
    email: 'somying@hotmail.com',
    carModel: 'Honda City',
    branch: 'ภูเก็ต - สนามบิน',
    pickupDate: '2024-12-17',
    pickupTime: '09:00',
    returnDate: '2024-12-22',
    returnTime: '18:00',
    checkInDate: '2024-12-15T10:15:00',
    status: 'pending',
    documents: [
      {
        label: 'สำเนาบัตรประชาชน',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/FF595A/white?text=ID+Card+2',
        fileName: 'id_card_2.jpg'
      },
      {
        label: 'สำเนาใบขับขี่',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/FFAB00/white?text=Driving+License+2',
        fileName: 'driving_license_2.jpg'
      }
    ],
    actionBy: null,
    actionDate: null,
    rejectReason: null
  },
  {
    id: 3,
    bookingNumber: 'ASP20241130001',
    bookingDate: '2024-11-30',
    customerName: 'วิชัย ขับดี',
    phone: '062-111-2222',
    email: 'wichai@company.co.th',
    carModel: 'Deepal S07',
    branch: 'เชียงใหม่ - สนามบิน',
    pickupDate: '2024-12-15',
    pickupTime: '14:00',
    returnDate: '2024-12-18',
    returnTime: '14:00',
    checkInDate: '2024-12-14T16:45:00',
    status: 'approved',
    documents: [
      {
        label: 'สำเนาบัตรประชาชน',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/36B37E/white?text=ID+Card+Approved',
        fileName: 'id_card_3.jpg'
      },
      {
        label: 'สำเนาใบขับขี่',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/36B37E/white?text=License+Approved',
        fileName: 'driving_license_3.jpg'
      }
    ],
    actionBy: 'Admin',
    actionDate: '2024-12-14T17:30:00',
    rejectReason: null
  },
  {
    id: 4,
    bookingNumber: 'ASP20241128001',
    bookingDate: '2024-11-28',
    customerName: 'นภา ท่องโลก',
    phone: '095-333-4444',
    email: 'napa@gmail.com',
    carModel: 'Mazda CX-5',
    branch: 'กระบี่ - สนามบิน',
    pickupDate: '2024-12-14',
    pickupTime: '11:00',
    returnDate: '2024-12-16',
    returnTime: '11:00',
    checkInDate: '2024-12-13T09:20:00',
    status: 'rejected',
    documents: [
      {
        label: 'สำเนาบัตรประชาชน',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/F56C6C/white?text=ID+Card+Rejected',
        fileName: 'id_card_4.jpg'
      }
    ],
    actionBy: 'Admin',
    actionDate: '2024-12-13T10:00:00',
    rejectReason: 'เอกสารไม่ชัดเจน กรุณาอัปโหลดใหม่อีกครั้ง และกรุณาแนบสำเนาใบขับขี่ด้วย'
  },
  {
    id: 5,
    bookingNumber: 'ASP20241215001',
    bookingDate: '2024-12-15',
    customerName: 'ประภา สุขใจ',
    phone: '088-555-6666',
    email: 'prapa@outlook.com',
    carModel: 'Nissan Kicks',
    branch: 'พัทยา - สาขาหลัก',
    pickupDate: '2024-12-18',
    pickupTime: '08:00',
    returnDate: '2024-12-21',
    returnTime: '20:00',
    checkInDate: '2024-12-15T18:00:00',
    status: 'pending',
    documents: [
      {
        label: 'สำเนาบัตรประชาชน',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/2574FF/white?text=ID+Card+5',
        fileName: 'id_card_5.jpg'
      },
      {
        label: 'สำเนาใบขับขี่',
        type: 'image/jpeg',
        url: 'https://placehold.co/800x500/36B37E/white?text=License+5',
        fileName: 'driving_license_5.jpg'
      }
    ],
    actionBy: null,
    actionDate: null,
    rejectReason: null
  }
])

const mockCarBrands = ref([
  {
    id: 1,
    name: 'Toyota',
    logo: 'https://placehold.co/100x100/FF595A/white?text=Toyota',
    order: 1,
    isActive: true,
    models: [
      {
        id: 1,
        name: 'Revo',
        images: [
          'https://placehold.co/400x300/FF595A/white?text=Revo+1',
          'https://placehold.co/400x300/FF595A/white?text=Revo+2',
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-08T10:30:00'
      },
      {
        id: 2,
        name: 'Vios',
        images: [
          'https://placehold.co/400x300/FF595A/white?text=Vios+1',
          'https://placehold.co/400x300/FF595A/white?text=Vios+2',
          'https://placehold.co/400x300/FF595A/white?text=Vios+3',
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-07T14:20:00'
      },
      {
        id: 3,
        name: 'Yaris',
        images: [
          'https://placehold.co/400x300/FF595A/white?text=Yaris+1',
          null,
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-05T09:15:00'
      },
      {
        id: 14,
        name: 'Camry',
        images: [null, null, null, null, null, null],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: null
      },
      {
        id: 15,
        name: 'Fortuner',
        images: [
          'https://placehold.co/400x300/FF595A/white?text=Fortuner+1',
          null,
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-01T11:00:00'
      },
      {
        id: 16,
        name: 'Corolla Cross',
        images: [null, null, null, null, null, null],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: null
      },
      {
        id: 17,
        name: 'Hilux',
        images: [
          'https://placehold.co/400x300/FF595A/white?text=Hilux+1',
          'https://placehold.co/400x300/FF595A/white?text=Hilux+2',
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-11-28T16:45:00'
      }
    ]
  },
  {
    id: 2,
    name: 'Honda',
    logo: 'https://placehold.co/100x100/2574FF/white?text=Honda',
    order: 2,
    isActive: true,
    models: [
      {
        id: 4,
        name: 'City',
        images: [
          'https://placehold.co/400x300/2574FF/white?text=City+1',
          'https://placehold.co/400x300/2574FF/white?text=City+2',
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-09T08:30:00'
      },
      {
        id: 5,
        name: 'Brio',
        images: [
          'https://placehold.co/400x300/2574FF/white?text=Brio+1',
          null,
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-06T13:00:00'
      },
      {
        id: 6,
        name: 'Civic',
        images: [
          'https://placehold.co/400x300/2574FF/white?text=Civic+1',
          'https://placehold.co/400x300/2574FF/white?text=Civic+2',
          'https://placehold.co/400x300/2574FF/white?text=Civic+3',
          'https://placehold.co/400x300/2574FF/white?text=Civic+4',
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-10T07:00:00'
      },
      {
        id: 18,
        name: 'Accord',
        images: [null, null, null, null, null, null],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: null
      },
      {
        id: 19,
        name: 'HR-V',
        images: [
          'https://placehold.co/400x300/2574FF/white?text=HRV+1',
          null,
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-04T10:20:00'
      },
      {
        id: 20,
        name: 'CR-V',
        images: [null, null, null, null, null, null],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: null
      }
    ]
  },
  {
    id: 3,
    name: 'Deepal',
    logo: 'https://placehold.co/100x100/36B37E/white?text=Deepal',
    order: 3,
    isActive: true,
    models: [
      {
        id: 7,
        name: 'S07',
        images: [
          'https://placehold.co/400x300/36B37E/white?text=S07+1',
          'https://placehold.co/400x300/36B37E/white?text=S07+2',
          'https://placehold.co/400x300/36B37E/white?text=S07+3',
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-09T15:30:00'
      },
      {
        id: 8,
        name: 'S05',
        images: [
          'https://placehold.co/400x300/36B37E/white?text=S05+1',
          'https://placehold.co/400x300/36B37E/white?text=S05+2',
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-08T12:00:00'
      }
    ]
  },
  {
    id: 4,
    name: 'Nissan',
    logo: 'https://placehold.co/100x100/FFAB00/white?text=Nissan',
    order: 4,
    isActive: true,
    models: [
      {
        id: 9,
        name: 'Almera',
        images: [
          'https://placehold.co/400x300/FFAB00/white?text=Almera+1',
          null,
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-03T09:00:00'
      },
      {
        id: 10,
        name: 'Kicks',
        images: [
          'https://placehold.co/400x300/FFAB00/white?text=Kicks+1',
          'https://placehold.co/400x300/FFAB00/white?text=Kicks+2',
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-07T11:30:00'
      },
      {
        id: 21,
        name: 'Note',
        images: [null, null, null, null, null, null],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: null
      }
    ]
  },
  {
    id: 5,
    name: 'Mazda',
    logo: 'https://placehold.co/100x100/9B59B6/white?text=Mazda',
    order: 5,
    isActive: true,
    models: [
      {
        id: 11,
        name: 'Mazda 2',
        images: [
          'https://placehold.co/400x300/9B59B6/white?text=Mazda2+1',
          'https://placehold.co/400x300/9B59B6/white?text=Mazda2+2',
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-06T14:00:00'
      },
      {
        id: 12,
        name: 'Mazda 3',
        images: [
          'https://placehold.co/400x300/9B59B6/white?text=Mazda3+1',
          null,
          null,
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-02T16:00:00'
      },
      {
        id: 13,
        name: 'CX-5',
        images: [
          'https://placehold.co/400x300/9B59B6/white?text=CX5+1',
          'https://placehold.co/400x300/9B59B6/white?text=CX5+2',
          'https://placehold.co/400x300/9B59B6/white?text=CX5+3',
          null,
          null,
          null
        ],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: '2025-12-09T09:45:00'
      },
      {
        id: 22,
        name: 'CX-30',
        images: [null, null, null, null, null, null],
        displayOrder: [1, 2, 3, 4, 5, 6],
        isActive: true,
        lastImageUpdate: null
      }
    ]
  }
])

export const useApi = () => {
  // ===== Banners =====
  const getBanners = async () => {
    return [...mockBanners.value].sort((a, b) => a.order - b.order)
  }

  const getBanner = async (id) => {
    return mockBanners.value.find(b => b.id === parseInt(id))
  }

  const createBanner = async (data) => {
    const newId = Math.max(...mockBanners.value.map(b => b.id)) + 1
    const newBanner = { ...data, id: newId }
    mockBanners.value.push(newBanner)
    return newBanner
  }

  const updateBanner = async (id, data) => {
    const index = mockBanners.value.findIndex(b => b.id === parseInt(id))
    if (index !== -1) {
      mockBanners.value[index] = { ...mockBanners.value[index], ...data }
      return mockBanners.value[index]
    }
    return null
  }

  const deleteBanner = async (id) => {
    const index = mockBanners.value.findIndex(b => b.id === parseInt(id))
    if (index !== -1) {
      mockBanners.value.splice(index, 1)
      return true
    }
    return false
  }

  const reorderBanners = async (newOrder) => {
    newOrder.forEach((id, index) => {
      const banner = mockBanners.value.find(b => b.id === id)
      if (banner) {
        banner.order = index + 1
      }
    })
    mockBanners.value.sort((a, b) => a.order - b.order)
    return true
  }

  // ===== Promotions =====
  const getPromotions = async () => {
    return [...mockPromotions.value].sort((a, b) => a.order - b.order)
  }

  const getPromotion = async (id) => {
    return mockPromotions.value.find(p => p.id === parseInt(id))
  }

  const createPromotion = async (data) => {
    const newId = Math.max(...mockPromotions.value.map(p => p.id)) + 1
    const newPromotion = { ...data, id: newId }
    mockPromotions.value.push(newPromotion)
    return newPromotion
  }

  const updatePromotion = async (id, data) => {
    const index = mockPromotions.value.findIndex(p => p.id === parseInt(id))
    if (index !== -1) {
      mockPromotions.value[index] = { ...mockPromotions.value[index], ...data }
      return mockPromotions.value[index]
    }
    return null
  }

  const deletePromotion = async (id) => {
    const index = mockPromotions.value.findIndex(p => p.id === parseInt(id))
    if (index !== -1) {
      mockPromotions.value.splice(index, 1)
      return true
    }
    return false
  }

  const reorderPromotions = async (newOrder) => {
    newOrder.forEach((id, index) => {
      const promotion = mockPromotions.value.find(p => p.id === id)
      if (promotion) {
        promotion.order = index + 1
      }
    })
    mockPromotions.value.sort((a, b) => a.order - b.order)
    return true
  }

  // ===== Provinces =====
  const getProvinces = async () => {
    return [...mockProvinces.value].sort((a, b) => a.order - b.order)
  }

  const getProvince = async (id) => {
    return mockProvinces.value.find(p => p.id === parseInt(id))
  }

  const createProvince = async (data) => {
    const newId = Math.max(...mockProvinces.value.map(p => p.id)) + 1
    const newProvince = { ...data, id: newId }
    mockProvinces.value.push(newProvince)
    return newProvince
  }

  const updateProvince = async (id, data) => {
    const index = mockProvinces.value.findIndex(p => p.id === parseInt(id))
    if (index !== -1) {
      mockProvinces.value[index] = { ...mockProvinces.value[index], ...data }
      return mockProvinces.value[index]
    }
    return null
  }

  const deleteProvince = async (id) => {
    const index = mockProvinces.value.findIndex(p => p.id === parseInt(id))
    if (index !== -1) {
      mockProvinces.value.splice(index, 1)
      return true
    }
    return false
  }

  const reorderProvinces = async (newOrder) => {
    newOrder.forEach((id, index) => {
      const province = mockProvinces.value.find(p => p.id === id)
      if (province) {
        province.order = index + 1
      }
    })
    mockProvinces.value.sort((a, b) => a.order - b.order)
    return true
  }

  // ===== Branches =====
  const getBranches = async () => {
    return [...mockBranches.value]
  }

  const getBranch = async (id) => {
    return mockBranches.value.find(b => b.id === parseInt(id))
  }

  const createBranch = async (data) => {
    const newId = Math.max(...mockBranches.value.map(b => b.id), 0) + 1
    const newBranch = { ...data, id: newId }
    mockBranches.value.push(newBranch)
    return newBranch
  }

  const updateBranch = async (id, data) => {
    const index = mockBranches.value.findIndex(b => b.id === parseInt(id))
    if (index !== -1) {
      mockBranches.value[index] = { ...mockBranches.value[index], ...data }
      return mockBranches.value[index]
    }
    return null
  }

  const deleteBranch = async (id) => {
    const index = mockBranches.value.findIndex(b => b.id === parseInt(id))
    if (index !== -1) {
      mockBranches.value.splice(index, 1)
      return true
    }
    return false
  }

  // ===== Article Categories (Strapi) =====
  const getArticleCategories = async () => {
    try {
      // Endpoint is /api/categories
      const response = await api.get(`${STRAPI_URL}/api/categories`)
      const categories = response.data.data.map(mapStrapiCategory)
      // Sort by order field
      return categories.sort((a, b) => a.order - b.order)
    } catch (error) {
      console.warn('Strapi Error, falling back to mock:', error)
      return [...mockArticleCategories.value].sort((a, b) => a.order - b.order)
    }
  }

  const getArticleCategory = async (id) => {
    try {
      const response = await api.get(`${STRAPI_URL}/api/categories/${id}`)
      return mapStrapiCategory(response.data.data)
    } catch (error) {
      return mockArticleCategories.value.find(c => c.id === parseInt(id))
    }
  }

  const createArticleCategory = async (data) => {
    try {
      // Store order/isActive in description as JSON workaround
      const metaJson = JSON.stringify({ order: data.order || 0, isActive: data.isActive !== false })
      const payload = {
        name: data.name,
        slug: data.slug,
        description: metaJson
      }
      const response = await api.post(`${STRAPI_URL}/api/categories`, { data: payload })
      return mapStrapiCategory(response.data.data)
    } catch (error) {
      const newId = Math.max(...mockArticleCategories.value.map(c => c.id)) + 1
      const newCategory = { ...data, id: newId }
      mockArticleCategories.value.push(newCategory)
      return newCategory
    }
  }

  const updateArticleCategory = async (id, data) => {
    try {
      // Store order/isActive in description as JSON workaround
      const metaJson = JSON.stringify({ order: data.order || 0, isActive: data.isActive !== false })
      const payload = {
        name: data.name,
        slug: data.slug,
        description: metaJson
      }
      const response = await api.put(`${STRAPI_URL}/api/categories/${id}`, { data: payload })
      return mapStrapiCategory(response.data.data)
    } catch (error) {
      const index = mockArticleCategories.value.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        mockArticleCategories.value[index] = { ...mockArticleCategories.value[index], ...data }
        return mockArticleCategories.value[index]
      }
      return null
    }
  }

  const deleteArticleCategory = async (id) => {
    try {
      await api.delete(`${STRAPI_URL}/api/categories/${id}`)
      return true
    } catch (error) {
      // ...
      return false
    }
  }

  const reorderArticleCategories = async (newOrderIds) => {
    try {
      // Update each category with new order in description JSON
      // First, fetch all categories to get their current data
      const allCategories = await getArticleCategories()

      await Promise.all(newOrderIds.map(async (id, index) => {
        const category = allCategories.find(c => c.id === id)
        if (category) {
          const metaJson = JSON.stringify({ order: index + 1, isActive: category.isActive })
          await api.put(`${STRAPI_URL}/api/categories/${id}`, {
            data: {
              name: category.name,
              slug: category.slug,
              description: metaJson
            }
          })
        }
      }))
      return true
    } catch (error) {
      console.warn('Reorder failed, falling back to mock:', error)
      newOrderIds.forEach((id, index) => {
        const category = mockArticleCategories.value.find(c => c.id === id)
        if (category) {
          category.order = index + 1
        }
      })
      mockArticleCategories.value.sort((a, b) => a.order - b.order)
      return true
    }
  }

  // ===== Articles (Strapi) =====
  const getArticles = async () => {
    try {
      // Endpoint is /api/articles
      const response = await api.get(`${STRAPI_URL}/api/articles?populate=*&sort=publishedAt:desc`)
      return response.data.data.map(mapStrapiArticle)
    } catch (error) {
      console.warn('Strapi Error, falling back to mock articles:', error)
      return [...mockArticles.value]
    }
  }

  const getArticle = async (id) => {
    try {
      const response = await api.get(`${STRAPI_URL}/api/articles/${id}?populate=*`)
      return mapStrapiArticle(response.data.data)
    } catch (error) {
      return mockArticles.value.find(a => a.id === parseInt(id))
    }
  }

  const createArticle = async (data) => {
    try {
      // Resolve tags to IDs
      const tagIds = await resolveTags(data.tags)

      // Construct payload for Strapi
      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.metaDescription, // Map metaDescription to description
        category: data.categoryId, // Relation ID
        tags: tagIds, // Relation IDs
        // For 'published' status, send publishedAt
        publishedAt: data.status === 'published' ? (data.publishedAt || new Date()) : null,

        // Handle cover image
        cover: data.coverImageId,

        // Handle Blocks (Content)
        blocks: [
          {
            __component: 'shared.rich-text',
            body: data.content
          }
        ]
      }

      const response = await api.post(`${STRAPI_URL}/api/articles`, { data: payload })
      return mapStrapiArticle(response.data.data)
    } catch (error) {
      // fallback to mock for demo if failed
      const newId = Math.max(...mockArticles.value.map(a => a.id)) + 1
      const category = mockArticleCategories.value.find(c => c.id === data.categoryId)
      const newArticle = { ...data, id: newId, category: category?.name || '' }
      mockArticles.value.push(newArticle)
      return newArticle
    }
  }

  const updateArticle = async (id, data) => {
    try {
      // Resolve tags to IDs
      const tagIds = await resolveTags(data.tags)

      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.metaDescription,
        category: data.categoryId,
        tags: tagIds,
        publishedAt: data.status === 'published' ? (data.publishedAt || new Date()) : null,
        cover: data.coverImageId,
        blocks: [
          {
            __component: 'shared.rich-text',
            body: data.content
          }
        ]
      }

      const response = await api.put(`${STRAPI_URL}/api/articles/${id}`, { data: payload })
      return mapStrapiArticle(response.data.data)
    } catch (error) {
      const index = mockArticles.value.findIndex(a => a.id === parseInt(id))
      if (index !== -1) {
        const category = mockArticleCategories.value.find(c => c.id === data.categoryId)
        mockArticles.value[index] = { ...mockArticles.value[index], ...data, category: category?.name || '' }
        return mockArticles.value[index]
      }
      return null
    }
  }

  const deleteArticle = async (id) => {
    try {
      await api.delete(`${STRAPI_URL}/api/articles/${id}`)
      return true
    } catch (error) {
      const index = mockArticles.value.findIndex(a => a.id === parseInt(id))
      if (index !== -1) {
        mockArticles.value.splice(index, 1)
        return true
      }
      return false
    }
  }

  const getTags = async () => {
    try {
      const response = await api.get(`${STRAPI_URL}/api/tags?pagination[limit]=100`)
      // Handle both v4 and v5 structures
      return response.data.data.map(t => t.attributes?.name || t.name)
    } catch (error) {
      console.warn('Failed to fetch tags', error)
      return []
    }
  }

  // ===== Media Upload (Strapi) =====
  const uploadImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('files', file)
      const response = await api.post(`${STRAPI_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const uploadedFile = response.data[0]
      return {
        id: uploadedFile.id,
        url: uploadedFile.url.startsWith('http') ? uploadedFile.url : `${STRAPI_URL}${uploadedFile.url}`
      }
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }

  // ===== FAQ Categories =====
  const getFAQCategories = async () => {
    return [...mockFAQCategories.value].sort((a, b) => a.order - b.order)
  }

  const getFAQCategory = async (id) => {
    return mockFAQCategories.value.find(c => c.id === parseInt(id))
  }

  const createFAQCategory = async (data) => {
    const newId = Math.max(...mockFAQCategories.value.map(c => c.id)) + 1
    const newCategory = { ...data, id: newId }
    mockFAQCategories.value.push(newCategory)
    return newCategory
  }

  const updateFAQCategory = async (id, data) => {
    const index = mockFAQCategories.value.findIndex(c => c.id === parseInt(id))
    if (index !== -1) {
      mockFAQCategories.value[index] = { ...mockFAQCategories.value[index], ...data }
      return mockFAQCategories.value[index]
    }
    return null
  }

  const deleteFAQCategory = async (id) => {
    const index = mockFAQCategories.value.findIndex(c => c.id === parseInt(id))
    if (index !== -1) {
      mockFAQCategories.value.splice(index, 1)
      return true
    }
    return false
  }

  // ===== FAQs =====
  const getFAQs = async () => {
    return [...mockFAQs.value]
  }

  const getFAQ = async (id) => {
    return mockFAQs.value.find(f => f.id === parseInt(id))
  }

  const createFAQ = async (data) => {
    const newId = Math.max(...mockFAQs.value.map(f => f.id)) + 1
    const category = mockFAQCategories.value.find(c => c.id === data.categoryId)
    const newFAQ = { ...data, id: newId, category: category?.name || '' }
    mockFAQs.value.push(newFAQ)
    return newFAQ
  }

  const updateFAQ = async (id, data) => {
    const index = mockFAQs.value.findIndex(f => f.id === parseInt(id))
    if (index !== -1) {
      const category = mockFAQCategories.value.find(c => c.id === data.categoryId)
      mockFAQs.value[index] = { ...mockFAQs.value[index], ...data, category: category?.name || '' }
      return mockFAQs.value[index]
    }
    return null
  }

  const deleteFAQ = async (id) => {
    const index = mockFAQs.value.findIndex(f => f.id === parseInt(id))
    if (index !== -1) {
      mockFAQs.value.splice(index, 1)
      return true
    }
    return false
  }

  const reorderFAQs = async (newOrder) => {
    newOrder.forEach((id, index) => {
      const faq = mockFAQs.value.find(f => f.id === id)
      if (faq) {
        faq.order = index + 1
      }
    })
    return true
  }

  // ===== Accounts =====
  const getAccounts = async () => {
    return [...mockAccounts.value]
  }

  const getAccount = async (id) => {
    return mockAccounts.value.find(a => a.id === parseInt(id))
  }

  const createAccount = async (data) => {
    const newId = Math.max(...mockAccounts.value.map(a => a.id)) + 1
    const newAccount = { ...data, id: newId, lastLogin: null }
    mockAccounts.value.push(newAccount)
    return newAccount
  }

  const updateAccount = async (id, data) => {
    const index = mockAccounts.value.findIndex(a => a.id === parseInt(id))
    if (index !== -1) {
      mockAccounts.value[index] = { ...mockAccounts.value[index], ...data }
      return mockAccounts.value[index]
    }
    return null
  }

  const deleteAccount = async (id) => {
    const index = mockAccounts.value.findIndex(a => a.id === parseInt(id))
    if (index !== -1) {
      mockAccounts.value.splice(index, 1)
      return true
    }
    return false
  }

  // ===== Contact Us =====
  const getContactUs = async () => {
    return { ...mockContactUs.value }
  }

  const updateContactUs = async (data) => {
    mockContactUs.value = { ...mockContactUs.value, ...data }
    return mockContactUs.value
  }

  // ===== Contact Submissions =====

  // ===== Coupons (Car Plan API Integration) =====
  const mockCoupons = ref([
    {
      id: 1,
      code: 'NEWCAR1000',
      title: 'คูปองส่วนลดสูงสุด 50%',
      description: 'สำหรับเช่ารถรายวัน 1 วันขึ้นไป',
      expiryDate: '2025-08-31T23:59:00',
      isActive: true,
      imageUrl: '',
      usageCount: 150,
      totalLimit: 500,
      // Content Management Fields
      contentHeadline: 'ลดได้ถึง 50%',
      contentSubtitle: 'มีฤทธิ์คุณจนถึง: 31 ส.ค. 68',
      contentTag: 'ส่วนลดสำหรับการจองล่วงหน้า',
      contentImage: 'https://placehold.co/600x600/2D3344/white?text=PROMOTION+IMAGE',
      contentIcon: '',

      aboutInfo: 'Lorem ipsum dolor sit amet consectetur. Viverra enim nulla pharetra ut molestie. Diam non augue libero cras in feugiat id.\nId turpis vel orci sit at mattis dignissim. Libero elementum ac adipiscing aenean risus. Sem vel donec malesuada ultricies ultrices mattis faucibus',
      termsAndConditions: 'Lorem ipsum dolor sit amet consectetur. Viverra enim nulla pharetra ut molestie. Diam non augue libero cras in feugiat id.\nId turpis vel orci sit at mattis dignissim. Libero elementum ac adipiscing aenean risus.',
      footerNote: 'โปรโมชันนี้สำหรับลูกค้าใหม่และเก่า มีเงื่อนไขและข้อกำหนดที่ใช้บังคับ\nโปรดติดต่อทีมงานบริการของเราหากมีคำถามเกี่ยวกับโปรโมชันนี้'
    },
    {
      id: 2,
      code: 'DISCOUNT200',
      title: 'ส่วนลด 200 บาท',
      description: 'เมื่อจองล่วงหน้า 7 วัน',
      expiryDate: '2025-02-28T23:59:00',
      isActive: false,
      imageUrl: '',
      usageCount: 45,
      totalLimit: 100,
      contentHeadline: 'ส่วนลดสำหรับการจองล่วงหน้า',
      contentSubtitle: 'ใช้ได้ถึง: 28 ก.พ. 68',
      contentTag: 'ส่วนลดสำหรับการจองล่วงหน้า',
      contentImage: '',
      contentIcon: '',

      aboutInfo: 'รายละเอียดโปรโมชัน...',
      termsAndConditions: 'เงื่อนไขการใช้งาน...',
      footerNote: ''
    },
    {
      id: 3,
      code: 'FREEDRIVE',
      title: 'ขับฟรี 1 วัน',
      description: 'เช่าครบ 5 วัน ฟรี 1 วัน',
      expiryDate: '2025-12-31T23:59:00',
      isActive: true,
      imageUrl: '',
      usageCount: 12,
      totalLimit: 50,
      contentHeadline: 'ขับฟรี 1 วันเต็มๆ',
      contentSubtitle: 'หมดเขต: 31 ธ.ค. 68',
      contentTag: 'โปรโมชันพิเศษ',
      contentImage: '',
      contentIcon: '',

      aboutInfo: 'เช่าครบ 5 วัน รับสิทธิ์ขับฟรีเพิ่ม 1 วัน...',
      termsAndConditions: 'เฉพาะรุ่นที่กำหนดเท่านั้น...',
      footerNote: ''
    },
    {
      id: 4,
      code: 'LUCKY888',
      title: 'ส่วนลด 888 บาท',
      description: 'ฉลองตรุษจีน รับส่วนลดทันที',
      expiryDate: '2025-02-15T23:59:00',
      isActive: true,
      imageUrl: '',
      usageCount: 88,
      totalLimit: 888,
      contentHeadline: 'เฮงๆ รับตรุษจีน ลด 888 บาท',
      contentSubtitle: 'ฉลองปีมังกร ถึง 15 ก.พ. 68',
      contentTag: 'ตรุษจีน 2025',
      contentImage: '',
      contentIcon: '',

      aboutInfo: 'ส่วนลดพิเศษสำหรับการเช่ารถทุกประเภท...',
      termsAndConditions: 'ไม่สามารถใช้ร่วมกับโปรโมชันอื่นได้...',
      footerNote: ''
    }
  ])

  const getCoupons = async () => {
    // Sort by Expiry Date (Ascending - Soonest first)
    return [...mockCoupons.value].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
  }

  const updateCouponStatus = async (id, isActive) => {
    const coupon = mockCoupons.value.find(c => c.id === parseInt(id))
    if (coupon) {
      coupon.isActive = isActive
      return coupon
    }
    return null
  }

  const getCoupon = async (id) => {
    return mockCoupons.value.find(c => c.id === parseInt(id))
  }

  const updateCouponContent = async (id, data) => {
    const index = mockCoupons.value.findIndex(c => c.id === parseInt(id))
    if (index !== -1) {
      mockCoupons.value[index] = { ...mockCoupons.value[index], ...data }
      return mockCoupons.value[index]
    }
    return null
  }

  const getContactSubmissions = async () => {
    return [...mockContactSubmissions.value].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  }

  const markContactSubmissionRead = async (id, remark) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockContactSubmissions.value.findIndex(s => s.id === id)
        if (index !== -1) {
          mockContactSubmissions.value[index].isRead = true
          mockContactSubmissions.value[index].readAt = new Date().toISOString()
          mockContactSubmissions.value[index].remark = remark
          resolve(mockContactSubmissions.value[index])
        }
      }, 500)
    })
  }

  // ===== About Us =====
  const getAboutUs = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockAboutUs })
      }, 500)
    })
  }

  const updateAboutUs = async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockAboutUs = { ...mockAboutUs, ...data }
        resolve(mockAboutUs)
      }, 800)
    })
  }

  // ===== Privacy Policy =====
  const getPrivacyPolicy = async () => {
    return { ...mockPrivacyPolicy.value }
  }

  const updatePrivacyPolicy = async (data) => {
    mockPrivacyPolicy.value = { ...mockPrivacyPolicy.value, ...data }
    return mockPrivacyPolicy.value
  }

  // ===== App Banner =====
  const getAppBanner = async () => {
    return { ...mockAppBanner.value }
  }

  const updateAppBanner = async (data) => {
    mockAppBanner.value = { ...mockAppBanner.value, ...data }
    return mockAppBanner.value
  }

  // ===== Check-in Online =====
  const getCheckIns = async () => {
    return [...mockCheckIns.value].sort((a, b) =>
      new Date(b.checkInDate) - new Date(a.checkInDate)
    )
  }

  const getCheckIn = async (id) => {
    return mockCheckIns.value.find(c => c.id === parseInt(id))
  }

  const approveCheckIn = async (id) => {
    const checkIn = mockCheckIns.value.find(c => c.id === parseInt(id))
    if (checkIn) {
      checkIn.status = 'approved'
      checkIn.actionBy = 'Admin'
      checkIn.actionDate = new Date().toISOString()
      return checkIn
    }
    return null
  }

  const rejectCheckIn = async (id, reason) => {
    const checkIn = mockCheckIns.value.find(c => c.id === parseInt(id))
    if (checkIn) {
      checkIn.status = 'rejected'
      checkIn.actionBy = 'Admin'
      checkIn.actionDate = new Date().toISOString()
      checkIn.rejectReason = reason
      return checkIn
    }
    return null
  }

  // ===== Car Categories (ประเภทกลุ่มรถ) =====
  const getCarCategories = async () => {
    return [...mockCarCategories.value].sort((a, b) => a.order - b.order)
  }

  const getCarCategory = async (id) => {
    return mockCarCategories.value.find(c => c.id === parseInt(id))
  }

  const createCarCategory = async (data) => {
    const newId = Math.max(...mockCarCategories.value.map(c => c.id)) + 1
    const newCategory = { ...data, id: newId, carCount: 0 }
    mockCarCategories.value.push(newCategory)
    return newCategory
  }

  const updateCarCategory = async (id, data) => {
    const index = mockCarCategories.value.findIndex(c => c.id === parseInt(id))
    if (index !== -1) {
      mockCarCategories.value[index] = { ...mockCarCategories.value[index], ...data }
      return mockCarCategories.value[index]
    }
    return null
  }

  const deleteCarCategory = async (id) => {
    const index = mockCarCategories.value.findIndex(c => c.id === parseInt(id))
    if (index !== -1) {
      mockCarCategories.value.splice(index, 1)
      return true
    }
    return false
  }

  // ===== Car Brands & Models =====
  const getCarBrands = async () => {
    return mockCarBrands.value.map(brand => ({
      ...brand,
      models: [...brand.models]
    })).sort((a, b) => a.order - b.order)
  }

  const getCarBrand = async (id) => {
    const brand = mockCarBrands.value.find(b => b.id === parseInt(id))
    if (brand) {
      return { ...brand, models: [...brand.models] }
    }
    return null
  }

  const updateCarModelImages = async (brandId, modelId, images, displayOrder) => {
    const brand = mockCarBrands.value.find(b => b.id === parseInt(brandId))
    if (brand) {
      const model = brand.models.find(m => m.id === parseInt(modelId))
      if (model) {
        model.images = images
        model.displayOrder = displayOrder || [1, 2, 3, 4, 5, 6]
        return model
      }
    }
    return null
  }

  const updateCarModelStatus = async (brandId, modelId, isActive) => {
    const brand = mockCarBrands.value.find(b => b.id === parseInt(brandId))
    if (brand) {
      const model = brand.models.find(m => m.id === parseInt(modelId))
      if (model) {
        model.isActive = isActive
        return model
      }
    }
    return null
  }

  const getProfile = async () => {
    return {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@asap.com',
      role: 'super_admin'
    }
  }


  const updateProfile = async (data) => {
    console.log('Update profile:', data)
    return true
  }

  // Agent Management
  const getAgents = async () => {
    return mockAgents.value
  }

  const getAgent = async (id) => {
    return mockAgents.value.find(item => item.id == id)
  }

  const createAgent = async (data) => {
    const newId = Math.max(...mockAgents.value.map(i => i.id)) + 1
    const newItem = { id: newId, ...data }
    mockAgents.value.push(newItem)
    return newItem
  }

  const updateAgent = async (id, data) => {
    const index = mockAgents.value.findIndex(item => item.id == id)
    if (index !== -1) {
      mockAgents.value[index] = { ...mockAgents.value[index], ...data }
      return mockAgents.value[index]
    }
    return null
  }

  const deleteAgent = async (id) => {
    const index = mockAgents.value.findIndex(item => item.id == id)
    if (index !== -1) {
      mockAgents.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    // Banners
    getBanners,
    getBanner,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    // Promotions
    getPromotions,
    getPromotion,
    createPromotion,
    updatePromotion,
    deletePromotion,
    reorderPromotions,

    // Provinces
    getProvinces,
    getProvince,
    createProvince,
    updateProvince,
    deleteProvince,
    reorderProvinces,

    // Branches
    getBranches,
    getBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    // Article Categories
    getArticleCategories,
    getArticleCategory,
    createArticleCategory,
    updateArticleCategory,
    deleteArticleCategory,
    reorderArticleCategories,

    // Articles
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    getTags,
    // FAQ Categories
    getFAQCategories,
    getFAQCategory,
    createFAQCategory,
    updateFAQCategory,
    deleteFAQCategory,
    // FAQs
    getFAQs,
    getFAQ,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    reorderFAQs,

    // Accounts
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    // Contact Us
    getContactUs,
    updateContactUs,
    // Contact Submissions
    getContactSubmissions,
    markContactSubmissionRead,
    // About Us
    getAboutUs,
    updateAboutUs,
    // Privacy Policy
    getPrivacyPolicy,
    updatePrivacyPolicy,
    // App Banner
    getAppBanner,
    updateAppBanner,
    // Car Categories
    getCarCategories,
    getCarCategory,
    createCarCategory,
    updateCarCategory,
    deleteCarCategory,
    // Car Brands & Models
    getCarBrands,
    getCarBrand,
    updateCarModelImages,
    updateCarModelStatus,
    // Check-in Online
    getCheckIns,
    getCheckIn,
    approveCheckIn,
    rejectCheckIn,
    // Coupons
    getCoupons,
    getCoupon,
    updateCouponStatus,
    updateCouponContent

  }
}
