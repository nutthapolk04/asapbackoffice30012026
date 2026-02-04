<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <img
        src="https://go.asapcarrent.com/wp-content/uploads/2024/06/asap_logo-02-300x175.png"
        alt="ASAP Logo"
        class="logo-image"
      />
      <span>ระบบจัดการหลังบ้าน</span>
      <span class="version-tag">V1.0.0 202602041642</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      :router="true"
      class="sidebar-menu"
    >
      <el-menu-item index="/">
        <el-icon><DataAnalysis /></el-icon>
        <span>แดชบอร์ด</span>
      </el-menu-item>

      <el-sub-menu index="home-content">
        <template #title>
          <el-icon><House /></el-icon>
          <span>เนื้อหาหน้าแรก</span>
        </template>
        <el-menu-item index="/banners">
          <el-icon><Picture /></el-icon>
          <span>แบนเนอร์</span>
        </el-menu-item>
        <el-menu-item index="/promotions">
          <el-icon><Discount /></el-icon>
          <span>โปรโมชัน</span>
        </el-menu-item>
        <el-menu-item index="/coupons">
          <el-icon><Postcard /></el-icon>
          <span>คูปอง</span>
        </el-menu-item>
        <el-menu-item index="/provinces">
          <el-icon><Location /></el-icon>
          <span>จังหวัด</span>
        </el-menu-item>
        <el-menu-item index="/app-banner">
          <el-icon><Iphone /></el-icon>
          <span>App Banner</span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/check-ins">
        <el-icon><Ticket /></el-icon>
        <span>เช็คอินออนไลน์</span>
      </el-menu-item>

      <el-sub-menu index="car-management">
        <template #title>
          <el-icon><Van /></el-icon>
          <span>จัดการรถยนต์</span>
        </template>
        <el-menu-item index="/car-models">
          <el-icon><Picture /></el-icon>
          <span>รูปภาพรถยนต์</span>
        </el-menu-item>
        <el-menu-item index="/car-categories">
          <el-icon><FolderOpened /></el-icon>
          <span>ประเภทกลุ่มรถ</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="content">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>จัดการเนื้อหา</span>
        </template>
        <el-menu-item index="/articles/categories">
          <el-icon><FolderOpened /></el-icon>
          <span>หมวดหมู่บทความ</span>
        </el-menu-item>
        <el-menu-item index="/articles">
          <el-icon><Notebook /></el-icon>
          <span>บทความ</span>
        </el-menu-item>
        <el-menu-item index="/faqs/categories">
          <el-icon><FolderOpened /></el-icon>
          <span>หมวดหมู่คำถาม</span>
        </el-menu-item>
        <el-menu-item index="/faqs">
          <el-icon><QuestionFilled /></el-icon>
          <span>คำถามที่พบบ่อย</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="pages">
        <template #title>
          <el-icon><Files /></el-icon>
          <span>หน้าเพจ</span>
        </template>
        <el-menu-item index="/pages/contact">
          <el-icon><Phone /></el-icon>
          <span>ข้อมูลติดต่อ</span>
        </el-menu-item>
        <el-menu-item index="/contact-submissions">
          <el-icon><Message /></el-icon>
          <span>ข้อความจากลูกค้า</span>
        </el-menu-item>
        <el-menu-item index="/pages/about">
          <el-icon><InfoFilled /></el-icon>
          <span>เกี่ยวกับเรา</span>
        </el-menu-item>
        <el-menu-item index="/pages/privacy">
          <el-icon><Lock /></el-icon>
          <span>นโยบายความเป็นส่วนตัว</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="account">
        <template #title>
          <el-icon><User /></el-icon>
          <span>จัดการบัญชี</span>
        </template>
        <el-menu-item index="/accounts">
          <el-icon><UserFilled /></el-icon>
          <span>ผู้ใช้งานทั้งหมด</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><Setting /></el-icon>
          <span>โปรไฟล์ของฉัน</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => {
  return route.path
})

const handleLogoError = (e) => {
  // Fallback to local logo if external fails
  e.target.src = '/logo.svg'
}
</script>

<style lang="scss" scoped>
.sidebar {
  &-logo {
    padding: 20px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;

    .logo-image {
      max-width: 120px;
      height: auto;
      margin-bottom: 8px;
    }

    span {
      display: block;
      font-size: 12px;
      color: #999;
    }

    .version-tag {
      display: inline-block;
      font-size: 10px;
      color: #FF595A;
      background: #FFF0F0;
      padding: 4px 10px;
      border-radius: 12px;
      margin-top: 8px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }

  &-menu {
    border-right: none;
    padding: 12px;

    .el-menu-item,
    :deep(.el-sub-menu__title) {
      border-radius: 8px;
      margin-bottom: 4px;

      &:hover {
        background-color: #FFF5F5;
      }
    }

    .el-menu-item.is-active {
      background-color: #FFF5F5;
      color: #FF595A;
    }
  }
}
</style>
