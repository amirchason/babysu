import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Slider } from 'react-native-paper';
import PropTypes from 'prop-types';
import { theme, spacing } from '../../utils/theme';

/**
 * Progress Bar Component
 *
 * Displays audio playback progress with seekable slider.
 * Shows current time and total duration.
 *
 * @example
 * <ProgressBar
 *   currentTime={45}
 *   duration={180}
 *   onSeek={handleSeek}
 * />
 */
const ProgressBar = ({ currentTime, duration, onSeek, style }) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleValueChange = (value) => {
    setSeekPosition(value);
  };

  const handleSlidingComplete = (value) => {
    setIsSeeking(false);
    if (onSeek) {
      onSeek(value);
    }
  };

  const displayTime = isSeeking ? seekPosition : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          value={displayTime}
          minimumValue={0}
          maximumValue={duration || 100}
          onSlidingStart={handleSlidingStart}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.disabled}
          thumbTintColor={theme.colors.primary}
          style={styles.slider}
        />
      </View>

      {/* Time Labels */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(displayTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

ProgressBar.propTypes = {
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  onSeek: PropTypes.func,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  sliderContainer: {
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    fontWeight: '500',
  },
});

export default ProgressBar;
