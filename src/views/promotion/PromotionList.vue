<template>
  <div class="promotion-list">
    <div class="page-header">
      <h1>จัดการโปรโมชัน</h1>
      <el-button
        type="primary"
        :disabled="promotions.length >= 3"
        @click="$router.push('/promotions/create')"
      >
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px;">เพิ่มโปรโมชัน</span>
      </el-button>
    </div>

    <div class="content-card">
      <div class="card-toolbar">
        <span class="item-count">ทั้งหมด {{ promotions.length }}/3 รายการ</span>
        <el-alert
          v-if="promotions.length >= 3"
          title="ถึงจำนวนสูงสุดแล้ว (3 โปรโมชัน)"
          type="warning"
          :closable="false"
          show-icon
          style="width: auto;"
        />
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="promotions"
        style="width: 100%"
        row-key="id"
      >
        <el-table-column width="60" align="center">
          <template #default>
            <el-icon class="drag-handle"><Rank /></el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="order" label="ลำดับ" width="80" align="center" />

        <el-table-column label="รูปภาพ" width="180">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              fit="cover"
              style="width: 140px; height: 100px; border-radius: 4px;"
            />
          </template>
        </el-table-column>

        <el-table-column prop="title" label="ชื่อโปรโมชัน" min-width="180" />

        <el-table-column label="ระยะเวลา" width="200">
          <template #default="{ row }">
            <div class="date-range">
              <span>{{ formatDate(row.startDate) }}</span>
              <span class="date-separator">ถึง</span>
              <span>{{ formatDate(row.endDate) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="สถานะ" width="120" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', `status-badge--${getStatus(row)}`]">
              {{ getStatusText(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="isActive" label="เปิด/ปิด" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="จัดการ" width="150" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                type="primary"
                text
                @click="$router.push(`/promotions/${row.id}/edit`)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                type="danger"
                text
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- Floating Save Button -->
    <div v-if="hasUnsavedChanges" class="floating-save">
      <el-button type="success" size="large" :loading="savingOrder" @click="saveOrder">
        <el-icon><Check /></el-icon>
        <span style="margin-left: 8px;">บันทึกลำดับ</span>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Rank, Check } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { useApi } from '@/composables/useApi'

const { getPromotions, updatePromotion, deletePromotion, reorderPromotions } = useApi()

const tableRef = ref(null)

const loading = ref(false)
const promotions = ref([])

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatus = (row) => {
  if (!row.isActive) return 'inactive'
  const now = new Date()
  const start = new Date(row.startDate)
  const end = new Date(row.endDate)
  if (now < start) return 'draft'
  if (now > end) return 'expired'
  return 'active'
}

const getStatusText = (row) => {
  const status = getStatus(row)
  const map = {
    active: 'กำลังแสดง',
    draft: 'รอแสดง',
    expired: 'หมดอายุ',
    inactive: 'ปิดใช้งาน'
  }
  return map[status]
}

const fetchPromotions = async () => {
  loading.value = true
  try {
    promotions.value = await getPromotions()
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updatePromotion(row.id, { isActive: row.isActive })
    ElMessage.success('อัปเดตสถานะสำเร็จ')
  } catch (error) {
    ElMessage.error('ไม่สามารถอัปเดตสถานะได้')
    row.isActive = !row.isActive
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบโปรโมชัน "${row.title}" ใช่หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    await deletePromotion(row.id)
    ElMessage.success('ลบโปรโมชันสำเร็จ')
    fetchPromotions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('ไม่สามารถลบได้')
    }
  }
}

onMounted(() => {
  fetchPromotions().then(() => {
    nextTick(() => {
      initSortable()
    })
  })
})

const hasUnsavedChanges = ref(false)
const savingOrder = ref(false)

const saveOrder = async () => {
  savingOrder.value = true
  try {
    const newOrderIds = promotions.value.map(p => p.id)
    await reorderPromotions(newOrderIds)
    ElMessage.success('บันทึกลำดับเรียบร้อย')
    hasUnsavedChanges.value = false
  } catch (error) {
    ElMessageBox.alert('ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'แจ้งเตือน', {
      type: 'error',
      confirmButtonText: 'ตกลง'
    })
    fetchPromotions()
  } finally {
    savingOrder.value = false
  }
}

const initSortable = () => {
  if (!tableRef.value) return
  
  const el = tableRef.value.$el.querySelector('tbody')
  if (!el) return

  Sortable.create(el, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex === newIndex) return

      const targetRow = promotions.value.splice(oldIndex, 1)[0]
      promotions.value.splice(newIndex, 0, targetRow)
      
      promotions.value.forEach((p, index) => {
        p.order = index + 1
      })

      hasUnsavedChanges.value = true
    }
  })
}
</script>

<style lang="scss" scoped>
.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.item-count {
  color: #666;
  font-size: 14px;
}

.date-range {
  font-size: 13px;

  .date-separator {
    margin: 0 4px;
    color: #999;
  }
}

.drag-handle {
  cursor: move;
  color: #999;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.floating-save {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
