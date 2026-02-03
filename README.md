# ASAP Car Rental - Backoffice CMS

## Project Overview

**Project:** ASAP Car Rental Backoffice CMS
**Type:** Frontend UI with Mock Data
**Framework:** Vue.js 3 + Vite
**Language:** JavaScript (ES Modules)

> **Note:** โปรเจคนี้เป็น Backoffice UI สำหรับจัดการ Content
> ใช้ Mock Data สำหรับ demo - พร้อม integrate กับ API ภายหลัง

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue.js 3 (Composition API) |
| Build Tool | Vite 5 |
| Router | Vue Router 4 |
| UI Library | (TBD - Vuetify / PrimeVue / Element Plus) |
| State | Pinia (optional) |
| HTTP Client | Axios (เตรียมไว้สำหรับ API) |

---

## Project Structure

```
asap-back-office/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── RichTextEditor.vue
│   │   │   ├── ImageUploader.vue
│   │   │   ├── DragDropList.vue
│   │   │   ├── DataTable.vue
│   │   │   ├── ConfirmDialog.vue
│   │   │   └── StatusBadge.vue
│   │   └── layout/
│   │       ├── Sidebar.vue
│   │       ├── Header.vue
│   │       └── MainLayout.vue
│   ├── views/
│   │   ├── Dashboard.vue
│   │   ├── banner/
│   │   │   ├── HeroBannerList.vue
│   │   │   └── HeroBannerForm.vue
│   │   ├── promotion/
│   │   │   ├── PromotionList.vue
│   │   │   └── PromotionForm.vue
│   │   ├── province/
│   │   │   ├── ProvinceCardList.vue
│   │   │   └── ProvinceCardForm.vue
│   │   ├── article/
│   │   │   ├── ArticleList.vue
│   │   │   ├── ArticleForm.vue
│   │   │   ├── ArticleCategoryList.vue
│   │   │   └── ArticleCategoryForm.vue
│   │   ├── faq/
│   │   │   ├── FAQList.vue
│   │   │   ├── FAQForm.vue
│   │   │   ├── FAQCategoryList.vue
│   │   │   └── FAQCategoryForm.vue
│   │   ├── pages/
│   │   │   ├── ContactUsForm.vue
│   │   │   └── PrivacyPolicyForm.vue
│   │   └── account/
│   │       ├── AccountList.vue
│   │       ├── AccountForm.vue
│   │       └── RoleManagement.vue
│   ├── router/
│   │   └── index.js
│   ├── composables/
│   │   └── useApi.js (mock/placeholder)
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Pages & Features

### 1. Dashboard
- Overview statistics
- Quick links to each section
- Recent activities

---

### 2. Hero Banner Management

**Path:** `/banners`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการ Banner ทั้งหมด |
| Create | สร้าง Banner ใหม่ |
| Edit | แก้ไข Banner |
| Delete | ลบ Banner |
| Reorder | Drag & Drop เรียงลำดับ |
| Toggle | เปิด/ปิดการแสดง |

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ชื่อ Banner | Text Input | ✅ | Max 100 chars |
| รูปภาพ Desktop | Image Upload | ✅ | - |
| รูปภาพ Mobile | Image Upload | ✅ | - |
| Link URL | Text Input | ❌ | Valid URL |
| ลำดับ | Number | ✅ | 1-5 |
| สถานะ | Toggle | ✅ | Active/Inactive |

**Constraints:**
- Maximum: 5 banners

---

### 3. Promotion Campaign Management

**Path:** `/promotions`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการ Promotion ทั้งหมด |
| Create | สร้าง Promotion ใหม่ |
| Edit | แก้ไข Promotion |
| Delete | ลบ Promotion |
| Reorder | Drag & Drop เรียงลำดับ |
| Date Filter | กรองตาม Start/End Date |

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ชื่อ Campaign | Text Input | ✅ | Max 100 chars |
| รูปภาพ | Image Upload | ✅ | 736x507 px |
| Link URL | Text Input | ❌ | Valid URL |
| วันเริ่มต้น | Date Picker | ✅ | - |
| วันสิ้นสุด | Date Picker | ✅ | > Start Date |
| ลำดับ | Number | ✅ | 1-3 |
| สถานะ | Toggle | ✅ | Active/Inactive |

**Constraints:**
- Maximum: 3 campaigns
- Auto show/hide based on date range

**List Display:**
- Status badges:
  - 🟢 Active (กำลังแสดง)
  - 🟡 Scheduled (รอแสดง)
  - 🔴 Expired (หมดอายุ)

---

### 4. Province Card Management

**Path:** `/provinces`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการ Province ทั้งหมด |
| Create | สร้าง Province ใหม่ |
| Edit | แก้ไข Province |
| Delete | ลบ Province |
| Reorder | Drag & Drop เรียงลำดับ |

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ชื่อจังหวัด | Text Input | ✅ | Max 50 chars |
| รูปภาพ | Image Upload | ✅ | 570x320 px |
| Link URL | Text Input | ❌ | Valid URL |
| ลำดับ | Number | ✅ | 1-10 |
| สถานะ | Toggle | ✅ | Active/Inactive |

**Constraints:**
- Maximum: 10 provinces

---

### 5. Article Management

#### 5.1 Article Category

**Path:** `/articles/categories`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการ Category |
| Create | สร้าง Category ใหม่ |
| Edit | แก้ไข Category |
| Delete | ลบ Category (ถ้าไม่มี Article) |
| Reorder | Drag & Drop เรียงลำดับ |

**Form Fields:**

| Field | Type | Required |
|-------|------|----------|
| ชื่อหมวดหมู่ | Text Input | ✅ |
| Slug | Text Input | ✅ (Auto-generate) |
| ลำดับ | Number | ✅ |
| สถานะ | Toggle | ✅ |

#### 5.2 Article

**Path:** `/articles`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการบทความ (Pagination) |
| Create | สร้างบทความใหม่ |
| Edit | แก้ไขบทความ |
| Delete | ลบบทความ |
| Filter | กรองตาม Category, Status |
| Search | ค้นหาตาม Title |

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| หัวข้อ | Text Input | ✅ | Max 200 chars |
| Slug | Text Input | ✅ | Auto-generate, unique |
| หมวดหมู่ | Dropdown | ✅ | From Category list |
| รูปหน้าปก | Image Upload | ✅ | 302x302 px |
| เนื้อหา | Rich Text Editor | ✅ | - |
| วันที่เผยแพร่ | Date Picker | ✅ | - |
| Meta Title | Text Input | ❌ | Max 60 chars |
| Meta Description | Textarea | ❌ | Max 160 chars |
| สถานะ | Dropdown | ✅ | Draft / Published |

**Rich Text Editor Features:**
- Bold, Italic, Underline, Strikethrough
- Headings (H1-H6)
- Lists (Ordered/Unordered)
- Links
- Images (Upload/URL)
- Video Embed (YouTube, Vimeo)
- Tables
- Code blocks
- Blockquotes

---

### 6. FAQ Management

#### 6.1 FAQ Category

**Path:** `/faqs/categories`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการ Category |
| Create | สร้าง Category ใหม่ |
| Edit | แก้ไข Category |
| Delete | ลบ Category (ถ้าไม่มี FAQ) |
| Reorder | Drag & Drop เรียงลำดับ |

**Form Fields:**

| Field | Type | Required |
|-------|------|----------|
| ชื่อหมวดหมู่ | Text Input | ✅ |
| ลำดับ | Number | ✅ |
| สถานะ | Toggle | ✅ |

#### 6.2 FAQ

**Path:** `/faqs`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการ FAQ (Group by Category) |
| Create | สร้าง FAQ ใหม่ |
| Edit | แก้ไข FAQ |
| Delete | ลบ FAQ |
| Reorder | Drag & Drop เรียงลำดับ |
| Filter | กรองตาม Category |

**Form Fields:**

| Field | Type | Required |
|-------|------|----------|
| คำถาม | Text Input | ✅ |
| คำตอบ | Rich Text Editor | ✅ |
| หมวดหมู่ | Dropdown | ✅ |
| ลำดับ | Number | ✅ |
| สถานะ | Dropdown | Draft / Published |

---

### 7. Static Pages Management

#### 7.1 Contact Us

**Path:** `/pages/contact-us`

**Form Fields:**

| Field | Type | Required |
|-------|------|----------|
| รูป Hero | Image Upload | ❌ |
| เบอร์โทรศัพท์ | Text Input | ✅ |
| อีเมล | Text Input | ✅ |
| LINE ID | Text Input | ❌ |
| ที่อยู่ | Textarea | ✅ |
| Google Maps Embed | Textarea | ❌ |
| เวลาทำการ | Text Input | ❌ |

#### 7.2 Privacy Policy

**Path:** `/pages/privacy-policy`

**Form Fields:**

| Field | Type | Required |
|-------|------|----------|
| หัวข้อ | Text Input | ✅ |
| เนื้อหา | Rich Text Editor | ✅ |
| วันที่อัปเดต | Date Picker | ✅ |

---

### 8. Account Management

**Path:** `/accounts`

| Feature | Description |
|---------|-------------|
| List | แสดงรายการ Admin Users |
| Create | สร้าง User ใหม่ |
| Edit | แก้ไข User |
| Delete | ลบ User (ยกเว้นตัวเอง) |
| Change Password | เปลี่ยนรหัสผ่าน |
| Role Assignment | กำหนด Role |

#### 8.1 Account List

**Path:** `/accounts`

**List Columns:**
| Column | Description |
|--------|-------------|
| ชื่อ | ชื่อ-นามสกุล |
| อีเมล | Email address |
| Role | Super Admin / Editor / Viewer |
| สถานะ | Active / Inactive |
| เข้าสู่ระบบล่าสุด | Last login date |
| Actions | Edit, Delete, Reset Password |

**Filters:**
- Filter by Role
- Filter by Status
- Search by Name/Email

#### 8.2 Account Form

**Path:** `/accounts/create`, `/accounts/:id/edit`

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ชื่อ | Text Input | ✅ | Max 100 chars |
| นามสกุล | Text Input | ✅ | Max 100 chars |
| อีเมล | Email Input | ✅ | Valid email, unique |
| รหัสผ่าน | Password Input | ✅ (create) | Min 8 chars |
| ยืนยันรหัสผ่าน | Password Input | ✅ (create) | Match password |
| Role | Dropdown | ✅ | Super Admin / Editor / Viewer |
| สถานะ | Toggle | ✅ | Active / Inactive |

#### 8.3 Role Management

**Path:** `/accounts/roles`

**Roles & Permissions:**

| Permission | Super Admin | Editor | Viewer |
|------------|-------------|--------|--------|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Banners | ✅ | ✅ | ❌ |
| Manage Promotions | ✅ | ✅ | ❌ |
| Manage Provinces | ✅ | ✅ | ❌ |
| Manage Articles | ✅ | ✅ | ❌ |
| Manage FAQs | ✅ | ✅ | ❌ |
| Manage Static Pages | ✅ | ✅ | ❌ |
| Manage Accounts | ✅ | ❌ | ❌ |
| View Content (Read-only) | ✅ | ✅ | ✅ |

#### 8.4 My Profile

**Path:** `/profile`

**Features:**
- View/Edit own profile
- Change password
- View login history (optional)

---

## Sidebar Navigation

```
📊 Dashboard

📷 Home Page Content
├── Hero Banners
├── Promotions
└── Province Cards

📝 Content
├── Articles
│   ├── All Articles
│   └── Categories
├── FAQs
│   ├── All FAQs
│   └── Categories
└── Static Pages
    ├── Contact Us
    └── Privacy Policy

👥 Account Management
├── All Accounts
├── Roles & Permissions
└── My Profile

⚙️ Settings (optional)
```

---

## Common Components

### 1. RichTextEditor.vue
- WYSIWYG editor (TipTap / Quill / CKEditor)
- Image upload
- Video embed
- Table support

### 2. ImageUploader.vue
- Drag & drop upload
- Preview
- Crop/Resize (optional)
- Size validation
- Format validation (jpg, png, webp)

### 3. DragDropList.vue
- Drag & drop reordering
- Update order numbers
- Visual feedback

### 4. DataTable.vue
- Sortable columns
- Pagination
- Search
- Filters
- Bulk actions

### 5. ConfirmDialog.vue
- Delete confirmation
- Unsaved changes warning

### 6. StatusBadge.vue
- Active (green)
- Inactive (gray)
- Draft (yellow)
- Published (blue)
- Expired (red)

---

## Mock Data (สำหรับ Development)

เนื่องจากยังไม่มี Backend ให้ใช้ Mock Data สำหรับ Development:

```javascript
// src/composables/useApi.js

// Mock data - จะเปลี่ยนเป็น API calls ภายหลัง
const mockBanners = [
  {
    id: 1,
    title: 'Banner 1',
    image_desktop: '/mock/banner1-desktop.jpg',
    image_mobile: '/mock/banner1-mobile.jpg',
    link: 'https://example.com',
    order: 1,
    is_active: true
  },
  // ...
];

export const useApi = () => {
  // Banner APIs
  const getBanners = async () => {
    // TODO: Replace with actual API call
    // return await axios.get('/api/banners');
    return mockBanners;
  };

  const createBanner = async (data) => {
    // TODO: Replace with actual API call
    // return await axios.post('/api/banners', data);
    console.log('Create banner:', data);
  };

  // ... other methods

  return {
    getBanners,
    createBanner,
    // ...
  };
};
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run production server (for deployment)
npm start
```

---

## Deployment (Render)

This project is configured to deploy on Render.com as a Web Service.

**Build Command:** `npm install && npm run build`
**Start Command:** `npm start`

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | Main application |
| `/health` | Health check |
| `/api/status` | Server status (uptime, memory) |

---

## Content Summary

| Content Type | Type | Max Items | Ordering | Path |
|--------------|------|-----------|----------|------|
| Hero Banner | Collection | 5 | Drag & Drop | /banners |
| Promotion Campaign | Collection | 3 | Drag & Drop | /promotions |
| Province Card | Collection | 10 | Drag & Drop | /provinces |
| Article Category | Collection | Unlimited | Drag & Drop | /articles/categories |
| Article | Collection | Unlimited | By Date | /articles |
| FAQ Category | Collection | Unlimited | Drag & Drop | /faqs/categories |
| FAQ | Collection | Unlimited | Drag & Drop | /faqs |
| Contact Us | Single | 1 | - | /pages/contact-us |
| Privacy Policy | Single | 1 | - | /pages/privacy-policy |
| Account | Collection | Unlimited | - | /accounts |

---

## Excluded from CMS (Connect to Internal System)

| Feature | Reason |
|---------|--------|
| Promotion Tickets | รอต่อระบบภายใน |
| User Bookings | ระบบภายใน |
| Vehicle Management | ระบบภายใน |
| Branch/Location Details | ระบบภายใน |

---

*Document Version: 1.2*
*Created: November 28, 2025*
*Updated: December 10, 2025*
*Type: Frontend UI with Mock Data*
