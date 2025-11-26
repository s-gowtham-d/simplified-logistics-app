import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className, onPress }: CardProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className={cn(
        'bg-card rounded-xl p-4 border border-border shadow-sm',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('mb-3', className)}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text className={cn('text-xl font-bold text-foreground', className)}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </Text>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn(className)}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('mt-3 pt-3 border-t border-border', className)}>
      {children}
    </View>
  );
}