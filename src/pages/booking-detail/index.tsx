import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, Picker } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';
import { BookingStatusText, type BookingStatus } from '@/types';
import Tag from '@/components/Tag';
import styles from './index.module.scss';

const PLAYER_OPTIONS = ['1人', '2人', '3人', '4人'];

const BookingDetailPage: React.FC = () => {
  const [bookingId, setBookingId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [playerCount, setPlayerCount] = useState<number>(2);

  const bookings = useAppStore((s) => s.bookings);
  const updateBooking = useAppStore((s) => s.updateBooking);
  const cancelBooking = useAppStore((s) => s.cancelBooking);

  const booking = useMemo(() => bookings.find((b) => b.id === bookingId), [bookings, bookingId]);

  useLoad((options) => {
    const id = (options as { id?: string })?.id;
    if (id) {
      setBookingId(id);
    }
  });

  useEffect(() => {
    if (booking) {
      setDate(booking.date);
      setStartTime(booking.startTime);
      setEndTime(booking.endTime);
      setPlayerCount(booking.playerCount);
    }
  }, [booking?.id]);

  const editable = booking && (booking.status === 'pending' || booking.status === 'confirmed');

  const handleSave = () => {
    if (!booking) return;
    if (startTime >= endTime) {
      Taro.showToast({ title: '开始时间需早于结束时间', icon: 'none' });
      return;
    }
    updateBooking(booking.id, { date, startTime, endTime, playerCount });
    Taro.showToast({ title: '修改已保存', icon: 'success' });
  };

  const handleCancel = () => {
    if (!booking) return;
    Taro.showModal({
      title: '确认取消预订',
      content: `取消后无法恢复，确定取消 ${booking.courseName} ${booking.date} 的预订吗？`,
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          cancelBooking(booking.id);
          Taro.showToast({ title: '已取消预订', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 800);
        }
      }
    });
  };

  if (!booking) {
    return (
      <View className={styles.container}>
        <View className={styles.body}>
          <Text className={styles.sectionTitle}>预订信息加载中或不存在</Text>
      </View>
      </View>
    );
  }

  const status = booking.status as BookingStatus;

  return (
    <View className={styles.container}>
      <View className={classnames(styles.statusHeader, styles[status])}>
        <View className={styles.statusRow}>
          <Text className={styles.statusText}>{BookingStatusText[status]}</Text>
          <View className={styles.tagRow}>
            {booking.isVip && <Tag type="vip">VIP</Tag>}
            {booking.isCycle && <Tag type="info">周期</Tag>}
          </View>
        </View>
        <Text className={styles.courseTitle}>{booking.courseName}</Text>
      </View>

      <View className={styles.body}>
        <Text className={styles.sectionTitle}>预订信息</Text>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>会员</Text>
            <View className={styles.formValueReadonly}>
              <Text>{booking.memberName}</Text>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>球道</Text>
            <View className={styles.formValueReadonly}>
              <Text>{booking.courseName}</Text>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>创建时间</Text>
            <View className={styles.formValueReadonly}>
              <Text>{booking.createdAt}</Text>
            </View>
          </View>
          {booking.caddieName && (
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>指派球童</Text>
              <View className={styles.formValueReadonly}>
                <Text>{booking.caddieName}</Text>
              </View>
            </View>
          )}
        </View>

        <Text className={styles.sectionTitle}>{editable ? '修改打球安排' : '打球安排'}</Text>
        <View className={styles.formCard}>
          {editable ? (
            <>
              <Picker mode="date" value={date} onChange={(e) => setDate(e.detail.value as string)}>
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>打球日期</Text>
                  <View className={styles.formValue}>
                    <Text>{date}</Text>
                    <Text className={styles.arrow}>›</Text>
                  </View>
                </View>
              </Picker>
              <Picker mode="time" value={startTime} onChange={(e) => setStartTime(e.detail.value as string)}>
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>开始时间</Text>
                  <View className={styles.formValue}>
                    <Text>{startTime}</Text>
                    <Text className={styles.arrow}>›</Text>
                  </View>
                </View>
              </Picker>
              <Picker mode="time" value={endTime} onChange={(e) => setEndTime(e.detail.value as string)}>
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>结束时间</Text>
                  <View className={styles.formValue}>
                    <Text>{endTime}</Text>
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
            </>
          ) : (
            <>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>打球日期</Text>
                <View className={styles.formValueReadonly}>
                  <Text>{booking.date}</Text>
                </View>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>开球时间</Text>
                <View className={styles.formValueReadonly}>
                  <Text>{booking.startTime} - {booking.endTime}</Text>
                </View>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>打球人数</Text>
                <View className={styles.formValueReadonly}>
                  <Text>{booking.playerCount}人</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {!editable && (
          <View className={styles.noticeCard}>
            <Text className={styles.noticeIcon}>ℹ️</Text>
            <Text className={styles.noticeText}>
              当前状态为「{BookingStatusText[status]}」，不可修改。仅待确认/已确认状态支持调整。
            </Text>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        {editable ? (
          <>
            <Button className={classnames(styles.btn, styles.cancel)} onClick={handleCancel}>
              取消预订
            </Button>
            <Button className={classnames(styles.btn, styles.save)} onClick={handleSave}>
              保存修改
            </Button>
          </>
        ) : (
          <Button className={classnames(styles.btn, styles.save, styles.disabled)} onClick={() => Taro.navigateBack()}>
            返回
          </Button>
        )}
      </View>
    </View>
  );
};

export default BookingDetailPage;
