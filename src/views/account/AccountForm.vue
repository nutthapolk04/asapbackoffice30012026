<template>
  <div class="account-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน' }}</h1>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="content-card"
    >
      <div class="form-section">
        <div class="form-section-title">ข้อมูลส่วนตัว</div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="ชื่อ" prop="firstName">
              <el-input v-model="form.firstName" placeholder="กรอกชื่อ" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="นามสกุล" prop="lastName">
              <el-input v-model="form.lastName" placeholder="กรอกนามสกุล" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="อีเมล" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="example@email.com"
          />
        </el-form-item>
      </div>

      <div class="form-section" v-if="!isEdit">
        <div class="form-section-title">รหัสผ่าน</div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="รหัสผ่าน" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ยืนยันรหัสผ่าน" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="form-section">
        <div class="form-section-title">การตั้งค่าบัญชี</div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="บทบาท" prop="role">
              <el-select v-model="form.role" placeholder="เลือกบทบาท" style="width: 100%;">
                <el-option label="Super Admin" value="super_admin">
                  <div class="role-option">
                    <span>Super Admin</span>
                    <small>จัดการได้ทุกอย่าง รวมถึงผู้ใช้งาน</small>
                  </div>
                </el-option>
                <el-option label="Editor" value="editor">
                  <div class="role-option">
                    <span>Editor</span>
                    <small>จัดการเนื้อหาได้ แต่ไม่สามารถจัดการผู้ใช้</small>
                  </div>
                </el-option>
                <el-option label="Viewer" value="viewer">
                  <div class="role-option">
                    <span>Viewer</span>
                    <small>ดูข้อมูลได้อย่างเดียว</small>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="สถานะ" prop="isActive">
              <el-switch
                v-model="form.isActive"
                active-text="เปิดใช้งาน"
                inactive-text="ปิดใช้งาน"
                style="margin-top: 8px;"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Role Permissions Preview -->
      <div class="form-section" v-if="form.role">
        <div class="form-section-title">สิทธิ์การใช้งาน</div>
        <div class="permissions-table">
          <el-table :data="permissionsData" size="small">
            <el-table-column prop="name" label="สิทธิ์" />
            <el-table-column label="สถานะ" width="100" align="center">
              <template #default="{ row }">
                <el-icon v-if="row[form.role]" color="#36B37E"><Check /></el-icon>
                <el-icon v-else color="#FF5630"><Close /></el-icon>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="form-actions">
        <el-button @click="$router.back()">ยกเลิก</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้งาน' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import IdentityDocuments from '@/components/common/IdentityDocuments.vue'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const { getAccount, createAccount, updateAccount } = useApi()

const formRef = ref()
const saving = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  isActive: true,
  documents: [
    { label: 'สำเนาบัตรประชาชน', url: '', type: 'image/jpeg', fileName: '' },
    { label: 'สำเนาใบขับขี่', url: '', type: 'image/jpeg', fileName: '' },
    { label: 'สำเนาหนังสือเดินทาง', url: '', type: 'image/jpeg', fileName: '' }
  ]
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('รหัสผ่านไม่ตรงกัน'))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  firstName: [{ required: true, message: 'กรุณากรอกชื่อ', trigger: 'blur' }],
  lastName: [{ required: true, message: 'กรุณากรอกนามสกุล', trigger: 'blur' }],
  email: [
    { required: true, message: 'กรุณากรอกอีเมล', trigger: 'blur' },
    { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง', trigger: 'blur' }
  ],
  password: isEdit.value ? [] : [
    { required: true, message: 'กรุณากรอกรหัสผ่าน', trigger: 'blur' },
    { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', trigger: 'blur' }
  ],
  confirmPassword: isEdit.value ? [] : [
    { required: true, message: 'กรุณายืนยันรหัสผ่าน', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  role: [{ required: true, message: 'กรุณาเลือกบทบาท', trigger: 'change' }]
}))

const permissionsData = [
  { name: 'ดูแดชบอร์ด', super_admin: true, editor: true, viewer: true },
  { name: 'จัดการแบนเนอร์', super_admin: true, editor: true, viewer: false },
  { name: 'จัดการโปรโมชัน', super_admin: true, editor: true, viewer: false },
  { name: 'จัดการจังหวัด', super_admin: true, editor: true, viewer: false },
  { name: 'จัดการบทความ', super_admin: true, editor: true, viewer: false },
  { name: 'จัดการคำถามที่พบบ่อย', super_admin: true, editor: true, viewer: false },
  { name: 'จัดการหน้าเพจ', super_admin: true, editor: true, viewer: false },
  { name: 'จัดการผู้ใช้งาน', super_admin: true, editor: false, viewer: false }
]

const handleDocUpload = (doc) => {
  ElMessage.info(`กำลังพัฒนาระบบอัปโหลดสำหรับ ${doc.label}`)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const data = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          isActive: form.isActive
        }

        if (!isEdit.value) {
          data.password = form.password
        }

        if (isEdit.value) {
          await updateAccount(route.params.id, data)
          ElMessage.success('แก้ไขผู้ใช้งานสำเร็จ')
        } else {
          await createAccount(data)
          ElMessage.success('สร้างผู้ใช้งานสำเร็จ')
        }
        router.push('/accounts')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
      } finally {
        saving.value = false
      }
    }
  })
}

const loadAccount = async () => {
  if (isEdit.value) {
    try {
      const data = await getAccount(route.params.id)
      if (data) {
        form.firstName = data.firstName
        form.lastName = data.lastName
        form.email = data.email
        form.role = data.role
        form.isActive = data.isActive
      } else {
        ElMessage.error('ไม่พบข้อมูลผู้ใช้งาน')
        router.push('/accounts')
      }
    } catch (error) {
      ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
      router.push('/accounts')
    }
  }
}

onMounted(() => {
  loadAccount()
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

.role-option {
  display: flex;
  flex-direction: column;
  line-height: 1.4;

  span {
    font-weight: 500;
  }

  small {
    font-size: 12px;
    color: #999;
  }
}

.permissions-table {
  max-width: 400px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
</style>
