import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { theme, spacing } from '../../utils/theme';

/**
 * Player Controls Component
 *
 * Audio player control buttons: skip backward, play/pause, skip forward.
 * Displays different icons based on play state.
 *
 * @example
 * <PlayerControls
 *   isPlaying={true}
 *   onPlayPause={handlePlayPause}
 *   onSkipForward={handleSkipForward}
 *   onSkipBackward={handleSkipBackward}
 * />
 */
const PlayerControls = ({
  isPlaying,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  showSkipButtons = true,
  disabled = false,
  size = 'large',
  style,
}) => {
  const buttonSize = size === 'large' ? 72 : size === 'medium' ? 56 : 40;
  const iconSize = size === 'large' ? 36 : size === 'medium' ? 28 : 20;
  const skipIconSize = size === 'large' ? 32 : size === 'medium' ? 24 : 18;

  return (
    <View style={[styles.container, style]}>
      {/* Skip Backward */}
      {showSkipButtons && (
        <TouchableOpacity
          onPress={onSkipBackward}
          disabled={disabled}
          style={[styles.controlButton, styles.skipButton]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="play-back"
            size={skipIconSize}
            color={disabled ? theme.colors.disabled : theme.colors.text}
          />
        </TouchableOpacity>
      )}

      {/* Play/Pause */}
      <TouchableOpacity
        onPress={onPlayPause}
        disabled={disabled}
        style={[
          styles.controlButton,
          styles.playButton,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
        ]}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={iconSize}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* Skip Forward */}
      {showSkipButtons && (
        <TouchableOpacity
          onPress={onSkipForward}
          disabled={disabled}
          style={[styles.controlButton, styles.skipButton]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="play-forward"
            size={skipIconSize}
            color={disabled ? theme.colors.disabled : theme.colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

PlayerControls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  onSkipForward: PropTypes.func,
  onSkipBackward: PropTypes.func,
  showSkipButtons: PropTypes.bool,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
  },
});

export default PlayerControls;
