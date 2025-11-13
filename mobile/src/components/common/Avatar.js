import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Avatar as PaperAvatar } from 'react-native-paper';
import PropTypes from 'prop-types';
import { theme } from '../../utils/theme';

/**
 * Custom Avatar Component
 *
 * Displays a child's avatar with initials or image.
 * Supports different sizes and colors.
 *
 * @example
 * <Avatar
 *   name="Emma"
 *   size={60}
 *   backgroundColor="#FF6B9D"
 *   source={{ uri: 'https://...' }}
 * />
 */
const Avatar = ({
  name,
  source,
  size = 60,
  backgroundColor,
  textColor = '#FFFFFF',
  style,
  ...props
}) => {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);
  const bgColor = backgroundColor || theme.colors.primary;

  if (source) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Image
          source={source}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
          {...props}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.initialsContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
            color: textColor,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  source: PropTypes.object,
  size: PropTypes.number,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: 'bold',
  },
});

export default Avatar;
