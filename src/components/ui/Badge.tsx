import React from 'react';
import {View, Text} from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'danger' | 'success' | 'warning' | 'info' | 'neutral';
  className?: string;
}

const colorMap = {
  danger: 'bg-danger',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  neutral: 'bg-neutral-500',
};

export default function Badge({children, color = 'neutral', className = ''}: BadgeProps) {
  return (
    <View className={`px-2.5 py-0.5 rounded-full self-start ${colorMap[color]} ${className}`}>
      <Text className="text-xs font-semibold text-white">{children}</Text>
    </View>
  );
}
