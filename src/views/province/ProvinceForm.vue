<template>
  <div class="province-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'แก้ไขจังหวัด' : 'เพิ่มจังหวัด' }}</h1>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="content-card"
    >
      <div class="form-section">
        <div class="form-section-title">ข้อมูลจังหวัด</div>

        <el-form-item label="ชื่อจังหวัด" prop="name">
          <el-input
            v-model="form.name"
            placeholder="กรอกชื่อจังหวัด"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="ลิงก์ URL (ถ้ามี)" prop="link">
          <el-input
            v-model="form.link"
            placeholder="/search?province=xxx หรือ https://example.com"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="ลำดับการแสดง" prop="order">
              <el-input-number
                v-model="form.order"
                :min="1"
                :max="10"
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

        <el-form-item prop="branches">
          <div class="branch-selection-wrapper">
            <el-select
              v-model="form.branches"
              multiple
              filterable
              placeholder="เลือกสาขาเพิ่ม"
              style="width: 100%; margin-bottom: 24px;"
            >
              <el-option
                v-for="branch in availableBranches"
                :key="branch.id"
                :label="branch.name"
                :value="branch.id"
              />
            </el-select>
          </div>

          <div v-if="selectedBranchesDetails.length > 0" class="selected-branches-list">
            <div v-for="branch in selectedBranchesDetails" :key="branch.id" class="branch-item-card">
              <div class="branch-item-info">
                <div class="branch-item-header">
                  <div class="branch-badges">
                    <el-tag size="small" :type="branch.type === 'airport' ? 'primary' : 'success'" effect="light" round>
                      {{ branch.type === 'airport' ? 'สนามบิน' : 'สาขาปกติ' }}
                    </el-tag>
                    <el-tag v-if="branch.isMaintenance" size="small" type="danger" effect="dark" round>
                      Maintenance
                    </el-tag>
                  </div>
                </div>
                <div class="branch-name">{{ branch.name }}</div>
                <div class="branch-item-meta">
                  <span v-if="branch.mapEmbed" class="has-map">
                    <el-icon><LocationInformation /></el-icon> มีพิกัดแผนที่แล้ว
                  </span>
                  <span v-else class="no-map">
                    <el-icon><MapLocation /></el-icon> ยังไม่มีพิกัด
                  </span>
                </div>
              </div>
              <div class="branch-item-actions">
                <el-button size="small" @click="openBranchEdit(branch)">
                  <el-icon><Setting /></el-icon>
                  <span>ตั้งค่า</span>
                </el-button>
                <el-button size="small" type="danger" plain class="btn-remove" @click="removeBranch(branch.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div class="field-hint">เลือกสาขาที่อยู่ภายใต้การบริหารจัดการของจังหวัดนี้</div>
        </el-form-item>
      </div>

      <div class="form-section">
        <div class="form-section-title">รูปภาพจังหวัด</div>

        <el-form-item prop="image">
          <div class="image-upload-wrapper">
            <el-upload
              class="image-uploader"
              :show-file-list="false"
              :auto-upload="false"
              accept="image/*"
              @change="handleImageChange"
            >
              <div v-if="form.image" class="image-preview">
                <img :src="form.image" />
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
            <div class="image-hint">แนะนำขนาด: 570 x 320 px</div>
            <el-input
              v-model="form.imageAlt"
              placeholder="Alt Text (สำหรับ SEO)"
              class="mt-2"
            />
          </div>
        </el-form-item>
      </div>

      <div class="form-actions">
        <el-button @click="$router.back()">ยกเลิก</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างจังหวัด' }}
        </el-button>
      </div>
    </el-form>

    <!-- Branch Edit Dialog -->
    <el-dialog
      v-model="branchDialogVisible"
      title="แก้ไขข้อมูลสาขา"
      width="600px"
      append-to-body
    >
      <el-form :model="branchForm" label-position="top">
        <el-form-item label="ชื่อสาขา" prop="name">
          <el-input v-model="branchForm.name" disabled />
        </el-form-item>
        
        <el-form-item label="ประเภทสาขา" prop="type">
          <el-radio-group v-model="branchForm.type">
            <el-radio-button label="airport">สนามบิน (Airport)</el-radio-button>
            <el-radio-button label="branch">สาขาปกติ (Branch)</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="สถานะสาขา" prop="isMaintenance">
          <el-switch
            v-model="branchForm.isMaintenance"
            active-text="ปิดปรับปรุง (Maintenance)"
            inactive-text="เปิดให้บริการปกติ"
            active-color="#F56C6C"
          />
        </el-form-item>

        <el-form-item label="Google Maps Embed Code" prop="mapEmbed">
          <el-input
            v-model="branchForm.mapEmbed"
            type="textarea"
            :rows="4"
            placeholder="เช่น <iframe src='https://www.google.com/maps/embed...' ...></iframe>"
          />
          <div class="field-hint">เมื่อใส่พิกัดแผนที่แล้ว ในหน้าเว็บจะแสดงปุ่มให้ลูกค้าดูสถานที่ตั้งได้ทันที</div>
          
          <div v-if="branchForm.mapEmbed" class="map-preview-section">
            <div class="preview-label">
              <el-icon><View /></el-icon>
              <span>ตัวอย่างการแสดงผลบนหน้าเว็บ</span>
            </div>
            <div class="map-preview-card" v-html="branchForm.mapEmbed"></div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="branchDialogVisible = false">ยกเลิก</el-button>
        <el-button type="primary" @click="saveBranchDetails" :loading="branchSaving">ตกลง</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const { getProvince, createProvince, updateProvince, getBranches, updateBranch } = useApi()

const formRef = ref()
const saving = ref(false)
const availableBranches = ref([])

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  image: '',
  imageAlt: '',
  link: '',
  order: 1,
  isActive: true,
  branches: []
})

// Branch management state
const branchDialogVisible = ref(false)
const branchSaving = ref(false)
const branchForm = reactive({
  id: null,
  name: '',
  type: 'branch',
  isMaintenance: false,
  mapEmbed: ''
})

const selectedBranchesDetails = computed(() => {
  return availableBranches.value.filter(b => form.branches.includes(b.id))
})

const rules = {
  name: [
    { required: true, message: 'กรุณากรอกชื่อจังหวัด', trigger: 'blur' }
  ],
  image: [
    { required: true, message: 'กรุณาอัปโหลดรูปภาพ', trigger: 'change' }
  ],
  order: [
    { required: true, message: 'กรุณากรอกลำดับ', trigger: 'blur' }
  ]
}

const handleImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.image = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const openBranchEdit = (branch) => {
  Object.assign(branchForm, {
    id: branch.id,
    name: branch.name,
    type: branch.type || 'branch',
    isMaintenance: branch.isMaintenance || false,
    mapEmbed: branch.mapEmbed || ''
  })
  branchDialogVisible.value = true
}

const removeBranch = (branchId) => {
  form.branches = form.branches.filter(id => id !== branchId)
}

const saveBranchDetails = async () => {
  branchSaving.value = true
  try {
    // In real app, call updateBranch API
    await updateBranch(branchForm.id, {
      type: branchForm.type,
      isMaintenance: branchForm.isMaintenance,
      mapEmbed: branchForm.mapEmbed
    })
    
    // Update local state to reflect changes instantly
    const index = availableBranches.value.findIndex(b => b.id === branchForm.id)
    if (index !== -1) {
      availableBranches.value[index] = { ...availableBranches.value[index], ...branchForm }
    }
    
    ElMessage.success('อัปเดตข้อมูลสาขาเรียบร้อย')
    branchDialogVisible.value = false
  } catch (error) {
    ElMessage.error('บันทึกไม่สำเร็จ')
  } finally {
    branchSaving.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await updateProvince(route.params.id, form)
          ElMessage.success('แก้ไขจังหวัดสำเร็จ')
        } else {
          await createProvince(form)
          ElMessage.success('สร้างจังหวัดสำเร็จ')
        }
        router.push('/provinces')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
      } finally {
        saving.value = false
      }
    }
  })
}

const loadData = async () => {
  try {
    // Load branches first
    availableBranches.value = await getBranches()

    // Load province data if editing
    if (isEdit.value) {
      const data = await getProvince(route.params.id)
      if (data) {
        Object.assign(form, {
          ...data,
          branches: data.branches || []
        })
      } else {
        ElMessage.error('ไม่พบข้อมูลจังหวัด')
        router.push('/provinces')
      }
    }
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
    if (isEdit.value) {
      router.push('/provinces')
    }
  }
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
  max-width: 400px;
}

.image-uploader {
  :deep(.el-upload) {
    width: 100%;
  }
}

.image-preview {
  width: 100%;
  height: 225px;
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
  height: 225px;
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

.image-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.field-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.selected-branches-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1600px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.branch-item-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF595A;
    box-shadow: 0 4px 16px rgba(255, 89, 90, 0.12);
    transform: translateY(-4px);
  }

  .branch-item-info {
    flex: 1;
    margin-bottom: 16px;
  }

  .branch-item-header {
    margin-bottom: 10px;
    
    .branch-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .branch-name {
    font-weight: 700;
    color: #1a1f25;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 40px;
  }

  .branch-item-meta {
    font-size: 11px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #8c98a5;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .has-map {
      color: #10b981;
      font-weight: 600;
    }
  }
  
  .branch-item-actions {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #f8f9fa;
    
    .el-button {
      flex: 1;
      height: 32px;
      padding: 0 8px;
      font-size: 12px;
      
      &.btn-remove {
        flex: 0 0 32px;
        color: #ff4d4f;
        background: #fff1f0;
        border: 1px solid #ffccc7;
        
        &:hover {
          background: #ff4d4f;
          color: white;
          border-color: #ff4d4f;
        }
      }
    }
  }
}

.map-preview-section {
  margin-top: 16px;
  
  .preview-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #606266;
    margin-bottom: 8px;
  }

  .map-preview-card {
    width: 100%;
    height: 200px;
    background: #f0f2f5;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
    
    :deep(iframe) {
      width: 100% !important;
      height: 100% !important;
      border: 0;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
</style>
