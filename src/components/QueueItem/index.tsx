import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { QueueItem as QueueItemType } from '@/types';
import Tag from '@/components/Tag';
import styles from './index.module.scss';

const priorityTypeMap = {
  normal: 'default' as const,
  vip: 'vip' as const,
  urgent: 'urgent' as const
};

const priorityTextMap = {
  normal: '普通',
  vip: 'VIP优先',
  urgent: '应急插队'
};

export interface QueueItemProps {
  item: QueueItemType;
  rank?: number;
}

const QueueItem: React.FC<QueueItemProps> = ({ item, rank }) => {
  const isCalled = item.status === 'called' || item.status === 'playing';

  return (
    <View className={classnames(styles.item, styles[item.priority], isCalled && styles.called)}>
      <View className={styles.number}>
        <Text className={styles.numberValue}>{isCalled ? '✓' : rank || item.number}</Text>
        <Text className={styles.numberLabel}>{isCalled ? '已叫号' : '排队号'}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.topRow}>
          <View className={styles.name}>
            <Text>{item.memberName}</Text>
            <Tag type={priorityTypeMap[item.priority]}>{priorityTextMap[item.priority]}</Tag>
          </View>
          <Text className={styles.timeInfo}>
            {isCalled && item.calledAt ? `叫号: ${item.calledAt.split(' ')[1]}` : `预计: ${item.estimatedTime}`}
          </Text>
        </View>
        <View className={styles.courseRow}>
          <Text className={styles.course}>{item.courseName}</Text>
        </View>
        <View className={styles.priority}>
          <Text className={styles.players}>{item.playerCount}人组 · 取号 {item.joinedAt.split(' ')[1]}</Text>
        </View>
      </View>
    </View>
  );
};

export default QueueItem;
