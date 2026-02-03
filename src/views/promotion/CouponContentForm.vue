<template>
  <div class="coupon-content-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      v-loading="loading"
    >
      <div class="form-grid">
        <!-- Configuration Section -->
        <div class="form-section">
          <h3 class="section-title">ข้อมูลพื้นฐาน</h3>
          
          <el-form-item label="Headline (หัวข้อหลัก)" prop="contentHeadline">
            <el-input v-model="form.contentHeadline" placeholder="เช่น ลดได้ถึง 50%" />
          </el-form-item>

          <el-form-item label="Tag (ป้ายกำกับสีแดง)" prop="contentTag">
            <el-input v-model="form.contentTag" placeholder="เช่น ส่วนลดสำหรับการจองล่วงหน้า" />
          </el-form-item>

          <el-form-item label="Subtitle (รายละเอียดใต้ชื่อ)" prop="contentSubtitle">
            <el-input v-model="form.contentSubtitle" placeholder="เช่น มีฤทธิ์คุณจนถึง: 31 ส.ค. 68" />
          </el-form-item>

          <div class="image-upload-row">
            <el-form-item label="รูปไอคอนคูปอง" prop="contentIcon" class="image-item">
              <div class="image-management">
                <el-upload
                  class="icon-uploader"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleIconChange"
                >
                  <div v-if="form.contentIcon" class="image-preview-container">
                    <img :src="form.contentIcon" class="preview-img" />
                    <div class="image-overlay">
                      <el-icon><Edit /></el-icon>
                    </div>
                  </div>
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                  </div>
                </el-upload>
                <div class="image-hint">
                  <span>แนะนำ 1:1 (PNG)</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="รูปภาพคูปอง" prop="contentImage" class="image-item">
              <div class="image-management">
                <el-upload
                  class="coupon-uploader"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleImageChange"
                >
                  <div v-if="form.contentImage" class="image-preview-container">
                    <img :src="form.contentImage" class="preview-img" />
                    <div class="image-overlay">
                      <el-icon><Edit /></el-icon>
                      <span>เปลี่ยนรูปภาพ</span>
                    </div>
                  </div>
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">คลิกเพื่อเลือกรูปภาพ</div>
                  </div>
                </el-upload>
                <div class="image-hint">
                  <el-icon><InfoFilled /></el-icon>
                  <span>แนะนำ 400 x 400 px</span>
                </div>
              </div>
            </el-form-item>
          </div>

        </div>

        <!-- Content Section -->
        <div class="form-section">
          <h3 class="section-title">รายละเอียดเนื้อหา</h3>
          
          <el-form-item label="เกี่ยวกับโปรโมชันนี้" prop="aboutInfo">
            <el-input
              v-model="form.aboutInfo"
              type="textarea"
              :rows="4"
              placeholder="กรอกรายละเอียดเกี่ยวกับโปรโมชัน..."
            />
          </el-form-item>

          <el-form-item label="คุณสมบัติและเงื่อนไข" prop="termsAndConditions">
            <el-input
              v-model="form.termsAndConditions"
              type="textarea"
              :rows="4"
              placeholder="กรอกเงื่อนไขการใช้งาน..."
            />
          </el-form-item>

          <el-form-item label="หมายเหตุด้านล่าง (Footer Note)" prop="footerNote">
            <el-input
              v-model="form.footerNote"
              type="textarea"
              :rows="3"
              placeholder="โปรโมชันนี้สำหรับลูกค้า..."
            />
          </el-form-item>
        </div>
      </div>

      <div class="form-actions">
        <el-button @click="$emit('cancel')">ยกเลิก</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          บันทึกการเปลี่ยนแปลง
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Plus, Edit, InfoFilled } from '@element-plus/icons-vue'
import { useApi } from '@/composables/useApi'


const props = defineProps({
  couponId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const { getCoupon, updateCouponContent } = useApi()

const loading = ref(false)
const saving = ref(false)
const formRef = ref(null)

const form = reactive({
  contentHeadline: '',
  contentTag: '',
  contentSubtitle: '',
  contentImage: '',
  contentIcon: '',
  aboutInfo: '',
  termsAndConditions: '',
  footerNote: ''
})


const rules = {
  contentHeadline: [{ required: true, message: 'กรุณากรอกหัวข้อหลัก', trigger: 'blur' }],
}

const fetchData = async () => {
  if (!props.couponId) return
  
  loading.value = true
  try {
    const data = await getCoupon(props.couponId)
    if (data) {
      form.contentHeadline = data.contentHeadline || ''
      form.contentTag = data.contentTag || ''
      form.contentSubtitle = data.contentSubtitle || ''
      form.contentImage = data.contentImage || ''
      form.contentIcon = data.contentIcon || ''
      form.aboutInfo = data.aboutInfo || ''
      form.termsAndConditions = data.termsAndConditions || ''
      form.footerNote = data.footerNote || ''
    }

  } catch (error) {
    ElMessage.error('โหลดข้อมูลความผิดพลาด')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await updateCouponContent(props.couponId, { ...form })
        ElMessage.success('บันทึกข้อมูลเรียบร้อยแล้ว')
        emit('save')
      } catch (error) {
        ElMessage.error('บันทึกไม่สำเร็จ')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleImageChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
    return false
  }
  
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    form.contentImage = reader.result
    ElMessage.success('เลือกรูปภาพเรียบร้อยแล้ว')
  }
}

const handleIconChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
    return false
  }
  
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    form.contentIcon = reader.result
    ElMessage.success('เลือกรูปไอคอนเรียบร้อยแล้ว')
  }
}


onMounted(fetchData)

watch(() => props.couponId, fetchData)
</script>

<style lang="scss" scoped>
.coupon-content-form {
  padding: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 24px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.image-upload-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-top: 8px;
  
  .image-item {
    margin-bottom: 0;
  }
}

.image-management {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coupon-uploader, .icon-uploader {
  :deep(.el-upload) {
    border: 1px dashed #D1D5DB;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FAFAFA;

    &:hover {
      border-color: #FF595A;
      background-color: #FFF5F5;
    }
  }
}

.coupon-uploader {
  :deep(.el-upload) {
    width: 160px;
    height: 160px;
  }
}

.icon-uploader {
  :deep(.el-upload) {
    width: 80px;
    height: 80px;
  }
  
  .upload-icon {
    font-size: 20px;
  }
}

.image-preview-container {
  width: 100%;
  height: 100%;
  position: relative;

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 13px;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  gap: 4px;
  padding: 8px;
  text-align: center;

  .upload-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .upload-text {
    font-size: 12px;
    line-height: 1.2;
  }
}

.image-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6B7280;
  
  .el-icon {
    color: #9CA3AF;
  }
}

.section-title {

  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E5E7EB;
}

.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  width: 100%;
  aspect-ratio: 1;
  background: #F9FAFB;
  border: 1px dashed #D1D5DB;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-image {
    width: 100%;
    height: 100%;
  }

  .image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #9CA3AF;
    font-size: 14px;
    gap: 8px;

    .el-icon {
      font-size: 32px;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}
</style>
