import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date, format = 'HH:mm'): string => {
  return dayjs(date).format(format);
};

export const getWeekday = (date: string | Date): number => {
  return dayjs(date).day();
};

export const getWeekdayName = (weekday: number): string => {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return names[weekday] || '';
};

export const getTodayDate = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const getNowTime = (): string => {
  return dayjs().format('HH:mm');
};

export const generateDays = (count = 7): Array<{ date: string; weekday: number; day: number; isToday: boolean }> => {
  const days = [];
  for (let i = 0; i < count; i++) {
    const date = dayjs().add(i, 'day');
    days.push({
      date: date.format('YYYY-MM-DD'),
      weekday: date.day(),
      day: date.date(),
      isToday: i === 0
    });
  }
  return days;
};

export const generateTimeSlots = (startHour = 6, endHour = 18, interval = 30): string[] => {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};
