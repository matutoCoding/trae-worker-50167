import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Booking } from '@/types';
import Tag from '@/components/Tag';
import styles from './index.module.scss';

const statusMap = {
  pending: { text: '待确认', className: 'pending' },
  confirmed: { text: '已确认', className: 'confirmed' },
  playing: { text: '进行中', className: 'playing' },
  completed: { text: '已完成', className: 'completed' },
  cancelled: { text: '已取消', className: 'cancelled' }
};

export interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, showActions = true }) => {
  const status = statusMap[booking.status];

  const handleDetail = () => {
    Taro.navigateTo({ url: `/pages/booking-detail/index?id=${booking.id}` });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消该预订吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消预订', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.left}>
          <Image className={styles.avatar} src={booking.memberAvatar} mode="aspectFill" />
          <View className={styles.info}>
            <View className={styles.name}>
              <Text>{booking.memberName}</Text>
              {booking.isVip && <Tag type="vip">VIP</Tag>}
            </View>
            <Text className={styles.meta}>{booking.courseName}</Text>
          </View>
        </View>
        <View className={classnames(styles.status, styles[status.className])}>{status.text}</View>
      </View>

      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.rowLabel}>打球日期</Text>
          <View className={styles.rowValue}>
            <Text>{booking.date}</Text>
            {booking.isCycle && <View className={styles.cycleTag}>周期</View>}
          </View>
        </View>
        <View className={styles.row}>
          <Text className={styles.rowLabel}>开球时间</Text>
          <Text className={styles.rowValue}>{booking.startTime} - {booking.endTime}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.rowLabel}>打球人数</Text>
          <Text className={styles.rowValue}>{booking.playerCount}人</Text>
        </View>
        {booking.caddieName && (
          <View className={styles.row}>
            <Text className={styles.rowLabel}>指派球童</Text>
            <Text className={styles.rowValue}>{booking.caddieName}</Text>
          </View>
        )}
      </View>

      {showActions && (booking.status === 'pending' || booking.status === 'confirmed') && (
        <View className={styles.footer}>
          <Button className={classnames(styles.btn, styles.outline)} onClick={handleCancel}>
            取消预订
          </Button>
          <Button className={classnames(styles.btn, styles.primary)} onClick={handleDetail}>
            查看详情
          </Button>
        </View>
      )}
    </View>
  );
};

export default BookingCard;
