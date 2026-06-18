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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  isVip: boolean;
  isCycle: boolean;
  cycleId?: string;
  caddieId?: string;
  caddieName?: string;
  createdAt: string;
}

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
  priority: 'normal' | 'vip' | 'urgent';
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
