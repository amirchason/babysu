import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import PropTypes from 'prop-types';
import { theme, spacing } from '../../utils/theme';

/**
 * Custom Input Component
 *
 * A text input component with validation and error display.
 * Wraps react-native-paper TextInput.
 *
 * @example
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error="Invalid email"
 *   keyboardType="email-address"
 * />
 */
const Input = ({
  label,
  value,
  onChangeText,
  error,
  helperText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        disabled={disabled}
        error={!!error}
        mode="outlined"
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
        right={rightIcon ? <TextInput.Icon icon={rightIcon} /> : undefined}
        style={styles.input}
        outlineColor={theme.colors.disabled}
        activeOutlineColor={theme.colors.primary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  placeholder: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.string,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.string,
  rightIcon: PropTypes.string,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default Input;
