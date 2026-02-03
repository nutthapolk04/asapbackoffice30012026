<template>
  <div class="brand-detail">
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="$router.push('/car-models')">
          <el-icon><ArrowLeft /></el-icon>
          <span style="margin-left: 6px;">กลับ</span>
        </el-button>
        <div class="brand-title" v-if="brand">
          <el-image
            :src="brand.logo"
            fit="contain"
            class="brand-logo"
          />
          <h1>{{ brand.name }}</h1>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="searchQuery"
            placeholder="ค้นหารุ่นรถ..."
            style="width: 250px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="imageFilter" placeholder="กรองตามรูปภาพ" style="width: 180px" clearable>
            <el-option label="ทั้งหมด" value="" />
            <el-option label="ยังไม่มีรูป" value="no_image" />
            <el-option label="มีรูปแล้ว" value="has_image" />
          </el-select>
        </div>

        <div class="stats-info">
          <el-tag type="info" effect="plain">
            ทั้งหมด {{ brand?.models.length || 0 }} รุ่น
          </el-tag>
          <el-tag v-if="noImageCount > 0" type="danger" effect="plain">
            <el-icon><Warning /></el-icon>
            ยังไม่มีรูป: {{ noImageCount }} รุ่น
          </el-tag>
          <el-tag v-else type="success" effect="plain">
            มีรูปครบทุกรุ่น
          </el-tag>
        </div>
      </div>

      <div v-loading="loading" class="models-container">
        <div class="models-list">
          <div
            v-for="model in paginatedModels"
            :key="model.id"
            class="model-card"
          >
            <div class="model-content">
              <!-- Thumbnail -->
              <div class="model-thumbnail">
                <el-image
                  v-if="getFirstImage(model)"
                  :src="getFirstImage(model)"
                  fit="cover"
                  class="thumbnail-img"
                />
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>

              <!-- Info -->
              <div class="model-info">
                <div class="model-header">
                  <div class="model-title">
                    <span class="model-name">{{ brand?.name }} {{ model.name }}</span>
                    <el-switch
                      v-model="model.isActive"
                      size="small"
                      @change="handleStatusChange(model)"
                    />
                  </div>
                  <el-button
                    type="primary"
                    size="small"
                    @click="openImageDialog(model)"
                  >
                    <el-icon><Picture /></el-icon>
                    <span style="margin-left: 6px;">จัดการรูปภาพ</span>
                  </el-button>
                </div>

                <div class="model-meta">
                  <span v-if="model.lastImageUpdate" class="last-update">
                    <el-icon><Clock /></el-icon>
                    อัปเดตล่าสุด: {{ formatDate(model.lastImageUpdate) }}
                  </span>
                  <el-tag v-else size="small" type="warning">ยังไม่เคยอัปโหลด</el-tag>
                </div>

                <div class="model-images-preview">
                  <div
                    v-for="(img, index) in model.images"
                    :key="index"
                    class="image-slot-preview"
                    :class="{ 'has-image': img }"
                  >
                    <el-image
                      v-if="img"
                      :src="img"
                      fit="cover"
                      class="preview-img"
                    />
                    <div v-else class="empty-slot">
                      <span>{{ index + 1 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-empty
          v-if="filteredModels.length === 0 && !loading"
          description="ไม่พบข้อมูล"
        />

        <div v-if="filteredModels.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30]"
            :total="filteredModels.length"
            layout="prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- Image Management Dialog -->
    <el-dialog
      v-model="imageDialogVisible"
      :title="`จัดการรูปภาพ - ${brand?.name || ''} ${selectedModel?.name || ''}`"
      width="800px"
      :close-on-click-modal="false"
      class="custom-image-dialog"
    >
      <div class="image-management">
        <div class="info-alert">
          <el-icon><InfoFilled /></el-icon>
          <span>อัปโหลดรูปภาพได้สูงสุด 6 รูป ลำดับการแสดงผลจะเรียงตาม รูป 1, 2, 3, 4, 5, 6</span>
        </div>

        <div class="image-slots">
          <div
            v-for="(img, index) in editingImages"
            :key="index"
            class="image-slot"
          >
            <div class="slot-header">
              <span class="slot-number">รูปที่ {{ index + 1 }}</span>
              <el-button
                v-if="img"
                class="btn-delete-image"
                @click="removeImage(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <div class="slot-content">
              <div v-if="img" class="image-preview">
                <el-image
                  :src="img"
                  fit="cover"
                  class="slot-image"
                />
              </div>
              <el-upload
                v-else
                class="image-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="(file) => handleImageSelect(file, index)"
                accept="image/*"
              >
                <div class="upload-placeholder">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span class="upload-text">อัปโหลดรูป</span>
                </div>
              </el-upload>
            </div>
          </div>
        </div>

        <div class="dialog-footer-info">
          <span class="recommend-text">
            ขนาดรูปที่แนะนำ 400x300 pixel ( อัตราส่วน 4:3 )
          </span>
        </div>
      </div>

      <template #footer>
        <div class="footer-buttons">
          <el-button class="btn-cancel" @click="imageDialogVisible = false">ยกเลิก</el-button>
          <el-button type="primary" class="btn-save" @click="saveImages" :loading="saving">
            บันทึก
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const { getCarBrand, updateCarModelImages, updateCarModelStatus } = useApi()

const loading = ref(false)
const saving = ref(false)
const brand = ref(null)
const searchQuery = ref('')
const imageFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Image dialog state
const imageDialogVisible = ref(false)
const selectedModel = ref(null)
const editingImages = ref([null, null, null, null, null, null])

const hasImage = (model) => {
  return model.images.some(img => img !== null)
}

const noImageCount = computed(() => {
  if (!brand.value) return 0
  return brand.value.models.filter(m => !hasImage(m)).length
})

const filteredModels = computed(() => {
  if (!brand.value) return []

  let models = [...brand.value.models]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    models = models.filter(model => model.name.toLowerCase().includes(query))
  }

  // Image filter
  if (imageFilter.value) {
    models = models.filter(model => {
      if (imageFilter.value === 'no_image') return !hasImage(model)
      if (imageFilter.value === 'has_image') return hasImage(model)
      return true
    })
  }

  return models
})

const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredModels.value.slice(start, end)
})

const getFirstImage = (model) => {
  return model.images.find(img => img !== null)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchBrand = async () => {
  loading.value = true
  try {
    brand.value = await getCarBrand(route.params.id)
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (model) => {
  try {
    await updateCarModelStatus(brand.value.id, model.id, model.isActive)
    ElMessage.success('อัปเดตสถานะสำเร็จ')
  } catch (error) {
    ElMessage.error('ไม่สามารถอัปเดตสถานะได้')
    model.isActive = !model.isActive
  }
}

const openImageDialog = (model) => {
  selectedModel.value = model
  editingImages.value = [...model.images]
  imageDialogVisible.value = true
}

const handleImageSelect = (file, index) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    editingImages.value[index] = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const removeImage = (index) => {
  editingImages.value[index] = null
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handlePageChange = (val) => {
  currentPage.value = val
}

const saveImages = async () => {
  saving.value = true
  try {
    await updateCarModelImages(
      brand.value.id,
      selectedModel.value.id,
      [...editingImages.value]
    )

    // Update local state
    const model = brand.value.models.find(m => m.id === selectedModel.value.id)
    if (model) {
      model.images = [...editingImages.value]
      model.lastImageUpdate = new Date().toISOString()
    }

    ElMessage.success('บันทึกรูปภาพสำเร็จ')
    imageDialogVisible.value = false
  } catch (error) {
    ElMessage.error('ไม่สามารถบันทึกรูปภาพได้')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchBrand()
})
</script>

<style lang="scss" scoped>
.page-header {
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .brand-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .brand-logo {
      width: 40px;
      height: 40px;
    }

    h1 {
      margin: 0;
    }
  }
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-info {
  display: flex;
  gap: 12px;
  align-items: center;

  .el-tag {
    height: 32px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    white-space: nowrap;
    transition: all 0.3s ease;
    border-width: 1px;

    :deep(.el-tag__content) {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 100%;
    }

    .el-icon {
      font-size: 18px;
      margin: 0;
      position: relative;
      top: -1px; /* Optical adjustment */
    }

    &.el-tag--danger {
      background-color: #fff1f0;
      border-color: #ffccc7;
      color: #ff4d4f;

      .el-icon {
        color: #ff4d4f;
      }
    }
  }
}

.models-container {
  min-height: 200px;
}

.models-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #eee;
}

.model-content {
  display: flex;
  gap: 16px;
}

.model-thumbnail {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  background: #e8e8e8;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 32px;
}

.model-info {
  flex: 1;
  min-width: 0;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.model-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.model-meta {
  margin-bottom: 10px;
}

.last-update {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.model-images-preview {
  display: grid;
  grid-template-columns: repeat(6, 96px);
  gap: 8px;
}

.image-slot-preview {
  aspect-ratio: 4/3;
  border-radius: 4px;
  overflow: hidden;
  background: #e8e8e8;

  &.has-image {
    background: #FF595A;
  }
}

.preview-img {
  width: 100%;
  height: 100%;
}

.empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 11px;
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

// Image Dialog styles
.custom-image-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    padding: 24px;
    
    .el-dialog__header {
      padding: 0 0 20px 0;
      margin: 0;
      border-bottom: 1px solid #f0f0f0;
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .el-dialog__body {
      padding: 24px 0;
    }

    .el-dialog__footer {
      padding: 20px 0 0 0;
      border-top: 1px solid #f0f0f0;
    }
  }
}

.image-management {
  .info-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #f0f2f5;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    color: #8c8c8c;
    font-size: 14px;

    .el-icon {
      font-size: 16px;
    }
  }
}

.image-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.image-slot {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  transition: all 0.3s ease;

  &:hover {
    border-color: #d9d9d9;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.slot-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.btn-delete-image {
  padding: 4px;
  height: auto;
  color: #ff4d4f;
  background: transparent;
  border: none;
  font-size: 16px;
  
  &:hover {
    color: #ff7875;
    background: #fff1f0;
  }
}

.slot-content {
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.image-preview {
  width: 100%;
  height: 100%;
  
  .slot-image {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #FF595A;
    background: #fff5f5;
    
    .upload-icon, .upload-text {
      color: #FF595A;
    }
  }

  .upload-icon {
    font-size: 32px;
    color: #bfbfbf;
    margin-bottom: 8px;
  }

  .upload-text {
    font-size: 13px;
    color: #8c8c8c;
  }
}

.dialog-footer-info {
  margin-top: 24px;
  
  .recommend-text {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    
    .primary-text {
      color: #2e7d32;
      margin-right: 4px;
    }
  }
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 500;
    height: 40px;
  }

  .btn-cancel {
    background: #fff;
    border: 1px solid #d9d9d9;
    color: #595959;

    &:hover {
      border-color: #40a9ff;
      color: #40a9ff;
    }
  }

  .btn-save {
    background: #FF595A;
    border-color: #FF595A;
    
    &:hover {
      background: #ff7875;
      border-color: #ff7875;
    }
  }
}

:deep(.el-upload) {
  width: 100%;
  height: 100%;
}
</style>
