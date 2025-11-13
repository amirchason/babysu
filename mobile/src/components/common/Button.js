import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, ActivityIndicator } from 'react-native-paper';
import PropTypes from 'prop-types';
import { theme } from '../../utils/theme';

/**
 * Custom Button Component
 *
 * A reusable button component with loading state support.
 * Wraps react-native-paper Button with additional features.
 *
 * @example
 * <Button
 *   mode="contained"
 *   onPress={handlePress}
 *   loading={isLoading}
 * >
 *   Submit
 * </Button>
 */
const Button = ({
  children,
  mode = 'contained',
  loading = false,
  disabled = false,
  onPress,
  style,
  buttonColor,
  textColor,
  icon,
  ...props
}) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      buttonColor={buttonColor || (mode === 'contained' ? theme.colors.primary : undefined)}
      textColor={textColor}
      icon={icon}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </PaperButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.oneOf(['text', 'outlined', 'contained', 'elevated', 'contained-tonal']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  buttonColor: PropTypes.string,
  textColor: PropTypes.string,
  icon: PropTypes.string,
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
  },
  content: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
