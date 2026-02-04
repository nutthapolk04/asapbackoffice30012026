<template>
  <div class="article-list">
    <div class="page-header">
      <h1>จัดการบทความ</h1>
      <el-button type="primary" @click="openStrapiCreate">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px;">เพิ่มบทความ</span>
      </el-button>
    </div>

    <div class="content-card">
      <div class="card-toolbar">
        <div class="filters">
          <el-select
            v-model="filterCategory"
            placeholder="ทุกหมวดหมู่"
            clearable
            style="width: 180px;"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
          <el-select
            v-model="filterStatus"
            placeholder="ทุกสถานะ"
            clearable
            style="width: 140px;"
          >
            <el-option label="เผยแพร่แล้ว" value="published" />
            <el-option label="ฉบับร่าง" value="draft" />
          </el-select>
          <el-input
            v-model="searchQuery"
            placeholder="ค้นหาบทความ..."
            clearable
            style="width: 200px;"
            :prefix-icon="Search"
          />
        </div>
        <span class="item-count">ทั้งหมด {{ filteredArticles.length }} รายการ</span>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredArticles"
        style="width: 100%"
        row-key="id"
      >
        <el-table-column label="จัดเรียง" width="70" align="center">
          <template #default>
            <el-icon class="drag-handle" style="font-size: 18px;"><Rank /></el-icon>
          </template>
        </el-table-column>

        <el-table-column label="ลำดับ" width="80" align="center">
          <template #default="{ row }">
            <span class="order-text">{{ row.order || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="รูปปก" width="140" align="center">
          <template #default="{ row }">
            <div class="cover-image-wrapper">
              <el-image
                v-if="row.coverImage"
                :src="row.coverImage"
                fit="cover"
                class="cover-image"
                :preview-src-list="[row.coverImage]"
              />
              <div v-else class="cover-placeholder">
                <el-icon :size="24"><Picture /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="หัวข้อ" min-width="280">
          <template #default="{ row }">
            <div class="article-title">
              <span class="title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="หมวดหมู่" width="120" />

        <el-table-column label="แท็ก" min-width="200">
          <template #default="{ row }">
            <div class="tags-cell">
              <el-tag
                v-for="tag in (row.tags || []).slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <el-tag v-if="(row.tags || []).length > 3" size="small" type="info">
                +{{ row.tags.length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="publishedAt" label="วันที่" width="120">
          <template #default="{ row }">
            {{ formatDate(row.publishedAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="สถานะ" width="120" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', `status-badge--${row.status}`]">
              {{ row.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="จัดการ" width="150" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                type="primary"
                text
                @click="openStrapiEdit(row)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                type="danger"
                text
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Floating Save Button -->
    <div v-if="hasUnsavedChanges" class="floating-save">
      <el-button type="success" size="large" :loading="savingOrder" @click="saveOrder">
        <el-icon><Check /></el-icon>
        <span style="margin-left: 8px;">บันทึกลำดับ</span>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Picture, Rank, Check } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { useApi } from '@/composables/useApi'

// Strapi Admin URL
const STRAPI_ADMIN_URL = import.meta.env.VITE_STRAPI_API_URL || 'https://my-strapi-api-0fz5.onrender.com'

const { getArticles, getArticleCategories, deleteArticle, reorderArticles } = useApi()

const tableRef = ref(null)
const hasUnsavedChanges = ref(false)
const savingOrder = ref(false)

const loading = ref(false)
const articles = ref([])
const categories = ref([])
const filterCategory = ref('')
const filterStatus = ref('')
const searchQuery = ref('')

// Open Strapi Admin to create new article
const openStrapiCreate = () => {
  window.open(`${STRAPI_ADMIN_URL}/admin/content-manager/collection-types/api::article.article/create`, '_blank')
}

// Open Strapi Admin to edit article
const openStrapiEdit = (row) => {
  // Use documentId for Strapi v5, fallback to id for older versions
  const identifier = row.documentId || row.id
  window.open(`${STRAPI_ADMIN_URL}/admin/content-manager/collection-types/api::article.article/${identifier}`, '_blank')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const filteredArticles = computed(() => {
  return articles.value.filter(article => {
    const matchCategory = !filterCategory.value || article.categoryId === filterCategory.value
    const matchStatus = !filterStatus.value || article.status === filterStatus.value
    const matchSearch = !searchQuery.value ||
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCategory && matchStatus && matchSearch
  })
})

const fetchData = async () => {
  loading.value = true
  try {
    const [articlesData, categoriesData] = await Promise.all([
      getArticles(),
      getArticleCategories()
    ])
    articles.value = articlesData
    categories.value = categoriesData
  } catch (error) {
    ElMessage.error('ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบบทความ "${row.title}" ใช่หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    await deleteArticle(row.id)
    ElMessage.success('ลบบทความสำเร็จ')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('ไม่สามารถลบได้')
    }
  }
}

onMounted(() => {
  fetchData().then(() => {
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
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex === newIndex) return

      const targetRow = articles.value.splice(oldIndex, 1)[0]
      articles.value.splice(newIndex, 0, targetRow)
      
      articles.value.forEach((a, index) => {
        a.order = index + 1
      })

      hasUnsavedChanges.value = true
    }
  })
}

const saveOrder = async () => {
  savingOrder.value = true
  try {
    const newOrderIds = articles.value.map(a => a.id)
    await reorderArticles(newOrderIds)
    ElMessage.success('บันทึกลำดับเรียบร้อย')
    hasUnsavedChanges.value = false
  } catch (error) {
    ElMessageBox.alert('ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'แจ้งเตือน', {
      type: 'error',
      confirmButtonText: 'ตกลง'
    })
    fetchData()
  } finally {
    savingOrder.value = false
  }
}
</script>

<style lang="scss" scoped>
.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.drag-handle {
  cursor: move;
  color: #999;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.item-count {
  color: #666;
  font-size: 14px;
}

// Cover Image Styles
.cover-image-wrapper {
  width: 80px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  background: #f5f7fa;
  margin: 0 auto;
}

.cover-image {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

// Article Title
.article-title {
  .title-text {
    font-weight: 500;
    color: #1D2433;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// Table Enhancements
:deep(.el-table) {
  --el-table-border-color: #f0f2f5;

  .el-table__row {
    transition: background-color 0.2s ease;

    &:hover > td {
      background-color: #fafbfc !important;
    }
  }

  .el-table__header th {
    background-color: #fafbfc;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }

  .el-table__cell {
    padding: 8px 0;
  }
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px;

  .el-button {
    padding: 8px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      border-radius: 6px;
    }
  }
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .tag-item {
    margin: 0;
    border-radius: 4px;
  }
}

// Status Badge Improvements
.order-text {
  font-weight: 600;
  color: #606266;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;


  &--draft {
    background-color: #fff1f0;
    color: #ff4d4f;
  }
}

.floating-save {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
