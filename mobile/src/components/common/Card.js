import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { theme, spacing, shadows } from '../../utils/theme';

/**
 * Custom Card Component
 *
 * A flexible card component for displaying songs or child profiles.
 * Can be used with or without onPress for touchable behavior.
 *
 * @example
 * <Card
 *   title="Bedtime Song"
 *   subtitle="Lullaby • 3 min"
 *   icon="musical-note"
 *   onPress={handlePress}
 * />
 */
const Card = ({
  title,
  subtitle,
  description,
  icon,
  iconColor,
  image,
  onPress,
  children,
  style,
  contentStyle,
  rightElement,
  ...props
}) => {
  const CardContent = (
    <PaperCard style={[styles.card, style]} {...props}>
      <PaperCard.Content style={[styles.content, contentStyle]}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconColor || theme.colors.primary + '20' }]}>
            <Ionicons
              name={icon}
              size={24}
              color={iconColor || theme.colors.primary}
            />
          </View>
        )}

        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
          {children}
        </View>

        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.placeholder} />
        )}
      </PaperCard.Content>
    </PaperCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  image: PropTypes.string,
  onPress: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.object,
  contentStyle: PropTypes.object,
  rightElement: PropTypes.node,
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  description: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: spacing.xs,
  },
});

export default Card;
