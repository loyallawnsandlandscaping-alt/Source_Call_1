
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
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  };

  const getPerformanceScore = () => {
    if (!benchmark) return model.accuracy;
    return (benchmark.accuracy * 0.6 + (1 - benchmark.latency / 1000) * 0.4);
  };

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(model.category) }]}>
            <Icon name={getCategoryIcon(model.category)} size={16} color="white" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.modelName} numberOfLines={1}>{model.name}</Text>
            <Text style={styles.modelVersion}>v{model.version}</Text>
          </View>
          {hasUpdate && (
            <View style={styles.updateBadge}>
              <Icon name="download" size={12} color="white" />
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.toggleButton, isActive && styles.activeToggle]}
          onPress={() => onToggle(model.id)}
        >
          <Icon 
            name={isActive ? 'check' : 'plus'} 
            size={16} 
            color={isActive ? 'white' : colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>{(model.accuracy * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Latency</Text>
          <Text style={styles.statValue}>{model.latency}ms</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Size</Text>
          <Text style={styles.statValue}>{formatSize(model.size)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={[styles.statValue, styles.scoreValue]}>
            {(getPerformanceScore() * 100).toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Requirements */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Requirements</Text>
        <View style={styles.requirementsList}>
          <View style={styles.requirement}>
            <Icon name="cpu" size={12} color={colors.textSecondary} />
            <Text style={styles.requirementText}>{model.requirements.minRAM} MB RAM</Text>
          </View>
          <View style={styles.requirement}>
            <Icon name="hard-drive" size={12} color={colors.textSecondary} />
            <Text style={styles.requirementText}>{model.requirements.minStorage} MB</Text>
          </View>
          {model.requirements.gpu && (
            <View style={styles.requirement}>
              <Icon name="zap" size={12} color={colors.textSecondary} />
              <Text style={styles.requirementText}>GPU Required</Text>
            </View>
          )}
        </View>
      </View>

      {/* Benchmark Info */}
      {benchmark && (
        <View style={styles.benchmarkContainer}>
          <Text style={styles.benchmarkTitle}>Latest Benchmark</Text>
          <View style={styles.benchmarkStats}>
            <Text style={styles.benchmarkStat}>
              Throughput: {benchmark.throughput.toFixed(1)} ops/sec
            </Text>
            <Text style={styles.benchmarkStat}>
              Memory: {benchmark.memoryUsage.toFixed(0)} MB
            </Text>
            <Text style={styles.benchmarkStat}>
              Energy: {benchmark.energyConsumption.toFixed(1)} mW
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onBenchmark(model.id)}
        >
          <Icon name="activity" size={16} color={colors.primary} />
          <Text style={styles.actionText}>Benchmark</Text>
        </TouchableOpacity>
        
        {hasUpdate && onUpdate && (
          <TouchableOpacity
            style={[styles.actionButton, styles.updateButton]}
            onPress={() => onUpdate(model.id)}
          >
            <Icon name="download" size={16} color="white" />
            <Text style={[styles.actionText, styles.updateText]}>Update</Text>
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
  },
  activeContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
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
    color: colors.text,
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
  activeToggle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  scoreValue: {
    color: colors.primary,
  },
  requirementsContainer: {
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  requirementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requirementText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  benchmarkContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  benchmarkTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  benchmarkStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benchmarkStat: {
    fontSize: 10,
    color: colors.textSecondary,
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
    borderColor: colors.primary,
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  updateText: {
    color: 'white',
  },
});

export default AIModelCard;
