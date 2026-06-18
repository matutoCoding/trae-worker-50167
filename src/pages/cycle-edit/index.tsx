import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const CycleEditPage: React.FC = () => {
  return (
    <View className={styles.container}>
      <View className={styles.icon}>📅</View>
      <Text className={styles.title}>周期规则编辑</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
    </View>
  );
};

export default CycleEditPage;
