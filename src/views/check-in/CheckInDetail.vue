<template>
  <div class="check-in-detail" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()" text>
          <el-icon><ArrowLeft /></el-icon>
          <span style="margin-left: 6px;">กลับ</span>
        </el-button>
        <h1>รายละเอียดเช็คอิน</h1>
        <el-tag :type="getStatusType(checkIn.status)" size="large" v-if="checkIn.status">
          {{ getStatusLabel(checkIn.status) }}
        </el-tag>
      </div>
    </div>

    <div class="detail-content" v-if="checkIn.id">
      <!-- Booking Info Section -->
      <div class="content-card">
        <div class="section-title">
          <el-icon><Tickets /></el-icon>
          ข้อมูลการจอง
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>หมายเลขการจอง</label>
            <span class="value highlight">{{ checkIn.bookingNumber }}</span>
          </div>
          <div class="info-item">
            <label>วันที่จอง</label>
            <span class="value">{{ formatDate(checkIn.bookingDate) }}</span>
          </div>
          <div class="info-item">
            <label>รถที่จอง</label>
            <span class="value">{{ checkIn.carModel }}</span>
          </div>
          <div class="info-item">
            <label>สาขารับรถ</label>
            <span class="value">{{ checkIn.branch }}</span>
          </div>
          <div class="info-item">
            <label>วันที่รับรถ</label>
            <span class="value">{{ formatDate(checkIn.pickupDate) }} {{ checkIn.pickupTime }}</span>
          </div>
          <div class="info-item">
            <label>วันที่คืนรถ</label>
            <span class="value">{{ formatDate(checkIn.returnDate) }} {{ checkIn.returnTime }}</span>
          </div>
        </div>
      </div>

      <!-- Customer Info Section -->
      <div class="content-card">
        <div class="section-title">
          <el-icon><User /></el-icon>
          ข้อมูลลูกค้า
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>ชื่อ-นามสกุล</label>
            <span class="value">{{ checkIn.customerName }}</span>
          </div>
          <div class="info-item">
            <label>เบอร์โทรศัพท์</label>
            <span class="value">{{ checkIn.phone }}</span>
          </div>
          <div class="info-item">
            <label>อีเมล</label>
            <span class="value">{{ checkIn.email }}</span>
          </div>
          <div class="info-item">
            <label>วันที่เช็คอิน</label>
            <span class="value">{{ formatDateTime(checkIn.checkInDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Documents Section -->
      <div class="content-card documents-section">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          เอกสารที่แนบมา
          <span class="doc-count">({{ actualDocCount }} ไฟล์)</span>
        </div>
        <IdentityDocuments
          title=""
          :documents="checkIn.documents || []"
          notice="เอกสารสำหรับการตรวจสอบเบื้องต้น (การอนุมัติจะดำเนินการผ่านระบบ Car Plan)"
          @view="viewFullScreen"
          @download="downloadDocument"
        />
      </div>

      <!-- Remarks Section (for rejected) -->
      <div class="content-card" v-if="checkIn.status === 'rejected' && checkIn.rejectReason">
        <div class="section-title danger">
          <el-icon><WarningFilled /></el-icon>
          เหตุผลที่ปฏิเสธ
        </div>
        <p class="reject-reason">{{ checkIn.rejectReason }}</p>
        <p class="action-info">
          ปฏิเสธโดย: {{ checkIn.actionBy }} | {{ formatDateTime(checkIn.actionDate) }}
        </p>
      </div>

      <!-- Approved Info -->
      <div class="content-card" v-if="checkIn.status === 'approved'">
        <div class="section-title success">
          <el-icon><CircleCheckFilled /></el-icon>
          ข้อมูลการอนุมัติ
        </div>
        <p class="action-info">
          อนุมัติโดย: {{ checkIn.actionBy }} | {{ formatDateTime(checkIn.actionDate) }}
        </p>
      </div>

      <!-- Action Section (View-only info) -->
      <div class="action-section" v-if="checkIn.status === 'pending'">
        <div class="action-card view-only-card">
          <div class="action-notice info">
            <el-icon><InfoFilled /></el-icon>
            <div class="notice-text">
              <strong>ระบบ View-only:</strong> 
              รายการนี้อยู่ระหว่างรอดำเนินการ กรุณาดำเนินการ "อนุมัติ" หรือ "ปฏิเสธ" ผ่านระบบ 
              <span class="highlight-text">Car Plan</span> เท่านั้น
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Dialog -->
    <el-dialog
      v-model="showRejectDialog"
      title="ปฏิเสธรายการเช็คอิน"
      width="500px"
    >
      <el-form :model="rejectForm" label-position="top">
        <el-form-item label="เหตุผลที่ปฏิเสธ" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="กรุณาระบุเหตุผลที่ปฏิเสธการเช็คอิน..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialog = false">ยกเลิก</el-button>
        <el-button
          type="danger"
          @click="handleReject"
          :disabled="!rejectForm.reason.trim()"
          :loading="processing"
        >
          ยืนยันการปฏิเสธ
        </el-button>
      </template>
    </el-dialog>

    <!-- Full Screen Image Viewer -->
    <el-dialog
      v-model="showImageViewer"
      :title="currentDocument?.label"
      width="90%"
      class="image-viewer-dialog"
    >
      <div class="full-image-container">
        <el-image
          v-if="currentDocument && isImage(currentDocument.type)"
          :src="currentDocument.url"
          fit="contain"
          style="width: 100%; height: 100%"
        />
        <iframe
          v-else-if="currentDocument"
          :src="currentDocument.url"
          style="width: 100%; height: 100%; border: none"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import IdentityDocuments from '@/components/common/IdentityDocuments.vue'
import { useApi } from '@/composables/useApi'
import {
  ArrowLeft,
  Tickets,
  User,
  Document,
  Picture,
  ZoomIn,
  Download,
  CircleCheckFilled,
  CircleCloseFilled,
  WarningFilled,
  InfoFilled
} from '@element-plus/icons-vue'

const actualDocCount = computed(() => {
  if (!checkIn.value.documents) return 0
  return checkIn.value.documents.filter(d => d.url && d.url.trim() !== '').length
})

const route = useRoute()
const router = useRouter()
const { getCheckIn, approveCheckIn, rejectCheckIn } = useApi()

const loading = ref(false)
const processing = ref(false)
const checkIn = ref({})
const showRejectDialog = ref(false)
const showImageViewer = ref(false)
const currentDocument = ref(null)

const rejectForm = reactive({
  reason: ''
})

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ'
  }
  return labels[status] || status
}

const isImage = (type) => {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'jpg', 'png', 'gif', 'webp'].includes(type?.toLowerCase())
}

const previewDocument = (doc) => {
  if (isImage(doc.type)) {
    // Image preview is handled by el-image component
    return
  }
  viewFullScreen(doc)
}

const viewFullScreen = (doc) => {
  currentDocument.value = doc
  showImageViewer.value = true
}

const downloadDocument = (doc) => {
  const link = document.createElement('a')
  link.href = doc.url
  link.download = doc.fileName || 'document'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm(
      'ยืนยันการอนุมัติการเช็คอินนี้?',
      'ยืนยันการอนุมัติ',
      {
        confirmButtonText: 'อนุมัติ',
        cancelButtonText: 'ยกเลิก',
        type: 'success'
      }
    )

    processing.value = true
    await approveCheckIn(route.params.id)
    ElMessage.success('อนุมัติการเช็คอินสำเร็จ')
    await fetchCheckIn()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  } finally {
    processing.value = false
  }
}

const handleReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('กรุณาระบุเหตุผลที่ยกเลิก')
    return
  }

  try {
    processing.value = true
    await rejectCheckIn(route.params.id, rejectForm.reason)
    ElMessage.success('ยกเลิกการเช็คอินสำเร็จ')
    showRejectDialog.value = false
    rejectForm.reason = ''
    await fetchCheckIn()
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
  } finally {
    processing.value = false
  }
}

const fetchCheckIn = async () => {
  loading.value = true
  try {
    const data = await getCheckIn(route.params.id)
    if (data) {
      checkIn.value = data
    } else {
      ElMessage.error('ไม่พบข้อมูลการเช็คอิน')
      router.push('/check-ins')
    }
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCheckIn()
})
</script>

<style lang="scss" scoped>
.check-in-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .content-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;

    .doc-count {
      font-size: 14px;
      font-weight: normal;
      color: #666;
    }

    &.danger {
      color: #F56C6C;
    }

    &.success {
      color: #67C23A;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 13px;
      color: #666;
    }

    .value {
      font-size: 15px;
      color: #333;
      font-weight: 500;

      &.highlight {
        color: #FF595A;
        font-size: 16px;
      }
    }
  }

  // Documents Section
  .documents-section {
    .documents-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #FEF0C7;
      color: #B54708;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .document-card {
    border: 1px solid #E4E7EC;
    border-radius: 12px;
    overflow: hidden;

    .doc-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #F9FAFB;
      border-bottom: 1px solid #E4E7EC;

      .doc-type {
        font-weight: 500;
        color: #333;
      }
    }

    .doc-preview {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3F4F6;
      cursor: pointer;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .image-placeholder,
      .file-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #666;
      }
    }

    .doc-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      background: #fff;
      border-top: 1px solid #E4E7EC;

      :deep(.el-button) {
        display: inline-flex;
        align-items: center;
        gap: 6px;

        .el-icon {
          margin: 0;
        }
      }
    }
  }

  // Action Section
  .action-section {
    margin-top: 20px;
  }

  .action-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #E4E7EC;

    &.view-only-card {
      background: #F9FAFB;
      border: 1.5px dashed #D0D5DD;
    }

    .action-notice {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #F0F9FF;
      color: #026AA2;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      line-height: 1.5;

      .el-icon {
        font-size: 18px;
        margin-top: 2px;
      }

      .notice-text {
        flex: 1;
      }

      .highlight-text {
        font-weight: 700;
        color: #004EEB;
        text-decoration: underline;
      }
    }

    .car-plan-link {
      display: flex;
      justify-content: center;
    }
  }

  .reject-reason {
    background: #FEE4E2;
    color: #B42318;
    padding: 16px;
    border-radius: 8px;
    margin: 0 0 12px 0;
    line-height: 1.6;
  }

  .action-info {
    color: #666;
    font-size: 13px;
    margin: 0;
  }
}

// Full screen image viewer
.image-viewer-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }

  .full-image-container {
    height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
  }
}
</style>
