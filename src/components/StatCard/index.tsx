import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface StatCardProps {
  value: string | number;
  label: string;
  theme?: 'primary' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ value, label, theme = 'primary' }) => {
  return (
    <View className={classnames(styles.statCard, styles[theme])}>
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
