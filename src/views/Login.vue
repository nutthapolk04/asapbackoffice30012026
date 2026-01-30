<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>ASAP</h1>
        <p>ระบบจัดการหลังบ้าน</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="อีเมล" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="กรอกอีเมล"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="รหัสผ่าน" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="กรอกรหัสผ่าน"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.remember">จดจำการเข้าสู่ระบบ</el-checkbox>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          native-type="submit"
          class="login-button"
        >
          เข้าสู่ระบบ
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const rules = {
  email: [
    { required: true, message: 'กรุณากรอกอีเมล', trigger: 'blur' },
    { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'กรุณากรอกรหัสผ่าน', trigger: 'blur' },
    { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true

      // TODO: เปลี่ยนเป็น API call จริง
      setTimeout(() => {
        loading.value = false
        ElMessage.success('เข้าสู่ระบบสำเร็จ')
        router.push('/')
      }, 1000)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF595A 0%, #FF8A8B 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    color: #FF595A;
    margin: 0 0 8px;
    font-weight: 700;
  }

  p {
    color: #999;
    margin: 0;
  }
}

.login-button {
  width: 100%;
  margin-top: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
