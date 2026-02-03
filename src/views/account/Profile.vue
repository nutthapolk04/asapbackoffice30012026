<template>
  <div class="profile">
    <div class="page-header">
      <h1>โปรไฟล์ของฉัน</h1>
    </div>

    <el-row :gutter="24">
      <el-col :span="16">
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-position="top"
          class="content-card"
        >
          <div class="form-section">
            <div class="form-section-title">ข้อมูลส่วนตัว</div>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="ชื่อ" prop="firstName">
                  <el-input v-model="profileForm.firstName" placeholder="กรอกชื่อ" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="นามสกุล" prop="lastName">
                  <el-input v-model="profileForm.lastName" placeholder="กรอกนามสกุล" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="อีเมล" prop="email">
              <el-input v-model="profileForm.email" type="email" disabled />
              <div class="field-hint">* ไม่สามารถเปลี่ยนอีเมลได้</div>
            </el-form-item>
          </div>

          <div class="form-actions">
            <el-button type="primary" :loading="savingProfile" @click="handleSaveProfile">
              บันทึกข้อมูล
            </el-button>
          </div>
        </el-form>

        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-position="top"
          class="content-card"
        >
          <div class="form-section">
            <div class="form-section-title">เปลี่ยนรหัสผ่าน</div>

            <el-form-item label="รหัสผ่านปัจจุบัน" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                show-password
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="รหัสผ่านใหม่" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    show-password
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="ยืนยันรหัสผ่านใหม่" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="form-actions">
            <el-button type="warning" :loading="savingPassword" @click="handleChangePassword">
              เปลี่ยนรหัสผ่าน
            </el-button>
          </div>
        </el-form>
      </el-col>

      <el-col :span="8">
        <div class="content-card profile-card">
          <div class="profile-avatar">
            <el-avatar :size="100">
              {{ profileForm.firstName.charAt(0) }}
            </el-avatar>
          </div>
          <h3 class="profile-name">{{ profileForm.firstName }} {{ profileForm.lastName }}</h3>
          <p class="profile-email">{{ profileForm.email }}</p>
          <el-tag :type="getRoleType(profileForm.role)" size="large">
            {{ getRoleName(profileForm.role) }}
          </el-tag>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, SwitchButton, Camera, Document } from '@element-plus/icons-vue'
import IdentityDocuments from '@/components/common/IdentityDocuments.vue'
import { useApi } from '@/composables/useApi'

const { getProfile, updateProfile } = useApi()

const profileFormRef = ref()
const passwordFormRef = ref()
const loading = ref(false)
const saving = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)

const userDocuments = ref([
  { label: 'สำเนาบัตรประชาชน', url: '', type: 'image/jpeg', fileName: '' },
  { label: 'สำเนาใบขับขี่', url: '', type: 'image/jpeg', fileName: '' },
  { label: 'สำเนาหนังสือเดินทาง', url: '', type: 'image/jpeg', fileName: '' }
])

// Mock current user data
const profileForm = reactive({
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@asap.com',
  role: 'super_admin'
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileRules = {
  firstName: [{ required: true, message: 'กรุณากรอกชื่อ', trigger: 'blur' }],
  lastName: [{ required: true, message: 'กรุณากรอกนามสกุล', trigger: 'blur' }]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('รหัสผ่านไม่ตรงกัน'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [{ required: true, message: 'กรุณากรอกรหัสผ่านปัจจุบัน', trigger: 'blur' }],
  newPassword: [
    { required: true, message: 'กรุณากรอกรหัสผ่านใหม่', trigger: 'blur' },
    { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'กรุณายืนยันรหัสผ่าน', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const getRoleName = (role) => {
  const map = {
    super_admin: 'Super Admin',
    editor: 'Editor',
    viewer: 'Viewer'
  }
  return map[role] || role
}

const getRoleType = (role) => {
  const map = {
    super_admin: 'danger',
    editor: 'warning',
    viewer: 'info'
  }
  return map[role] || ''
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return

  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      savingProfile.value = true
      try {
        // TODO: Call API to update profile
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('บันทึกข้อมูลสำเร็จ')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด')
      } finally {
        savingProfile.value = false
      }
    }
  })
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      savingPassword.value = true
      try {
        // TODO: Call API to change password
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('เปลี่ยนรหัสผ่านสำเร็จ')
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด')
      } finally {
        savingPassword.value = false
      }
    }
  })
}

const handleLogout = () => {
  // ... logout logic
}

const handleDocUpload = (doc) => {
  ElMessage.info(`กำลังพัฒนาระบบอัปโหลดสำหรับ ${doc.label}`)
}

onMounted(() => {
  // TODO: Load current user profile from API
})
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 24px;

  &-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
}

.field-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.profile-card {
  text-align: center;
  padding: 32px 24px;
}

.profile-avatar {
  margin-bottom: 16px;

  :deep(.el-avatar) {
    background-color: #FF595A;
    font-size: 36px;
  }
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
}

.profile-email {
  color: #999;
  margin: 0 0 16px;
}
</style>
