import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useAppStore } from '@/store/appStore';
import { currentMember } from '@/data/members';
import { courses } from '@/data/courses';
import { getTodayDate, getWeekdayName, getWeekday, getNowTime } from '@/utils/date';
import BookingCard from '@/components/BookingCard';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(getNowTime());

  const getSortedQueue = useAppStore((s) => s.getSortedQueue);
  const getCalledQueue = useAppStore((s) => s.getCalledQueue);
  const bookings = useAppStore((s) => s.bookings);

  const sortedQueue = getSortedQueue();
  const calledQueue = getCalledQueue();
  const todayBookings = bookings.filter((b) => b.date === getTodayDate() && b.status !== 'cancelled');
  const today = new Date();
  const availableCount = courses.filter((c) => c.status === 'available').length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getNowTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const handleAction = (action: string) => {
    const tabMap: Record<string, string> = {
      book: '/pages/course/index',
      cycle: '/pages/booking/index',
      queue: '/pages/queue/index',
      history: '/pages/booking/index',
      profile: '/pages/profile/index'
    };
    const navMap: Record<string, string> = {
      caddie: '/pages/caddie/index',
      vip: '/pages/take-number/index?priority=vip',
      urgent: '/pages/take-number/index?priority=urgent'
    };
    if (tabMap[action]) {
      Taro.switchTab({ url: tabMap[action] });
    } else if (navMap[action]) {
      Taro.navigateTo({ url: navMap[action] });
    }
  };

  const upcomingBookings = todayBookings.slice(0, 2);

  return (
    <ScrollView className={styles.container} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.welcome}>
          <View className={styles.left}>
            <Image className={styles.avatar} src={currentMember.avatar} mode="aspectFill" />
            <View className={styles.greeting}>
              <Text className={styles.hello}>早上好，欢迎回来</Text>
              <View className={styles.name}>
                <Text>{currentMember.name}</Text>
                {currentMember.isVip && <View className={styles.vipBadge}>VIP</View>}
              </View>
            </View>
          </View>
          <View className={styles.dateInfo}>
            <Text>{getTodayDate()}</Text>
            <Text style={{ display: 'block' }}>{getWeekdayName(getWeekday(today))} · {currentTime}</Text>
          </View>
        </View>

        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{availableCount}</Text>
            <Text className={styles.statLabel}>可用球道</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayBookings.length}</Text>
            <Text className={styles.statLabel}>今日预订</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{sortedQueue.length}</Text>
            <Text className={styles.statLabel}>排队中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{currentMember.totalBookings}</Text>
            <Text className={styles.statLabel}>累计打球</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.quickActions}>
          <Text className={styles.sectionTitle}>快捷操作</Text>
          <View className={styles.actionGrid}>
            <View className={styles.actionItem} onClick={() => handleAction('book')}>
              <View className={styles.actionIcon}>🏌️</View>
              <Text className={styles.actionLabel}>立即预订</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('cycle')}>
              <View className={`${styles.actionIcon} ${styles.info}`}>📅</View>
              <Text className={styles.actionLabel}>周期预订</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('queue')}>
              <View className={`${styles.actionIcon} ${styles.warning}`}>🎫</View>
              <Text className={styles.actionLabel}>排队叫号</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('vip')}>
              <View className={`${styles.actionIcon} ${styles.vip}`}>⭐</View>
              <Text className={styles.actionLabel}>VIP插队</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('urgent')}>
              <View className={`${styles.actionIcon} ${styles.warning}`}>🚨</View>
              <Text className={styles.actionLabel}>应急处理</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('caddie')}>
              <View className={styles.actionIcon}>🧑‍🌾</View>
              <Text className={styles.actionLabel}>球童派单</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('history')}>
              <View className={`${styles.actionIcon} ${styles.info}`}>📋</View>
              <Text className={styles.actionLabel}>预订记录</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('profile')}>
              <View className={styles.actionIcon}>👤</View>
              <Text className={styles.actionLabel}>个人中心</Text>
            </View>
          </View>
        </View>

        <View className={styles.queueSection}>
          <View className={styles.queueHeader}>
            <Text className={styles.sectionTitle}>实时叫号</Text>
            <Text className={styles.queueCount}>
              排队 <Text className={styles.highlight}>{sortedQueue.length}</Text> 人
            </Text>
          </View>

          {calledQueue.length > 0 && (
            <View className={styles.currentNumber}>
              <View className={styles.currentLeft}>
                <View className={styles.currentIcon}>📢</View>
                <View className={styles.currentInfo}>
                  <Text className={styles.currentLabel}>当前叫号</Text>
                  <Text className={styles.currentValue}>{calledQueue[0].number}号</Text>
                </View>
              </View>
              <View className={styles.currentRight}>
                <Text className={styles.currentName}>{calledQueue[0].memberName}</Text>
                <Text className={styles.currentTime}>{calledQueue[0].courseName}</Text>
              </View>
            </View>
          )}

          {sortedQueue.length > 0 && (
            <View className={styles.nextUp}>
              <Text className={styles.nextLabel}>下一位</Text>
              <View className={styles.nextItem}>
                <Text className={styles.nextNumber}>{sortedQueue[0].number}号 · {sortedQueue[0].memberName}</Text>
                <Text className={styles.nextInfo}>预计 {sortedQueue[0].estimatedTime}</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.bookingSection}>
          <View className={styles.bookingHeader}>
            <Text className={styles.sectionTitle}>今日预订</Text>
            <Text className={styles.viewAll} onClick={() => Taro.switchTab({ url: '/pages/booking/index' })}>
              查看全部
            </Text>
          </View>
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <View style={{ padding: '32rpx 0', textAlign: 'center', color: '#86909C' }}>
              今日暂无预订
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
