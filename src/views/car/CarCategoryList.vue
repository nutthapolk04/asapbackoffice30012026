<template>
  <div class="car-category-list">
    <!-- Sticky Header -->
    <div class="sticky-header">
      <div class="page-header">
        <h1>จัดการประเภทกลุ่มรถ</h1>
        <el-button type="primary" @click="openDialog()">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 6px;">เพิ่มประเภทกลุ่มรถ</span>
        </el-button>
      </div>

      <!-- Stats Summary -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ categories.length }}</span>
          <span class="stat-label">ประเภททั้งหมด</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ activeCount }}</span>
          <span class="stat-label">เปิดใช้งาน</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalCars }}</span>
          <span class="stat-label">รถทั้งหมด</span>
        </div>
      </div>
    </div>

    <!-- Category Cards -->
    <div class="content-card" v-loading="loading">
      <div class="category-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          :class="{ 'is-inactive': !category.isActive }"
        >
          <div class="card-image">
            <el-image
              v-if="category.image"
              :src="category.image"
              fit="cover"
              :preview-src-list="[category.image]"
            />
            <div v-else class="image-placeholder">
              <el-icon :size="40"><Picture /></el-icon>
            </div>
            <div class="card-badge">
              <span class="order-badge">#{{ category.order }}</span>
            </div>
            <div class="card-status">
              <el-tag :type="category.isActive ? 'success' : 'info'" size="small" effect="dark">
                {{ category.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
              </el-tag>
            </div>
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ category.name }}</h3>
            <div class="card-meta">
              <div class="sippcode-badges">
                <code
                  v-for="(code, idx) in (category.sippcodes || [])"
                  :key="idx"
                  class="sippcode-badge"
                >{{ code }}</code>
              </div>
              <span class="car-count">
                <el-icon><Van /></el-icon>
                {{ category.carCount || 0 }} รุ่น
              </span>
            </div>
          </div>

          <div class="card-actions">
            <el-switch
              v-model="category.isActive"
              size="small"
              @change="handleStatusChange(category)"
            />
            <div class="action-buttons">
              <el-button type="primary" size="small" circle @click="openDialog(category)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" size="small" circle @click="handleDelete(category)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingCategory ? 'แก้ไขประเภทกลุ่มรถ' : 'เพิ่มประเภทกลุ่มรถ'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="รูปภาพประเภทกลุ่มรถ" prop="image">
          <div class="image-upload-wrapper">
            <el-upload
              class="image-uploader"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleImageChange"
              accept="image/*"
            >
              <div v-if="form.image" class="uploaded-image">
                <el-image :src="form.image" fit="contain" />
                <div class="image-actions">
                  <el-button type="danger" size="small" @click.stop="removeImage">
                    <el-icon><Delete /></el-icon>
                    <span>ลบรูป</span>
                  </el-button>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span>อัปโหลดรูปภาพ</span>
                <p class="upload-hint">แนะนำขนาด 400x300 px</p>
              </div>
            </el-upload>
          </div>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="ชื่อประเภทกลุ่มรถ" prop="name">
              <el-input
                v-model="form.name"
                placeholder="เช่น Economy, SUV, EV Car"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ลำดับ" prop="order">
              <el-input-number v-model="form.order" :min="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Sippcode" required>
          <div class="sippcode-list">
            <div
              v-for="(code, index) in form.sippcodes"
              :key="index"
              class="sippcode-item"
            >
              <el-select
                v-model="form.sippcodes[index]"
                placeholder="เลือก Sippcode"
                filterable
              >
                <el-option
                  v-for="item in sippcodeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                  :disabled="form.sippcodes.includes(item) && form.sippcodes[index] !== item"
                />
              </el-select>
              <el-button
                v-if="form.sippcodes.length > 1"
                type="danger"
                circle
                size="small"
                @click="removeSippcode(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <div class="add-sippcode" @click="addSippcode">
              <el-icon><Plus /></el-icon>
              <span>Add another</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="สถานะ">
          <el-switch
            v-model="form.isActive"
            active-text="เปิดใช้งาน"
            inactive-text="ปิดใช้งาน"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">ยกเลิก</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          <el-icon><Check /></el-icon>
          <span>บันทึก</span>
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApi } from '@/composables/useApi'
import { Check, Van } from '@element-plus/icons-vue'

const {
  getCarCategories,
  createCarCategory,
  updateCarCategory,
  deleteCarCategory
} = useApi()

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const categories = ref([])
const editingCategory = ref(null)
const formRef = ref()
const sippcodeOptions = ['ECAR', 'CCAR', 'SCAR', 'IFAR', 'EVAR', 'HCAR', 'HCMR', 'LCAR', 'PCAR', 'FCAR', 'PFAR', 'LFAR', 'SFAR']

const activeCount = computed(() => categories.value.filter(c => c.isActive).length)
const totalCars = computed(() => categories.value.reduce((sum, c) => sum + (c.carCount || 0), 0))

const form = reactive({
  name: '',
  sippcodes: [''],
  image: '',
  order: 1,
  isActive: true
})

const rules = {
  name: [{ required: true, message: 'กรุณากรอกชื่อประเภทกลุ่มรถ', trigger: 'blur' }],
  order: [{ required: true, message: 'กรุณากรอกลำดับ', trigger: 'blur' }]
}

const addSippcode = () => {
  form.sippcodes.push('')
}

const removeSippcode = (index) => {
  form.sippcodes.splice(index, 1)
}

const handleImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.image = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const removeImage = () => {
  form.image = ''
}

const fetchCategories = async () => {
  loading.value = true
  try {
    categories.value = await getCarCategories()
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const openDialog = (category = null) => {
  editingCategory.value = category
  if (category) {
    Object.assign(form, {
      name: category.name,
      sippcodes: category.sippcodes?.length ? [...category.sippcodes] : [''],
      image: category.image,
      order: category.order,
      isActive: category.isActive
    })
  } else {
    form.name = ''
    form.sippcodes = ['']
    form.image = ''
    form.order = categories.value.length + 1
    form.isActive = true
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (editingCategory.value) {
          await updateCarCategory(editingCategory.value.id, form)
          ElMessage.success('แก้ไขประเภทกลุ่มรถสำเร็จ')
        } else {
          await createCarCategory(form)
          ElMessage.success('สร้างประเภทกลุ่มรถสำเร็จ')
        }
        dialogVisible.value = false
        fetchCategories()
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleStatusChange = async (row) => {
  try {
    await updateCarCategory(row.id, { isActive: row.isActive })
    ElMessage.success('อัปเดตสถานะสำเร็จ')
  } catch (error) {
    ElMessage.error('ไม่สามารถอัปเดตสถานะได้')
    row.isActive = !row.isActive
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบประเภทกลุ่มรถ "${row.name}" ใช่หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    await deleteCarCategory(row.id)
    ElMessage.success('ลบประเภทกลุ่มรถสำเร็จ')
    fetchCategories()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('ไม่สามารถลบได้')
    }
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.car-category-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }
}

// Sticky Header
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #F9F9F9;
  margin-left: -24px;
  margin-right: -24px;
  padding: 24px 24px 24px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

// Stats Row
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  .stat-item {
    background: #fff;
    border-radius: 12px;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #FF595A;
    }

    .stat-label {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }
  }
}

// Category Grid
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  &.is-inactive {
    opacity: 0.6;

    .card-image {
      filter: grayscale(50%);
    }
  }

  .card-image {
    position: relative;
    height: 160px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);

    .el-image {
      width: 100%;
      height: 100%;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccc;
    }

    .card-badge {
      position: absolute;
      top: 12px;
      left: 12px;

      .order-badge {
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
    }

    .card-status {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  .card-content {
    padding: 16px;

    .card-title {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1D2433;
    }

    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .sippcode-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .sippcode-badge {
        background: #e8f5e9;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        color: #2e7d32;
        font-weight: 500;
      }

      .car-count {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #666;

        .el-icon {
          color: #FF595A;
        }
      }
    }
  }

  .card-actions {
    padding: 12px 16px;
    border-top: 1px solid #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

// Dialog styles
.image-upload-wrapper {
  width: 100%;
}

.image-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }
}

.uploaded-image {
  width: 100%;
  height: 200px;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  overflow: hidden;
  background: #fafafa;

  .el-image {
    width: 100%;
    height: 100%;
  }

  .image-actions {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }
}

.upload-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #FF595A;
    color: #FF595A;
  }

  .upload-icon {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .upload-hint {
    font-size: 12px;
    margin-top: 8px;
    color: #bbb;
  }
}

// Sippcode list in dialog
.sippcode-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sippcode-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input {
    flex: 1;
  }
}

.add-sippcode {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #67c23a;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.3s;

  &:hover {
    color: #529b2e;
  }

  .el-icon {
    font-size: 16px;
  }
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
</style>
