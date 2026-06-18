import React, { useState, useMemo } from 'react';
import { View, Text, Button, Picker } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';
import { getCourseById } from '@/data/courses';
import { currentMember } from '@/data/members';
import { getTodayDate } from '@/utils/date';
import type { Course } from '@/types';
import styles from './index.module.scss';

const TYPE_NAMES: Record<Course['type'], string> = {
  standard: '标准场',
  vip: 'VIP场',
  executive: '行政场'
};

const STATUS_NAMES: Record<Course['status'], string> = {
  available: '可用',
  occupied: '使用中',
  maintenance: '维护中',
  closed: '已关闭'
};

interface Slot {
  start: string;
  end: string;
}

const ALL_SLOTS: Slot[] = [
  { start: '06:00', end: '10:30' },
  { start: '07:30', end: '12:00' },
  { start: '09:00', end: '13:30' },
  { start: '10:30', end: '15:00' },
  { start: '12:00', end: '16:30' },
  { start: '13:30', end: '18:00' },
  { start: '15:00', end: '19:30' },
  { start: '16:30', end: '21:00' }
];

const PLAYER_OPTIONS = ['1人', '2人', '3人', '4人'];

const CourseDetailPage: React.FC = () => {
  const [courseId, setCourseId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDate());
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [playerCount, setPlayerCount] = useState<number>(2);

  const bookings = useAppStore((s) => s.bookings);
  const addBooking = useAppStore((s) => s.addBooking);

  useLoad((options) => {
    const id = (options as { id?: string })?.id;
    if (id) {
      setCourseId(id);
    }
  });

  const course = getCourseById(courseId);

  const occupiedStartTimes = useMemo(() => {
    return new Set(
      bookings
        .filter((b) => b.courseId === courseId && b.date === date && b.status !== 'cancelled')
        .map((b) => b.startTime)
    );
  }, [bookings, courseId, date]);

  const isCourseBookable = course && course.status === 'available';

  const handleSlotClick = (slot: Slot) => {
    if (occupiedStartTimes.has(slot.start)) {
      Taro.showToast({ title: '该时段已被占用', icon: 'none' });
      return;
    }
    setSelectedSlot(slot.start);
  };

  const handleSubmit = () => {
    if (!course) {
      Taro.showToast({ title: '球道信息异常', icon: 'none' });
      return;
    }
    if (!isCourseBookable) {
      Taro.showToast({ title: '当前球道不可预订', icon: 'none' });
      return;
    }
    if (!selectedSlot) {
      Taro.showToast({ title: '请选择打球时段', icon: 'none' });
      return;
    }
    const slot = ALL_SLOTS.find((s) => s.start === selectedSlot)!;
    const id = addBooking({
      memberId: currentMember.id,
      memberName: currentMember.name,
      memberAvatar: currentMember.avatar,
      courseId: course.id,
      courseName: course.name,
      date,
      startTime: slot.start,
      endTime: slot.end,
      playerCount,
      status: 'confirmed',
      isVip: currentMember.isVip,
      isCycle: false
    });
    Taro.showToast({ title: '预订成功', icon: 'success' });
    console.info('[Booking] 球道详情页提交新预订', id);
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/booking/index' });
    }, 800);
  };

  if (!course) {
    return (
      <View className={styles.container}>
        <View className={styles.body}>
          <Text className={styles.sectionTitle}>球道信息加载中或不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.courseHeader}>
        <View className={styles.courseNameRow}>
          <Text className={styles.courseName}>{course.name}</Text>
          <Text style={{ fontSize: '22rpx', background: 'rgba(255,255,255,0.2)', padding: '4rpx 16rpx', borderRadius: '20rpx' }}>
            {TYPE_NAMES[course.type]} · {STATUS_NAMES[course.status]}
          </Text>
        </View>
        <Text className={styles.courseDesc}>{course.description}</Text>
        <View className={styles.courseMeta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{course.par}</Text>
            <Text className={styles.metaLabel}>标准杆</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{course.yardage}</Text>
            <Text className={styles.metaLabel}>总码数</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{course.capacity}</Text>
            <Text className={styles.metaLabel}>容纳人数</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{course.todayBookings}</Text>
            <Text className={styles.metaLabel}>今日预订</Text>
          </View>
        </View>
      </View>

      <View className={styles.body}>
        <Text className={styles.sectionTitle}>预订信息</Text>
        <View className={styles.formCard}>
          <Picker mode="date" value={date} onChange={(e) => setDate(e.detail.value as string)}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>打球日期</Text>
              <View className={styles.formValue}>
                <Text>{date}</Text>
                <Text className={styles.arrow}>›</Text>
              </View>
            </View>
          </Picker>

          <Picker mode="selector" range={PLAYER_OPTIONS} value={playerCount - 1} onChange={(e) => setPlayerCount(Number(e.detail.value) + 1)}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>打球人数</Text>
              <View className={styles.formValue}>
                <Text>{playerCount}人</Text>
                <Text className={styles.arrow}>›</Text>
              </View>
            </View>
          </Picker>
        </View>

        <Text className={styles.sectionTitle}>可选时段</Text>
        <View className={styles.formCard}>
          <View className={styles.slotGrid}>
            {ALL_SLOTS.map((slot) => {
              const occupied = occupiedStartTimes.has(slot.start);
              const selected = selectedSlot === slot.start;
              return (
                <Button
                  key={slot.start}
                  className={classnames(
                    styles.slot,
                    selected ? styles.selected : occupied ? styles.disabled : styles.available
                  )}
                  onClick={() => handleSlotClick(slot)}
                  disabled={occupied}
                >
                  <Text className={styles.slotTime}>{slot.start}</Text>
                  <Text className={styles.slotStatus}>{occupied ? '已占用' : '可预订'}</Text>
                </Button>
              );
            })}
          </View>
        </View>

        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>预订确认</Text>
          <Text className={styles.summaryText}>
            球道：{course.name}{'\n'}
            日期：{date}{'\n'}
            时段：{selectedSlot || '未选择'} {selectedSlot ? `- ${ALL_SLOTS.find((s) => s.start === selectedSlot)?.end}` : ''}{'\n'}
            人数：{playerCount}人{'\n'}
            会员：{currentMember.name}
          </Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.submitBtn, (!isCourseBookable || !selectedSlot) && styles.disabled)}
          onClick={handleSubmit}
        >
          {!isCourseBookable ? '球道暂不可预订' : '提交预订'}
        </Button>
      </View>
    </View>
  );
};

export default CourseDetailPage;
