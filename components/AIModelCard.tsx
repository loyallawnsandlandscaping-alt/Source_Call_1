
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AIModelType, ModelBenchmark } from '../types';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface AIModelCardProps {
  model: AIModelType;
  benchmark?: ModelBenchmark;
  isActive: boolean;
  onToggle: (modelId: string) => void;
  onBenchmark: (modelId: string) => void;
  onUpdate?: (modelId: string) => void;
  hasUpdate?: boolean;
}

const AIModelCard: React.FC<AIModelCardProps> = ({
  model,
  benchmark,
  isActive,
  onToggle,
  onBenchmark,
  onUpdate,
  hasUpdate
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vision': return 'eye';
      case 'nlp': return 'message-circle';
      case 'audio': return 'volume-2';
      case 'multimodal': return 'layers';
      case 'generative': return 'zap';
      default: return 'cpu';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vision': return '#3498db';
      case 'nlp': return '#2ecc71';
      case 'audio': return '#e74c3c';
      case 'multimodal': return '#9b59b6';
      case 'generative': return '#f39c12';
      default: return colors.text;
    }
  };

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB === 0) return 'N/A';
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  };

  const getPerformanceScore = () => {
    if (!benchmark) return model.accuracy;
    return (benchmark.accuracy * 0.6 + (1 - benchmark.latency / 1000) * 0.4);
  };

  return (
    <View style={[styles.container, { opacity: 0.6 }]}> {/* Dimmed to show disabled state */}
      {/* Disabled Banner */}
      <View style={styles.disabledBanner}>
        <Icon name="alert-triangle" size={12} color="white" />
        <Text style={styles.disabledText}>DISABLED</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(model.category) }]}>
            <Icon name={getCategoryIcon(model.category)} size={16} color="white" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.modelName} numberOfLines={1}>{model.name}</Text>
            <Text style={styles.modelVersion}>v{model.version} (Stub)</Text>
          </View>
          {hasUpdate && (
            <View style={[styles.updateBadge, { opacity: 0.5 }]}>
              <Icon name="download" size={12} color="white" />
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.toggleButton, styles.disabledToggle]}
          onPress={() => onToggle(model.id)}
        >
          <Icon name="x" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {model.accuracy === 0.5 ? 'N/A' : (model.accuracy * 100).toFixed(1) + '%'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Latency</Text>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {model.latency === 100 ? 'N/A' : model.latency + 'ms'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Size</Text>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {formatSize(model.size)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>
            OFF
          </Text>
        </View>
      </View>

      {/* Disabled Message */}
      <View style={styles.disabledMessage}>
        <Text style={styles.disabledMessageText}>
          AI model functionality has been disabled to improve app performance and user experience.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { opacity: 0.5 }]}
          onPress={() => onBenchmark(model.id)}
        >
          <Icon name="activity" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Benchmark (Demo)</Text>
        </TouchableOpacity>
        
        {hasUpdate && onUpdate && (
          <TouchableOpacity
            style={[styles.actionButton, styles.updateButton, { opacity: 0.5 }]}
            onPress={() => onUpdate(model.id)}
          >
            <Icon name="download" size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Update (Demo)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  disabledBanner: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  disabledText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary, // Dimmed
    marginBottom: 2,
  },
  modelVersion: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  updateBadge: {
    backgroundColor: colors.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledToggle: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  disabledMessage: {
    backgroundColor: colors.warningLight,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  disabledMessageText: {
    fontSize: 11,
    color: colors.warning,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  updateButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
});

export default AIModelCard;
