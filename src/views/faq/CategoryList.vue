<template>
  <div class="category-list">
    <div class="page-header">
      <h1>หมวดหมู่คำถาม</h1>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px;">เพิ่มหมวดหมู่</span>
      </el-button>
    </div>

    <div class="content-card">
      <el-table
        v-loading="loading"
        :data="categories"
        style="width: 100%"
      >
        <el-table-column width="60" align="center">
          <template #default>
            <el-icon class="drag-handle"><Rank /></el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="order" label="ลำดับ" width="80" align="center" />

        <el-table-column prop="name" label="ชื่อหมวดหมู่" min-width="250" />

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
              <el-button type="primary" text @click="openDialog(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" text @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="ชื่อหมวดหมู่" prop="name">
          <el-input v-model="form.name" placeholder="กรอกชื่อหมวดหมู่" />
        </el-form-item>

        <el-form-item label="ลำดับ" prop="order">
          <el-input-number v-model="form.order" :min="1" style="width: 100%;" />
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
          บันทึก
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApi } from '@/composables/useApi'

const {
  getFAQCategories,
  createFAQCategory,
  updateFAQCategory,
  deleteFAQCategory
} = useApi()

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const categories = ref([])
const editingCategory = ref(null)
const formRef = ref()

const form = reactive({
  name: '',
  order: 1,
  isActive: true
})

const rules = {
  name: [{ required: true, message: 'กรุณากรอกชื่อหมวดหมู่', trigger: 'blur' }],
  order: [{ required: true, message: 'กรุณากรอกลำดับ', trigger: 'blur' }]
}

const fetchCategories = async () => {
  loading.value = true
  try {
    categories.value = await getFAQCategories()
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const openDialog = (category = null) => {
  editingCategory.value = category
  if (category) {
    Object.assign(form, category)
  } else {
    form.name = ''
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
          await updateFAQCategory(editingCategory.value.id, form)
          ElMessage.success('แก้ไขหมวดหมู่สำเร็จ')
        } else {
          await createFAQCategory(form)
          ElMessage.success('สร้างหมวดหมู่สำเร็จ')
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
    await updateFAQCategory(row.id, { isActive: row.isActive })
    ElMessage.success('อัปเดตสถานะสำเร็จ')
  } catch (error) {
    ElMessage.error('ไม่สามารถอัปเดตสถานะได้')
    row.isActive = !row.isActive
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบหมวดหมู่ "${row.name}" ใช่หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    await deleteFAQCategory(row.id)
    ElMessage.success('ลบหมวดหมู่สำเร็จ')
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
.drag-handle {
  cursor: move;
  color: #999;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px;
}
</style>
