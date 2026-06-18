import type { QueueItem } from '@/types';

export const queueItems: QueueItem[] = [
  {
    id: 'q001',
    number: 101,
    memberId: 'm006',
    memberName: '周明',
    memberAvatar: 'https://picsum.photos/id/64/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    status: 'called',
    priority: 'normal',
    playerCount: 4,
    estimatedTime: '--',
    joinedAt: '2026-06-18 06:45',
    calledAt: '2026-06-18 06:58'
  },
  {
    id: 'q002',
    number: 102,
    memberId: 'm007',
    memberName: '吴敏',
    memberAvatar: 'https://picsum.photos/id/91/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    status: 'waiting',
    priority: 'vip',
    playerCount: 2,
    estimatedTime: '07:15',
    joinedAt: '2026-06-18 06:50'
  },
  {
    id: 'q003',
    number: 103,
    memberId: 'm008',
    memberName: '郑浩',
    memberAvatar: 'https://picsum.photos/id/177/200/200',
    courseId: 'c002',
    courseName: '锦标赛2号场',
    status: 'waiting',
    priority: 'urgent',
    playerCount: 3,
    estimatedTime: '08:45',
    joinedAt: '2026-06-18 07:00'
  },
  {
    id: 'q004',
    number: 104,
    memberId: 'm009',
    memberName: '黄丽',
    memberAvatar: 'https://picsum.photos/id/338/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    status: 'waiting',
    priority: 'normal',
    playerCount: 4,
    estimatedTime: '07:45',
    joinedAt: '2026-06-18 06:55'
  },
  {
    id: 'q005',
    number: 105,
    memberId: 'm010',
    memberName: '林涛',
    memberAvatar: 'https://picsum.photos/id/1027/200/200',
    courseId: 'c005',
    courseName: '山景5号场',
    status: 'waiting',
    priority: 'normal',
    playerCount: 2,
    estimatedTime: '09:30',
    joinedAt: '2026-06-18 07:10'
  },
  {
    id: 'q006',
    number: 106,
    memberId: 'm011',
    memberName: '徐峰',
    memberAvatar: 'https://picsum.photos/id/64/200/200',
    courseId: 'c001',
    courseName: '锦标赛1号场',
    status: 'waiting',
    priority: 'vip',
    playerCount: 4,
    estimatedTime: '08:00',
    joinedAt: '2026-06-18 07:15'
  },
  {
    id: 'q007',
    number: 107,
    memberId: 'm012',
    memberName: '孙燕',
    memberAvatar: 'https://picsum.photos/id/91/200/200',
    courseId: 'c006',
    courseName: '林克斯6号场',
    status: 'waiting',
    priority: 'normal',
    playerCount: 3,
    estimatedTime: '10:00',
    joinedAt: '2026-06-18 07:20'
  }
];

export const getSortedQueue = (): QueueItem[] => {
  const priorityWeight = { urgent: 0, vip: 1, normal: 2 };
  return [...queueItems]
    .filter(item => item.status === 'waiting')
    .sort((a, b) => {
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      }
      return a.joinedAt.localeCompare(b.joinedAt);
    });
};

export const getCalledQueue = (): QueueItem[] => {
  return queueItems.filter(item => item.status === 'called' || item.status === 'playing');
};
