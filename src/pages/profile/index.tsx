import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { currentMember, getLevelName, caddies } from '@/data/members';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const handleMenuClick = (key: string) => {
    const routeMap: Record<string, string> = {
      bookings: '/pages/booking/index',
      cycle: '/pages/booking/index',
      caddie: '/pages/caddie/index',
      queue: '/pages/queue/index',
      vip: '/pages/take-number/index'
    };
    const url = routeMap[key];
    if (url) {
      if (key === 'bookings' || key === 'cycle' || key === 'queue') {
        Taro.switchTab({ url });
      } else {
        Taro.navigateTo({ url });
      }
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={currentMember.avatar} mode="aspectFill" />
          <View className={styles.info}>
            <View className={styles.nameRow}>
              <Text className={styles.name}>{currentMember.name}</Text>
              {currentMember.isVip && <View className={styles.vipBadge}>VIP会员</View>}
            </View>
            <Text className={styles.phone}>{currentMember.phone}</Text>
            <Text className={styles.level}>{getLevelName(currentMember.level)} · 入会 {currentMember.joinDate}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{currentMember.totalBookings}</Text>
          <Text className={styles.statLabel}>累计打球</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{currentMember.points}</Text>
          <Text className={styles.statLabel}>会员积分</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{caddies.filter(c => c.status === 'idle').length}</Text>
          <Text className={styles.statLabel}>空闲球童</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>我的服务</Text>
          <View className={styles.menuItem} onClick={() => handleMenuClick('bookings')}>
            <View className={styles.menuIcon}>📋</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>我的预订</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View className={styles.divider} />
          <View className={styles.menuItem} onClick={() => handleMenuClick('cycle')}>
            <View className={`${styles.menuIcon} ${styles.info}`}>📅</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>周期规则</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View className={styles.divider} />
          <View className={styles.menuItem} onClick={() => handleMenuClick('queue')}>
            <View className={`${styles.menuIcon} ${styles.warning}`}>🎫</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>排队叫号</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View className={styles.divider} />
          <View className={styles.menuItem} onClick={() => handleMenuClick('caddie')}>
            <View className={styles.menuIcon}>🧑‍🌾</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>球童管理</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>会员特权</Text>
          <View className={styles.menuItem} onClick={() => handleMenuClick('vip')}>
            <View className={`${styles.menuIcon} ${styles.vip}`}>⭐</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>VIP优先插队</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View className={styles.divider} />
          <View className={styles.menuItem} onClick={() => handleMenuClick('points')}>
            <View className={styles.menuIcon}>💎</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>积分兑换</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View className={styles.divider} />
          <View className={styles.menuItem} onClick={() => handleMenuClick('exclusive')}>
            <View className={`${styles.menuIcon} ${styles.vip}`}>🏆</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>专属球道</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>设置</Text>
          <View className={styles.menuItem} onClick={() => handleMenuClick('notify')}>
            <View className={`${styles.menuIcon} ${styles.info}`}>🔔</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>消息通知</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
          <View className={styles.divider} />
          <View className={styles.menuItem} onClick={() => handleMenuClick('about')}>
            <View className={styles.menuIcon}>ℹ️</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>关于我们</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <Button className={styles.logoutBtn} onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  );
};

export default ProfilePage;
