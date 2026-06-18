import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { Booking, CycleRule, QueueItem, QueuePriority, Caddie } from '@/types';
import { bookings as initialBookings, cycleRules as initialCycleRules } from '@/data/bookings';
import { queueItems as initialQueueItems } from '@/data/queue';
import { caddies as initialCaddies } from '@/data/members';
import { getMemberById } from '@/data/members';
import { getCourseById } from '@/data/courses';
import { formatDateTime, getWeekday } from '@/utils/date';

const STORAGE_KEY = 'golf_booking_app_state_v2';

const priorityWeight: Record<QueuePriority, number> = { urgent: 0, vip: 1, normal: 2 };

const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface PersistedState {
  bookings: Booking[];
  cycleRules: CycleRule[];
  queueItems: (QueueItem & { seq: number })[];
  caddies: Caddie[];
}

const parseDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const computeBookingConflict = (
  bookings: Booking[],
  courseId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): boolean => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  if (startMin >= endMin) return true;
  return bookings.some((b) => {
    if (excludeId && b.id === excludeId) return false;
    if (b.courseId !== courseId) return false;
    if (b.date !== date) return false;
    if (b.status === 'cancelled') return false;
    const bs = timeToMinutes(b.startTime);
    const be = timeToMinutes(b.endTime);
    return startMin < be && endMin > bs;
  });
};

const loadPersistedState = (): PersistedState & {
  maxBookingSeq: number;
  maxCycleSeq: number;
  maxQueueSeq: number;
  maxQueueNumber: number;
} => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (!raw) {
      console.info('[Store] 无持久化数据，使用初始数据');
      return {
        bookings: initialBookings,
        cycleRules: initialCycleRules,
        queueItems: initialQueueItems.map((q, idx) => ({ ...q, seq: 200 + idx + 1 })),
        caddies: initialCaddies,
        maxBookingSeq: 100,
        maxCycleSeq: 100,
        maxQueueSeq: 200,
        maxQueueNumber: 200
      };
    }
    const data = JSON.parse(raw) as PersistedState;
    const bkSeq = Math.max(
      100,
      ...(data.bookings || []).map((b: Booking) => {
        const m = b.id.match(/^b(\d+)$/);
        return m ? Number(m[1]) : 0;
      })
    );
    const cySeq = Math.max(
      100,
      ...(data.cycleRules || []).map((c: CycleRule) => {
        const m = c.id.match(/^cy(\d+)$/);
        return m ? Number(m[1]) : 0;
      })
    );
    const qSeq = Math.max(
      200,
      ...(data.queueItems || []).map((q) => q.seq || 0)
    );
    const qNum = Math.max(
      200,
      ...(data.queueItems || []).map((q) => q.number)
    );
    console.info('[Store] 加载持久化数据成功', {
      bookings: data.bookings?.length,
      cycleRules: data.cycleRules?.length,
      queueItems: data.queueItems?.length,
      caddies: data.caddies?.length
    });
    return {
      bookings: data.bookings || initialBookings,
      cycleRules: data.cycleRules || initialCycleRules,
      queueItems: data.queueItems || initialQueueItems.map((q, idx) => ({ ...q, seq: 200 + idx + 1 })),
      caddies: data.caddies || initialCaddies,
      maxBookingSeq: bkSeq,
      maxCycleSeq: cySeq,
      maxQueueSeq: qSeq,
      maxQueueNumber: qNum
    };
  } catch (e) {
    console.error('[Store] 读取持久化数据失败', e);
    return {
      bookings: initialBookings,
      cycleRules: initialCycleRules,
      queueItems: initialQueueItems.map((q, idx) => ({ ...q, seq: 200 + idx + 1 })),
      caddies: initialCaddies,
      maxBookingSeq: 100,
      maxCycleSeq: 100,
      maxQueueSeq: 200,
      maxQueueNumber: 200
    };
  }
};

const persisted = loadPersistedState();
let bookingSeq = persisted.maxBookingSeq;
let cycleSeq = persisted.maxCycleSeq;
let queueSeq = persisted.maxQueueSeq;
let queueNumberSeq = persisted.maxQueueNumber;

interface AppState {
  bookings: Booking[];
  cycleRules: CycleRule[];
  queueItems: (QueueItem & { seq: number })[];
  caddies: Caddie[];

  hasBookingConflict: (courseId: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;

  addBooking: (data: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: Booking['status'] }) => string;
  updateBooking: (id: string, patch: Partial<Booking>) => boolean;
  cancelBooking: (id: string) => void;
  getBookingById: (id: string) => Booking | undefined;

  assignCaddie: (bookingId: string, caddieId: string) => boolean;
  removeCaddieFromBooking: (bookingId: string) => void;
  getCaddieById: (id: string) => Caddie | undefined;
  getIdleCaddies: () => Caddie[];

  addCycleRule: (data: Omit<CycleRule, 'id' | 'generatedCount' | 'totalCount'>) => string;
  updateCycleRule: (id: string, patch: Partial<CycleRule>) => void;
  toggleCycleRule: (id: string) => void;
  getCycleRuleById: (id: string) => CycleRule | undefined;
  generateBookingsFromCycle: (cycleId: string, toDate: string) => { success: number; skipped: string[]; total: number; };

  takeNumber: (priority: QueuePriority, courseId: string, playerCount: number) => string;
  callNext: () => string | null;
  getSortedQueue: () => (QueueItem & { seq: number })[];
  getCalledQueue: () => (QueueItem & { seq: number })[];
}

export const useAppStore = create<AppState>((set, get) => ({
  bookings: persisted.bookings,
  cycleRules: persisted.cycleRules,
  queueItems: persisted.queueItems,
  caddies: persisted.caddies,

  hasBookingConflict: (courseId, date, startTime, endTime, excludeId) => {
    return computeBookingConflict(get().bookings, courseId, date, startTime, endTime, excludeId);
  },

  addBooking: (data) => {
    if (computeBookingConflict(get().bookings, data.courseId, data.date, data.startTime, data.endTime)) {
      console.warn('[Booking] 新增预订被冲突拦截', data.courseId, data.date, data.startTime);
      return '';
    }
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
    const current = get().bookings.find((b) => b.id === id);
    if (!current) return false;

    const nextCourseId = patch.courseId || current.courseId;
    const nextDate = patch.date || current.date;
    const nextStart = patch.startTime || current.startTime;
    const nextEnd = patch.endTime || current.endTime;

    if (
      (patch.courseId || patch.date || patch.startTime || patch.endTime) &&
      computeBookingConflict(get().bookings, nextCourseId, nextDate, nextStart, nextEnd, id)
    ) {
      console.warn('[Booking] 更新预订被冲突拦截', id, patch);
      return false;
    }

    if (patch.caddieId !== undefined && patch.caddieId !== current.caddieId) {
      const nextCaddieId = patch.caddieId;
      const prevCaddieId = current.caddieId;
      set((state) => {
        let nextCaddies = [...state.caddies];
        if (prevCaddieId) {
          nextCaddies = nextCaddies.map((c) =>
            c.id === prevCaddieId ? { ...c, status: 'idle' as const } : c
          );
        }
        if (nextCaddieId) {
          nextCaddies = nextCaddies.map((c) =>
            c.id === nextCaddieId ? { ...c, status: 'working' as const, todayRounds: c.todayRounds + 1 } : c
          );
        }
        return {
          caddies: nextCaddies,
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b))
        };
      });
      return true;
    }

    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b))
    }));
    console.info('[Booking] 更新预订', id, patch);
    return true;
  },

  cancelBooking: (id) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return;
    const caddieId = booking.caddieId;
    set((state) => {
      let nextCaddies = state.caddies;
      if (caddieId) {
        nextCaddies = state.caddies.map((c) =>
          c.id === caddieId ? { ...c, status: 'idle' as const } : c
        );
      }
      return {
        caddies: nextCaddies,
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b
        )
      };
    });
    console.info('[Booking] 取消预订', id, '球童释放', caddieId);
  },

  getBookingById: (id) => get().bookings.find((b) => b.id === id),

  assignCaddie: (bookingId, caddieId) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    const caddie = get().caddies.find((c) => c.id === caddieId);
    if (!booking || !caddie) return false;
    if (caddie.status !== 'idle') {
      console.warn('[Caddie] 球童非空闲', caddieId, caddie.status);
      return false;
    }
    const prevCaddieId = booking.caddieId;
    set((state) => {
      let nextCaddies = [...state.caddies];
      if (prevCaddieId) {
        nextCaddies = nextCaddies.map((c) =>
          c.id === prevCaddieId ? { ...c, status: 'idle' as const } : c
        );
      }
      nextCaddies = nextCaddies.map((c) =>
        c.id === caddieId ? { ...c, status: 'working' as const, todayRounds: c.todayRounds + 1 } : c
      );
      return {
        caddies: nextCaddies,
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, caddieId, caddieName: caddie.name } : b
        )
      };
    });
    console.info('[Caddie] 指派球童', bookingId, '->', caddieId, caddie.name);
    return true;
  },

  removeCaddieFromBooking: (bookingId) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking || !booking.caddieId) return;
    const caddieId = booking.caddieId;
    set((state) => ({
      caddies: state.caddies.map((c) =>
        c.id === caddieId ? { ...c, status: 'idle' as const } : c
      ),
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, caddieId: undefined, caddieName: undefined } : b
      )
    }));
    console.info('[Caddie] 移除球童', bookingId, caddieId);
  },

  getCaddieById: (id) => get().caddies.find((c) => c.id === id),

  getIdleCaddies: () => get().caddies.filter((c) => c.status === 'idle'),

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
    return id;
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

  generateBookingsFromCycle: (cycleId, toDate) => {
    const rule = get().getCycleRuleById(cycleId);
    if (!rule) return { success: 0, skipped: [], total: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startD = parseDate(rule.startDate);
    const toD = parseDate(toDate);
    if (startD < today) startD = today;
    if (toD < startD) {
      console.warn('[Cycle] 结束日期早于开始日期', { startD, toD });
      return { success: 0, skipped: [], total: 0 };
    }

    const member = getMemberById(rule.memberId);
    const course = getCourseById(rule.courseId);
    if (!member || !course) {
      console.error('[Cycle] 会员或球道不存在', rule);
      return { success: 0, skipped: [], total: 0 };
    }

    const successDates: string[] = [];
    const skippedDates: string[] = [];

    let current = new Date(startD);
    const endD = new Date(toD);

    while (current <= endD) {
      const dateStr = formatDate(current);
      if (getWeekday(dateStr) === rule.weekday) {
        const hasConflict = computeBookingConflict(
          get().bookings,
          rule.courseId,
          dateStr,
          rule.startTime,
          rule.endTime
        );
        if (hasConflict) {
          skippedDates.push(dateStr);
        } else {
          const id = `b${++bookingSeq}`;
          const booking: Booking = {
            id,
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar,
            courseId: course.id,
            courseName: course.name,
            date: dateStr,
            startTime: rule.startTime,
            endTime: rule.endTime,
            playerCount: rule.playerCount,
            status: 'confirmed',
            isVip: member.isVip,
            isCycle: true,
            cycleId: rule.id,
            createdAt: formatDateTime(new Date())
          };
          set((state) => ({
            bookings: [booking, ...state.bookings]
          }));
          successDates.push(dateStr);
        }
      }
      current.setDate(current.getDate() + 1);
    }

    const result = {
      success: successDates.length,
      skipped: skippedDates,
      total: successDates.length + skippedDates.length
    };

    if (successDates.length > 0) {
      set((state) => ({
        cycleRules: state.cycleRules.map((c) =>
          c.id === cycleId
            ? { ...c, generatedCount: c.generatedCount + successDates.length }
            : c
        )
      }));
    }

    console.info('[Cycle] 批量生成完成', cycleId, result);
    return result;
  },

  takeNumber: (priority, courseId, playerCount) => {
    const id = `q${++queueSeq}`;
    const number = ++queueNumberSeq;
    const seq = queueSeq;
    const course = getCourseById(courseId);
    const member = getMemberById('m001') || getMemberById('m002');
    if (!member || !course) {
      --queueNumberSeq;
      --queueSeq;
      console.error('[Queue] 取号失败，会员或球道不存在', { priority, courseId });
      return '';
    }
    const now = new Date();
    const baseDelay = priority === 'urgent' ? 15 : priority === 'vip' ? 25 : 45;
    now.setMinutes(now.getMinutes() + baseDelay);
    const estimatedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const item: QueueItem & { seq: number } = {
      id,
      number,
      seq,
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      courseId: course.id,
      courseName: course.name,
      status: 'waiting',
      priority,
      playerCount,
      estimatedTime,
      joinedAt: formatDateTime(new Date())
    };
    set((state) => ({ queueItems: [item, ...state.queueItems] }));
    console.info('[Queue] 取号成功', id, number, priority);
    return id;
  },

  callNext: () => {
    const sorted = get().getSortedQueue();
    const next = sorted[0];
    if (!next) {
      console.warn('[Queue] 队列为空，无下一位');
      return null;
    }
    set((state) => ({
      queueItems: state.queueItems.map((q) =>
        q.id === next.id ? { ...q, status: 'called' as const, calledAt: formatDateTime(new Date()) } : q
      )
    }));
    console.info('[Queue] 叫号', next.id, next.number);
    return next.id;
  },

  getSortedQueue: () => {
    return [...get().queueItems]
      .filter((item) => item.status === 'waiting')
      .sort((a, b) => {
        const pa = priorityWeight[a.priority];
        const pb = priorityWeight[b.priority];
        if (pa !== pb) return pa - pb;
        return a.seq - b.seq;
      });
  },

  getCalledQueue: () => {
    return get().queueItems
      .filter((item) => item.status === 'called' || item.status === 'playing')
      .sort((a, b) => b.seq - a.seq);
  }
}));

useAppStore.subscribe((state) => {
  try {
    const payload: PersistedState = {
      bookings: state.bookings,
      cycleRules: state.cycleRules,
      queueItems: state.queueItems,
      caddies: state.caddies
    };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('[Store] 持久化失败', e);
  }
});
