<template>
  <div class="duration-card">
    <div class="duration-header">
      <div class="icon-wrapper">
        <el-icon><Timer /></el-icon>
      </div>
      <span class="duration-label">ระยะเวลาเข้าชมเฉลี่ย</span>
    </div>
    
    <div class="duration-main">
      <div class="duration-value">{{ store.avgDuration?.value || '0m 0s' }}</div>
      <div class="duration-trend" :class="trendClass">
        <el-icon v-if="trendDirection === 'up'"><ArrowUp /></el-icon>
        <el-icon v-else-if="trendDirection === 'down'"><ArrowDown /></el-icon>
        <span>{{ store.avgDuration?.trend || '0%' }} จากสัปดาห์ก่อน</span>
      </div>
    </div>

    <!-- Modern Wave Chart -->
    <div class="wave-chart" v-if="store.avgDuration?.history">
      <svg viewBox="0 0 200 50" preserveAspectRatio="none" class="wave-svg">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#6366F1;stop-opacity:0.4" />
            <stop offset="100%" style="stop-color:#6366F1;stop-opacity:0.05" />
          </linearGradient>
        </defs>
        <path :d="wavePath" fill="url(#waveGradient)" />
        <path :d="linePath" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Timer, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
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

const linePath = computed(() => {
  const data = normalizedHistory.value
  if (data.length === 0) return ''
  
  const width = 200
  const height = 50
  const padding = 5
  const step = width / (data.length - 1)
  
  const points = data.map((val, i) => {
    const x = i * step
    const y = height - padding - (val / 100) * (height - padding * 2)
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
})

const wavePath = computed(() => {
  const data = normalizedHistory.value
  if (data.length === 0) return ''
  
  const width = 200
  const height = 50
  const padding = 5
  const step = width / (data.length - 1)
  
  const points = data.map((val, i) => {
    const x = i * step
    const y = height - padding - (val / 100) * (height - padding * 2)
    return `${x},${y}`
  })
  
  return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`
})
</script>

<style lang="scss" scoped>
.duration-card {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
}

.duration-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  .icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .duration-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }
}

.duration-main {
  flex: 1;
}

.duration-value {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 8px;
}

.duration-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  
  &.trend-up { color: #86EFAC; }
  &.trend-down { color: #FCA5A5; }
  &.trend-neutral { color: rgba(255, 255, 255, 0.6); }
}

.wave-chart {
  margin-top: 16px;
  height: 50px;
  
  .wave-svg {
    width: 100%;
    height: 100%;
  }
}
</style>
