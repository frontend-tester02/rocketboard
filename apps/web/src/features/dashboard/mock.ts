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
