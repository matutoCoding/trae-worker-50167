import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/appStore';
import { getNowTime } from '@/utils/date';
import type { QueuePriority } from '@/types';
import QueueItemComp from '@/components/QueueItem';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const QueuePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'waiting' | 'called'>('waiting');
  const [currentTime, setCurrentTime] = useState(getNowTime());

  const getSortedQueue = useAppStore((s) => s.getSortedQueue);
  const getCalledQueue = useAppStore((s) => s.getCalledQueue);
  const callNext = useAppStore((s) => s.callNext);
  const queueItems = useAppStore((s) => s.queueItems);

  const sortedQueue = getSortedQueue();
  const calledQueue = getCalledQueue();

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      setCurrentTime(getNowTime());
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const urgentCount = queueItems.filter((q) => q.priority === 'urgent' && q.status === 'waiting').length;
  const vipCount = queueItems.filter((q) => q.priority === 'vip' && q.status === 'waiting').length;
  const normalCount = queueItems.filter((q) => q.priority === 'normal' && q.status === 'waiting').length;

  const handleTakeNumber = (priority: QueuePriority) => {
    Taro.navigateTo({ url: `/pages/take-number/index?priority=${priority}` });
  };

  const handleCallNext = () => {
    if (sortedQueue.length === 0) {
      Taro.showToast({ title: '暂无等待队列', icon: 'none' });
      return;
    }
    const next = sortedQueue[0];
    Taro.showModal({
      title: '叫号确认',
      content: `确定叫下一位 ${next.number}号 ${next.memberName} 吗？`,
      success: (res) => {
        if (res.confirm) {
          callNext();
          Taro.showToast({ title: `已叫号 ${next.number}号`, icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.callingBoard}>
        <View className={styles.boardHeader}>
          <View className={styles.boardTitle}>
            <View className={styles.liveDot} />
            <Text>实时叫号</Text>
          </View>
          <Text className={styles.boardTime}>{currentTime}</Text>
        </View>

        {calledQueue.length > 0 && (
          <View className={styles.currentCall}>
            <View className={styles.currentLeft}>
              <Text className={styles.currentLabel}>当前叫号</Text>
              <Text className={styles.currentNumber}>{calledQueue[0].number}</Text>
            </View>
            <View className={styles.currentRight}>
              <Text className={styles.currentName}>{calledQueue[0].memberName}</Text>
              <Text className={styles.currentCourse}>{calledQueue[0].courseName}</Text>
            </View>
          </View>
        )}

        <View className={styles.currentMeta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{urgentCount}</Text>
            <Text className={styles.metaLabel}>应急插队</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{vipCount}</Text>
            <Text className={styles.metaLabel}>VIP优先</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaValue}>{normalCount}</Text>
            <Text className={styles.metaLabel}>普通排队</Text>
          </View>
        </View>

        <Button
          className={classnames(styles.callNextBtn, sortedQueue.length === 0 && styles.disabled)}
          onClick={handleCallNext}
        >
          {sortedQueue.length > 0 ? `叫下一位（${sortedQueue[0].number}号）` : '暂无等待队列'}
        </Button>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>队列状态</Text>
          <View className={styles.priorityLegend}>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.urgent}`} />
              <Text>应急</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.vip}`} />
              <Text>VIP</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.normal}`} />
              <Text>普通</Text>
            </View>
          </View>
        </View>

        <View className={styles.tabs}>
          <View
            className={classnames(styles.tab, activeTab === 'waiting' && styles.active)}
            onClick={() => setActiveTab('waiting')}
          >
            <Text>等待中 ({sortedQueue.length})</Text>
          </View>
          <View
            className={classnames(styles.tab, activeTab === 'called' && styles.active)}
            onClick={() => setActiveTab('called')}
          >
            <Text>已叫号 ({calledQueue.length})</Text>
          </View>
        </View>

        <ScrollView scrollY enhanced showScrollbar={false}>
          {activeTab === 'waiting' ? (
            sortedQueue.length > 0 ? (
              sortedQueue.map((item, index) => (
                <QueueItemComp key={item.id} item={item} rank={index + 1} />
              ))
            ) : (
              <EmptyState icon="🎫" text="暂无排队等待" desc="点击下方按钮取号排队" />
            )
          ) : (
            calledQueue.length > 0 ? (
              calledQueue.map(item => (
                <QueueItemComp key={item.id} item={item} />
              ))
            ) : (
              <EmptyState icon="✅" text="暂无叫号记录" />
            )
          )}
        </ScrollView>
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.actionBtn, styles.primary)} onClick={() => handleTakeNumber('normal')}>
          普通取号
        </Button>
        <Button className={classnames(styles.actionBtn, styles.vip)} onClick={() => handleTakeNumber('vip')}>
          VIP优先
        </Button>
        <Button className={classnames(styles.actionBtn, styles.urgent)} onClick={() => handleTakeNumber('urgent')}>
          应急插队
        </Button>
      </View>
    </View>
  );
};

export default QueuePage;
