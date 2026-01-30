<template>
  <div class="contact-us">
    <div class="page-header">
      <h1>ข้อมูลติดต่อ</h1>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="content-card"
      v-loading="loading"
    >
      <div class="form-section">
        <div class="form-section-title">รูปข้อมูลผู้ติดต่อ</div>

        <el-form-item prop="heroImage">
          <div class="image-upload-wrapper">
            <el-upload
              class="image-uploader"
              :show-file-list="false"
              :auto-upload="false"
              accept="image/*"
              @change="handleImageChange"
            >
              <div v-if="form.heroImage" class="image-preview">
                <img :src="form.heroImage" />
                <div class="image-overlay">
                  <el-icon><Plus /></el-icon>
                  <span>เปลี่ยนรูป</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
                <span>อัปโหลดรูปภาพ</span>
              </div>
            </el-upload>
            <div class="image-hint">แนะนำขนาด: 1280 x 400 px</div>
          </div>
        </el-form-item>
      </div>

      <div class="form-section">
        <div class="form-section-title">ข้อมูลติดต่อ</div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="เบอร์โทรศัพท์" prop="phone">
              <el-input v-model="form.phone" placeholder="02-xxx-xxxx" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="อีเมล" prop="email">
              <el-input v-model="form.email" placeholder="contact@example.com" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="LINE ID" prop="lineId">
              <el-input v-model="form.lineId" placeholder="@lineId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="เวลาทำการ" prop="workingHours">
              <el-input v-model="form.workingHours" placeholder="จันทร์-ศุกร์ 08:00-18:00 น." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="ที่อยู่" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="3"
            placeholder="กรอกที่อยู่"
          />
        </el-form-item>

        <el-form-item label="Google Maps Embed Code" prop="mapEmbed">
          <el-input
            v-model="form.mapEmbed"
            type="textarea"
            :rows="4"
            placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
          />
          <div class="field-hint">
            * วางโค้ด iframe จาก Google Maps
          </div>
        </el-form-item>
      </div>

      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          บันทึกข้อมูล
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'

const { getContactUs, updateContactUs } = useApi()

const formRef = ref()
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  heroImage: '',
  phone: '',
  email: '',
  lineId: '',
  address: '',
  mapEmbed: '',
  workingHours: ''
})

const rules = {
  phone: [{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์', trigger: 'blur' }],
  email: [
    { required: true, message: 'กรุณากรอกอีเมล', trigger: 'blur' },
    { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง', trigger: 'blur' }
  ],
  address: [{ required: true, message: 'กรุณากรอกที่อยู่', trigger: 'blur' }]
}

const handleImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.heroImage = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getContactUs()
    Object.assign(form, data)
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await updateContactUs(form)
        ElMessage.success('บันทึกข้อมูลสำเร็จ')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
      } finally {
        saving.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 32px;

  &-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
}

.image-upload-wrapper {
  width: 100%;
  max-width: 600px;
}

.image-uploader {
  :deep(.el-upload) {
    width: 100%;
  }
}

.image-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #ddd;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;

    .el-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }
  }

  &:hover .image-overlay {
    opacity: 1;
  }
}

.upload-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #FF595A;
    color: #FF595A;
  }

  .el-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
}

.image-hint,
.field-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
</style>
