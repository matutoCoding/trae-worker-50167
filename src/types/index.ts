export interface Course {
  id: string;
  name: string;
  number: number;
  type: 'standard' | 'vip' | 'executive';
  status: 'available' | 'occupied' | 'maintenance' | 'closed';
  capacity: number;
  currentPlayers: number;
  description: string;
  todayBookings: number;
  yardage: number;
  par: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'playing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  courseId: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  playerCount: number;
  status: BookingStatus;
  isVip: boolean;
  isCycle: boolean;
  cycleId?: string;
  caddieId?: string;
  caddieName?: string;
  createdAt: string;
}

export const BookingStatusText: Record<BookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  playing: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

export type QueuePriority = 'normal' | 'vip' | 'urgent';

export const QueuePriorityText: Record<QueuePriority, string> = {
  normal: '普通',
  vip: 'VIP优先',
  urgent: '应急插队'
};

export interface CycleRule {
  id: string;
  memberId: string;
  memberName: string;
  courseId: string;
  courseName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  playerCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  generatedCount: number;
  totalCount: number;
}

export interface QueueItem {
  id: string;
  number: number;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  courseId: string;
  courseName: string;
  status: 'waiting' | 'called' | 'playing' | 'passed';
  priority: QueuePriority;
  playerCount: number;
  estimatedTime: string;
  joinedAt: string;
  calledAt?: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  level: 'regular' | 'silver' | 'gold' | 'diamond';
  isVip: boolean;
  totalBookings: number;
  joinDate: string;
  points: number;
}

export interface Caddie {
  id: string;
  name: string;
  avatar: string;
  level: 'junior' | 'senior' | 'master';
  status: 'idle' | 'working' | 'rest';
  rating: number;
  totalRounds: number;
  todayRounds: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  bookingId?: string;
}
