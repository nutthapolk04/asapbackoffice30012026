<template>
  <div class="account-list">
    <div class="page-header">
      <h1>จัดการผู้ใช้งาน</h1>
      <el-button type="primary" @click="$router.push('/accounts/create')">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px;">เพิ่มผู้ใช้งาน</span>
      </el-button>
    </div>

    <div class="content-card">
      <div class="card-toolbar">
        <div class="filters">
          <el-select
            v-model="filterRole"
            placeholder="ทุกบทบาท"
            clearable
            style="width: 150px;"
          >
            <el-option label="Super Admin" value="super_admin" />
            <el-option label="Editor" value="editor" />
            <el-option label="Viewer" value="viewer" />
          </el-select>
          <el-select
            v-model="filterStatus"
            placeholder="ทุกสถานะ"
            clearable
            style="width: 140px;"
          >
            <el-option label="เปิดใช้งาน" :value="true" />
            <el-option label="ปิดใช้งาน" :value="false" />
          </el-select>
          <el-input
            v-model="searchQuery"
            placeholder="ค้นหาชื่อ, อีเมล..."
            clearable
            style="width: 200px;"
            :prefix-icon="Search"
          />
        </div>
        <span class="item-count">ทั้งหมด {{ filteredAccounts.length }} รายการ</span>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredAccounts"
        style="width: 100%"
      >
        <el-table-column label="ชื่อ-นามสกุล" min-width="180">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36">
                {{ row.firstName.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ row.firstName }} {{ row.lastName }}</span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="role" label="บทบาท" width="150">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)" size="small">
              {{ getRoleName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="isActive" label="สถานะ" width="120" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', row.isActive ? 'status-badge--active' : 'status-badge--inactive']">
              {{ row.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="lastLogin" label="เข้าสู่ระบบล่าสุด" width="180">
          <template #default="{ row }">
            {{ row.lastLogin || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="จัดการ" width="180" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                type="primary"
                text
                @click="$router.push(`/accounts/${row.id}/edit`)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                type="warning"
                text
                @click="handleResetPassword(row)"
              >
                <el-icon><Key /></el-icon>
              </el-button>
              <el-button
                type="danger"
                text
                @click="handleDelete(row)"
                :disabled="row.id === 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Key } from '@element-plus/icons-vue'
import { useApi } from '@/composables/useApi'

const { getAccounts, deleteAccount } = useApi()

const loading = ref(false)
const accounts = ref([])
const filterRole = ref('')
const filterStatus = ref('')
const searchQuery = ref('')

const getRoleName = (role) => {
  const map = {
    super_admin: 'Super Admin',
    editor: 'Editor',
    viewer: 'Viewer'
  }
  return map[role] || role
}

const getRoleType = (role) => {
  const map = {
    super_admin: 'danger',
    editor: 'warning',
    viewer: 'info'
  }
  return map[role] || ''
}

const filteredAccounts = computed(() => {
  return accounts.value.filter(account => {
    const matchRole = !filterRole.value || account.role === filterRole.value
    const matchStatus = filterStatus.value === '' || account.isActive === filterStatus.value
    const matchSearch = !searchQuery.value ||
      account.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      account.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchRole && matchStatus && matchSearch
  })
})

const fetchAccounts = async () => {
  loading.value = true
  try {
    accounts.value = await getAccounts()
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการรีเซ็ตรหัสผ่านของ "${row.firstName} ${row.lastName}" ใช่หรือไม่?`,
      'ยืนยันการรีเซ็ตรหัสผ่าน',
      {
        confirmButtonText: 'รีเซ็ต',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    // TODO: Call reset password API
    ElMessage.success('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลเรียบร้อยแล้ว')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('เกิดข้อผิดพลาด')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบผู้ใช้ "${row.firstName} ${row.lastName}" ใช่หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    await deleteAccount(row.id)
    ElMessage.success('ลบผู้ใช้สำเร็จ')
    fetchAccounts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('ไม่สามารถลบได้')
    }
  }
}

onMounted(() => {
  fetchAccounts()
})
</script>

<style lang="scss" scoped>
.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.item-count {
  color: #666;
  font-size: 14px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
}

.user-email {
  font-size: 12px;
  color: #999;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px;
}
</style>
