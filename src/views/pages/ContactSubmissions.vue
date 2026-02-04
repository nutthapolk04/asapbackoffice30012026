<template>
  <div class="contact-submissions">
    <div class="page-header">
      <h1>ข้อความจากลูกค้า</h1>
      <div class="header-stats">
        <el-tag type="danger" effect="plain">
          ยังไม่อ่าน: {{ unreadCount }}
        </el-tag>
        <el-tag type="success" effect="plain">
          อ่านแล้ว: {{ readCount }}
        </el-tag>
      </div>
    </div>

    <div class="content-card">
      <div class="card-toolbar">
        <div class="filters">
          <el-select
            v-model="filterStatus"
            placeholder="ทุกสถานะ"
            clearable
            style="width: 150px;"
          >
            <el-option label="ยังไม่อ่าน" value="unread" />
            <el-option label="อ่านแล้ว" value="read" />
          </el-select>
          <el-input
            v-model="searchQuery"
            placeholder="ค้นหาชื่อ, อีเมล, หัวข้อ..."
            clearable
            style="width: 250px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <span class="item-count">ทั้งหมด {{ filteredSubmissions.length }} รายการ</span>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredSubmissions"
        style="width: 100%"
        :row-class-name="getRowClassName"
        @row-click="openDetailDialog"
      >
        <el-table-column label="สถานะ" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'success' : 'danger'" size="small">
              {{ row.isRead ? 'อ่านแล้ว' : 'ยังไม่อ่าน' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="วันที่" width="160" align="center">
          <template #default="{ row }">
            <span class="date-text">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="ลูกค้า" min-width="260">
          <template #default="{ row }">
            <div class="customer-info">
              <el-avatar :size="32" :style="{ backgroundColor: getAvatarColor(row.firstName) }">
                {{ row.firstName.charAt(0) }}
              </el-avatar>
              <div class="customer-text">
                <div class="customer-name" :class="{ 'text-bold': !row.isRead }">
                  {{ row.firstName }} {{ row.lastName }}
                </div>
                <div class="customer-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="เบอร์โทร" width="150" align="center" />

        <el-table-column prop="subject" label="หัวข้อ" min-width="350">
          <template #default="{ row }">
            <div class="subject-cell">
              <span class="subject-text">{{ row.subject }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="จัดการ" width="145" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text @click.stop="openDetailDialog(row)">
              <el-icon><View /></el-icon>
              <span style="margin-left: 6px;">ดูรายละเอียด</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="รายละเอียดข้อความ"
      width="700px"
    >
      <div v-if="selectedSubmission" class="submission-detail">
        <div class="detail-header">
          <el-tag :type="selectedSubmission.isRead ? 'success' : 'danger'" size="large">
            {{ selectedSubmission.isRead ? 'อ่านแล้ว' : 'ยังไม่อ่าน' }}
          </el-tag>
          <span class="detail-date">{{ formatDateTime(selectedSubmission.createdAt) }}</span>
        </div>

        <el-descriptions :column="2" border class="detail-info">
          <el-descriptions-item label="ชื่อ">
            {{ selectedSubmission.firstName }}
          </el-descriptions-item>
          <el-descriptions-item label="นามสกุล">
            {{ selectedSubmission.lastName }}
          </el-descriptions-item>
          <el-descriptions-item label="อีเมล">
            <a :href="`mailto:${selectedSubmission.email}`" class="email-link">
              {{ selectedSubmission.email }}
            </a>
          </el-descriptions-item>
          <el-descriptions-item label="เบอร์โทรศัพท์">
            <a :href="`tel:${selectedSubmission.phone}`" class="phone-link">
              {{ selectedSubmission.phone }}
            </a>
          </el-descriptions-item>
          <el-descriptions-item label="หัวข้อ" :span="2">
            {{ selectedSubmission.subject }}
          </el-descriptions-item>
          <el-descriptions-item label="ข้อความ" :span="2">
            <div class="message-content">{{ selectedSubmission.message }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedSubmission.isRead" class="read-info">
          <el-divider />
          <div class="read-info-content">
            <el-icon><CircleCheck /></el-icon>
            <div class="read-info-text">
              <span class="read-by">บันทึกโดย: {{ selectedSubmission.readBy || 'Admin' }}</span>
              <span class="read-at">เมื่อ: {{ formatDateTime(selectedSubmission.readAt) }}</span>
            </div>
          </div>
          <div v-if="selectedSubmission.remark" class="remark-content">
            <strong>Remark:</strong> {{ selectedSubmission.remark }}
          </div>
        </div>

        <div v-if="!selectedSubmission.isRead" class="mark-read-section">
          <el-divider />
          <el-form label-position="top">
            <el-form-item label="บันทึก Remark (ถ้ามี)">
              <el-input
                v-model="remarkText"
                type="textarea"
                :rows="3"
                placeholder="กรอก Remark เพิ่มเติม เช่น 'ติดต่อกลับแล้ว', 'รอการตอบกลับ' เป็นต้น"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">ปิด</el-button>
        <el-button
          v-if="selectedSubmission && !selectedSubmission.isRead"
          type="primary"
          :loading="marking"
          @click="markAsRead"
        >
          <el-icon><Check /></el-icon>
          <span style="margin-left: 6px;">บันทึก "อ่านแล้ว"</span>
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'

const { getContactSubmissions, markContactSubmissionRead } = useApi()

const loading = ref(false)
const marking = ref(false)
const submissions = ref([])
const filterStatus = ref('')
const searchQuery = ref('')
const detailDialogVisible = ref(false)
const selectedSubmission = ref(null)
const remarkText = ref('')

const unreadCount = computed(() => {
  return submissions.value.filter(s => !s.isRead).length
})

const readCount = computed(() => {
  return submissions.value.filter(s => s.isRead).length
})

const filteredSubmissions = computed(() => {
  return submissions.value.filter(s => {
    const matchStatus = !filterStatus.value ||
      (filterStatus.value === 'read' ? s.isRead : !s.isRead)
    const matchSearch = !searchQuery.value ||
      s.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRowClassName = ({ row }) => {
  return row.isRead ? '' : 'unread-row'
}

const getAvatarColor = (name) => {
  const colors = ['#FF595A', '#2574FF', '#36B37E', '#FFAB00', '#9B59B6', '#34495E']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const openDetailDialog = (row) => {
  selectedSubmission.value = row
  remarkText.value = ''
  detailDialogVisible.value = true
}

const fetchSubmissions = async () => {
  loading.value = true
  try {
    submissions.value = await getContactSubmissions()
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const markAsRead = async () => {
  if (!selectedSubmission.value) return

  marking.value = true
  try {
    await markContactSubmissionRead(selectedSubmission.value.id, remarkText.value)
    selectedSubmission.value.isRead = true
    selectedSubmission.value.readAt = new Date().toISOString()
    selectedSubmission.value.readBy = 'Admin'
    selectedSubmission.value.remark = remarkText.value
    ElMessage.success('บันทึก "อ่านแล้ว" สำเร็จ')
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาด')
  } finally {
    marking.value = false
  }
}

onMounted(() => {
  fetchSubmissions()
})
</script>

<style lang="scss" scoped>
.header-stats {
  display: flex;
  gap: 12px;
}

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

.subject-cell {
  .subject-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

:deep(.unread-row) {
  background-color: #FFF9F2 !important;
  color: #101828 !important;
  font-weight: 500;
  
  td {
    background-color: #FFF9F2 !important;
  }
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 24px;
}

.customer-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.customer-name {
  font-size: 14px;
  color: #1D2433;
  
  &.text-bold {
    font-weight: 700;
  }
}

.customer-email {
  font-size: 12px;
  color: #6B7280;
}

.date-text {
  font-variant-numeric: tabular-nums;
  color: #4B5563;
}

:deep(.el-table__row) {
  cursor: pointer;

  &:hover {
    background-color: #f5f7fa !important;
  }
}

.submission-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .detail-date {
      color: #666;
      font-size: 14px;
    }
  }

  .detail-info {
    margin-bottom: 20px;
  }

  .email-link,
  .phone-link {
    color: #2574FF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .message-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: #333;
  }

  .read-info {
    background: #f0f9eb;
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;

    .el-divider {
      display: none;
    }

    .read-info-content {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #67c23a;

      .el-icon {
        font-size: 24px;
      }

      .read-info-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;

        .read-by {
          font-weight: 500;
        }

        .read-at {
          color: #666;
        }
      }
    }

    .remark-content {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e1f3d8;
      font-size: 14px;
      color: #333;
    }
  }

  .mark-read-section {
    margin-top: 16px;
  }
}
</style>
