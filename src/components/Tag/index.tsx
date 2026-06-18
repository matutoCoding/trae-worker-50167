import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface TagProps {
  type?: 'success' | 'warning' | 'error' | 'info' | 'vip' | 'urgent' | 'primary' | 'default';
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ type = 'default', children }) => {
  return (
    <View className={classnames(styles.tag, styles[type])}>
      <Text>{children}</Text>
    </View>
  );
};

export default Tag;
