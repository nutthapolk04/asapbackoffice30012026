<template>
  <div class="about-us-page">
    <div class="page-header">
      <h1>จัดการหน้า "เกี่ยวกับเรา"</h1>
      <div class="header-actions">
        <el-button type="primary" :loading="saving" @click="handleSave">
          บันทึกการเปลี่ยนแปลง
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="content-tabs" type="border-card">
      <!-- 1. Hero Section -->
      <el-tab-pane label="ส่วนหัว" name="hero">
        <div class="form-section">
          <div class="form-section-title">ส่วนหัวเว็บไซต์</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="หัวข้อหลัก (Title)">
                  <el-input v-model="form.hero.title" placeholder="เช่น เราคือผู้ให้บริการ..." />
                </el-form-item>
                <el-form-item label="คำโปรย (Subtitle)">
                  <el-input
                    v-model="form.hero.subtitle"
                    type="textarea"
                    :rows="3"
                    placeholder="เช่น มุ่งมั่นนำเสนอบริการ..."
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="รูปภาพปก (Hero Image)">
                  <div class="image-uploader">
                    <div v-if="form.hero.image" class="image-preview">
                      <img :src="form.hero.image" alt="Hero Image" />
                      <div class="image-actions">
                        <el-button type="danger" circle @click="removeImage('hero')">
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                    <div v-else class="upload-placeholder" @click="triggerUpload('hero')">
                      <el-icon><Plus /></el-icon>
                      <span>อัปโหลดรูปภาพ</span>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
        </div>
      </el-tab-pane>

      <!-- 2. Story (Main Content) -->
      <el-tab-pane label="เนื้อหาหลัก (Story)" name="content">
        <div class="form-section">
          <div class="form-section-title">เรื่องราวของเรา (Story)</div>
          <div class="editor-wrapper">
             <!-- <QuillEditor 
              v-model:content="form.content" 
              contentType="html" 
              theme="snow"
              toolbar="full"
            /> -->
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="10"
              placeholder="เนื้อหาหลัก (Rich Text Editor temporarily disabled)"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 3. Vision & Mission -->
      <el-tab-pane label="วิสัยทัศน์ & พันธกิจ" name="vision">
        <div class="form-section">
          <div class="form-section-title">วิสัยทัศน์และพันธกิจ</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="วิสัยทัศน์ (Vision)">
                <el-input
                  v-model="form.vision"
                  type="textarea"
                  :rows="4"
                  placeholder="กรอกวิสัยทัศน์..."
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="พันธกิจ (Mission)">
                <el-input
                  v-model="form.mission"
                  type="textarea"
                  :rows="4"
                  placeholder="กรอกพันธกิจ..."
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 4. Service Highlight -->
      <el-tab-pane label="จุดเด่นบริการ" name="services">
        <div class="form-section">
            <div class="form-section-title">จุดเด่นบริการ (Highlights)</div>
            <el-form-item label="หัวข้อส่วนบริการ (Section Title)">
              <el-input v-model="form.serviceHighlight.title" />
            </el-form-item>
            
            <div class="sub-section-title">รายการบริการ (Accordion Items)</div>
            <div
              v-for="(item, index) in form.serviceHighlight.items"
              :key="index"
              class="service-item"
            >
              <el-row :gutter="10" align="middle">
                <el-col :span="10">
                  <el-input v-model="item.title" placeholder="ชื่อบริการ" />
                </el-col>
                <el-col :span="12">
                  <el-input v-model="item.detail" placeholder="รายละเอียดบริการ" />
                </el-col>
                <el-col :span="2" style="text-align: right;">
                   <el-button type="danger" circle size="small" @click="removeServiceItem(index)" :disabled="form.serviceHighlight.items.length <= 1">
                      <el-icon><Minus /></el-icon>
                   </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button class="mt-2" plain type="primary" size="small" @click="addServiceItem">
              <el-icon><Plus /></el-icon> เพิ่มรายการ
            </el-button>
          </div>
      </el-tab-pane>

      <!-- 5. Why Us -->
      <el-tab-pane label="Why Us" name="whyus">
         <div class="form-section">
            <div class="form-section-title">ทำไมต้องเลือกเรา (Why Us)</div>
            <el-row :gutter="20">
              <el-col :span="12">
                 <el-form-item label="ข้อความพาดหัว (Banner Text)">
                  <el-input v-model="form.whyUs.title" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="รูปภาพพื้นหลัง (Background Image)">
                  <div class="image-uploader small-uploader">
                    <div v-if="form.whyUs.image" class="image-preview">
                      <img :src="form.whyUs.image" alt="Why Us Image" />
                      <div class="image-actions">
                        <el-button type="danger" circle @click="removeImage('whyUs')">
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                     <div v-else class="upload-placeholder" @click="triggerUpload('whyUs')">
                      <el-icon><Plus /></el-icon>
                      <span>อัปโหลดรูปภาพ</span>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
           </div>
      </el-tab-pane>

      <!-- 6. Rental Service -->
      <el-tab-pane label="Rental Info" name="rental">
         <div class="form-section">
            <div class="form-section-title">บริการรถเช่า (Rental Service Info)</div>
             <el-form-item label="หัวข้อ (Title)">
               <el-input v-model="form.rentalService.title" />
             </el-form-item>
             <el-form-item label="รายละเอียด (Detail)">
               <el-input
                v-model="form.rentalService.detail"
                type="textarea"
                :rows="4"
              />
             </el-form-item>
           </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Hidden Inputs for File Upload -->
    <input type="file" ref="heroFileInput" accept="image/*" style="display: none;" @change="(e) => handleFileChange(e, 'hero')" />
    <input type="file" ref="whyUsFileInput" accept="image/*" style="display: none;" @change="(e) => handleFileChange(e, 'whyUs')" />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Minus } from '@element-plus/icons-vue'
import { useApi } from '@/composables/useApi'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const { getAboutUs, updateAboutUs } = useApi()

const activeTab = ref('hero')
const heroFileInput = ref()
const whyUsFileInput = ref()
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  hero: { title: '', subtitle: '', image: '' },
  content: '',
  vision: '',
  mission: '',
  serviceHighlight: { title: '', items: [] },
  whyUs: { title: '', image: '' },
  rentalService: { title: '', detail: '' }
})

const triggerUpload = (type) => {
  if (type === 'hero') heroFileInput.value.click()
  if (type === 'whyUs') whyUsFileInput.value.click()
}

const handleFileChange = (e, type) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (type === 'hero') form.hero.image = e.target.result
      if (type === 'whyUs') form.whyUs.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = (type) => {
  if (type === 'hero') form.hero.image = ''
  if (type === 'whyUs') form.whyUs.image = ''
}

const addServiceItem = () => {
  form.serviceHighlight.items.push({ title: '', detail: '' })
}

const removeServiceItem = (index) => {
  form.serviceHighlight.items.splice(index, 1)
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getAboutUs()
    
    // Deep merge / Assignment
    if(data.hero) Object.assign(form.hero, data.hero)
    form.content = data.content || ''
    form.vision = data.vision || ''
    form.mission = data.mission || ''
    
    if(data.serviceHighlight) Object.assign(form.serviceHighlight, data.serviceHighlight)
    if(data.whyUs) Object.assign(form.whyUs, data.whyUs)
    if(data.rentalService) Object.assign(form.rentalService, data.rentalService)

    // Fallbacks
    if (!form.serviceHighlight.items || form.serviceHighlight.items.length === 0) {
      form.serviceHighlight.items = [{ title: '', detail: '' }]
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('โหลดข้อมูลล้มเหลว')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const payload = JSON.parse(JSON.stringify(form))
    await updateAboutUs(payload)
    ElMessage.success('บันทึกข้อมูลเรียบร้อยแล้ว')
  } catch (error) {
    ElMessage.error('บันทึกข้อมูลล้มเหลว')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 24px;
}

.content-tabs {
  min-height: 500px;
}

.form-section {
  padding: 16px 0;
  
  &-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #1a1a1a;
    border-left: 4px solid #FF595A;
    padding-left: 12px;
  }
}

.sub-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 16px 0 12px;
  color: #666;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;

  &:hover {
    border-color: #409eff;
  }
  
  &.small-uploader {
     height: 150px;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8c939d;
  
  .el-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-actions {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    
    &:hover {
      opacity: 1;
    }
  }
}

.editor-wrapper {
  :deep(.ql-editor) {
    min-height: 400px;
  }
}

.service-item {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

.mt-2 {
  margin-top: 8px;
}
</style>
