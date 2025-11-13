import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { theme, spacing } from '../../utils/theme';
import Button from './Button';

/**
 * Empty State Component
 *
 * Displays a friendly message when there's no content to show.
 * Includes optional icon, message, and call-to-action button.
 *
 * @example
 * <EmptyState
 *   icon="musical-notes-outline"
 *   title="No Songs Yet"
 *   message="Create your first personalized song!"
 *   buttonText="Create Song"
 *   onButtonPress={handleCreate}
 * />
 */
const EmptyState = ({
  icon = 'folder-open-outline',
  emoji,
  title = 'Nothing Here',
  message = 'There are no items to display.',
  buttonText,
  onButtonPress,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={64} color={theme.colors.disabled} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {buttonText && onButtonPress && (
        <Button
          mode="contained"
          onPress={onButtonPress}
          style={styles.button}
        >
          {buttonText}
        </Button>
      )}
    </View>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  emoji: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  buttonText: PropTypes.string,
  onButtonPress: PropTypes.func,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
  },
});

export default EmptyState;
