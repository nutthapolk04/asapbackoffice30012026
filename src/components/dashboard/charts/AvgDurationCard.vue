<template>
  <div class="metric-card">
    <div class="metric-header">
      <div class="metric-icon">
        <el-icon><Timer /></el-icon>
      </div>
      <h3 class="metric-title">ระยะเวลาเข้าชมเฉลี่ย (Avg. Visit Duration)</h3>
    </div>
    
    <div class="metric-content">
      <div class="metric-value">{{ store.avgDuration?.value || '0m 0s' }}</div>
      <div class="metric-trend" :class="trendClass">
        <el-icon v-if="trendDirection === 'up'"><ArrowUp /></el-icon>
        <el-icon v-else-if="trendDirection === 'down'"><ArrowDown /></el-icon>
        <el-icon v-else><Minus /></el-icon>
        <span>{{ store.avgDuration?.trend || '0%' }} vs สัปดาห์ก่อน</span>
      </div>
    </div>

    <!-- Simple Sparkline Representation -->
    <div class="sparkline-container" v-if="store.avgDuration?.history">
        <div 
            v-for="(val, index) in normalizedHistory" 
            :key="index" 
            class="spark-bar"
            :style="{ height: `${val}%` }"
        ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Timer, ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()

const trendDirection = computed(() => store.avgDuration?.trendDirection || 'neutral')

const trendClass = computed(() => {
  if (trendDirection.value === 'up') return 'trend-up'
  if (trendDirection.value === 'down') return 'trend-down'
  return 'trend-neutral'
})

const normalizedHistory = computed(() => {
    const history = store.avgDuration?.history || []
    if (history.length === 0) return []
    const max = Math.max(...history)
    return history.map(val => (val / max) * 100)
})
</script>

<style lang="scss" scoped>
.metric-card {
  background: white; // Or a specific gradient like #2574FF
  border-radius: 12px;
  padding: 24px;
  color: #1D2433;
  border: 1px solid #E5E7EB;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  .metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(37, 116, 255, 0.1);
    color: #2574FF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .metric-title {
    font-size: 14px;
    font-weight: 500;
    color: #6B7280;
    margin: 0;
  }
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  
  &.trend-up { color: #36B37E; }
  &.trend-down { color: #FF5630; }
  &.trend-neutral { color: #9CA3AF; }
}

.sparkline-container {
    height: 40px;
    display: flex;
    align-items: flex-end;
    gap: 6px;
    margin-top: 24px;
    opacity: 0.8;
}

.spark-bar {
    flex: 1;
    background-color: #2574FF; // Primary Blue
    border-radius: 2px;
    min-height: 4px;
    transition: height 0.5s ease;
}
</style>
