import React from 'react';
import {View, TouchableOpacity, type ViewStyle} from 'react-native';

interface StyledCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
}

export default function StyledCard({children, onPress, className = '', style}: StyledCardProps) {
  const cardClass = `bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={cardClass}
        style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={cardClass} style={style}>
      {children}
    </View>
  );
}
