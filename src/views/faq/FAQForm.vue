<template>
  <div class="faq-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'แก้ไขคำถาม' : 'เพิ่มคำถาม' }}</h1>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="content-card"
    >
      <div class="form-section">
        <div class="form-section-title">ข้อมูลคำถาม</div>

        <el-form-item label="คำถาม" prop="title">
          <el-input
            v-model="form.title"
            placeholder="กรอกคำถาม"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="คำตอบ" prop="detail">
          <div class="editor-wrapper">
            <QuillEditor
              v-model:content="form.detail"
              contentType="html"
              theme="snow"
              toolbar="full"
              style="height: 300px"
              placeholder="กรอกคำตอบที่นี่..."
            />
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="หมวดหมู่" prop="categoryId">
              <div style="display: flex; gap: 8px;">
                <el-select
                  v-model="form.categoryId"
                  placeholder="เลือกหมวดหมู่"
                  style="flex: 1;"
                  filterable
                >
                  <el-option
                    v-for="cat in categories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
                <el-button @click="handleAddCategory" :icon="Plus" circle />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ลำดับ" prop="order">
              <el-input-number
                v-model="form.order"
                :min="1"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="สถานะ" prop="status">
              <el-select v-model="form.status" style="width: 100%;">
                <el-option label="ฉบับร่าง" value="draft" />
                <el-option label="เผยแพร่" value="published" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="form-actions">
        <el-button @click="$router.back()">ยกเลิก</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างคำถาม' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useApi } from '@/composables/useApi'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const { getFAQ, getFAQCategories, createFAQ, updateFAQ, createFAQCategory } = useApi()

const formRef = ref()
const saving = ref(false)
const categories = ref([])

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  detail: '',
  categoryId: null,
  order: 1,
  status: 'draft'
})

const rules = {
  title: [
    { required: true, message: 'กรุณากรอกคำถาม', trigger: 'blur' }
  ],
  detail: [
    { required: true, message: 'กรุณากรอกคำตอบ', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: 'กรุณาเลือกหมวดหมู่', trigger: 'change' }
  ],
  order: [
    { required: true, message: 'กรุณากรอกลำดับ', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'กรุณาเลือกสถานะ', trigger: 'change' }
  ]
}



const handleAddCategory = async () => {
  try {
    const { value } = await ElMessageBox.prompt('กรุณากรอกชื่อหมวดหมู่ใหม่', 'เพิ่มหมวดหมู่', {
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      inputPattern: /\S/,
      inputErrorMessage: 'กรุณากรอกชื่อหมวดหมู่'
    })

    if (value) {
      const newCat = await createFAQCategory({ 
        name: value, 
        isActive: true, 
        order: categories.value.length + 1 
      })
      
      categories.value.push(newCat)
      form.categoryId = newCat.id
      ElMessage.success('เพิ่มหมวดหมู่สำเร็จ')
    }
  } catch (error) {
    // Cancelled
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await updateFAQ(route.params.id, form)
          ElMessage.success('แก้ไขคำถามสำเร็จ')
        } else {
          await createFAQ(form)
          ElMessage.success('สร้างคำถามสำเร็จ')
        }
        router.push('/faqs')
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
    categories.value = await getFAQCategories()

    if (isEdit.value) {
      const data = await getFAQ(route.params.id)
      if (data) {
        Object.assign(form, data)
      } else {
        ElMessage.error('ไม่พบข้อมูลคำถาม')
        router.push('/faqs')
      }
    }
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
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

.editor-wrapper {
  width: 100%;
  background: #fff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
</style>
