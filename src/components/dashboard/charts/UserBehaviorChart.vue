<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">หน้ายอดนิยม (Popular Pages)</h3>
    </div>
    <div class="chart-body">
      <div class="chart-container">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
      <div class="legend-list">
        <div v-for="(label, index) in chartData.labels" :key="index" class="legend-item">
          <span class="dot" :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"></span>
          <span class="label">{{ label }}</span>
          <span class="value">{{ chartData.datasets[0].data[index] }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { useDashboardStore } from '@/stores/dashboard'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useDashboardStore()
const chartData = computed(() => store.userBehavior || { labels: [], datasets: [] })

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1D2433',
      bodyColor: '#6B7280',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      callbacks: {
          labelTextColor: function() {
              return '#6B7280';
          }
      }
    }
  },
  cutout: '70%',
  radius: '90%'
}
</script>

<style lang="scss" scoped>
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.chart-body {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 200px;
}

.chart-container {
  flex: 1;
  height: 100%;
  position: relative;
  max-width: 180px;
}

.legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
  }
  
  .label {
    color: #6B7280;
    flex: 1;
  }
  
  .value {
    font-weight: 600;
    color: #111827;
  }
}
</style>
