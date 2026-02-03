<template>
  <header class="header">
    <div class="header-left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">หน้าแรก</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentPage">{{ currentPage }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="36" :src="userAvatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToProfile">
              <el-icon><User /></el-icon>
              <span style="margin-left: 6px;">โปรไฟล์ของฉัน</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span style="margin-left: 6px;">ออกจากระบบ</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// Mock user data - จะเปลี่ยนเป็นข้อมูลจริงภายหลัง
const userName = 'Admin User'
const userRole = 'Super Admin'
const userAvatar = ''

const currentPage = computed(() => {
  return route.meta.title || ''
})

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  ElMessageBox.confirm(
    'คุณต้องการออกจากระบบใช่หรือไม่?',
    'ยืนยันการออกจากระบบ',
    {
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      type: 'warning'
    }
  ).then(() => {
    // TODO: Clear auth state
    router.push('/login')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &-left {
    display: flex;
    align-items: center;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.3;

  .user-name {
    font-weight: 600;
    font-size: 14px;
  }

  .user-role {
    font-size: 12px;
    color: #999;
  }
}

.dropdown-icon {
  color: #999;
}
</style>
