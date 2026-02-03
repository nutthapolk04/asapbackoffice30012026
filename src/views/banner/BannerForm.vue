<template>
  <div class="banner-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์' }}</h1>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="content-card"
    >
      <div class="form-section">
        <div class="form-section-title">ข้อมูลทั่วไป</div>

        <el-form-item label="ชื่อแบนเนอร์ (สำหรับ Admin)" prop="title">
          <el-input
            v-model="form.title"
            placeholder="กรอกชื่อแบนเนอร์"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="ลิงก์ URL (ถ้ามี)" prop="link">
          <el-input
            v-model="form.link"
            placeholder="https://example.com"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="ลำดับการแสดง" prop="order">
              <el-input-number
                v-model="form.order"
                :min="1"
                :max="5"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="สถานะ" prop="isActive">
              <el-switch
                v-model="form.isActive"
                active-text="เปิดใช้งาน"
                inactive-text="ปิดใช้งาน"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="form-section">
        <div class="form-section-title">รูปภาพ</div>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="รูปภาพ Desktop" prop="imageDesktop">
              <div class="image-upload-wrapper">
                <el-upload
                  class="image-uploader"
                  :show-file-list="false"
                  :auto-upload="false"
                  accept="image/*"
                  @change="handleDesktopImageChange"
                >
                  <div v-if="form.imageDesktop" class="image-preview">
                    <img :src="form.imageDesktop" />
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
                <div class="image-hint">แนะนำขนาด: 1280 x 500 px</div>
                <el-input
                  v-model="form.imageAltDesktop"
                  placeholder="Alt Text (คำอธิบายรูปภาพสำหรับ SEO)"
                  class="mt-2"
                />
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="รูปภาพ Mobile" prop="imageMobile">
              <div class="image-upload-wrapper">
                <el-upload
                  class="image-uploader"
                  :show-file-list="false"
                  :auto-upload="false"
                  accept="image/*"
                  @change="handleMobileImageChange"
                >
                  <div v-if="form.imageMobile" class="image-preview image-preview--mobile">
                    <img :src="form.imageMobile" />
                    <div class="image-overlay">
                      <el-icon><Plus /></el-icon>
                      <span>เปลี่ยนรูป</span>
                    </div>
                  </div>
                  <div v-else class="upload-placeholder upload-placeholder--mobile">
                    <el-icon><Plus /></el-icon>
                    <span>อัปโหลดรูปภาพ</span>
                  </div>
                </el-upload>
                <div class="image-hint">แนะนำขนาด: 390 x 300 px</div>
                <el-input
                  v-model="form.imageAltMobile"
                  placeholder="Alt Text (คำอธิบายรูปภาพสำหรับ SEO)"
                  class="mt-2"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="form-actions">
        <el-button @click="$router.back()">ยกเลิก</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างแบนเนอร์' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const { getBanner, createBanner, updateBanner } = useApi()

const formRef = ref()
const saving = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  imageDesktop: '',
  imageAltDesktop: '',
  imageMobile: '',
  imageAltMobile: '',
  link: '',
  order: 1,
  isActive: true
})

const rules = {
  title: [
    { required: true, message: 'กรุณากรอกชื่อแบนเนอร์', trigger: 'blur' }
  ],
  imageDesktop: [
    { required: true, message: 'กรุณาอัปโหลดรูปภาพ Desktop', trigger: 'change' }
  ],
  imageMobile: [
    { required: true, message: 'กรุณาอัปโหลดรูปภาพ Mobile', trigger: 'change' }
  ],
  order: [
    { required: true, message: 'กรุณากรอกลำดับ', trigger: 'blur' }
  ]
}

const handleDesktopImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.imageDesktop = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleMobileImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.imageMobile = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await updateBanner(route.params.id, form)
          ElMessage.success('แก้ไขแบนเนอร์สำเร็จ')
        } else {
          await createBanner(form)
          ElMessage.success('สร้างแบนเนอร์สำเร็จ')
        }
        router.push('/banners')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
      } finally {
        saving.value = false
      }
    }
  })
}

const loadBanner = async () => {
  if (isEdit.value) {
    try {
      const data = await getBanner(route.params.id)
      if (data) {
        Object.assign(form, data)
      } else {
        ElMessage.error('ไม่พบข้อมูลแบนเนอร์')
        router.push('/banners')
      }
    } catch (error) {
      ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
      router.push('/banners')
    }
  }
}

onMounted(() => {
  loadBanner()
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
}

.image-uploader {
  :deep(.el-upload) {
    width: 100%;
  }
}

.image-preview {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #ddd;

  &--mobile {
    height: 220px;
    max-width: 200px;
  }

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
  height: 180px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: border-color 0.2s;

  &--mobile {
    height: 220px;
    max-width: 200px;
  }

  &:hover {
    border-color: #FF595A;
    color: #FF595A;
  }

  .el-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
}

.image-hint {
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
