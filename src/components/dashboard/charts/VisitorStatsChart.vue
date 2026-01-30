<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">สถิติผู้เข้าชมเว็บไซต์ (Visitor Stats)</h3>
      <div class="chart-legend">
        <span class="legend-dot"></span> ผู้เข้าชม
      </div>
    </div>
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useDashboardStore } from '@/stores/dashboard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const store = useDashboardStore()
const chartData = computed(() => store.visitorStats || { labels: [], datasets: [] })

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1D2433',
      bodyColor: '#6B7280',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      padding: 10,
      displayColors: true,
      callbacks: {
        labelTextColor: function() {
            return '#6B7280';
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#F3F4F6',
        drawBorder: false
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11
        }
      }
    }
  },
  interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
  }
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
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.chart-legend {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6B7280;
  
  .legend-dot {
    width: 8px;
    height: 8px;
    background-color: #FF595A;
    border-radius: 50%;
    margin-right: 6px;
  }
}

.chart-container {
  flex: 1;
  min-height: 250px;
  position: relative;
}
</style>
