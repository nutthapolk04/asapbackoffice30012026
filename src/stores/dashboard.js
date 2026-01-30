import { defineStore } from 'pinia';
import api from '@/services/api';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        stats: {
            totalOrders: 0,
            carPickups: 0,
            pendingCheckins: 0,
            unreadMessages: 0
        },
        recentArticles: [],
        activePromotions: [],
        pendingCheckinsList: [],
        loading: false,
        error: null,
        // Analytics Data
        visitorStats: null,
        userBehavior: null,
        avgDuration: null
    }),

    actions: {
        async fetchStats() {
            try {
                const response = await api.get('/stats');
                this.stats = response.data;
            } catch (err) {
                this.error = 'Failed to fetch stats';
                console.error(err);
            }
        },

        async fetchRecentArticles() {
            try {
                const response = await api.get('/articles/recent');
                this.recentArticles = response.data;
            } catch (err) {
                this.error = 'Failed to fetch articles';
                console.error(err);
            }
        },

        async fetchActivePromotions() {
            try {
                const response = await api.get('/promotions/active');
                this.activePromotions = response.data;
            } catch (err) {
                this.error = 'Failed to fetch promotions';
                console.error(err);
            }
        },

        async fetchPendingCheckins() {
            try {
                const response = await api.get('/check-ins/pending');
                this.pendingCheckinsList = response.data;
            } catch (err) {
                console.error('Failed to fetch pending checkins', err);
            }
        },


        async fetchAnalyticsData() {
            // Mock Data for Analytics
            this.visitorStats = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'ผู้เข้าชม (คน)',
                        backgroundColor: (ctx) => {
                            const canvas = ctx.chart.ctx;
                            const gradient = canvas.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(255, 89, 90, 0.5)');
                            gradient.addColorStop(1, 'rgba(255, 89, 90, 0.0)');
                            return gradient;
                        },
                        borderColor: '#FF595A',
                        pointBackgroundColor: '#FF595A',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#FF595A',
                        data: [150, 230, 224, 218, 135, 147, 260],
                        fill: true,
                        tension: 0.4
                    }
                ]
            };

            this.userBehavior = {
                labels: ['หน้าแรก (Home)', 'จองรถ (Booking)', 'โปรโมชัน (Promo)', 'ติดต่อเรา (Contact)'],
                datasets: [
                    {
                        backgroundColor: ['#FF595A', '#2574FF', '#36B37E', '#FFAB00'],
                        data: [45, 30, 15, 10]
                    }
                ]
            };

            this.avgDuration = {
                value: '4m 32s',
                trend: '+15%',
                trendDirection: 'up', // up, down, neutral
                history: [3, 4, 3.5, 4.2, 4.5, 4.8, 5] // Sparkline data
            };
        },

        async fetchAllData() {
            this.loading = true;
            this.error = null;
            try {
                await Promise.all([
                    this.fetchStats(),
                    this.fetchRecentArticles(),
                    this.fetchActivePromotions(),
                    this.fetchRecentArticles(),
                    this.fetchActivePromotions(),
                    this.fetchPendingCheckins(),
                    this.fetchAnalyticsData()
                ]);
            } catch (err) {
                this.error = 'Failed to load dashboard data';
            } finally {
                this.loading = false;
            }
        }
    }
});
