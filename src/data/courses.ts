import type { Course } from '@/types';

export const courses: Course[] = [
  {
    id: 'c001',
    name: '锦标赛1号场',
    number: 1,
    type: 'standard',
    status: 'available',
    capacity: 4,
    currentPlayers: 0,
    description: '标准18洞锦标赛级球场，球道宽阔，适合各类球手',
    todayBookings: 8,
    yardage: 7200,
    par: 72
  },
  {
    id: 'c002',
    name: '锦标赛2号场',
    number: 2,
    type: 'standard',
    status: 'occupied',
    capacity: 4,
    currentPlayers: 4,
    description: '湖景球场，水障碍众多，极具挑战性',
    todayBookings: 12,
    yardage: 6800,
    par: 72
  },
  {
    id: 'c003',
    name: 'VIP专属场',
    number: 3,
    type: 'vip',
    status: 'available',
    capacity: 4,
    currentPlayers: 0,
    description: 'VIP会员专属球场，私密性极佳，配备专属球童',
    todayBookings: 4,
    yardage: 7000,
    par: 72
  },
  {
    id: 'c004',
    name: '行政场',
    number: 4,
    type: 'executive',
    status: 'maintenance',
    capacity: 4,
    currentPlayers: 0,
    description: '9洞行政球场，适合快速打球和练习',
    todayBookings: 0,
    yardage: 3200,
    par: 36
  },
  {
    id: 'c005',
    name: '山景5号场',
    number: 5,
    type: 'standard',
    status: 'available',
    capacity: 4,
    currentPlayers: 2,
    description: '依山而建，起伏较大，山景优美',
    todayBookings: 6,
    yardage: 6900,
    par: 72
  },
  {
    id: 'c006',
    name: '林克斯6号场',
    number: 6,
    type: 'standard',
    status: 'available',
    capacity: 4,
    currentPlayers: 0,
    description: '林克斯风格球场，沙坑众多，考验短杆',
    todayBookings: 5,
    yardage: 6700,
    par: 71
  }
];

export const getCourseById = (id: string): Course | undefined => {
  return courses.find(c => c.id === id);
};

export const getAvailableCourses = (): Course[] => {
  return courses.filter(c => c.status === 'available');
};
