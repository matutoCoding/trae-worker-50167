import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const CourseDetailPage: React.FC = () => {
  return (
    <View className={styles.container}>
      <View className={styles.icon}>🏌️</View>
      <Text className={styles.title}>球道详情</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
    </View>
  );
};

export default CourseDetailPage;
