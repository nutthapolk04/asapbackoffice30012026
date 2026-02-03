<template>
  <div class="app-banner-page">
    <div class="page-header">
      <h1>จัดการ Home Application Banner</h1>
    </div>

    <div class="content-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        v-loading="loading"
      >
        <!-- Preview -->
        <div class="banner-preview">
          <h3>ตัวอย่างการแสดงผลบนหน้าเว็บ</h3>
          <div class="preview-container">
            <div class="preview-content">
              <div class="preview-left" :style="{ backgroundColor: form.backgroundColor }">
                <img v-if="form.logoImage" :src="form.logoImage" class="preview-logo" />
                <div v-else class="preview-logo-placeholder">asap</div>
                <h2 class="preview-title">{{ form.title || 'จองสะดวกขึ้นผ่านแอปเอแซ็ป' }}</h2>
                <p class="preview-description">{{ form.description || 'ค้นหารถเช่า check-in สะสม ASC Coin ผ่านแอป' }}</p>
                <div class="preview-buttons">
                  <img v-if="form.showAppStore" src="https://placehold.co/100x32/000/white?text=App+Store" class="store-badge" />
                  <img v-if="form.showGooglePlay" src="https://placehold.co/100x32/000/white?text=Google+Play" class="store-badge" />
                </div>
              </div>
              <div class="preview-right">
                <img v-if="form.bannerImage" :src="form.bannerImage" class="preview-banner-image" />
                <div v-else class="preview-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>แบนเนอร์ (600x400)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-divider />

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="รูปภาพแบนเนอร์ (แสดงทางขวา)" prop="bannerImage">
              <div class="image-upload-wrapper">
                <el-upload
                  class="image-uploader"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="(file) => handleImageChange(file, 'bannerImage')"
                  accept="image/*"
                >
                  <div v-if="form.bannerImage" class="uploaded-image">
                    <el-image :src="form.bannerImage" fit="contain" />
                    <div class="image-actions">
                      <el-button type="danger" size="small" @click.stop="form.bannerImage = ''">
                        <el-icon><Delete /></el-icon>
                        <span>ลบรูป</span>
                      </el-button>
                    </div>
                  </div>
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span>อัปโหลดรูปภาพแบนเนอร์</span>
                    <p class="upload-hint">แนะนำขนาด 600x400 px (PNG โปร่งใส)</p>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="โลโก้แอป" prop="logoImage">
              <div class="image-upload-wrapper">
                <el-upload
                  class="image-uploader logo-uploader"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="(file) => handleImageChange(file, 'logoImage')"
                  accept="image/*"
                >
                  <div v-if="form.logoImage" class="uploaded-image small">
                    <el-image :src="form.logoImage" fit="contain" />
                    <div class="image-actions">
                      <el-button type="danger" size="small" @click.stop="form.logoImage = ''">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div v-else class="upload-placeholder small">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span>โลโก้แอป</span>
                    <p class="upload-hint">100x100 px</p>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="หัวข้อ" prop="title">
              <el-input
                v-model="form.title"
                placeholder="เช่น จองสะดวกขึ้นผ่านแอปเอแซ็ป (asap app)"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="สีพื้นหลัง" prop="backgroundColor">
              <el-color-picker v-model="form.backgroundColor" show-alpha />
              <el-input v-model="form.backgroundColor" style="width: 150px; margin-left: 12px;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="คำอธิบาย" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="เช่น ค้นหารถเช่า check-in สะสม ASC Coin ผ่านแอป"
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="ลิงก์ App Store (iOS)" prop="appStoreLink">
              <div class="flex items-center gap-4">
                <el-input
                  v-model="form.appStoreLink"
                  placeholder="https://apps.apple.com/..."
                  :disabled="!form.showAppStore"
                >
                  <template #prefix>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
                <el-switch
                  v-model="form.showAppStore"
                  active-text="เปิด"
                  inactive-text="ปิด"
                  inline-prompt
                />
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="ลิงก์ Google Play (Android)" prop="googlePlayLink">
              <div class="flex items-center gap-4">
                <el-input
                  v-model="form.googlePlayLink"
                  placeholder="https://play.google.com/..."
                  :disabled="!form.showGooglePlay"
                >
                  <template #prefix>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
                <el-switch
                  v-model="form.showGooglePlay"
                  active-text="เปิด"
                  inactive-text="ปิด"
                  inline-prompt
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="สถานะ">
          <el-switch
            v-model="form.isActive"
            active-text="แสดงบนหน้าเว็บ"
            inactive-text="ซ่อน"
          />
        </el-form-item>

        <el-divider />

        <div class="form-actions">
          <el-button type="primary" size="large" :loading="saving" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            <span>บันทึกการเปลี่ยนแปลง</span>
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'

const { getAppBanner, updateAppBanner } = useApi()

const loading = ref(false)
const saving = ref(false)
const formRef = ref()

const form = reactive({
  title: '',
  description: '',
  bannerImage: '',
  logoImage: '',
  backgroundColor: '#FF595A',
  appStoreLink: '',
  googlePlayLink: '',
  showAppStore: true,
  showGooglePlay: true,
  isActive: true
})

const rules = {
  title: [{ required: true, message: 'กรุณากรอกหัวข้อ', trigger: 'blur' }]
}

const handleImageChange = (file, field) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form[field] = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getAppBanner()
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
        await updateAppBanner(form)
        ElMessage.success('บันทึกสำเร็จ')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด')
      } finally {
        saving.value = false
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.banner-preview {
  margin-bottom: 24px;

  h3 {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
  }
}

.preview-container {
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #eee;
  height: 240px;
}

.preview-content {
  display: flex;
  height: 100%;
}

.preview-left {
  width: 380px;
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;

  .preview-logo {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    margin-bottom: 12px;
    object-fit: cover;
  }

  .preview-logo-placeholder {
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.8;
  }

  .preview-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 6px 0;
    line-height: 1.3;
  }

  .preview-description {
    font-size: 13px;
    opacity: 0.9;
    margin: 0 0 16px 0;
    line-height: 1.4;
  }

  .preview-buttons {
    display: flex;
    gap: 8px;

    .store-badge {
      height: 30px;
      border-radius: 4px;
    }
  }
}

.preview-right {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .preview-banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #cbd5e0;
    font-size: 14px;

    .el-icon {
      font-size: 40px;
    }
  }
}

.image-upload-wrapper {
  width: 100%;
}

.image-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  &.logo-uploader {
    :deep(.el-upload) {
      width: 150px;
    }
  }
}

.uploaded-image {
  width: 100%;
  height: 200px;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;

  &.small {
    width: 150px;
    height: 150px;
  }

  .el-image {
    width: 100%;
    height: 100%;
  }

  .image-actions {
    position: absolute;
    bottom: 8px;
    right: 8px;
  }
}

.upload-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: border-color 0.3s;

  &.small {
    width: 150px;
    height: 150px;
  }

  &:hover {
    border-color: #FF595A;
  }

  .upload-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .upload-hint {
    font-size: 12px;
    margin-top: 8px;
    color: #bbb;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

// Button icon spacing
:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .el-icon {
    margin: 0;
  }
}

// Utility classes
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.gap-4 {
  gap: 16px;
}
</style>
