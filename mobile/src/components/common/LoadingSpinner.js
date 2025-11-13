import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import PropTypes from 'prop-types';
import { theme, spacing } from '../../utils/theme';

/**
 * Loading Spinner Component
 *
 * Displays a loading indicator with optional message.
 * Can be used as a full-screen overlay or inline.
 *
 * @example
 * <LoadingSpinner message="Loading songs..." />
 * <LoadingSpinner size="small" />
 * <LoadingSpinner fullScreen />
 */
const LoadingSpinner = ({
  size = 'large',
  color,
  message,
  fullScreen = false,
  style,
  ...props
}) => {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator
        size={size}
        color={color || theme.colors.primary}
        animating={true}
        {...props}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  return content;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  message: {
    marginTop: spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
