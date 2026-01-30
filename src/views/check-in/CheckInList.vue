<template>
  <div class="check-in-list">
    <div class="page-header">
      <h1>เช็คอินออนไลน์</h1>
    </div>

    <div class="content-card">
      <!-- Filters -->
      <div class="card-toolbar">
        <div class="filters">
          <el-select v-model="filterStatus" placeholder="สถานะ" clearable style="width: 150px">
            <el-option label="ทั้งหมด" value="" />
            <el-option label="รอดำเนินการ" value="pending" />
            <el-option label="อนุมัติแล้ว" value="approved" />
            <el-option label="ปฏิเสธ" value="rejected" />
          </el-select>
          <el-date-picker
            v-model="filterDate"
            type="daterange"
            range-separator="-"
            start-placeholder="วันที่เริ่ม"
            end-placeholder="วันที่สิ้นสุด"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
          <el-input
            v-model="searchText"
            placeholder="ค้นหาชื่อ, เบอร์โทร, หมายเลขการจอง"
            clearable
            style="width: 280px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <span class="item-count">ทั้งหมด {{ filteredCheckIns.length }} รายการ</span>
      </div>

      <!-- Table -->
      <el-table
        v-loading="loading"
        :data="filteredCheckIns"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column label="หมายเลขการจอง" prop="bookingNumber" width="150" />
        <el-table-column label="ชื่อลูกค้า" min-width="180">
          <template #default="{ row }">
            <div class="customer-info">
              <div class="name-with-indicator">
                <span class="unread-indicator" v-if="row.status === 'pending'"></span>
                <span class="customer-name">{{ row.customerName }}</span>
              </div>
              <span class="phone">{{ row.phone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="รถที่จอง" min-width="150">
          <template #default="{ row }">
            <span>{{ row.carModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="วันที่รับรถ" width="130">
          <template #default="{ row }">
            {{ formatDate(row.pickupDate) }}
          </template>
        </el-table-column>
        <el-table-column label="สาขา" min-width="150" prop="branch" />
        <el-table-column label="วันที่เช็คอิน" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.checkInDate) }}
          </template>
        </el-table-column>
        <el-table-column label="สถานะ" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="จัดการ" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(row)"
            >
              <el-icon><View /></el-icon>
              <span style="margin-left: 6px;">ดูรายละเอียด</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="filteredCheckIns.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredCheckIns.length"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { Search, View } from '@element-plus/icons-vue'

const router = useRouter()
const { getCheckIns } = useApi()

const loading = ref(false)
const checkIns = ref([])
const filterStatus = ref('')
const filterDate = ref(null)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredCheckIns = computed(() => {
  let result = [...checkIns.value]

  // Filter by status
  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  // Filter by date range
  if (filterDate.value && filterDate.value.length === 2) {
    const [start, end] = filterDate.value
    result = result.filter(item => {
      const checkInDate = item.checkInDate.split('T')[0]
      return checkInDate >= start && checkInDate <= end
    })
  }

  // Filter by search text
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(item =>
      item.customerName.toLowerCase().includes(search) ||
      item.phone.includes(search) ||
      item.bookingNumber.toLowerCase().includes(search)
    )
  }

  return result
})

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ'
  }
  return labels[status] || status
}

const tableRowClassName = ({ row }) => {
  if (row.status === 'pending') return 'unread-row'
  return ''
}

const viewDetail = (row) => {
  router.push(`/check-ins/${row.id}`)
}

const fetchCheckIns = async () => {
  loading.value = true
  try {
    checkIns.value = await getCheckIns()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCheckIns()
})
</script>

<style lang="scss" scoped>
.check-in-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .content-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;

    .filters {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .item-count {
      color: #666;
      font-size: 14px;
    }
  }

  .customer-info {
    display: flex;
    flex-direction: column;

    .customer-name {
      font-size: 14px;
      line-height: 1.4;
    }

    .phone {
      font-size: 12px;
      color: #666;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  :deep(.unread-row) {
    background-color: #FFF9F2 !important;
    font-weight: 700 !important;
    color: #101828 !important;
    
    .phone {
      font-weight: 400 !important; // Keep secondary info normal weight
    }
  }

  .name-with-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .unread-indicator {
    width: 8px;
    height: 8px;
    background-color: #2E90FA;
    border-radius: 50%;
    flex-shrink: 0;
  }

  // Button icon spacing
  :deep(.el-button) {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    .el-icon {
      margin: 0;
    }
  }
}
</style>
