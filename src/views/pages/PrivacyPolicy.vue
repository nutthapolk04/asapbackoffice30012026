<template>
  <div class="privacy-policy">
    <div class="page-header">
      <h1>นโยบายความเป็นส่วนตัว</h1>
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
        <div class="form-section-title">ข้อมูลทั่วไป</div>

        <el-form-item label="หัวข้อ" prop="title">
          <el-input
            v-model="form.title"
            placeholder="นโยบายความเป็นส่วนตัว"
          />
        </el-form-item>

        <el-form-item label="วันที่อัปเดตล่าสุด" prop="lastUpdated">
          <el-date-picker
            v-model="form.lastUpdated"
            type="date"
            placeholder="เลือกวันที่"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            style="width: 200px;"
          />
        </el-form-item>
      </div>

      <div class="form-section">
        <div class="form-section-title">เนื้อหา</div>

        <el-form-item prop="content">
          <div class="editor-wrapper">
            <QuillEditor
              v-model:content="form.content"
              contentType="html"
              theme="snow"
              toolbar="full"
              style="height: 400px"
            />
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
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const { getPrivacyPolicy, updatePrivacyPolicy } = useApi()

const formRef = ref()
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  title: '',
  content: '',
  lastUpdated: ''
})

const rules = {
  title: [{ required: true, message: 'กรุณากรอกหัวข้อ', trigger: 'blur' }],
  content: [{ required: true, message: 'กรุณากรอกเนื้อหา', trigger: 'blur' }],
  lastUpdated: [{ required: true, message: 'กรุณาเลือกวันที่', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getPrivacyPolicy()
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
        await updatePrivacyPolicy(form)
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

.editor-wrapper {
  width: 100%;
  
  :deep(.ql-editor) {
    min-height: 200px;
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
