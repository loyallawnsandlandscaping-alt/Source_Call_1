
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../../styles/commonStyles';
import DrumKit from '../../components/DrumKit';
import Icon from '../../components/Icon';

const DrumKitScreen = () => {
  const [showDrumKit, setShowDrumKit] = useState(false);

  if (showDrumKit) {
    return (
      <DrumKit 
        onClose={() => setShowDrumKit(false)}
        gestureControlEnabled={false}
      />
    );
  }

  return (
    <SafeAreaView style={[commonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={commonStyles.container}>
        {/* Header */}
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.title, { color: colors.text, marginBottom: 8 }]}>
            Drum Kit
          </Text>
          <Text style={[commonStyles.subtitle, { color: colors.textSecondary }]}>
            Create beats and rhythms with our virtual drum kit
          </Text>
        </View>

        {/* Launch Drum Kit */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setShowDrumKit(true)}
          >
            <Icon name="musical-notes" size={24} color="white" />
            <Text style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '600',
              marginLeft: 12
            }}>
              Launch Drum Kit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[commonStyles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
            Features
          </Text>
          
          <View style={{ gap: 12 }}>
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: colors.primary,
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Icon name="hand-left" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.subtitle, { color: colors.text, marginBottom: 4 }]}>
                  Touch Controls
                </Text>
                <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
                  Tap drum pads to create beats
                </Text>
              </View>
            </View>

            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: colors.success,
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Icon name="volume-high" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.subtitle, { color: colors.text, marginBottom: 4 }]}>
                  High-Quality Audio
                </Text>
                <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
                  Professional drum samples with low latency
                </Text>
              </View>
            </View>

            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: colors.warning,
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Icon name="settings" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.subtitle, { color: colors.text, marginBottom: 4 }]}>
                  Customizable
                </Text>
                <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
                  Adjust volume, effects, and drum kit settings
                </Text>
              </View>
            </View>

            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: colors.info,
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Icon name="pulse" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.subtitle, { color: colors.text, marginBottom: 4 }]}>
                  Haptic Feedback
                </Text>
                <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
                  Feel the beat with vibration feedback
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
            How to Use
          </Text>
          
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
          }}>
            <Text style={[commonStyles.text, { color: colors.textSecondary, lineHeight: 20 }]}>
              1. Tap "Launch Drum Kit" to open the drum interface{'\n'}
              2. Tap different drum pads to play sounds{'\n'}
              3. Use the settings to adjust volume and effects{'\n'}
              4. Create your own beats and rhythms{'\n'}
              5. Tap the close button to return to this screen
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DrumKitScreen;
