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
                labels: [
                    'หน้าแรก (Home)',
                    'จองรถเช่า (Booking)',
                    'โปรโมชัน (Promotions)',
                    'คูปองส่วนลด (Coupons)',
                    'บทความ (Articles)',
                    'เช็คอินออนไลน์ (Check-in)',
                    'พลาซ่า (Plaza)',
                    'ติดต่อเรา (Contact)',
                    'คำถามที่พบบ่อย (FAQ)',
                    'นโยบายความเป็นส่วนตัว (Privacy)'
                ],
                datasets: [
                    {
                        backgroundColor: [
                            '#FF595A', // Red
                            '#2574FF', // Blue
                            '#36B37E', // Green
                            '#FFAB00', // Yellow
                            '#6366F1', // Indigo
                            '#EC4899', // Pink
                            '#14B8A6', // Teal
                            '#F59E0B', // Amber
                            '#8B5CF6', // Violet
                            '#9CA3AF'  // Gray
                        ],
                        data: [25, 20, 15, 12, 8, 7, 5, 4, 2, 2]
                    }
                ]
            };

            this.avgDuration = {
                value: '4m 32s',
                trend: '+15%',
                trendDirection: 'up', // up, down, neutral
                history: [3, 4, 3.5, 4.2, 4.5, 4.8, 5] // Sparkline data
            };

            // Realistic mock data for pending check-ins
            this.pendingCheckinsList = [
                {
                    id: 1,
                    bookingNumber: 'BK-2026020401',
                    customerName: 'คุณสมชาย ใจดี',
                    date: '04/02/2569',
                    status: 'pending'
                },
                {
                    id: 2,
                    bookingNumber: 'BK-2026020402',
                    customerName: 'คุณสมหญิง รักสวย',
                    date: '04/02/2569',
                    status: 'pending'
                },
                {
                    id: 3,
                    bookingNumber: 'BK-2026020403',
                    customerName: 'คุณวิชัย มั่งมี',
                    date: '04/02/2569',
                    status: 'pending'
                },
                {
                    id: 4,
                    bookingNumber: 'BK-2026020305',
                    customerName: 'คุณนภา แสงทอง',
                    date: '03/02/2569',
                    status: 'reviewed'
                },
                {
                    id: 5,
                    bookingNumber: 'BK-2026020306',
                    customerName: 'คุณประยุทธ์ รักชาติ',
                    date: '03/02/2569',
                    status: 'reviewed'
                }
            ];

            // Realistic stats
            this.stats = {
                totalOrders: 156,
                carPickups: 42,
                pendingCheckins: 3,
                unreadMessages: 7
            };

            // Active promotions mock
            this.activePromotions = [
                {
                    id: 1,
                    title: 'โปรซัมเมอร์ลดแรง 30%',
                    image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=200&h=150&fit=crop',
                    startDate: '01/02/2569',
                    endDate: '28/02/2569'
                },
                {
                    id: 2,
                    title: 'เช่ารถ 3 วันฟรี 1 วัน',
                    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=200&h=150&fit=crop',
                    startDate: '01/02/2569',
                    endDate: '15/02/2569'
                },
                {
                    id: 3,
                    title: 'สมาชิกใหม่รับส่วนลด 500฿',
                    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop',
                    startDate: '01/01/2569',
                    endDate: '31/03/2569'
                }
            ];
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
