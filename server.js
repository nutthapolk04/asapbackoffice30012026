import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
const banners = [
  { id: 1, title: 'Summer Sale', image: 'https://placehold.co/800x400/FF595A/white?text=Summer+Sale', status: 'active' },
  { id: 2, title: 'New Collection', image: 'https://placehold.co/800x400/1D2433/white?text=New+Arrivals', status: 'active' },
  { id: 3, title: 'Maintenance Notice', image: 'https://placehold.co/800x400/FFAB00/white?text=Maintenance', status: 'inactive' }
];

const promotions = [
  {
    id: 1,
    title: 'Mom\'s Day Special',
    image: 'https://placehold.co/300x200/FF595A/white?text=Mom+Day',
    startDate: '01/08/2025',
    endDate: '31/08/2025',
    status: 'active'
  },
  {
    id: 2,
    title: 'September Double Deal',
    image: 'https://placehold.co/300x200/2574FF/white?text=9.9+Deal',
    startDate: '01/09/2025',
    endDate: '09/09/2025',
    status: 'active'
  },
  {
    id: 3,
    title: 'End Year Sale',
    image: 'https://placehold.co/300x200/36B37E/white?text=End+Year',
    startDate: '01/12/2025',
    endDate: '31/12/2025',
    status: 'draft'
  }
];

const articles = [
  { id: 1, title: '10 เส้นทางท่องเที่ยวยอดนิยม', category: 'ท่องเที่ยว', status: 'published', date: '28/11/2025', views: 1250 },
  { id: 2, title: 'วิธีเช่ารถสำหรับมือใหม่', category: 'แนะนำ', status: 'published', date: '27/11/2025', views: 850 },
  { id: 3, title: 'โปรโมชั่นส่งท้ายปี 2025', category: 'โปรโมชั่น', status: 'draft', date: '26/11/2025', views: 0 },
  { id: 4, title: 'การดูแลรักษารถยนต์เบื้องต้น', category: 'ความรู้', status: 'published', date: '25/11/2025', views: 540 },
  { id: 5, title: 'เที่ยวเหนือหน้าหนาว', category: 'ท่องเที่ยว', status: 'published', date: '20/11/2025', views: 2100 }
];

const faqs = Array.from({ length: 24 }, (_, i) => ({ id: i + 1, question: `Question ${i + 1}`, answer: `Answer ${i + 1}`, status: 'published' }));

const orders = Array.from({ length: 450 }, (_, i) => ({ id: i + 1, status: 'completed' }));
const pickups = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, time: '10:00' }));
const checkIns = [
  { id: 1, bookingNumber: 'ASP20241201001', customerName: 'สมชาย ใจดี', status: 'pending', date: '2024-12-15' },
  { id: 2, bookingNumber: 'ASP20241201002', customerName: 'สมหญิง รักเที่ยว', status: 'pending', date: '2024-12-15' },
  { id: 5, bookingNumber: 'ASP20241215001', customerName: 'ประภา สุขใจ', status: 'pending', date: '2024-12-15' },
  { id: 3, bookingNumber: 'ASP20241130001', customerName: 'วิชัย ขับดี', status: 'approved', date: '2024-12-14' },
  { id: 4, bookingNumber: 'ASP20241128001', customerName: 'นภา ท่องโลก', status: 'rejected', date: '2024-12-13' }
];

const contacts = [
  { id: 1, name: 'ลูกค้า A', message: 'สอบถามโปรโมชั่น', isRead: false },
  { id: 2, name: 'ลูกค้า B', message: 'ต้องการเช่ารถรายเดือน', isRead: false },
  { id: 3, name: 'ลูกค้า C', message: 'สอบถามเรื่องประกัน', isRead: true }
];

// --- API Endpoints ---

// Get Overview Stats
app.get('/api/stats', (req, res) => {
  res.json({
    totalOrders: orders.length,
    carPickups: pickups.length,
    pendingCheckins: checkIns.filter(c => c.status === 'pending').length,
    unreadMessages: contacts.filter(c => !c.isRead).length
  });
});

// Get Pending Check-ins
app.get('/api/check-ins/pending', (req, res) => {
  res.json(checkIns.filter(c => c.status === 'pending'));
});

// Get Recent Articles (Limit 5)
app.get('/api/articles/recent', (req, res) => {
  res.json(articles.slice(0, 5));
});

// Get Active Promotions
app.get('/api/promotions/active', (req, res) => {
  const activePromos = promotions.filter(p => p.status === 'active');
  res.json(activePromos);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
