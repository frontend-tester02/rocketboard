// Typed mock data for Dashboard #1. Replaced by real endpoints in I3.

export interface StatItem {
  key: string;
  label: string;
  value: string;
  change: number; // percent, positive or negative
  icon: 'income' | 'sales' | 'clients';
}

export const stats: StatItem[] = [
  { key: 'income', label: 'Total Income', value: '$8.500', change: 53.8, icon: 'income' },
  { key: 'sales', label: 'Total Sales', value: '3.500K', change: 32.5, icon: 'sales' },
  { key: 'clients', label: 'New Clients', value: '2.500K', change: 24.3, icon: 'clients' },
];

export interface WeeklyPoint {
  day: string;
  income: number;
  expense: number;
}

export const statisticsWeekly: WeeklyPoint[] = [
  { day: 'Mon', income: 1800, expense: 900 },
  { day: 'Tue', income: 2500, expense: 1200 },
  { day: 'Wed', income: 1600, expense: 1400 },
  { day: 'Thu', income: 2200, expense: 800 },
  { day: 'Fri', income: 2000, expense: 1500 },
  { day: 'Sat', income: 1400, expense: 700 },
  { day: 'Sun', income: 2300, expense: 1100 },
];

export interface AnalyticsPoint {
  name: string;
  revenue: number;
  profit: number;
}

export const analytics: AnalyticsPoint[] = [
  { name: 'W1', revenue: 1200, profit: 600 },
  { name: 'W2', revenue: 2100, profit: 900 },
  { name: 'W3', revenue: 800, profit: 500 },
  { name: 'W4', revenue: 1600, profit: 1000 },
  { name: 'W5', revenue: 2600, profit: 1400 },
  { name: 'W6', revenue: 2000, profit: 1100 },
  { name: 'W7', revenue: 3200, profit: 1800 },
];

export const analyticsSummary = {
  revenue: '$5.850',
  profit: '$1.750',
};

export const salesGauge = {
  total: 3500,
  currentWeek: { value: 3500, change: 5.8 },
  lastWeek: { value: 1000, change: -5.8 },
};

export interface DivergingPoint {
  label: string;
  income: number;
  expense: number; // stored positive; rendered to the left
}

export const diverging: DivergingPoint[] = [
  { label: '08:00', income: 320, expense: 180 },
  { label: '10:00', income: 260, expense: 240 },
  { label: '12:00', income: 380, expense: 150 },
  { label: '14:00', income: 200, expense: 300 },
  { label: '16:00', income: 340, expense: 220 },
  { label: '18:00', income: 280, expense: 120 },
];

export type PaymentType = 'Credit Card' | 'PayPal';

export interface OrderRow {
  id: string;
  customer: string;
  orderNo: string;
  amount: string;
  payment: PaymentType;
  date: string;
}

export const lastOrders: OrderRow[] = [
  { id: '1', customer: 'Regina Cooper', orderNo: '#760841', amount: '$2.500', payment: 'Credit Card', date: '12.09.2019' },
  { id: '2', customer: 'Robert Edwards', orderNo: '#760894', amount: '$1.500', payment: 'PayPal', date: '12.09.2019' },
  { id: '3', customer: 'Gloria Mckinney', orderNo: '#790857', amount: '$5.000', payment: 'Credit Card', date: '12.09.2019' },
  { id: '4', customer: 'Randall Fisher', orderNo: '#790687', amount: '$2.850', payment: 'PayPal', date: '12.09.2019' },
];

export interface TransactionRow {
  id: string;
  name: string;
  when: string;
  amount: number;
  type: 'Payment' | 'Refund';
}

export const transactions: TransactionRow[] = [
  { id: '1', name: 'Devon Williamson', when: '08:00 am · 19 August', amount: 1400, type: 'Payment' },
  { id: '2', name: 'Debra Wilson', when: '08:30 am · 19 August', amount: -600, type: 'Refund' },
  { id: '3', name: 'Judith Black', when: '09:15 am · 19 August', amount: 1200, type: 'Payment' },
  { id: '4', name: 'Philip Henry', when: '10:00 am · 19 August', amount: 600, type: 'Payment' },
  { id: '5', name: 'Mitchel Cooper', when: '11:30 am · 19 August', amount: 900, type: 'Payment' },
];

// ── Dashboard #2 (finance) ────────────────────────────────────────────────

export interface SparkStat {
  key: string;
  label: string;
  value: string;
  change: number;
  color: 'income' | 'expense';
  data: number[];
}

export const sparkStats: SparkStat[] = [
  { key: 'income', label: 'Total Income', value: '$8.500', change: 53.8, color: 'income', data: [8, 10, 7, 12, 9, 14, 13] },
  { key: 'expense', label: 'Total Expense', value: '3.500K', change: -50.8, color: 'expense', data: [14, 11, 12, 8, 10, 6, 7] },
  { key: 'bonus', label: 'Total Bonus', value: '5.100K', change: 24.3, color: 'income', data: [6, 8, 7, 10, 9, 12, 15] },
];

export const balance = {
  amount: 27500,
  income: 500,
  spending: 300,
  wave: [12, 18, 10, 22, 16, 26, 20, 30, 24].map((v, i) => ({ i, v })),
};

export const cardDetails: { label: string; value: string }[] = [
  { label: 'Card Type', value: 'Visa' },
  { label: 'Card Holder', value: 'Felecia Brown' },
  { label: 'Expires', value: '12/19' },
  { label: 'Card Number', value: '5880 5057 3258 8854' },
  { label: 'Total Balance', value: '$80,700.00' },
  { label: 'Total Debt', value: '$8,250.00' },
];

export const myCard = {
  brand: 'VISA',
  holder: 'Felecia Brown',
  number: '5880 5057 3258 8854',
  balance: 80700,
};

export type TxCategory = 'shopping' | 'travel' | 'food' | 'medicine' | 'sport';

export interface CategoryTx {
  id: string;
  category: TxCategory;
  title: string;
  time: string;
  amount: number;
}

export const categoryTransactions: CategoryTx[] = [
  { id: '1', category: 'shopping', title: 'Shopping', time: '09:00 am · 19 August', amount: -1400 },
  { id: '2', category: 'travel', title: 'Travel', time: '10:30 am · 19 August', amount: -850 },
  { id: '3', category: 'food', title: 'Food', time: '12:15 pm · 19 August', amount: -2150 },
  { id: '4', category: 'medicine', title: 'Medicine', time: '02:00 pm · 19 August', amount: -850 },
  { id: '5', category: 'sport', title: 'Sport', time: '05:30 pm · 19 August', amount: -900 },
];

// ── Dashboard #3 (projects) ───────────────────────────────────────────────

export type TaskTileIcon = 'total' | 'new' | 'progress' | 'done';

export interface TaskTileItem {
  key: string;
  label: string;
  value: number;
  change: number;
  icon: TaskTileIcon;
}

export const taskTiles: TaskTileItem[] = [
  { key: 'total', label: 'Total Tasks', value: 320, change: 12.5, icon: 'total' },
  { key: 'new', label: 'New Tasks', value: 48, change: 8.2, icon: 'new' },
  { key: 'progress', label: 'In Progress', value: 76, change: -3.4, icon: 'progress' },
  { key: 'done', label: 'Completed', value: 196, change: 18.9, icon: 'done' },
];

export const projectsStatus = { ongoing: 24, hold: 8, done: 42 };

export type TaskPeriod = 'day' | 'week' | 'month';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface ActiveTask {
  id: string;
  title: string;
  done: boolean;
  priority: TaskPriority;
  time: string;
}

export const activeTasks: Record<TaskPeriod, ActiveTask[]> = {
  day: [
    { id: 'd1', title: 'Finalize finance dashboard layout', done: true, priority: 'high', time: '09:00 am' },
    { id: 'd2', title: 'Review chat panel interactions', done: false, priority: 'medium', time: '11:30 am' },
    { id: 'd3', title: 'Sync card balances with API', done: false, priority: 'high', time: '02:00 pm' },
    { id: 'd4', title: 'Prepare category breakdown', done: false, priority: 'low', time: '04:15 pm' },
  ],
  week: [
    { id: 'w1', title: 'Ship Dashboard #3 widgets', done: false, priority: 'high', time: 'Mon' },
    { id: 'w2', title: 'QA the orders table', done: true, priority: 'medium', time: 'Tue' },
    { id: 'w3', title: 'Design projects gauge', done: true, priority: 'low', time: 'Wed' },
    { id: 'w4', title: 'Wire activity timeline', done: false, priority: 'medium', time: 'Fri' },
  ],
  month: [
    { id: 'm1', title: 'Launch E-Commerce module', done: false, priority: 'high', time: 'Week 1' },
    { id: 'm2', title: 'Integrate notifications', done: false, priority: 'medium', time: 'Week 2' },
    { id: 'm3', title: 'Calendar scheduling', done: true, priority: 'low', time: 'Week 3' },
  ],
};

export const heatmapHours = ['08', '10', '12', '14', '16', '18', '20'];
export const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Rows = days, columns = hours; values 0–4 are the posting intensity.
export const heatmap: number[][] = [
  [1, 3, 4, 2, 3, 1, 0],
  [0, 2, 3, 4, 2, 1, 1],
  [2, 1, 3, 3, 4, 2, 0],
  [1, 2, 2, 4, 3, 3, 1],
  [0, 1, 4, 3, 2, 1, 2],
  [1, 0, 2, 1, 2, 0, 1],
  [0, 1, 1, 2, 1, 0, 0],
];

export interface ActivityItem {
  id: string;
  actor: string;
  text: string;
  time: string;
}

export interface ActivityGroup {
  date: string;
  items: ActivityItem[];
}

export const recentActivity: ActivityGroup[] = [
  {
    date: 'Today',
    items: [
      { id: 'a1', actor: 'Felecia Brown', text: 'commented on Finance Dashboard', time: '09:15 am' },
      { id: 'a2', actor: 'Robert Edwards', text: 'completed task “Sync card balances”', time: '10:40 am' },
      { id: 'a3', actor: 'Gloria Mckinney', text: 'uploaded 3 files to Projects', time: '12:05 pm' },
    ],
  },
  {
    date: 'Yesterday',
    items: [
      { id: 'a4', actor: 'Regina Cooper', text: 'created project “Rocket Admin”', time: '03:20 pm' },
      { id: 'a5', actor: 'Randall Fisher', text: 'moved 5 tasks to In Progress', time: '05:00 pm' },
    ],
  },
];

// ── Dashboard #4 (tasks) ──────────────────────────────────────────────────

export interface MiniBarStatItem {
  key: string;
  label: string;
  value: string;
  change: number;
  color: 'income' | 'expense';
  data: number[];
}

export const miniBarStats: MiniBarStatItem[] = [
  { key: 'completed', label: 'Completed Tasks', value: '196', change: 18.9, color: 'income', data: [4, 6, 5, 8, 7, 9, 11] },
  { key: 'productivity', label: 'Productivity', value: '87%', change: 5.2, color: 'income', data: [6, 5, 7, 6, 8, 7, 9] },
  { key: 'hours', label: 'Tracked Hours', value: '142h', change: -2.1, color: 'expense', data: [9, 7, 8, 6, 7, 5, 6] },
];

export interface ProjectProgressItem {
  id: string;
  label: string;
  value: number;
  total: number;
  color: string;
}

export const totalProjects: ProjectProgressItem[] = [
  { id: 'p1', label: 'UI/UX Design', value: 32, total: 40, color: 'hsl(var(--primary))' },
  { id: 'p2', label: 'Development', value: 18, total: 30, color: 'hsl(var(--warning))' },
  { id: 'p3', label: 'Marketing', value: 12, total: 20, color: 'hsl(var(--success))' },
  { id: 'p4', label: 'Research', value: 6, total: 15, color: 'hsl(var(--danger))' },
];

// ── Dashboard #5 (social) ─────────────────────────────────────────────────

export interface ProfileInfoRow {
  label: string;
  value: string;
}

export const profileInfo: ProfileInfoRow[] = [
  { label: 'Email', value: 'felecia.brown@rocket.io' },
  { label: 'Phone', value: '+1 (704) 555-0127' },
  { label: 'Location', value: 'Charlotte, NC' },
  { label: 'Joined', value: 'March 2022' },
];

export interface PersonItem {
  id: string;
  name: string;
  role: string;
}

export const favorites: PersonItem[] = [
  { id: 'f1', name: 'Regina Cooper', role: 'Product Designer' },
  { id: 'f2', name: 'Robert Edwards', role: 'Frontend Dev' },
  { id: 'f3', name: 'Gloria Mckinney', role: 'Marketing Lead' },
  { id: 'f4', name: 'Randall Fisher', role: 'QA Engineer' },
];

export type SocialStatIcon = 'visitors' | 'followers' | 'likes' | 'comments';

export interface SocialStatItem {
  key: string;
  label: string;
  value: string;
  change: number;
  icon: SocialStatIcon;
}

export const socialStats: SocialStatItem[] = [
  { key: 'visitors', label: 'Visitors', value: '12.4K', change: 14.2, icon: 'visitors' },
  { key: 'followers', label: 'Followers', value: '8.2K', change: 9.8, icon: 'followers' },
  { key: 'likes', label: 'Likes', value: '24.6K', change: 21.5, icon: 'likes' },
  { key: 'comments', label: 'Comments', value: '3.1K', change: -4.3, icon: 'comments' },
];

export interface VisitPoint {
  name: string;
  min: number;
  avg: number;
  max: number;
}

export const visits: VisitPoint[] = [
  { name: 'Mon', min: 120, avg: 320, max: 540 },
  { name: 'Tue', min: 180, avg: 420, max: 620 },
  { name: 'Wed', min: 140, avg: 360, max: 500 },
  { name: 'Thu', min: 220, avg: 480, max: 700 },
  { name: 'Fri', min: 260, avg: 520, max: 760 },
  { name: 'Sat', min: 200, avg: 440, max: 640 },
  { name: 'Sun', min: 160, avg: 380, max: 560 },
];

export const visitsSummary = { min: '120', avg: '417', max: '760' };

export interface FollowerSource {
  name: string;
  value: number;
  color: string;
}

export const followerSources: FollowerSource[] = [
  { name: 'Instagram', value: 42, color: 'hsl(var(--primary))' },
  { name: 'Facebook', value: 28, color: 'hsl(var(--warning))' },
  { name: 'Twitter', value: 18, color: 'hsl(var(--success))' },
  { name: 'Other', value: 12, color: 'hsl(var(--danger))' },
];

export interface GrowthPoint {
  name: string;
  value: number;
}

export const followersGrowth: GrowthPoint[] = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 3200 },
  { name: 'Mar', value: 2800 },
  { name: 'Apr', value: 4100 },
  { name: 'May', value: 3600 },
  { name: 'Jun', value: 4800 },
];

export const newFollowers: PersonItem[] = [
  { id: 'nf1', name: 'Judith Black', role: 'UX Researcher' },
  { id: 'nf2', name: 'Philip Henry', role: 'Data Analyst' },
  { id: 'nf3', name: 'Devon Williamson', role: 'Backend Dev' },
  { id: 'nf4', name: 'Debra Wilson', role: 'Content Writer' },
];
