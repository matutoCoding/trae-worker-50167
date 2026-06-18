import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { getCaddieLevelName } from '@/data/members';
import { useAppStore } from '@/store/appStore';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import type { Caddie } from '@/types';
import styles from './index.module.scss';

const CaddiePage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | Caddie['status']>('all');
  const caddies = useAppStore((s) => s.caddies);
  const bookings = useAppStore((s) => s.bookings);

  const stats = useMemo(() => ({
    idle: caddies.filter(c => c.status === 'idle').length,
    working: caddies.filter(c => c.status === 'working').length,
    rest: caddies.filter(c => c.status === 'rest').length
  }), [caddies]);

  const statusMap = {
    idle: { text: '空闲', className: 'idle' },
    working: { text: '工作中', className: 'working' },
    rest: { text: '休息中', className: 'rest' }
  };

  const filteredList = filter === 'all'
    ? caddies
    : caddies.filter(c => c.status === filter);

  const getCurrentBooking = (caddieId: string) => {
    return bookings.find(b => b.caddieId === caddieId && b.status !== 'cancelled' && b.status !== 'completed');
  };

  const handleViewDetail = (bookingId: string) => {
    Taro.navigateTo({ url: `/pages/booking-detail/index?id=${bookingId}` });
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'idle', label: '空闲' },
    { key: 'working', label: '工作中' },
    { key: 'rest', label: '休息' }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.statsBar}>
        <StatCard value={stats.idle} label="空闲球童" theme="primary" />
        <StatCard value={stats.working} label="工作中" theme="warning" />
        <StatCard value={stats.rest} label="休息中" theme="info" />
      </View>

      <View className={styles.filterTabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tab, filter === tab.key && styles.active)}
            onClick={() => setFilter(tab.key as any)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        {filteredList.length > 0 ? (
          filteredList.map(caddie => {
            const status = statusMap[caddie.status];
            const currentBooking = getCurrentBooking(caddie.id);
            return (
              <View key={caddie.id} className={styles.caddieCard}>
                <Image className={styles.avatar} src={caddie.avatar} mode="aspectFill" />
                <View className={styles.info}>
                  <View className={styles.nameRow}>
                    <Text className={styles.name}>{caddie.name}</Text>
                    <View className={classnames(styles.levelTag, caddie.level)}>
                      {getCaddieLevelName(caddie.level)}
                    </View>
                  </View>
                  <View className={styles.stats}>
                    <View className={styles.stat}>
                      <Text>评分</Text>
                      <Text className={styles.statValue}>⭐ {caddie.rating.toFixed(1)}</Text>
                    </View>
                    <View className={styles.stat}>
                      <Text>总场次</Text>
                      <Text className={styles.statValue}>{caddie.totalRounds}</Text>
                    </View>
                    <View className={styles.stat}>
                      <Text>今日</Text>
                      <Text className={styles.statValue}>{caddie.todayRounds}场</Text>
                    </View>
                  </View>
                  {currentBooking && (
                    <View
                      className={styles.currentBooking}
                      onClick={() => handleViewDetail(currentBooking.id)}
                    >
                      <Text className={styles.bookingLabel}>当前服务：</Text>
                      <Text className={styles.bookingText}>
                        {currentBooking.courseName} {currentBooking.startTime}-{currentBooking.endTime}
                      </Text>
                      <Text className={styles.bookingArrow}>›</Text>
                    </View>
                  )}
                  <View className={styles.statusRow}>
                    <View className={classnames(styles.status, styles[status.className])}>
                      <View className={styles.statusDot} />
                      <Text>{status.text}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState icon="🧑‍🌾" text="暂无球童数据" />
        )}
      </ScrollView>
    </View>
  );
};

export default CaddiePage;
