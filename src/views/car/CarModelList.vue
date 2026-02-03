<template>
  <div class="car-model-list">
    <div class="page-header">
      <h1>จัดการรูปภาพรถยนต์</h1>
    </div>

    <div class="content-card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="searchQuery"
            placeholder="ค้นหายี่ห้อรถ..."
            style="width: 250px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="stats-info">
          <el-tag type="info" effect="plain">
            ทั้งหมด {{ totalModelsCount }} รุ่น
          </el-tag>
          <el-tag type="danger" effect="plain">
            <el-icon><Warning /></el-icon>
            ยังไม่มีรูป: {{ totalNoImageCount }} รุ่น
          </el-tag>
        </div>
      </div>

      <div v-loading="loading" class="brands-container">
        <div class="brands-grid">
          <div
            v-for="brand in filteredBrands"
            :key="brand.id"
            class="brand-card"
            @click="goToBrandDetail(brand)"
          >
            <div class="brand-logo-wrapper">
              <el-image
                :src="brand.logo"
                fit="contain"
                class="brand-logo"
              />
            </div>

            <div class="brand-info">
              <h3 class="brand-name">{{ brand.name }}</h3>
              <div class="brand-stats">
                <el-tag size="small" type="info">{{ brand.models.length }} รุ่น</el-tag>
                <el-tag v-if="getNoImageCount(brand) > 0" size="small" type="danger">
                  ยังไม่มีรูป {{ getNoImageCount(brand) }}
                </el-tag>
                <el-tag v-else size="small" type="success">
                  มีรูปครบ
                </el-tag>
              </div>
            </div>

            <div class="brand-action">
              <el-button type="primary" text>
                จัดการรูปภาพ
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <el-empty
          v-if="filteredBrands.length === 0 && !loading"
          description="ไม่พบข้อมูล"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const { getCarBrands } = useApi()

const loading = ref(false)
const brands = ref([])
const searchQuery = ref('')

const hasImage = (model) => {
  return model.images.some(img => img !== null)
}

const getNoImageCount = (brand) => {
  return brand.models.filter(m => !hasImage(m)).length
}

const totalModelsCount = computed(() => {
  return brands.value.reduce((total, brand) => total + brand.models.length, 0)
})

const totalNoImageCount = computed(() => {
  return brands.value.reduce((total, brand) => total + getNoImageCount(brand), 0)
})

const filteredBrands = computed(() => {
  if (!searchQuery.value) return brands.value

  const query = searchQuery.value.toLowerCase()
  return brands.value.filter(brand =>
    brand.name.toLowerCase().includes(query)
  )
})

const fetchBrands = async () => {
  loading.value = true
  try {
    brands.value = await getCarBrands()
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const goToBrandDetail = (brand) => {
  router.push(`/car-models/${brand.id}`)
}

onMounted(() => {
  fetchBrands()
})
</script>

<style lang="scss" scoped>
.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-info {
  display: flex;
  gap: 8px;

  .el-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    white-space: nowrap;
    transition: all 0.3s ease;
    border-width: 1px;

    :deep(.el-tag__content) {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 100%;
    }

    .el-icon {
      font-size: 18px;
      margin: 0;
      position: relative;
      top: -1px;
    }

    &.el-tag--danger {
      background-color: #fff1f0;
      border-color: #ffccc7;
      color: #ff4d4f;

      .el-icon {
        color: #ff4d4f;
      }
    }
  }
}

.brands-container {
  min-height: 200px;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.brand-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #FF595A;
    box-shadow: 0 4px 12px rgba(255, 89, 90, 0.15);
    transform: translateY(-2px);
  }
}

.brand-logo-wrapper {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
}

.brand-logo {
  width: 50px;
  height: 50px;
}

.brand-info {
  flex: 1;
  min-width: 0;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.brand-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .el-tag {
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    font-weight: 500;

    &.el-tag--danger {
      background-color: #fff1f0;
      border-color: #ffccc7;
      color: #ff4d4f;
    }
  }
}

.brand-action {
  flex-shrink: 0;
}
</style>
