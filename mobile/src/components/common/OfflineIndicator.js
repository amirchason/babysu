import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { theme, spacing } from '../../utils/theme';

/**
 * Offline Indicator Component
 *
 * Shows a banner when isOffline prop is true.
 * Pass isOffline prop from parent component that monitors network status.
 *
 * Note: To add automatic network detection, install:
 * npm install @react-native-community/netinfo
 * Then implement network monitoring in parent component.
 *
 * @example
 * <OfflineIndicator isOffline={!isConnected} />
 */
const OfflineIndicator = ({ isOffline = false, style }) => {
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (isOffline) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
};

OfflineIndicator.propTypes = {
  isOffline: PropTypes.bool,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default OfflineIndicator;
