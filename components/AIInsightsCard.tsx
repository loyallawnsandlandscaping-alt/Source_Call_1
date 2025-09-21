
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
  color = colors.textSecondary, // Dimmed color for disabled state
  onPress
}) => {
  const formatChange = (change: number) => {
    return 'N/A'; // No real data
  };

  const getChangeColor = (change: number) => {
    return colors.textSecondary; // Neutral color for disabled state
  };

  return (
    <TouchableOpacity
      style={[styles.container, styles.disabledContainer]}
      onPress={onPress}
      disabled={true} // Always disabled
    >
      {/* Disabled Banner */}
      <View style={styles.disabledBanner}>
        <Text style={styles.disabledText}>DISABLED</Text>
      </View>

      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color, opacity: 0.5 }]}>
          <Icon name={icon} size={20} color="white" />
        </View>
        {change !== undefined && (
          <View style={[styles.changeContainer, { backgroundColor: getChangeColor(change) }]}>
            <Text style={styles.changeText}>{formatChange(change)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color: colors.textSecondary }]}>
          {typeof value === 'string' ? 'N/A' : '0'}
        </Text>
        <Text style={styles.title}>{title} (Disabled)</Text>
      </View>

      <View style={styles.disabledMessage}>
        <Text style={styles.disabledMessageText}>
          AI insights are currently disabled
        </Text>
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
    minHeight: 120,
    position: 'relative',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledBanner: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  disabledText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
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
    justifyContent: 'center',
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
  disabledMessage: {
    marginTop: 8,
    padding: 6,
    backgroundColor: colors.warningLight,
    borderRadius: 4,
  },
  disabledMessageText: {
    fontSize: 10,
    color: colors.warning,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AIInsightsCard;
