import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Course } from '@/types';
import styles from './index.module.scss';

const statusMap = {
  available: { text: '可用', className: 'available' },
  occupied: { text: '使用中', className: 'occupied' },
  maintenance: { text: '维护中', className: 'maintenance' },
  closed: { text: '已关闭', className: 'closed' }
};

const typeMap = {
  standard: '标准场',
  vip: 'VIP场',
  executive: '行政场'
};

export interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const status = statusMap[course.status];

  const handleBook = () => {
    if (course.status !== 'available') {
      Taro.showToast({ title: '该球道暂不可预订', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${course.id}` });
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{course.name}</Text>
          {course.type === 'vip' ? (
            <View className={styles.vipTag}>VIP</View>
          ) : (
            <View className={styles.typeTag}>{typeMap[course.type]}</View>
          )}
        </View>
        <View className={classnames(styles.status, styles[status.className])}>{status.text}</View>
      </View>

      <View className={styles.info}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>标准杆</Text>
          <Text className={styles.infoValue}>{course.par}杆</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>总长度</Text>
          <Text className={styles.infoValue}>{course.yardage}码</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>容纳人数</Text>
          <Text className={styles.infoValue}>{course.capacity}人</Text>
        </View>
      </View>

      <Text className={styles.desc}>{course.description}</Text>

      <View className={styles.footer}>
        <Text className={styles.bookings}>
          今日预订 <Text className={styles.bookingsCount}>{course.todayBookings}</Text> 组
        </Text>
        <Button
          className={classnames(styles.actionBtn, course.status !== 'available' && styles.disabled)}
          onClick={handleBook}
        >
          立即预订
        </Button>
      </View>
    </View>
  );
};

export default CourseCard;
