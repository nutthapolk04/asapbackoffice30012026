<template>
  <div class="category-list">
    <div class="page-header">
      <h1>หมวดหมู่บทความ</h1>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px;">เพิ่มหมวดหมู่</span>
      </el-button>
    </div>

    <div class="content-card">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="categories"
        style="width: 100%"
        row-key="id"
      >

        <el-table-column width="60" align="center">
          <template #default>
            <el-icon class="drag-handle"><Rank /></el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="order" label="ลำดับ" width="80" align="center" />

        <el-table-column prop="name" label="ชื่อหมวดหมู่" min-width="200" />

        <el-table-column prop="slug" label="Slug" min-width="150">
          <template #default="{ row }">
            <code>{{ row.slug }}</code>
          </template>
        </el-table-column>

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
          <el-input
            v-model="form.name"
            placeholder="กรอกชื่อหมวดหมู่"
            @blur="generateSlug"
          />
        </el-form-item>

        <el-form-item label="Slug" prop="slug">
          <el-input v-model="form.slug" placeholder="auto-generate" />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Sortable from 'sortablejs'
import { useApi } from '@/composables/useApi'

const {
  getArticleCategories,
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
  reorderArticleCategories
} = useApi()

const tableRef = ref(null)

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const categories = ref([])
const editingCategory = ref(null)
const formRef = ref()

const form = reactive({
  name: '',
  slug: '',
  order: 1,
  isActive: true
})

const rules = {
  name: [{ required: true, message: 'กรุณากรอกชื่อหมวดหมู่', trigger: 'blur' }],
  slug: [{ required: true, message: 'กรุณากรอก Slug', trigger: 'blur' }],
  order: [{ required: true, message: 'กรุณากรอกลำดับ', trigger: 'blur' }]
}

const generateSlug = () => {
  if (form.name && !form.slug) {
    form.slug = form.name
      .toLowerCase()
      .replace(/[^\w\sก-๙]/g, '')
      .replace(/\s+/g, '-')
  }
}

const fetchCategories = async () => {
  loading.value = true
  try {
    categories.value = await getArticleCategories()
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
    form.slug = ''
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
          await updateArticleCategory(editingCategory.value.id, form)
          ElMessage.success('แก้ไขหมวดหมู่สำเร็จ')
        } else {
          await createArticleCategory(form)
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
    await updateArticleCategory(row.id, { isActive: row.isActive })
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

    await deleteArticleCategory(row.id)
    ElMessage.success('ลบหมวดหมู่สำเร็จ')
    fetchCategories()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('ไม่สามารถลบได้')
    }
  }
}

onMounted(() => {
  fetchCategories().then(() => {
    nextTick(() => {
      initSortable()
    })
  })
})

const initSortable = () => {
  if (!tableRef.value) return
  
  const el = tableRef.value.$el.querySelector('tbody')
  if (!el) return

  Sortable.create(el, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: async ({ oldIndex, newIndex }) => {
      const targetRow = categories.value.splice(oldIndex, 1)[0]
      categories.value.splice(newIndex, 0, targetRow)
      
      categories.value.forEach((c, index) => {
        c.order = index + 1
      })

      try {
        const newOrderIds = categories.value.map(c => c.id)
        await reorderArticleCategories(newOrderIds)
        ElMessage.success('จัดลำดับสำเร็จ')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาดในการจัดลำดับ')
        fetchCategories()
      }
    }
  })
}
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

code {
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
