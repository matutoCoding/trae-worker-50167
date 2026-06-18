import type { Booking, CycleRule } from '@/types';

export const bookings: Booking[] = [
  {
    id: 'b001',
    memberId: 'm001',
    memberName: '张伟',
    memberAvatar: 'https://picsum.photos/id/64/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    date: '2026-06-18',
    startTime: '07:00',
    endTime: '11:30',
    playerCount: 4,
    status: 'confirmed',
    isVip: false,
    isCycle: true,
    cycleId: 'cy001',
    caddieId: 'ca001',
    caddieName: '李明',
    createdAt: '2026-06-10 10:00'
  },
  {
    id: 'b002',
    memberId: 'm002',
    memberName: '王芳',
    memberAvatar: 'https://picsum.photos/id/91/200/200',
    courseId: 'c002',
    courseName: '锦标赛2号场',
    date: '2026-06-18',
    startTime: '08:30',
    endTime: '13:00',
    playerCount: 3,
    status: 'playing',
    isVip: true,
    isCycle: false,
    caddieId: 'ca002',
    caddieName: '赵强',
    createdAt: '2026-06-15 14:30'
  },
  {
    id: 'b003',
    memberId: 'm003',
    memberName: '刘强',
    memberAvatar: 'https://picsum.photos/id/177/200/200',
    courseId: 'c003',
    courseName: 'VIP专属场',
    date: '2026-06-18',
    startTime: '09:00',
    endTime: '13:30',
    playerCount: 4,
    status: 'confirmed',
    isVip: true,
    isCycle: true,
    cycleId: 'cy002',
    caddieId: 'ca003',
    caddieName: '孙丽',
    createdAt: '2026-06-01 09:00'
  },
  {
    id: 'b004',
    memberId: 'm004',
    memberName: '陈静',
    memberAvatar: 'https://picsum.photos/id/338/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    date: '2026-06-18',
    startTime: '12:00',
    endTime: '16:30',
    playerCount: 2,
    status: 'pending',
    isVip: false,
    isCycle: false,
    createdAt: '2026-06-17 16:00'
  },
  {
    id: 'b005',
    memberId: 'm005',
    memberName: '杨华',
    memberAvatar: 'https://picsum.photos/id/1027/200/200',
    courseId: 'c005',
    courseName: '山景5号场',
    date: '2026-06-18',
    startTime: '14:00',
    endTime: '18:30',
    playerCount: 4,
    status: 'pending',
    isVip: false,
    isCycle: true,
    cycleId: 'cy003',
    createdAt: '2026-06-12 11:20'
  },
  {
    id: 'b006',
    memberId: 'm001',
    memberName: '张伟',
    memberAvatar: 'https://picsum.photos/id/64/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    date: '2026-06-25',
    startTime: '07:00',
    endTime: '11:30',
    playerCount: 4,
    status: 'confirmed',
    isVip: false,
    isCycle: true,
    cycleId: 'cy001',
    createdAt: '2026-06-10 10:00'
  },
  {
    id: 'b007',
    memberId: 'm001',
    memberName: '张伟',
    memberAvatar: 'https://picsum.photos/id/64/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    date: '2026-07-02',
    startTime: '07:00',
    endTime: '11:30',
    playerCount: 4,
    status: 'confirmed',
    isVip: false,
    isCycle: true,
    cycleId: 'cy001',
    createdAt: '2026-06-10 10:00'
  }
];

export const cycleRules: CycleRule[] = [
  {
    id: 'cy001',
    memberId: 'm001',
    memberName: '张伟',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    weekday: 4,
    startTime: '07:00',
    endTime: '11:30',
    playerCount: 4,
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    isActive: true,
    generatedCount: 8,
    totalCount: 30
  },
  {
    id: 'cy002',
    memberId: 'm003',
    memberName: '刘强',
    courseId: 'c003',
    courseName: 'VIP专属场',
    weekday: 4,
    startTime: '09:00',
    endTime: '13:30',
    playerCount: 4,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    generatedCount: 24,
    totalCount: 52
  },
  {
    id: 'cy003',
    memberId: 'm005',
    memberName: '杨华',
    courseId: 'c005',
    courseName: '山景5号场',
    weekday: 4,
    startTime: '14:00',
    endTime: '18:30',
    playerCount: 4,
    startDate: '2026-05-01',
    endDate: '2026-10-31',
    isActive: true,
    generatedCount: 7,
    totalCount: 26
  },
  {
    id: 'cy004',
    memberId: 'm002',
    memberName: '王芳',
    courseId: 'c002',
    courseName: '锦标赛2号场',
    weekday: 6,
    startTime: '06:30',
    endTime: '11:00',
    playerCount: 3,
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    isActive: false,
    generatedCount: 12,
    totalCount: 26
  }
];

export const getBookingsByDate = (date: string): Booking[] => {
  return bookings.filter(b => b.date === date);
};

export const getBookingsByMember = (memberId: string): Booking[] => {
  return bookings.filter(b => b.memberId === memberId);
};

export const getBookingById = (id: string): Booking | undefined => {
  return bookings.find(b => b.id === id);
};
