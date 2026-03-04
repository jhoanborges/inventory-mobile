import React from 'react';
import {View} from 'react-native';

interface DividerProps {
  className?: string;
}

export default function Divider({className = ''}: DividerProps) {
  return (
    <View className={`h-px bg-neutral-200 dark:bg-neutral-700 my-3 ${className}`} />
  );
}
