import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

export interface EmptyStateProps {
  icon?: string;
  text: string;
  desc?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📋', text, desc }) => {
  return (
    <View className={styles.empty}>
      <View className={styles.icon}>
        <Text>{icon}</Text>
      </View>
      <Text className={styles.text}>{text}</Text>
      {desc && <Text className={styles.desc}>{desc}</Text>}
    </View>
  );
};

export default EmptyState;
