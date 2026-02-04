<template>
  <div class="banner-list">
    <div class="page-header">
      <h1>จัดการแบนเนอร์</h1>
      <el-button
        type="primary"
        :disabled="banners.length >= 5"
        @click="$router.push('/banners/create')"
      >
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px;">เพิ่มแบนเนอร์</span>
      </el-button>
    </div>

    <div class="content-card">
      <div class="card-toolbar">
        <span class="item-count">ทั้งหมด {{ banners.length }}/5 รายการ</span>
        <el-alert
          v-if="banners.length >= 5"
          title="ถึงจำนวนสูงสุดแล้ว (5 แบนเนอร์)"
          type="warning"
          :closable="false"
          show-icon
          style="width: auto;"
        />
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="banners"
        style="width: 100%"
        row-key="id"

      >
        <el-table-column width="60" align="center">
          <template #default>
            <el-icon class="drag-handle"><Rank /></el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="order" label="ลำดับ" width="80" align="center" />

        <el-table-column label="รูปภาพ" width="200">
          <template #default="{ row }">
            <el-image
              :src="row.imageDesktop"
              fit="cover"
              style="width: 160px; height: 60px; border-radius: 4px;"
            />
          </template>
        </el-table-column>

        <el-table-column prop="title" label="ชื่อแบนเนอร์" min-width="200" />

        <el-table-column prop="link" label="ลิงก์" min-width="150">
          <template #default="{ row }">
            <span v-if="row.link" class="link-text">{{ row.link }}</span>
            <span v-else class="text-muted">ไม่มีลิงก์</span>
          </template>
        </el-table-column>

        <el-table-column prop="isActive" label="สถานะ" width="100" align="center">
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
                @click="$router.push(`/banners/${row.id}/edit`)"
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

const { getBanners, updateBanner, deleteBanner, reorderBanners } = useApi()

const tableRef = ref(null)

const loading = ref(false)
const banners = ref([])

const fetchBanners = async () => {
  loading.value = true
  try {
    banners.value = await getBanners()
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updateBanner(row.id, { isActive: row.isActive })
    ElMessage.success('อัปเดตสถานะสำเร็จ')
  } catch (error) {
    ElMessage.error('ไม่สามารถอัปเดตสถานะได้')
    row.isActive = !row.isActive
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบแบนเนอร์ "${row.title}" ใช่หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    await deleteBanner(row.id)
    ElMessage.success('ลบแบนเนอร์สำเร็จ')
    fetchBanners()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('ไม่สามารถลบได้')
    }
  }
}

onMounted(() => {
  fetchBanners().then(() => {
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
    const newOrderIds = banners.value.map(b => b.id)
    await reorderBanners(newOrderIds)
    ElMessage.success('บันทึกลำดับเรียบร้อย')
    hasUnsavedChanges.value = false
  } catch (error) {
    ElMessageBox.alert('ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'แจ้งเตือน', {
      type: 'error',
      confirmButtonText: 'ตกลง'
    })
    fetchBanners()
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

      // Move item in local array to match visual change
      const targetRow = banners.value.splice(oldIndex, 1)[0]
      banners.value.splice(newIndex, 0, targetRow)
      
      // Update order property visually 
      banners.value.forEach((b, index) => {
        b.order = index + 1
      })

      // Mark as unsaved
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

.link-text {
  color: #2574FF;
  font-size: 13px;
  word-break: break-all;
}

.text-muted {
  color: #999;
  font-size: 13px;
}

.drag-handle {
  cursor: move;
  color: #999;

  &:hover {
    color: #666;
  }
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
