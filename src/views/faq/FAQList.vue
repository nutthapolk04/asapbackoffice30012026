<template>
  <div class="faq-list">
    <div class="page-header">
      <h1>จัดการคำถามที่พบบ่อย</h1>
      <el-button type="primary" @click="$router.push('/faqs/create')">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px;">เพิ่มคำถาม</span>
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
          <el-input
            v-model="searchQuery"
            placeholder="ค้นหาคำถาม..."
            clearable
            style="width: 200px;"
            :prefix-icon="Search"
          />
        </div>
        <span class="item-count">ทั้งหมด {{ filteredFAQs.length }} รายการ</span>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredFAQs"
        style="width: 100%"
        row-key="id"
      >

        <el-table-column width="60" align="center">
          <template #default>
            <el-icon class="drag-handle"><Rank /></el-icon>
          </template>
        </el-table-column>

        <el-table-column label="ลำดับ" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>

        <el-table-column prop="title" label="คำถาม" min-width="300" />

        <el-table-column prop="category" label="หมวดหมู่" width="150" />

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
                @click="$router.push(`/faqs/${row.id}/edit`)"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { useApi } from '@/composables/useApi'

const { getFAQs, getFAQCategories, deleteFAQ, reorderFAQs } = useApi()

const tableRef = ref(null)

const loading = ref(false)
const faqs = ref([])
const categories = ref([])
const filterCategory = ref('')
const searchQuery = ref('')

const filteredFAQs = computed(() => {
  return faqs.value.filter(faq => {
    const matchCategory = !filterCategory.value || faq.categoryId === filterCategory.value
    const matchSearch = !searchQuery.value ||
      faq.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCategory && matchSearch
  })
})

const fetchData = async () => {
  loading.value = true
  try {
    const [faqsData, categoriesData] = await Promise.all([
      getFAQs(),
      getFAQCategories()
    ])
    faqs.value = faqsData
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
      `คุณต้องการลบคำถาม "${row.title}" ใช่หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning'
      }
    )

    await deleteFAQ(row.id)
    ElMessage.success('ลบคำถามสำเร็จ')
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
    onEnd: async ({ oldIndex, newIndex }) => {
      // Note: Reordering in a filtered list can be complex.
      // We update the 'filteredFAQs' array which Vue might not reactive sync back to 'faqs' if it's computed.
      // But in this implementation, faqs is a ref and filteredFAQs depends on it.
      // We should swap in the source 'faqs' array.
      
      const itemMoved = filteredFAQs.value[oldIndex]
      const targetItem = filteredFAQs.value[newIndex]
      
      // Find real indices in source array
      const realOldIndex = faqs.value.findIndex(f => f.id === itemMoved.id)
      const realNewIndex = faqs.value.findIndex(f => f.id === targetItem.id)
      
      const targetRow = faqs.value.splice(realOldIndex, 1)[0]
      faqs.value.splice(realNewIndex, 0, targetRow)

      try {
        const newOrderIds = faqs.value.map(f => f.id)
        await reorderFAQs(newOrderIds)
        ElMessage.success('จัดลำดับสำเร็จ')
      } catch (error) {
        ElMessage.error('เกิดข้อผิดพลาดในการจัดลำดับ')
        fetchData()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filters {
  display: flex;
  gap: 12px;
}

.item-count {
  color: #666;
  font-size: 14px;
}

.drag-handle {
  cursor: move;
  color: #999;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px;
}
</style>
