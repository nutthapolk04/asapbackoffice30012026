<template>
  <div class="coupon-management">
    <div class="page-header">
      <div>
        <h1>จัดการคูปอง</h1>
        <p class="text-subtitle">จัดการการแสดงผลคูปองส่วนลดจากระบบ Car Plan</p>
      </div>
      <div class="header-actions">
        <!-- Future: Add 'Sync' button if connecting to real API -->
        <el-button @click="fetchData">
            <el-icon><Refresh /></el-icon>
            <span>รีเฟรชข้อมูล</span>
        </el-button>
      </div>
    </div>

    <div class="content-card">
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="ค้นหาชื่อคูปอง หรือ รหัส..."
          prefix-icon="Search"
          style="width: 300px"
          clearable
        />
        <el-radio-group v-model="filterStatus">
          <el-radio-button label="all">ทั้งหมด</el-radio-button>
          <el-radio-button label="active">แสดงอยู่</el-radio-button>
          <el-radio-button label="inactive">ซ่อนอยู่</el-radio-button>
        </el-radio-group>
      </div>

      <el-table 
        v-loading="loading" 
        :data="filteredCoupons" 
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column width="80" align="center">
          <template #default>
            <div class="coupon-icon">
                <el-icon><Ticket /></el-icon>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="รายละเอียดคูปอง" min-width="250">
          <template #default="{ row }">
            <div class="coupon-detail">
              <div class="coupon-title">{{ row.title }}</div>
              <div class="coupon-code">
                <el-icon><Discount /></el-icon>
                <span>{{ row.code }}</span>
              </div>
              <div class="coupon-desc">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="วันหมดอายุ (Expiry)" width="200">
          <template #default="{ row }">
            <div class="expiry-info" :class="{ 'expiring-soon': isExpiringSoon(row.expiryDate) }">
              <div class="date-text">{{ formatDate(row.expiryDate) }}</div>
              <div class="days-left" v-if="getDaysLeft(row.expiryDate) > 0">
                เหลือ {{ getDaysLeft(row.expiryDate) }} วัน
              </div>
              <div class="days-left text-danger" v-else>
                หมดอายุแล้ว
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="สถิติการใช้" width="150" align="center">
            <template #default="{ row }">
                <div>{{ row.usageCount }} / {{ row.totalLimit }}</div>
                <el-progress 
                    :percentage="Math.min((row.usageCount / row.totalLimit) * 100, 100)" 
                    :show-text="false" 
                    :status="getUsageStatus(row)"
                    style="margin-top: 4px;"
                />
            </template>
        </el-table-column>

        <el-table-column label="จัดการเนื้อหา" width="120" align="center">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              text 
              @click="openContentDrawer(row)"
            >
              <el-icon><Edit /></el-icon>
              <span style="margin-left: 4px">จัดการ</span>
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="แสดงผลบนเว็บ" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="(val) => handleStatusChange(row.id, val)"
              active-text="แสดง"
              inactive-text="ซ่อน"
              inline-prompt
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Content Management Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="จัดการข้อมูลภายในคูปอง"
      size="800px"
      direction="rtl"
      destroy-on-close
    >
      <template #header>
        <div class="drawer-header">
          <h2 style="margin: 0">จัดการข้อมูลภายในคูปอง</h2>
          <el-tag v-if="selectedCoupon" type="info">{{ selectedCoupon.code }}</el-tag>
        </div>
      </template>
      
      <CouponContentForm 
        v-if="selectedCoupon"
        :coupon-id="selectedCoupon.id"
        @save="handleContentSaved"
        @cancel="drawerVisible = false"
      />
    </el-drawer>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Refresh, Ticket, Discount, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'
import { useDate } from '@/composables/useDate'
import CouponContentForm from './CouponContentForm.vue'


const { getCoupons, updateCouponStatus } = useApi()
const { formatDate } = useDate()

const loading = ref(false)
const coupons = ref([])
const searchQuery = ref('')
const filterStatus = ref('all')
const drawerVisible = ref(false)
const selectedCoupon = ref(null)


const fetchData = async () => {
  loading.value = true
  try {
    const data = await getCoupons()
    coupons.value = data
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลคูปองได้')
  } finally {
    loading.value = false
  }
}

const filteredCoupons = computed(() => {
  let result = coupons.value

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.code.toLowerCase().includes(query)
    )
  }

  // Filter
  if (filterStatus.value === 'active') {
    result = result.filter(c => c.isActive)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(c => !c.isActive)
  }

  return result
})

const handleStatusChange = async (id, isActive) => {
  try {
    await updateCouponStatus(id, isActive)
    ElMessage.success(isActive ? 'เปิดการแสดงผลคูปองแล้ว' : 'ซ่อนคูปองแล้ว')
  } catch (error) {
    // Revert if failed (in real app)
    ElMessage.error('บันทึกสถานะไม่สำเร็จ')
  }
}

const isExpiringSoon = (dateStr) => {
    const days = getDaysLeft(dateStr)
    return days > 0 && days <= 30 // Warning if expiring in 30 days
}

const getDaysLeft = (dateStr) => {
    const now = new Date()
    const expiry = new Date(dateStr)
    const diffTime = expiry - now
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getUsageStatus = (row) => {
    const percentage = (row.usageCount / row.totalLimit) * 100
    if (percentage >= 90) return 'exception'
    if (percentage >= 70) return 'warning'
    return 'success'
}

const tableRowClassName = ({ row }) => {
    if (isExpiringSoon(row.expiryDate)) return 'warning-row'
    return ''
}

const openContentDrawer = (coupon) => {
  selectedCoupon.value = coupon
  drawerVisible.value = true
}

const handleContentSaved = () => {
  drawerVisible.value = false
  fetchData()
}


onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .text-subtitle {
    color: #6B7280;
    font-size: 14px;
    margin-top: 4px;
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.coupon-icon {
    width: 40px;
    height: 40px;
    background-color: #FFF0F0;
    color: #FF595A;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.coupon-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.coupon-title {
    font-weight: 600;
    color: #111827;
}

.coupon-code {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #6B7280;
    background: #F3F4F6;
    padding: 2px 8px;
    border-radius: 4px;
    width: fit-content;
    font-family: monospace;
}

.coupon-desc {
    font-size: 12px;
    color: #9CA3AF;
}

.expiry-info {
    font-size: 14px;
    
    .days-left {
        font-size: 12px;
        color: #6B7280;
        margin-top: 2px;
        
        &.text-danger {
            color: #FF595A;
        }
    }
    
    &.expiring-soon .days-left {
        color: #FFAB00;
        font-weight: 600;
    }
}

:deep(.warning-row) {
    background-color: #FFFBF0;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>

