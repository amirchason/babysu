import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { theme, spacing, shadows } from '../../utils/theme';

/**
 * Mini Player Component
 *
 * Compact audio player shown at the bottom of screens during navigation.
 * Displays current song info and play/pause control.
 *
 * @example
 * <MiniPlayer
 *   song={{ title: 'Bedtime Song', category: 'Lullaby' }}
 *   isPlaying={true}
 *   onPlayPause={handlePlayPause}
 *   onPress={handleExpand}
 * />
 */
const MiniPlayer = ({
  song,
  isPlaying,
  onPlayPause,
  onPress,
  style,
}) => {
  if (!song) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Song Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {song.imageUrl ? (
          <Image source={{ uri: song.imageUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Ionicons name="musical-note" size={20} color={theme.colors.primary} />
          </View>
        )}
      </View>

      {/* Song Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {song.category || 'Song'}
        </Text>
      </View>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={28}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      {/* Expand Icon */}
      <View style={styles.expandIcon}>
        <Ionicons
          name="chevron-up"
          size={20}
          color={theme.colors.placeholder}
        />
      </View>
    </TouchableOpacity>
  );
};

MiniPlayer.propTypes = {
  song: PropTypes.shape({
    title: PropTypes.string.isRequired,
    category: PropTypes.string,
    imageUrl: PropTypes.string,
  }),
  isPlaying: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  onPress: PropTypes.func,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.disabled + '30',
    ...shadows.medium,
  },
  thumbnailContainer: {
    marginRight: spacing.md,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  placeholderThumbnail: {
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.placeholder,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  expandIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MiniPlayer;
