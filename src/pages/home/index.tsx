import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useAppStore } from '@/store/appStore';
import { currentMember } from '@/data/members';
import { courses } from '@/data/courses';
import { getTodayDate, getWeekdayName, getWeekday, getNowTime } from '@/utils/date';
import { BookingStatusText } from '@/types';
import Tag from '@/components/Tag';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(getNowTime());

  const getSortedQueue = useAppStore((s) => s.getSortedQueue);
  const getCalledQueue = useAppStore((s) => s.getCalledQueue);
  const bookings = useAppStore((s) => s.bookings);

  const sortedQueue = getSortedQueue();
  const calledQueue = getCalledQueue();
  const todayDate = getTodayDate();
  const todayBookings = bookings.filter((b) => b.date === todayDate && b.status !== 'cancelled');
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

  const handleViewBooking = (bookingId: string) => {
    Taro.navigateTo({ url: `/pages/booking-detail/index?id=${bookingId}` });
  };

  const queueStats = useMemo(() => ({
    urgent: sortedQueue.filter((q) => q.priority === 'urgent').length,
    vip: sortedQueue.filter((q) => q.priority === 'vip').length,
    normal: sortedQueue.filter((q) => q.priority === 'normal').length
  }), [sortedQueue]);

  const playingBookings = useMemo(() => {
    return todayBookings
      .filter((b) => b.status === 'playing')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [todayBookings]);

  const upcomingBookings = useMemo(() => {
    const now = getNowTime();
    return todayBookings
      .filter((b) => b.status === 'confirmed' && b.startTime > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 4);
  }, [todayBookings]);

  const courseOccupancy = useMemo(() => {
    return courses.map((course) => {
      const courseBookings = todayBookings.filter(
        (b) => b.courseId === course.id && b.status !== 'cancelled' && b.status !== 'completed'
      );
      return {
        course,
        bookings: courseBookings.sort((a, b) => a.startTime.localeCompare(b.startTime))
      };
    });
  }, [todayBookings]);

  const formatTimeRange = (start: string, end: string) => {
    return `${start}-${end}`;
  };

  return (
    <ScrollView className={styles.container} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.welcome}>
          <View className={styles.left}>
            <Image className={styles.avatar} src={currentMember.avatar} mode="aspectFill" />
            <View className={styles.greeting}>
              <Text className={styles.hello}>今日运营概览</Text>
              <View className={styles.name}>
                <Text>{currentMember.name}</Text>
                {currentMember.isVip && <View className={styles.vipBadge}>VIP</View>}
              </View>
            </View>
          </View>
          <View className={styles.dateInfo}>
            <Text>{todayDate}</Text>
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
            <Text className={styles.statValue}>{playingBookings.length}</Text>
            <Text className={styles.statLabel}>进行中</Text>
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
            <View className={styles.actionItem} onClick={() => handleAction('caddie')}>
              <View className={styles.actionIcon}>🧑‍🌾</View>
              <Text className={styles.actionLabel}>球童派单</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('vip')}>
              <View className={`${styles.actionIcon} ${styles.vip}`}>⭐</View>
              <Text className={styles.actionLabel}>VIP插队</Text>
            </View>
            <View className={styles.actionItem} onClick={() => handleAction('urgent')}>
              <View className={`${styles.actionIcon} ${styles.warning}`}>🚨</View>
              <Text className={styles.actionLabel}>应急处理</Text>
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

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>等待队列汇总</Text>
            <Text
              className={styles.viewAll}
              onClick={() => Taro.switchTab({ url: '/pages/queue/index' })}
            >
              查看队列 ›
            </Text>
          </View>
          <View className={styles.queueSummary}>
            <View className={styles.queueCard}>
              <View className={`${styles.queueDot} ${styles.urgent}`} />
              <View className={styles.queueInfo}>
                <Text className={styles.queueLabel}>应急</Text>
                <Text className={styles.queueCount}>{queueStats.urgent}人</Text>
              </View>
            </View>
            <View className={styles.queueCard}>
              <View className={`${styles.queueDot} ${styles.vip}`} />
              <View className={styles.queueInfo}>
                <Text className={styles.queueLabel}>VIP</Text>
                <Text className={styles.queueCount}>{queueStats.vip}人</Text>
              </View>
            </View>
            <View className={styles.queueCard}>
              <View className={`${styles.queueDot} ${styles.normal}`} />
              <View className={styles.queueInfo}>
                <Text className={styles.queueLabel}>普通</Text>
                <Text className={styles.queueCount}>{queueStats.normal}人</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>当前正在打球</Text>
            <Text className={styles.sectionSubtitle}>{playingBookings.length} 场进行中</Text>
          </View>
          {playingBookings.length > 0 ? (
            <View className={styles.bookingList}>
              {playingBookings.map((booking) => (
                <View
                  key={booking.id}
                  className={styles.bookingItem}
                  onClick={() => handleViewBooking(booking.id)}
                >
                  <View className={styles.bookingTime}>
                    <Text className={styles.bookingTimeText}>{booking.startTime}</Text>
                    <View className={styles.bookingTimeLine} />
                    <Text className={styles.bookingTimeText}>{booking.endTime}</Text>
                  </View>
                  <View className={styles.bookingContent}>
                    <View className={styles.bookingHeader}>
                      <Text className={styles.bookingMember}>{booking.memberName}</Text>
                      <Tag type="playing">{BookingStatusText[booking.status]}</Tag>
                    </View>
                    <View className={styles.bookingMeta}>
                      <Text>{booking.courseName} · {booking.playerCount}人</Text>
                      {booking.caddieName && (
                        <Text className={styles.bookingCaddie}>🧑‍🌾 {booking.caddieName}</Text>
                      )}
                    </View>
                  </View>
                  <Text className={styles.bookingArrow}>›</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptySection}>
              <Text>暂无进行中的预订</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>即将开球</Text>
            <Text className={styles.sectionSubtitle}>按时间排序</Text>
          </View>
          {upcomingBookings.length > 0 ? (
            <View className={styles.bookingList}>
              {upcomingBookings.map((booking) => (
                <View
                  key={booking.id}
                  className={styles.bookingItem}
                  onClick={() => handleViewBooking(booking.id)}
                >
                  <View className={styles.bookingTime}>
                    <Text className={styles.bookingTimeTextUpcoming}>{booking.startTime}</Text>
                  </View>
                  <View className={styles.bookingContent}>
                    <View className={styles.bookingHeader}>
                      <Text className={styles.bookingMember}>{booking.memberName}</Text>
                      {booking.isVip && <Tag type="vip">VIP</Tag>}
                    </View>
                    <View className={styles.bookingMeta}>
                      <Text>{booking.courseName} · {booking.playerCount}人</Text>
                    </View>
                  </View>
                  <Text className={styles.bookingArrow}>›</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptySection}>
              <Text>暂无即将开球的预订</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>各球道今日占用</Text>
            <Text className={styles.sectionSubtitle}>点击查看详情</Text>
          </View>
          <View className={styles.courseList}>
            {courseOccupancy.map(({ course, bookings: courseBookings }) => (
              <View key={course.id} className={styles.courseCard}>
                <View className={styles.courseHeader}>
                  <Text className={styles.courseName}>{course.name}</Text>
                  <Text
                    className={styles.courseStatus}
                    style={{
                      color: course.status === 'available' ? '#2E7D32' : '#757575'
                    }}
                  >
                    {course.status === 'available' ? '空闲' : '维护中'}
                  </Text>
                </View>
                {courseBookings.length > 0 ? (
                  <View className={styles.timeSlotList}>
                    {courseBookings.map((booking) => (
                      <View
                        key={booking.id}
                        className={classnames(
                          styles.timeSlot,
                          booking.status === 'playing' && styles.timeSlotPlaying,
                          booking.status === 'cancelled' && styles.timeSlotCancelled
                        )}
                        onClick={() => handleViewBooking(booking.id)}
                      >
                        <Text className={styles.timeSlotText}>
                          {formatTimeRange(booking.startTime, booking.endTime)}
                        </Text>
                        <Text className={styles.timeSlotMember}>{booking.memberName}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className={styles.courseEmpty}>
                    <Text>今日暂无预订</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
