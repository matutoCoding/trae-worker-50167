import type { Member, Caddie } from '@/types';

export const currentMember: Member = {
  id: 'm001',
  name: '张伟',
  avatar: 'https://picsum.photos/id/64/200/200',
  phone: '138****8888',
  level: 'gold',
  isVip: true,
  totalBookings: 128,
  joinDate: '2023-03-15',
  points: 8650
};

export const members: Member[] = [
  {
    id: 'm001',
    name: '张伟',
    avatar: 'https://picsum.photos/id/64/200/200',
    phone: '138****8888',
    level: 'gold',
    isVip: true,
    totalBookings: 128,
    joinDate: '2023-03-15',
    points: 8650
  },
  {
    id: 'm002',
    name: '王芳',
    avatar: 'https://picsum.photos/id/91/200/200',
    phone: '139****6666',
    level: 'diamond',
    isVip: true,
    totalBookings: 256,
    joinDate: '2022-01-08',
    points: 15200
  },
  {
    id: 'm003',
    name: '刘强',
    avatar: 'https://picsum.photos/id/177/200/200',
    phone: '137****1234',
    level: 'diamond',
    isVip: true,
    totalBookings: 310,
    joinDate: '2021-06-20',
    points: 22400
  },
  {
    id: 'm005',
    name: '杨华',
    avatar: 'https://picsum.photos/id/1027/200/200',
    phone: '135****5678',
    level: 'silver',
    isVip: false,
    totalBookings: 64,
    joinDate: '2024-02-11',
    points: 3200
  },
  {
    id: 'm006',
    name: '周明',
    avatar: 'https://picsum.photos/id/64/200/200',
    phone: '136****9012',
    level: 'regular',
    isVip: false,
    totalBookings: 18,
    joinDate: '2025-01-05',
    points: 560
  },
  {
    id: 'm007',
    name: '吴敏',
    avatar: 'https://picsum.photos/id/91/200/200',
    phone: '133****3456',
    level: 'gold',
    isVip: true,
    totalBookings: 142,
    joinDate: '2022-11-30',
    points: 9800
  }
];

export const getMemberById = (id: string): Member | undefined => {
  return members.find(m => m.id === id);
};

export const caddies: Caddie[] = [
  {
    id: 'ca001',
    name: '李明',
    avatar: 'https://picsum.photos/id/1027/200/200',
    level: 'master',
    status: 'working',
    rating: 4.9,
    totalRounds: 1256,
    todayRounds: 2
  },
  {
    id: 'ca002',
    name: '赵强',
    avatar: 'https://picsum.photos/id/177/200/200',
    level: 'senior',
    status: 'working',
    rating: 4.8,
    totalRounds: 892,
    todayRounds: 3
  },
  {
    id: 'ca003',
    name: '孙丽',
    avatar: 'https://picsum.photos/id/338/200/200',
    level: 'master',
    status: 'idle',
    rating: 4.95,
    totalRounds: 1580,
    todayRounds: 1
  },
  {
    id: 'ca004',
    name: '周华',
    avatar: 'https://picsum.photos/id/64/200/200',
    level: 'senior',
    status: 'idle',
    rating: 4.7,
    totalRounds: 678,
    todayRounds: 0
  },
  {
    id: 'ca005',
    name: '吴敏',
    avatar: 'https://picsum.photos/id/91/200/200',
    level: 'junior',
    status: 'rest',
    rating: 4.5,
    totalRounds: 234,
    todayRounds: 0
  },
  {
    id: 'ca006',
    name: '郑华',
    avatar: 'https://picsum.photos/id/1027/200/200',
    level: 'junior',
    status: 'idle',
    rating: 4.6,
    totalRounds: 312,
    todayRounds: 0
  }
];

export const getLevelName = (level: Member['level']): string => {
  const map = { regular: '普通会员', silver: '银卡会员', gold: '金卡会员', diamond: '钻石会员' };
  return map[level];
};

export const getCaddieLevelName = (level: Caddie['level']): string => {
  const map = { junior: '初级球童', senior: '高级球童', master: '大师级球童' };
  return map[level];
};
