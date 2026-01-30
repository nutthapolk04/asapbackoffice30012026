<template>
  <div class="article-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'แก้ไขบทความ' : 'เพิ่มบทความ' }}</h1>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-row :gutter="24">
        <el-col :span="16">
          <div class="content-card">
            <div class="form-section">
              <div class="form-section-title">ข้อมูลบทความ</div>

              <el-form-item label="หัวข้อบทความ" prop="title">
                <el-input
                  v-model="form.title"
                  placeholder="กรอกหัวข้อบทความ"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="Slug (URL)" prop="slug">
                <el-input
                  v-model="form.slug"
                  placeholder="auto-generate-from-title"
                >
                  <template #append>
                    <el-button @click="generateSlug">
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="เนื้อหาบทความ" prop="content">
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

            <div class="form-section">
              <div class="form-section-title">SEO</div>

              <el-form-item label="Meta Title">
                <el-input
                  v-model="form.metaTitle"
                  placeholder="หัวข้อสำหรับ SEO (ถ้าไม่ระบุจะใช้หัวข้อบทความ)"
                  maxlength="60"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="Meta Description">
                <el-input
                  v-model="form.metaDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="คำอธิบายสำหรับ SEO"
                  maxlength="160"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="Focus Keyword">
                <el-input
                  v-model="form.focusKeyword"
                  placeholder="เช่น รถเช่า, ท่องเที่ยว, Deepal"
                />
              </el-form-item>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="content-card">
            <div class="form-section">
              <div class="form-section-title">การตั้งค่า</div>

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

              <el-form-item label="วันที่เผยแพร่/ตั้งเวลา" prop="publishedAt">
                <el-date-picker
                  v-model="form.publishedAt"
                  type="datetime"
                  placeholder="เลือกวันที่และเวลา"
                  format="DD/MM/YYYY HH:mm"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  style="width: 100%;"
                />
              </el-form-item>

              <el-form-item label="สถานะ" prop="status">
                <el-select v-model="form.status" style="width: 100%;">
                  <el-option label="ฉบับร่าง" value="draft" />
                  <el-option label="เผยแพร่" value="published" />
                </el-select>
              </el-form-item>

              <el-form-item label="แท็ก" prop="tags">
                <el-select
                  v-model="form.tags"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="พิมพ์แล้วกด Enter เพื่อเพิ่มแท็ก"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="tag in availableTags"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
                <div class="tags-hint">พิมพ์แท็กแล้วกด Enter เพื่อเพิ่มแท็กใหม่</div>
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="form-section-title">รูปหน้าปก</div>

              <el-form-item prop="coverImage">
                <div class="image-upload-wrapper">
                  <el-upload
                    class="image-uploader"
                    :show-file-list="false"
                    :auto-upload="false"
                    accept="image/*"
                    @change="handleImageChange"
                  >
                    <div v-if="form.coverImage" class="image-preview">
                      <img :src="form.coverImage" />
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
                  <div class="image-hint">แนะนำขนาด: 302 x 242 px (5:4)</div>
                  <el-input
                    v-model="form.coverImageAlt"
                    placeholder="Alt Text (สำหรับ SEO)"
                    class="mt-2"
                  />
                </div>
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="form-section-title">รูปภาพเพิ่มเติม (Gallery)</div>
              
              <div class="gallery-grid">
                <div v-for="(img, index) in form.images" :key="index" class="gallery-item">
                  <img :src="img" />
                  <div class="item-actions">
                    <el-button type="danger" :icon="Delete" circle size="small" @click="removeGalleryImage(index)" />
                  </div>
                </div>
                
                <el-upload
                  class="gallery-uploader"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  multiple
                  @change="handleGalleryUpload"
                >
                  <div class="gallery-add-placeholder">
                    <el-icon><Plus /></el-icon>
                    <span>เพิ่มรูป</span>
                  </div>
                </el-upload>
              </div>
              <div class="image-hint">คุณสามารถอัปโหลดรูปภาพประกอบบทความเพิ่มเติมได้ที่นี่</div>
            </div>

            <div class="form-actions">
              <el-button @click="$router.back()">ยกเลิก</el-button>
              <el-button type="primary" :loading="saving" @click="handleSubmit">
                {{ isEdit ? 'บันทึก' : 'สร้างบทความ' }}
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Refresh } from '@element-plus/icons-vue'
import { useApi } from '@/composables/useApi'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const { getArticle, getArticleCategories, createArticle, updateArticle, createArticleCategory, uploadImage } = useApi()

const formRef = ref()
const saving = ref(false)
const categories = ref([])
const availableTags = ref([
  'สายแคมป์ปิ้ง',
  'รถEV',
  'Deepal',
  'เที่ยวทะเล',
  'เที่ยวภูเขา',
  'รถประหยัด',
  'รถครอบครัว',
  'โปรโมชัน',
  'ขับรถระยะไกล',
  'ท่องเที่ยว'
])

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  slug: '',
  categoryId: null,
  coverImage: '',
  coverImageId: null, // Store ID for Strapi
  coverImageAlt: '',
  content: '',
  publishedAt: new Date().toISOString(),
  metaTitle: '',
  metaDescription: '',
  focusKeyword: '',
  status: 'draft',
  tags: [],
  images: []
})

const rules = {
  title: [
    { required: true, message: 'กรุณากรอกหัวข้อบทความ', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: 'กรุณากรอก Slug', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: 'กรุณาเลือกหมวดหมู่', trigger: 'change' }
  ],
  coverImage: [
    { required: true, message: 'กรุณาอัปโหลดรูปหน้าปก', trigger: 'change' }
  ],
  content: [
    { required: true, message: 'กรุณากรอกเนื้อหาบทความ', trigger: 'blur' }
  ],
  publishedAt: [
    { required: true, message: 'กรุณาเลือกวันที่และเวลา', trigger: 'change' }
  ],
  status: [
    { required: true, message: 'กรุณาเลือกสถานะ', trigger: 'change' }
  ]
}

const generateSlug = () => {
  if (form.title) {
    let slug = form.title
      .toLowerCase()
      .replace(/[^\w\sก-๙-]/g, '') // Allow dash
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') // Collapse dashes
      .substring(0, 100)
    
    // Remove trailing dash
    if (slug.endsWith('-')) {
      slug = slug.slice(0, -1)
    }

    // Mock duplicate check (in real app this should check API)
    // For demo: if title contains "duplicate", append random number
    if (form.title.toLowerCase().includes('duplicate')) {
       slug += `-${Math.floor(Math.random() * 1000)}`
    }

    form.slug = slug
  }
}

// Auto-generate slug when title changes (if slug is empty or user hasn't manually edited it much)
watch(() => form.title, (newTitle) => {
  if (!isEdit.value && newTitle) {
      generateSlug()
  }
})

const handleImageChange = async (file) => {
  try {
    const uploaded = await uploadImage(file.raw)
    form.coverImage = uploaded.url
    form.coverImageId = uploaded.id // Save ID
  } catch (error) {
    ElMessage.error('อัปโหลดรูปภาพล้มเหลว')
  }
}

const handleGalleryUpload = async (file) => {
  try {
    const uploaded = await uploadImage(file.raw)
    form.images.push(uploaded.url)
  } catch (error) {
    ElMessage.error('อัปโหลดรูปภาพล้มเหลว')
  }
}

const removeGalleryImage = (index) => {
  form.images.splice(index, 1)
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
      const slug = value.toLowerCase().replace(/[^\w\sก-๙-]/g, '').replace(/\s+/g, '-')
      const newCat = await createArticleCategory({ 
        name: value, 
        slug: slug, 
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
          await updateArticle(route.params.id, form)
          ElMessage.success('แก้ไขบทความสำเร็จ')
        } else {
          await createArticle(form)
          ElMessage.success('สร้างบทความสำเร็จ')
        }
        router.push('/articles')
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
    categories.value = await getArticleCategories()

    if (isEdit.value) {
      const data = await getArticle(route.params.id)
      if (data) {
        Object.assign(form, data)
      } else {
        ElMessage.error('ไม่พบข้อมูลบทความ')
        router.push('/articles')
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
  margin-bottom: 24px;

  &-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
}

.editor-wrapper {
  width: 100%;
}

.editor-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
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
  aspect-ratio: 5/4;
  max-width: 300px;
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
  aspect-ratio: 5/4;
  max-width: 300px;
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

.tags-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.gallery-item {
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  border: 1px solid #eee;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-actions {
    position: absolute;
    top: 4px;
    right: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .item-actions {
    opacity: 1;
  }
}

.gallery-add-placeholder {
  aspect-ratio: 1;
  border: 2px dashed #eee;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;

  .el-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }

  &:hover {
    border-color: #FF595A;
    color: #FF595A;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
</style>
