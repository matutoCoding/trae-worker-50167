import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { courses } from '@/data/courses';
import { generateDays, getWeekdayName } from '@/utils/date';
import CourseCard from '@/components/CourseCard';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const CoursePage: React.FC = () => {
  const days = generateDays(7);
  const [selectedDate, setSelectedDate] = useState(days[0].date);
  const [filter, setFilter] = useState<string>('all');

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'available', label: '可用' },
    { key: 'standard', label: '标准场' },
    { key: 'vip', label: 'VIP场' },
    { key: 'executive', label: '行政场' }
  ];

  const filteredCourses = courses.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'available') return c.status === 'available';
    return c.type === filter;
  });

  const availableCount = courses.filter(c => c.status === 'available').length;
  const occupiedCount = courses.filter(c => c.status === 'occupied').length;
  const maintenanceCount = courses.filter(c => c.status === 'maintenance').length;

  return (
    <View className={styles.container}>
      <View className={styles.dateBar}>
        <ScrollView scrollX className={styles.dateList} enhanced showScrollbar={false}>
          {days.map(day => (
            <View
              key={day.date}
              className={classnames(styles.dateItem, selectedDate === day.date && styles.active)}
              onClick={() => setSelectedDate(day.date)}
            >
              <Text className={styles.dateWeekday}>{getWeekdayName(day.weekday)}</Text>
              <Text className={styles.dateDay}>{day.day}</Text>
              {day.isToday && <Text className={styles.dateToday}>今天</Text>}
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.content}>
        <View className={styles.statsBar}>
          <StatCard value={availableCount} label="可用球道" theme="primary" />
          <StatCard value={occupiedCount} label="使用中" theme="warning" />
          <StatCard value={maintenanceCount} label="维护中" theme="info" />
        </View>

        <ScrollView scrollX className={styles.filterBar} enhanced showScrollbar={false}>
          {filterOptions.map(opt => (
            <View
              key={opt.key}
              className={classnames(styles.filterTag, filter === opt.key && styles.active)}
              onClick={() => setFilter(opt.key)}
            >
              <Text>{opt.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View className={styles.courseList}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <EmptyState icon="🏌️" text="暂无符合条件的球道" desc="请尝试切换筛选条件" />
          )}
        </View>
      </View>
    </View>
  );
};

export default CoursePage;
