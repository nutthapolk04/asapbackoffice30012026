<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>แดชบอร์ด</h1>
        <p class="text-subtitle">ภาพรวมระบบประจำวันนี้</p>
      </div>
      <div class="header-actions">
        <el-button>
          <el-icon><Refresh /></el-icon>
          <span>อัปเดตข้อมูล</span>
        </el-button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card stat-card--highlight">
        <div class="stat-card-content">
          <div class="stat-card-icon stat-card-icon--danger">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="stat-card-info">
            <div class="stat-card-value">{{ dashboardStore.stats.totalOrders }}</div>
            <div class="stat-card-label">จำนวนออเดอร์ทั้งหมด</div>
          </div>
        </div>
        <div class="stat-card-trend trend-up">
          <el-icon><ArrowUp /></el-icon>
          <span>+12% จากสัปดาห์ก่อน</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-content">
          <div class="stat-card-icon stat-card-icon--success">
            <el-icon><Box /></el-icon>
          </div>
          <div class="stat-card-info">
            <div class="stat-card-value">{{ dashboardStore.stats.carPickups }}</div>
            <div class="stat-card-label">จำนวนการ Pick-up รถ</div>
          </div>
        </div>
        <div class="stat-card-trend trend-neutral">
          <span>วันนี้ (12 ม.ค. 2569)</span>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/check-ins')">
        <div class="stat-card-content">
          <div class="stat-card-icon stat-card-icon--warning">
            <el-icon><Ticket /></el-icon>
          </div>
          <div class="stat-card-info">
            <div class="stat-card-value">{{ dashboardStore.stats.pendingCheckins }}</div>
            <div class="stat-card-label">Online Check-in รอดำเนินการ</div>
          </div>
        </div>
        <div class="stat-card-trend trend-danger" v-if="dashboardStore.stats.pendingCheckins > 0">
          <el-icon><Warning /></el-icon>
          <span>ควรเร่งตรวจสอบ</span>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/contacts')">
        <div class="stat-card-content">
          <div class="stat-card-icon stat-card-icon--info">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-card-info">
            <div class="stat-card-value">{{ dashboardStore.stats.unreadMessages }}</div>
            <div class="stat-card-label">ข้อความจากลูกค้าที่ยังไม่ได้อ่าน</div>
          </div>
        </div>
        <div class="stat-card-trend trend-neutral" v-if="dashboardStore.stats.unreadMessages > 0">
          <span>มีอัปเดตใหม่</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="dashboard-main">
        <!-- Analytics Section -->
        <div class="analytics-dashboard">
          <div class="analytics-row-main mb-4">
             <VisitorStatsChart />
          </div>
          <div class="analytics-row-secondary">
             <UserBehaviorChart />
             <AvgDurationCard />
          </div>
        </div>

        <!-- Pending Online Check-ins -->
        <div class="content-card highlight-card">
          <div class="card-header">
            <div class="title-with-badge">
              <h3 class="section-title">Online Check-in ล่าสุด</h3>
              <el-badge :value="dashboardStore.stats.pendingCheckins" type="danger" />
            </div>
            <el-button text type="primary" @click="$router.push('/check-ins')">
              ดูทั้งหมด
            </el-button>
          </div>
          <el-table
            :data="dashboardStore.pendingCheckinsList"
            style="width: 100%"
            v-loading="dashboardStore.loading"
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="bookingNumber" label="Booking No." width="150" />
            <el-table-column prop="customerName" label="ลูกค้า">
              <template #default="{ row }">
                <div class="customer-name-cell">
                  <span class="unread-indicator" v-if="row.status === 'pending'"></span>
                  <span class="customer-name">{{ row.customerName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="วันที่ส่ง" width="120" />
            <el-table-column label="จัดการ" width="120" align="center">
              <template #default="{ row }">
                <el-button type="primary" plain size="small" @click="$router.push(`/check-ins/${row.id}`)">
                  ดูรายละเอียด
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="view-only-notice mt-4">
            <el-icon><InfoFilled /></el-icon>
            <span>* รายการข้างต้นใช้สำหรับตรวจสอบภาพรวมเท่านั้น การอนุมัติจะดำเนินการผ่านระบบ <strong>Car Plan</strong></span>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="dashboard-sidebar">
        <!-- Active Promotions -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="section-title">โปรโมชันที่กำลังแสดง</h3>
            <el-button text type="primary" @click="$router.push('/promotions')">
              จัดการ
            </el-button>
          </div>
          <div class="promotion-list">
            <div
              v-for="promo in dashboardStore.activePromotions"
              :key="promo.id"
              class="promotion-item"
            >
              <div class="promo-image-wrapper">
                <img :src="promo.image" :alt="promo.title" />
              </div>
              <div class="promotion-info">
                <div class="promotion-title">{{ promo.title }}</div>
                <div class="promotion-date">
                  <el-icon><Calendar /></el-icon>
                  {{ promo.startDate }} - {{ promo.endDate }}
                </div>
              </div>
              <div class="status-indicator active"></div>
            </div>
            
            <div v-if="dashboardStore.activePromotions.length === 0" class="empty-state-mini">
              <el-icon><Files /></el-icon>
              <p>ไม่มีโปรโมชันที่กำลังแสดง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import {
  Picture,
  Refresh,
  ArrowUp,
  ShoppingCart,
  Box,
  Ticket,
  Warning,
  Discount,
  EditPen,
  ChatLineSquare,
  Calendar,
  Files,
  ChatDotRound,
  InfoFilled
} from '@element-plus/icons-vue'
import { useDashboardStore } from '@/stores/dashboard'
import VisitorStatsChart from '@/components/dashboard/charts/VisitorStatsChart.vue'
import UserBehaviorChart from '@/components/dashboard/charts/UserBehaviorChart.vue'
import AvgDurationCard from '@/components/dashboard/charts/AvgDurationCard.vue'

const dashboardStore = useDashboardStore()

const tableRowClassName = ({ row }) => {
  if (row.status === 'pending') return 'unread-row'
  return ''
}

onMounted(async () => {
  dashboardStore.fetchAllData()
})
</script>

<style lang="scss" scoped>
.text-subtitle {
  color: #6B7280;
  font-size: 14px;
  margin-top: 4px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

// Stat Cards customizations
.stat-card {
  cursor: pointer;
  display: flex !important;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  
  &--highlight {
    border: 1px solid rgba(255, 89, 90, 0.2);
    background: linear-gradient(135deg, #fff 0%, #fff 70%, rgba(255, 89, 90, 0.05) 100%);
  }
  
  &-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  &-trend {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    
    &.trend-up {
      color: #36B37E;
    }
    
    &.trend-danger {
      color: #FF5630;
      animation: pulse 2s infinite;
    }
    
    &.trend-neutral {
      color: #9CA3AF;
    }
  }

  &-icon {
    &--danger { background: rgba(255, 89, 90, 0.1); color: #FF595A; }
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.highlight-card {
  border: 1px solid rgba(255, 89, 90, 0.1);
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

// Quick Actions
.quick-actions-card {
  background: linear-gradient(to right, #fff, #fff);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  
  .action-item {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #fff;
      border-color: #FF595A;
      box-shadow: 0 4px 12px rgba(255, 89, 90, 0.15);
      transform: translateY(-2px);
      
      .action-icon {
        transform: scale(1.1);
      }
    }
    
    span {
      font-size: 14px;
      font-weight: 500;
      color: #4B5563;
    }
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: transform 0.2s;
    
    &--primary { background: rgba(255, 89, 90, 0.1); color: #FF595A; }
    &--success { background: rgba(54, 179, 126, 0.1); color: #36B37E; }
    &--warning { background: rgba(255, 171, 0, 0.1); color: #FFAB00; }
    &--info { background: rgba(37, 116, 255, 0.1); color: #2574FF; }
  }
}

// Recent Articles Table
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
  font-weight: 500;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  
  &--published { background-color: #36B37E; }
  &--draft { background-color: #FFAB00; }
}

.status-text {
  font-size: 13px;
  color: #6B7280;
}

// Promotion List
.promotion-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.promotion-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #F3F4F6;
  position: relative;
  transition: all 0.2s;
  
  &:hover {
    border-color: #FF595A;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
}

.promo-image-wrapper {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.promotion-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.promotion-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promotion-date {
  font-size: 12px;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-indicator {
  width: 4px;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 4px 0 0 4px;
  
  &.active {
    background-color: #36B37E;
  }
}

.empty-state-mini {
  text-align: center;
  padding: 32px 0;
  color: #9CA3AF;
  font-size: 14px;
  
  .el-icon {
    font-size: 32px;
    margin-bottom: 8px;
    display: block;
    margin: 0 auto 8px;
    opacity: 0.5;
  }
}

.banner-summary {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  
  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .label {
      font-size: 12px;
      color: #6B7280;
    }
    
    .value {
      font-size: 18px;
      font-weight: 700;
      color: #1D2433;
    }
  }
}

.view-only-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6B7280;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px dashed #D1D5DB;

  .el-icon {
    font-size: 16px;
    color: #2574FF;
  }

  strong {
    color: #1D2433;
    margin-left: 4px;
  }
}

.customer-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .customer-name {
    font-size: 14px;
    line-height: 1.4;
  }
}

:deep(.unread-row) {
  background-color: #FFF9F2 !important;
  font-weight: 700 !important;
  color: #101828 !important;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: #2E90FA;
  border-radius: 50%;
  flex-shrink: 0;
}
.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: #2E90FA;
  border-radius: 50%;
  flex-shrink: 0;
}

// Analytics Layout
.analytics-dashboard {
  margin-bottom: 24px;
}

.analytics-row-main {
  height: 350px;
  width: 100%;
}

.analytics-row-secondary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 250px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
}

.mb-4 {
  margin-bottom: 24px;
}
</style>
