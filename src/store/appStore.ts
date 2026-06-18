import { create } from 'zustand';
import type { Booking, CycleRule, QueueItem, QueuePriority } from '@/types';
import { bookings as initialBookings, cycleRules as initialCycleRules } from '@/data/bookings';
import { queueItems as initialQueueItems } from '@/data/queue';
import { getMemberById } from '@/data/members';
import { getCourseById } from '@/data/courses';
import { formatDateTime } from '@/utils/date';

interface AppState {
  bookings: Booking[];
  cycleRules: CycleRule[];
  queueItems: QueueItem[];

  addBooking: (data: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: Booking['status'] }) => string;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  getBookingById: (id: string) => Booking | undefined;

  addCycleRule: (data: Omit<CycleRule, 'id' | 'generatedCount' | 'totalCount'>) => void;
  updateCycleRule: (id: string, patch: Partial<CycleRule>) => void;
  toggleCycleRule: (id: string) => void;
  getCycleRuleById: (id: string) => CycleRule | undefined;

  takeNumber: (priority: QueuePriority, courseId: string, playerCount: number) => string;
  callNext: () => void;
  getSortedQueue: () => QueueItem[];
  getCalledQueue: () => QueueItem[];
}

let bookingSeq = 100;
let cycleSeq = 100;
let queueSeq = 200;

const estimateTime = (priority: QueuePriority): string => {
  const now = new Date();
  const baseDelay = priority === 'urgent' ? 15 : priority === 'vip' ? 25 : 45;
  now.setMinutes(now.getMinutes() + baseDelay);
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const useAppStore = create<AppState>((set, get) => ({
  bookings: initialBookings,
  cycleRules: initialCycleRules,
  queueItems: initialQueueItems,

  addBooking: (data) => {
    const id = `b${++bookingSeq}`;
    const createdAt = formatDateTime(new Date());
    const booking: Booking = {
      ...data,
      id,
      createdAt,
      status: data.status || 'pending'
    };
    set((state) => ({ bookings: [booking, ...state.bookings] }));
    console.info('[Booking] 新增预订', id, booking);
    return id;
  },

  updateBooking: (id, patch) => {
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b))
    }));
    console.info('[Booking] 更新预订', id, patch);
  },

  cancelBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      )
    }));
    console.info('[Booking] 取消预订', id);
  },

  getBookingById: (id) => get().bookings.find((b) => b.id === id),

  addCycleRule: (data) => {
    const id = `cy${++cycleSeq}`;
    const rule: CycleRule = {
      ...data,
      id,
      generatedCount: 0,
      totalCount: 30
    };
    set((state) => ({ cycleRules: [rule, ...state.cycleRules] }));
    console.info('[Cycle] 新增周期规则', id, rule);
  },

  updateCycleRule: (id, patch) => {
    set((state) => ({
      cycleRules: state.cycleRules.map((c) => (c.id === id ? { ...c, ...patch } : c))
    }));
    console.info('[Cycle] 更新周期规则', id, patch);
  },

  toggleCycleRule: (id) => {
    set((state) => ({
      cycleRules: state.cycleRules.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    }));
  },

  getCycleRuleById: (id) => get().cycleRules.find((c) => c.id === id),

  takeNumber: (priority, courseId, playerCount) => {
    const id = `q${++queueSeq}`;
    const number = queueSeq;
    const course = getCourseById(courseId);
    const member = getMemberById('m001') || getMemberById('m002');
    if (!member || !course) {
      console.error('[Queue] 取号失败，会员或球道不存在', { priority, courseId });
      return '';
    }
    const item: QueueItem = {
      id,
      number,
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      courseId: course.id,
      courseName: course.name,
      status: 'waiting',
      priority,
      playerCount,
      estimatedTime: estimateTime(priority),
      joinedAt: formatDateTime(new Date())
    };
    set((state) => ({ queueItems: [item, ...state.queueItems] }));
    console.info('[Queue] 取号成功', id, item);
    return id;
  },

  callNext: () => {
    const sorted = get().getSortedQueue();
    const next = sorted[0];
    if (!next) {
      console.warn('[Queue] 队列为空，无下一位');
      return;
    }
    set((state) => ({
      queueItems: state.queueItems.map((q) =>
        q.id === next.id ? { ...q, status: 'called' as const, calledAt: formatDateTime(new Date()) } : q
      )
    }));
    console.info('[Queue] 叫号', next.id, next.number);
  },

  getSortedQueue: () => {
    const priorityWeight: Record<QueuePriority, number> = { urgent: 0, vip: 1, normal: 2 };
    return [...get().queueItems]
      .filter((item) => item.status === 'waiting')
      .sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[a.priority] - priorityWeight[b.priority];
        }
        return a.joinedAt.localeCompare(b.joinedAt);
      });
  },

  getCalledQueue: () => {
    return get().queueItems.filter((item) => item.status === 'called' || item.status === 'playing');
  }
}));
