import React, { useState } from 'react';
import { View, Text, Button, Picker } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';
import { courses } from '@/data/courses';
import { currentMember } from '@/data/members';
import type { QueuePriority } from '@/types';
import { QueuePriorityText } from '@/types';
import styles from './index.module.scss';

const PRIORITY_CONFIG: Record<QueuePriority, { icon: string; desc: string }> = {
  normal: {
    icon: '⛳',
    desc: '按取号顺序排队，依次叫号开球。'
  },
  vip: {
    icon: '👑',
    desc: 'VIP会员专属通道，优先于普通会员叫号。'
  },
  urgent: {
    icon: '🚨',
    desc: '应急插队通道，拥有最高优先级，立即排到队首。'
  }
};

const PLAYER_OPTIONS = ['1人', '2人', '3人', '4人'];

const TakeNumberPage: React.FC = () => {
  const [priority, setPriority] = useState<QueuePriority>('normal');
  const [courseIndex, setCourseIndex] = useState<number>(0);
  const [playerCount, setPlayerCount] = useState<number>(2);

  const takeNumber = useAppStore((s) => s.takeNumber);

  useLoad((options) => {
    const p = (options as { priority?: string })?.priority as QueuePriority;
    const finalPriority: QueuePriority =
      p && ['normal', 'vip', 'urgent'].includes(p) ? p : 'normal';
    setPriority(finalPriority);
    Taro.setNavigationBarTitle({ title: `${QueuePriorityText[finalPriority]}取号` });
  });

  const handleConfirm = () => {
    const course = courses[courseIndex];
    if (!course) {
      Taro.showToast({ title: '请选择球道', icon: 'none' });
      return;
    }
    const id = takeNumber(priority, course.id, playerCount);
    if (id) {
      Taro.showToast({ title: `取号成功`, icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/queue/index' });
      }, 800);
    } else {
      Taro.showToast({ title: '取号失败', icon: 'none' });
    }
  };

  const config = PRIORITY_CONFIG[priority];
  const course = courses[courseIndex];

  return (
    <View className={styles.container}>
      <View className={classnames(styles.priorityCard, styles[priority])}>
        <Text className={styles.priorityIcon}>{config.icon}</Text>
        <Text className={styles.priorityTitle}>{QueuePriorityText[priority]}</Text>
        <Text className={styles.priorityDesc}>{config.desc}</Text>
      </View>

      <Text className={styles.sectionTitle}>开球信息</Text>
      <View className={styles.formCard}>
        <Picker mode="selector" range={courses.map((c) => c.name)} value={courseIndex} onChange={(e) => setCourseIndex(Number(e.detail.value))}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>球道</Text>
            <View className={styles.formValue}>
              <Text>{course?.name}</Text>
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

      <View className={styles.confirmCard}>
        <Text className={styles.confirmTitle}>取号确认</Text>
        <View className={styles.confirmRow}>
          <Text className={styles.confirmLabel}>会员</Text>
          <Text className={styles.confirmValue}>{currentMember.name}</Text>
        </View>
        <View className={styles.confirmRow}>
          <Text className={styles.confirmLabel}>优先级</Text>
          <Text className={styles.confirmValue}>{QueuePriorityText[priority]}</Text>
        </View>
        <View className={styles.confirmRow}>
          <Text className={styles.confirmLabel}>球道</Text>
          <Text className={styles.confirmValue}>{course?.name}</Text>
        </View>
        <View className={styles.confirmRow}>
          <Text className={styles.confirmLabel}>人数</Text>
          <Text className={styles.confirmValue}>{playerCount}人</Text>
        </View>
      </View>

      <View className={styles.noticeCard}>
        <Text className={styles.noticeIcon}>💡</Text>
        <Text className={styles.noticeText}>
          确认取号后将加入等待队列，系统按「应急 ＞ VIP ＞ 普通」优先级叫号。
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.submitBtn, styles[priority])} onClick={handleConfirm}>
          确认取号
        </Button>
      </View>
    </View>
  );
};

export default TakeNumberPage;
