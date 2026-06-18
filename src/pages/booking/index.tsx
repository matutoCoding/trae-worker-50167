import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { cycleRules, getBookingsByMember } from '@/data/bookings';
import { currentMember } from '@/data/members';
import { getWeekdayName } from '@/utils/date';
import BookingCard from '@/components/BookingCard';
import Tag from '@/components/Tag';
import EmptyState from '@/components/EmptyState';
import type { CycleRule } from '@/types';
import styles from './index.module.scss';

const BookingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cycle' | 'list'>('cycle');
  const [cycles, setCycles] = useState<CycleRule[]>(cycleRules);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const toggleCycle = (id: string) => {
    setCycles(prev => prev.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleAddCycle = () => {
    Taro.navigateTo({ url: '/pages/cycle-edit/index' });
  };

  const handleEditCycle = (id: string) => {
    Taro.navigateTo({ url: `/pages/cycle-edit/index?id=${id}` });
  };

  const myBookings = getBookingsByMember(currentMember.id);

  return (
    <View className={styles.container}>
      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'cycle' && styles.active)}
          onClick={() => setActiveTab('cycle')}
        >
          <Text>周期规则</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'list' && styles.active)}
          onClick={() => setActiveTab('list')}
        >
          <Text>预订记录</Text>
        </View>
      </View>

      <View className={styles.content}>
        {activeTab === 'cycle' ? (
          <>
            {cycles.length > 0 ? (
              cycles.map(cycle => (
                <View key={cycle.id} className={styles.cycleCard}>
                  <View className={styles.cycleHeader}>
                    <View className={styles.cycleTitle}>
                      <Text className={styles.courseName}>{cycle.courseName}</Text>
                      {!cycle.isActive && <Tag type="default">已暂停</Tag>}
                    </View>
                    <View
                      className={classnames(styles.switch, cycle.isActive && styles.active)}
                      onClick={() => toggleCycle(cycle.id)}
                    />
                  </View>

                  <View className={styles.cycleInfo}>
                    <View className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>固定时间</Text>
                      <Text className={styles.infoValue}>
                        {getWeekdayName(cycle.weekday)} {cycle.startTime}
                      </Text>
                    </View>
                    <View className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>打球人数</Text>
                      <Text className={styles.infoValue}>{cycle.playerCount}人</Text>
                    </View>
                    <View className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>有效期限</Text>
                      <Text className={styles.infoValue}>{cycle.startDate}</Text>
                    </View>
                    <View className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>会员</Text>
                      <Text className={styles.infoValue}>{cycle.memberName}</Text>
                    </View>
                  </View>

                  <View className={styles.cycleFooter}>
                    <View className={styles.progress}>
                      <View className={styles.progressBar}>
                        <View
                          className={styles.progressFill}
                          style={{ width: `${(cycle.generatedCount / cycle.totalCount) * 100}%` }}
                        />
                      </View>
                      <Text className={styles.progressText}>
                        已生成 {cycle.generatedCount}/{cycle.totalCount}
                      </Text>
                    </View>
                    <Button className={styles.editBtn} onClick={() => handleEditCycle(cycle.id)}>
                      编辑
                    </Button>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState icon="📅" text="暂无周期规则" desc="点击右下角按钮添加周期预订规则" />
            )}

            <Button className={styles.addBtn} onClick={handleAddCycle}>
              +
            </Button>
          </>
        ) : (
          <ScrollView scrollY>
            {myBookings.length > 0 ? (
              myBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <EmptyState icon="📋" text="暂无预订记录" desc="去创建您的第一个预订吧" />
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default BookingPage;
