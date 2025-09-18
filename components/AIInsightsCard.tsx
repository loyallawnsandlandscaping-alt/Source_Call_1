
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface AIInsightsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color?: string;
  onPress?: () => void;
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = colors.primary,
  onPress
}) => {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return colors.success;
    if (change < 0) return colors.error;
    return colors.textSecondary;
  };

  return (
    <TouchableOpacity
      style={[styles.container, onPress && styles.pressable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={20} color="white" />
        </View>
        {change !== undefined && (
          <View style={[styles.changeContainer, { backgroundColor: getChangeColor(change) }]}>
            <Text style={styles.changeText}>{formatChange(change)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  pressable: {
    transform: [{ scale: 1 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  changeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default AIInsightsCard;
